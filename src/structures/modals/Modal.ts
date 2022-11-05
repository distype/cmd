import { CommandHandler } from '../CommandHandler';
import { InteractionContext } from '../InteractionContext';

import type { MiddlewareMeta } from '../../middleware';

import * as DiscordTypes from 'discord-api-types/v10';

/**
 * Add a field to a modal.
 */
type AddField <T, R extends boolean, K extends string, Fields extends Record<string, any>> = Modal<Fields & { [key in K]: R extends true ? T : T | undefined }>

/**
 * A modal text field's style.
 */
export enum ModalTextFieldStyle {
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
export class Modal<Fields extends Record<string, any> = Record<string, never>> {
    /**
     * The modal's execute method.
     */
    private _execute: (ctx: ModalContext<Fields>) => (void | Promise<void>) = () => {};
    /**
     * Middleware metadata.
     */
    private _middlewareMeta: MiddlewareMeta | null = null;
    /**
     * The raw modal.
     */
    private _raw: Partial<DiscordTypes.APIModalInteractionResponseCallbackData> = {};

    /**
     * Set the modal's ID.
     * @param id The ID to use.
     * @returns The modal.
     */
    public setId (id: string): this {
        this._raw.custom_id = id;
        return this;
    }

    /**
     * Set the modal's title.
     * @param title The title to use.
     * @returns The modal.
     */
    public setTitle (title: string): this {
        this._raw.title = title;
        return this;
    }

    /**
     * Add a text field.
     * @param required If the field is required.
     * @param id The field's ID.
     * @param label The field's label.
     * @param style The field's style.
     * @param options Options for the field.
     * @returns The modal.
     */
    public addTextField<R extends boolean, K extends string> (required: R, id: K, label: string, style: ModalTextFieldStyle, options?: { minLength?: number, maxLength?: number, placeholder?: string }): AddField<string, R, K, Fields> {
        this._raw.components ??= [];
        this._raw.components.push({
            type: DiscordTypes.ComponentType.ActionRow,
            components: [
                {
                    type: DiscordTypes.ComponentType.TextInput,
                    custom_id: id,
                    label,
                    required,
                    style: style as any,
                    min_length: options?.minLength,
                    max_length: options?.maxLength,
                    placeholder: options?.placeholder
                }
            ]
        });
        return this;
    }

    /**
     * Set middleware metadata.
     * @param meta The metadata to set.
     * @returns The modal.
     */
    public setMiddlewareMeta (meta: MiddlewareMeta): this {
        this._middlewareMeta = meta;
        return this;
    }

    /**
     * Gets the modal's middleware meta.
     * @returns The middleware meta.
     */
    public getMiddlewareMeta (): MiddlewareMeta | null {
        return this._middlewareMeta;
    }

    /**
     * Sets the modal's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     * @returns The component.
     */
    public setExecute (executeCallback: (ctx: ModalContext<Fields>) => (void | Promise<void>)): this {
        this._execute = executeCallback;
        return this;
    }

    /**
     * Gets the component's execute method.
     * @returns The execute method.
     */
    public getExecute (): (ctx: ModalContext<Fields>) => (void | Promise<void>) {
        return this._execute;
    }

    /**
     * Converts the modal to a Discord API compatible object.
     * @returns The converted modal.
     */
    public getRaw (): DiscordTypes.APIModalInteractionResponseCallbackData {
        if (!this._raw.custom_id) throw new Error(`An ID must be specified`);
        if (!this._raw.title) throw new Error(`Title must be defined`);
        if (!this._raw.components) throw new Error(`Fields must be specified`);
        return { ...this._raw as any };
    }

    /**
     * Gets the modal's custom ID.
     * @returns The custom ID.
     */
    public getCustomId (): string | null {
        return this._raw.custom_id ?? null;
    }

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
    public bind (commandHandler: CommandHandler): this {
        if (!this._raw.custom_id) throw new Error(`An ID must be specified`);
        commandHandler.bind(this);
        return this;
    }

    /**
     * Unbind the modal from the {@link CommandHandler command handler}.
     * @param commandHandler The command handler to unbind from.
     * @returns The modal.
     */
    public unbind (commandHandler: CommandHandler): this {
        commandHandler.unbind(this);
        return this;
    }
}

/**
 * {@link Modal} context.
 */
export class ModalContext<Fields extends Record<string, any> = Record<string, never>> extends InteractionContext {
    /**
     * Field values from the user.
     */
    public readonly fields: Fields;
    /**
     * Modal data.
     */
    public readonly modal: {
        /**
         * The modal's ID.
         */
        id: string
    };

    /**
     * Create {@link Modal modal} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor (interaction: DiscordTypes.APIModalSubmitInteraction, commandHandler: CommandHandler) {
        super(interaction, commandHandler);

        this.modal = { id: interaction.data.custom_id };
        this.fields = (interaction.data.components?.map((component) => component.components).flat() ?? []).reduce((p, c) => Object.assign(p, { [c.custom_id]: c.value?.length ? c.value : undefined }), {}) as any;
    }
}
