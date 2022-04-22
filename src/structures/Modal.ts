import { BaseContext } from './BaseContext';
import { CommandHandler } from './CommandHandler';

import { DistypeCmdError, DistypeCmdErrorType } from '../errors/DistypeCmdError';

import * as DiscordTypes from 'discord-api-types/v10';
import { DiscordConstants, Snowflake } from 'distype';

/**
 * Adds a prop to a modal.
 * @internal
 */
type AddProp <K extends keyof Required<ModalProps>, V extends ModalProp<K>, Props, Parameters extends DiscordTypes.APIModalActionRowComponent[]> = Modal<Props & Record<K, V>, Parameters>;

/**
 * Adds a parameter to a modal.
 * @internal
 */
type AddParameter <T extends DiscordTypes.APIModalActionRowComponent, Props, Parameters extends DiscordTypes.APIModalActionRowComponent[]> = Modal<Props, [...Parameters, T]>

/**
 * Generate a paramater's value in an interaction.
 * @internal
 */
type ParameterValue<R extends boolean | undefined> = R extends true ? string : string | undefined;

/**
 * A property of a modal.
 * @internal
 */
type ModalProp<K extends keyof Required<ModalProps>> = Required<ModalProps>[K];

/**
 * A modal's props.
 */
export type ModalProps = Omit<DiscordTypes.APIModalInteractionResponseCallbackData, `components`>

/**
 * A modal builder.
 *
 * @example
 * ```ts
 * new Modal()
 *   .setId(`foo`)
 *   .setTitle(`Bar`)
 *   .addField(true, `field0`, `How are you?`, `paragraph`, { placeholder: `Doing great!` })
 *   .addField(false, `field1`, `A non-required field`, `short`)
 *   .setExecute(async (ctx) => {
 *     await ctx.send(`This is how you said you were feeling:\n${ctx.parameters.field0}\n\nThis was what you put in the non-required field:\n${ctx.parameters.field1 ?? `\`nothing :(\``}`);
 *   });
 * ```
 */
export class Modal<PR extends Partial<ModalProps> = Record<string, never>, PA extends DiscordTypes.APIModalActionRowComponent[] = []> {
    /**
     * The modal's props.
     */
    public props: PR = {} as PR;
    /**
     * The modal's parameters.
     */
    public parameters: PA = [] as unknown as PA;
    /**
     * The modal's execute method.
     * @internal
     */
    public run: ((ctx: ModalContext<PR, PA>) => (void | Promise<void>)) | null = null;

    /**
     * Set the modal's ID.
     * @param id The custom ID to use.
     * @returns The modal.
     */
    public setId <T extends string> (id: T): AddProp<`custom_id`, T, PR, PA> {
        this.props.custom_id = id;
        return this as any;
    }

    /**
     * Set the modal's title.
     * @param title The title to use.
     * @returns The modal.
     */
    public setTitle <T extends string> (title: T): AddProp<`title`, T, PR, PA> {
        if (title.length > DiscordConstants.MODAL_LIMITS.TITLE) throw new DistypeCmdError(`Specified title is longer than maximum length ${DiscordConstants.MODAL_LIMITS.TITLE}`, DistypeCmdErrorType.INVALID_MODAL_VALUE);
        this.props.title = title;
        return this as any;
    }

