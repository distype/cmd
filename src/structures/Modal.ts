import { BaseContext } from './BaseContext';
import { CommandHandler } from './CommandHandler';

import * as DiscordTypes from 'discord-api-types/v10';
import { Snowflake } from 'distype';

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
        if (this.parameters.find((parameter) => parameter.custom_id === id)) throw new Error(`A field already exists with the ID "${id}"`);

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
        if (!this.props.custom_id || !this.props.title) throw new Error(`A modal's ID and title must be present to set its execute method`);
        this.run = exec;
        return this;
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
}
