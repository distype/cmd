import { BaseContext } from './BaseContext';
import { CommandHandler } from './CommandHandler';
import * as DiscordTypes from 'discord-api-types/v10';
import { Snowflake } from 'distype';
/**
 * Adds a prop to a modal.
 * @internal
 */
declare type AddProp<K extends keyof Required<ModalProps>, V extends ModalProp<K>, Props, Parameters extends DiscordTypes.APIModalActionRowComponent[]> = Modal<Props & Record<K, V>, Parameters>;
/**
 * Adds a parameter to a modal.
 * @internal
 */
declare type AddParameter<T extends DiscordTypes.APIModalActionRowComponent, Props, Parameters extends DiscordTypes.APIModalActionRowComponent[]> = Modal<Props, [...Parameters, T]>;
/**
 * Generate a paramater's value in an interaction.
 * @internal
 */
declare type ParameterValue<R extends boolean | undefined> = R extends true ? string : string | undefined;
/**
 * A property of a modal.
 * @internal
 */
declare type ModalProp<K extends keyof Required<ModalProps>> = Required<ModalProps>[K];
/**
 * A modal's props.
 */
export declare type ModalProps = Omit<DiscordTypes.APIModalInteractionResponseCallbackData, `components`>;
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
export declare class Modal<PR extends Partial<ModalProps> = Record<string, never>, PA extends DiscordTypes.APIModalActionRowComponent[] = []> {
    /**
     * The modal's props.
     */
    props: PR;
    /**
     * The modal's parameters.
     */
    parameters: PA;
    /**
     * The modal's execute method.
     * @internal
     */
    run: ((ctx: ModalContext<PR, PA>) => (void | Promise<void>)) | null;
    /**
     * Set the modal's ID.
     * @param id The custom ID to use.
     * @returns The modal.
     */
    setId<T extends string>(id: T): AddProp<`custom_id`, T, PR, PA>;
    /**
     * Set the modal's title.
     * @param title The title to use.
     * @returns The modal.
     */
    setTitle<T extends string>(title: T): AddProp<`title`, T, PR, PA>;
    addField<R extends boolean, I extends string, L extends string, S extends `short` | `paragraph`, MaxL extends number | undefined = undefined, MinL extends number | undefined = undefined, P extends string | undefined = undefined>(required: R, id: I, label: L, style: S, options?: {
        maxLength?: MaxL;
        minLength?: MinL;
        placeholder?: P;
    }): AddParameter<{
        type: DiscordTypes.ComponentType.TextInput;
        custom_id: I;
        label: L;
        style: S extends `short` ? DiscordTypes.TextInputStyle.Short : DiscordTypes.TextInputStyle.Paragraph;
        max_length: MaxL;
        min_length: MinL;
        placeholder: P;
        required: R;
    }, PR, PA>;
    /**
     * Sets the command's execute method.
     * @param exec The callback to execute when an interaction is received.
     */
    setExecute(exec: (ctx: ModalContext<PR, PA>) => (void | Promise<void>)): this;
    /**
     * Converts a modal to a Discord API compatible object.
     * @returns The raw modal.
     */
    getRaw(): DiscordTypes.APIModalInteractionResponseCallbackData;
}
/**
 * Modal context.
 */
export declare class ModalContext<PR extends Partial<ModalProps>, PA extends DiscordTypes.APIModalActionRowComponent[]> extends BaseContext {
    /**
     * The ID of the channel that the modal was submitted in.
     */
    readonly channelId?: Snowflake;
    /**
     * Modal data.
     */
    readonly modal: PR;
    /**
     * Parameter values from the user.
     */
    readonly parameters: {
        [K in PA[number][`custom_id`]]: ParameterValue<Extract<PA[number], {
            custom_id: K;
        }>[`required`]>;
    };
    /**
     * Create a modal's context.
     * @param commandHandler The command handler that invoked the context.
     * @param modal The modal that invoked the context.
     * @param interaction Interaction data.
     */
    constructor(commandHandler: CommandHandler, modal: Modal<PR, PA>, interaction: DiscordTypes.APIModalSubmitInteraction);
    /**
     * Unbinds the modal's execution callback from the command handler.
     * Use this method to prevent memory leaks from inactive modals.
     */
    unbind(): void;
}
export {};
