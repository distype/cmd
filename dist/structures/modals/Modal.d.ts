import { CommandHandler } from '../CommandHandler';
import { InteractionContext } from '../InteractionContext';
import type { MiddlewareMeta } from '../../middleware';
import * as DiscordTypes from 'discord-api-types/v10';
/**
 * Add a field to a modal.
 */
declare type AddField<T, R extends boolean, K extends string, Fields extends Record<string, any>> = Modal<Fields & {
    [key in K]: R extends true ? T : T | undefined;
}>;
/**
 * A modal text field's style.
 */
export declare enum ModalTextFieldStyle {
    SHORT = 1,
    PARAGRAPH = 2
}
/**
 * A modal builder.
 *
 * @example
 * ```ts
 * new Modal()
 *   .setId(`foo`)
 *   .setTitle(`Bar`)
 *   .addTextField(true, `field0`, `How are you?`, ModalTextFieldStyle.PARAGRAPH, { placeholder: `Doing great!` })
 *   .addTextField(false, `field1`, `A non-required field`, ModalTextFieldStyle.SHORT)
 *   .setExecute(async (ctx) => {
 *     await ctx.send(`This is how you said you were feeling:\n${ctx.fields.field0}\n\nThis was what you put in the non-required field:\n${ctx.fields.field1 ?? `\`nothing :(\``}`);
 *   });
 * ```
 */
export declare class Modal<Fields extends Record<string, any> = Record<string, never>> {
    /**
     * The modal's execute method.
     */
    private _execute;
    /**
     * Middleware metadata.
     */
    private _middlewareMeta;
    /**
     * The raw modal.
     */
    private _raw;
    /**
     * Set the modal's ID.
     * @param id The ID to use.
     * @returns The modal.
     */
    setId(id: string): this;
    /**
     * Set the modal's title.
     * @param title The title to use.
     * @returns The modal.
     */
    setTitle(title: string): this;
    /**
     * Add a text field.
     * @param required If the field is required.
     * @param id The field's ID.
     * @param label The field's label.
     * @param style The field's style.
     * @param options Options for the field.
     * @returns The modal.
     */
    addTextField<R extends boolean, K extends string>(required: R, id: K, label: string, style: ModalTextFieldStyle, options?: {
        minLength?: number;
        maxLength?: number;
        placeholder?: string;
    }): AddField<string, R, K, Fields>;
    /**
     * Set middleware metadata.
     * @param meta The metadata to set.
     * @returns The modal.
     */
    setMiddlewareMeta(meta: MiddlewareMeta): this;
    /**
     * Gets the modal's middleware meta.
     * @returns The middleware meta.
     */
    getMiddlewareMeta(): MiddlewareMeta | null;
    /**
     * Sets the modal's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     * @returns The component.
     */
    setExecute(executeCallback: (ctx: ModalContext<Fields>) => (void | Promise<void>)): this;
    /**
     * Gets the component's execute method.
     * @returns The execute method.
     */
    getExecute(): (ctx: ModalContext<Fields>) => (void | Promise<void>);
    /**
     * Converts the modal to a Discord API compatible object.
     * @returns The converted modal.
     */
    getRaw(): DiscordTypes.APIModalInteractionResponseCallbackData;
    /**
     * Gets the modal's custom ID.
     * @returns The custom ID.
     */
    getCustomId(): string | null;
    /**
     * Bind the modal to the {@link CommandHandler command handler}.
     * Note that modals are not bound in an immutable fashion.
     * Changing the execute method, middleware, or custom ID will propagate to the command handler.
     * However, changing "visual" props, such as the title, will not have an effect.
     * As an extension, changing the custom ID after sending a modal only propogates to interaction handling, not to the sent modal.
     * "Visual" props, along with the custom ID, are rendered when sending a modal (`.getRaw()`) and sent modals are not edited.
     * @param commandHandler The command handler to bind to.
     * @returns The modal.
     */
    bind(commandHandler: CommandHandler): this;
    /**
     * Unbind the modal from the {@link CommandHandler command handler}.
     * @param commandHandler The command handler to unbind from.
     * @returns The modal.
     */
    unbind(commandHandler: CommandHandler): this;
}
/**
 * {@link Modal} context.
 */
export declare class ModalContext<Fields extends Record<string, any> = Record<string, never>> extends InteractionContext {
    /**
     * Field values from the user.
     */
    readonly fields: Fields;
    /**
     * Modal data.
     */
    readonly modal: {
        /**
         * The modal's ID.
         */
        id: string;
    };
    /**
     * Create {@link Modal modal} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: DiscordTypes.APIModalSubmitInteraction, commandHandler: CommandHandler);
}
export {};