    public addField <
        R extends boolean,
        I extends string,
        L extends string,
        S extends `short` | `paragraph`,
        MaxL extends number | undefined = undefined,
        MinL extends number | undefined = undefined,
        P extends string | undefined = undefined,
    > (required: R, id: I, label: L, style: S, options?: {
        maxLength?: MaxL,
        minLength?: MinL,
        placeholder?: P
    }): AddParameter<{
        type: DiscordTypes.ComponentType.TextInput
        custom_id: I,
        label: L,
        style: S extends `short` ? DiscordTypes.TextInputStyle.Short : DiscordTypes.TextInputStyle.Paragraph,
        max_length: MaxL,
        min_length: MinL,
        placeholder: P,
        required: R
    }, PR, PA> {
        if (id.length > DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.CUSTOM_ID) throw new DistypeCmdError(`Specified ID is longer than maximum length ${DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.CUSTOM_ID}`, DistypeCmdErrorType.INVALID_MODAL_VALUE);
        if (label.length > DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.LABEL) throw new DistypeCmdError(`Specified label is longer than maximum length ${DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.LABEL}`, DistypeCmdErrorType.INVALID_MODAL_VALUE);
        if ((options?.maxLength ?? -1) > DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.MAX_LENGTH.MAX || (options?.maxLength ?? Infinity) < DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.MAX_LENGTH.MIN) throw new DistypeCmdError(`Specified max length is not in valid range ${DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.MAX_LENGTH.MIN}-${DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.MAX_LENGTH.MAX}`, DistypeCmdErrorType.INVALID_MODAL_VALUE);
        if ((options?.minLength ?? -1) > DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.MIN_LENGTH.MAX || (options?.minLength ?? Infinity) < DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.MIN_LENGTH.MIN) throw new DistypeCmdError(`Specified min length is not in valid range ${DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.MIN_LENGTH.MIN}-${DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.MIN_LENGTH.MAX}`, DistypeCmdErrorType.INVALID_MODAL_VALUE);
        if ((options?.placeholder ?? ``).length > DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.PLACEHOLDER) throw new DistypeCmdError(`Specified placeholder is longer than maximum length ${DiscordConstants.COMPONENT_LIMITS.TEXT_INPUT.PLACEHOLDER}`, DistypeCmdErrorType.INVALID_MODAL_VALUE);

        if (this.parameters.length === DiscordConstants.MODAL_LIMITS.COMPONENTS) throw new DistypeCmdError(`Modal already contains maximum number of fields (${DiscordConstants.MODAL_LIMITS.COMPONENTS})`, DistypeCmdErrorType.INVALID_MODAL_VALUE);
        if (this.parameters.find((parameter) => parameter.custom_id === id)) throw new DistypeCmdError(`A field already exists with the ID "${id}"`, DistypeCmdErrorType.INVALID_MODAL_VALUE);

        this.parameters.push({
            type: DiscordTypes.ComponentType.TextInput,
            required,
            custom_id: id,
            label,
            style: style === `short` ? DiscordTypes.TextInputStyle.Short : DiscordTypes.TextInputStyle.Paragraph,
            max_length: options?.maxLength,
            min_length: options?.minLength,
            placeholder: options?.placeholder
        });

        return this as any;
    }

    /**
     * Sets the command's execute method.
     * @param exec The callback to execute when an interaction is received.
     */
    public setExecute (exec: (ctx: ModalContext<PR, PA>) => (void | Promise<void>)): this {
        this.run = exec;
        return this;
    }

    /**
     * Converts a modal to a Discord API compatible object.
     * @returns The raw modal.
     */
    public getRaw (): DiscordTypes.APIModalInteractionResponseCallbackData {
        if (typeof this.props.custom_id !== `string`) throw new DistypeCmdError(`Cannot convert a modal with a missing "custom_id" parameter to raw`, DistypeCmdErrorType.INVALID_MODAL_PARAMETERS_FOR_RAW);
        if (typeof this.props.title !== `string`) throw new DistypeCmdError(`Cannot convert a modal with a missing "title" parameter to raw`, DistypeCmdErrorType.INVALID_MODAL_PARAMETERS_FOR_RAW);

        return {
            ...this.props as any,
            components: this.parameters.map((parameter) => ({
                type: DiscordTypes.ComponentType.ActionRow,
                components: [parameter]
            }))
        };
    }
}

/**
 * Modal context.
 */
export class ModalContext<PR extends Partial<ModalProps>, PA extends DiscordTypes.APIModalActionRowComponent[]> extends BaseContext {
    /**
     * The ID of the channel that the modal was submitted in.
     */
    public readonly channelId?: Snowflake;
    /**
     * Modal data.
     */
    public readonly modal: PR;
    /**
     * Parameter values from the user.
     */
    public readonly parameters: { [K in PA[number][`custom_id`]]: ParameterValue<Extract<PA[number], { custom_id: K }>[`required`]> };

    /**
     * Create a modal's context.
     * @param commandHandler The command handler that invoked the context.
     * @param modal The modal that invoked the context.
     * @param interaction Interaction data.
     */
    constructor (commandHandler: CommandHandler, modal: Modal<PR, PA>, interaction: DiscordTypes.APIModalSubmitInteraction) {
        super(commandHandler, interaction);

        this.channelId = interaction.channel_id;
        this.modal = modal.props;
        this.parameters = (interaction.data.components?.map((component) => component.components).flat() ?? []).reduce((p, c) => Object.assign(p, { [c.custom_id]: c.value?.length ? c.value : undefined }), {}) as any;
    }

    /**
     * Unbinds the modal's execution callback from the command handler.
     * Use this method to prevent memory leaks from inactive modals.
     */
    public unbind (): void {
        this.commandHandler.unbindModal(this.modal.custom_id!);
    }
}
