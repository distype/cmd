import { CommandHandler } from '../../CommandHandler';
import { InteractionContext } from '../../InteractionContext';

import { FactoryComponents, FactoryMessage, messageFactory } from '../../../utils/messageFactory';
import type { MiddlewareMeta } from '../../../middleware';

import * as DiscordTypes from 'discord-api-types/v10';

/**
 * Base component context callback.
 * @internal
 */
export type BaseComponentContextCallback<T> = (ctx: T) => (void | Promise<void>);

/**
 * The base component builder.
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components)
 * @internal
 */
export abstract class BaseComponent<Raw extends DiscordTypes.APIButtonComponentWithCustomId | DiscordTypes.APISelectMenuComponent> {
    /**
     * The component's execute method.
     */
    protected _execute: BaseComponentContextCallback<any> = () => {};
    /**
     * Middleware metadata.
     */
    protected _middlewareMeta: MiddlewareMeta | null = null;
    /**
     * The raw component.
     */
    protected _raw: Partial<Omit<Raw, `type`>> & { type: Required<Raw>[`type`] };

    /**
     * Create the base component builder.
     * @param type The component's type.
     */
    constructor (type: Required<Raw>[`type`]) {
        this._raw = { type } as any;
    }

    /**
     * Set the component's ID.
     * @param id The ID to use.
     * @returns The component.
     */
    public setId (id: string): this {
        this._raw.custom_id = id;
        return this;
    }

    /**
     * Set the component's disabled state.
     * @param disabled The disabled state to use.
     * @returns The component.
     */
    public setDisabled (disabled: boolean): this {
        this._raw.disabled = disabled;
        return this;
    }

    /**
     * Set middleware metadata.
     * @param meta The metadata to set.
     * @returns The component.
     */
    public setMiddlewareMeta (meta: MiddlewareMeta): this {
        this._middlewareMeta = meta;
        return this;
    }

    /**
     * Gets the component's middleware meta.
     * @returns The middleware meta.
     */
    public getMiddlewareMeta (): MiddlewareMeta | null {
        return this._middlewareMeta;
    }

    /**
     * Sets the component's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     * @returns The component.
     */
    public setExecute (executeCallback: BaseComponentContextCallback<any>): this {
        this._execute = executeCallback;
        return this;
    }

    /**
     * Gets the component's execute method.
     * @returns The execute method.
     */
    public getExecute (): BaseComponentContextCallback<any> {
        return this._execute;
    }

    /**
     * Converts the component to a Discord API compatible object.
     * @returns The converted component.
     */
    public getRaw (): Raw {
        if (!this._raw.custom_id) throw new Error(`An ID must be specified`);
        return { ...this._raw as any };
    }

    /**
     * Gets the component's custom ID.
     * @returns The custom ID.
     */
    public getCustomId (): string | null {
        return this._raw.custom_id ?? null;
    }

    /**
     * Gets the component's type.
     * @returns The component's type.
     */
    public getType (): number {
        return this._raw.type;
    }

    /**
     * Bind the component to the {@link CommandHandler command handler}.
     * Note that components are not bound in an immutable fashion.
     * Changing the execute method, middleware, or custom ID will propagate to the command handler.
     * However, changing "visual" props, such as a button style or placeholder text, will not have an effect.
     * As an extension, changing the custom ID after sending a component only propogates to interaction handling, not to the sent component.
     * "Visual" props, along with the custom ID, are rendered when sending a message (`.getRaw()`) and sent messages are not edited.
     * @param commandHandler The command handler to bind to.
     * @returns The component.
     */
    public bind (commandHandler: CommandHandler): this {
        if (!this._raw.custom_id) throw new Error(`An ID must be specified`);
        commandHandler.bind(this as any);
        return this;
    }

    /**
     * Unbind the component from the {@link CommandHandler command handler}.
     * @param commandHandler The command handler to unbind from.
     * @returns The component.
     */
    public unbind (commandHandler: CommandHandler): this {
        commandHandler.unbind(this as any);
        return this;
    }
}

/**
 * {@link BaseComponent Base component} context.
 * @internal
 */
export abstract class BaseComponentContext extends InteractionContext {
    /**
     * Component data.
     */
    public readonly component: {
        /**
         * The component's custom ID.
         */
        id: string
        /**
         * The component's type.
         */
        type: DiscordTypes.ComponentType
    };
    /**
     * The message the component is attached to.
     */
    public readonly message: DiscordTypes.APIMessage;

    /**
     * If a deferred message update was sent.
     */
    protected _deferredMessageUpdate = false;

    /**
     * Create {@link BaseComponent base component} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor (interaction: DiscordTypes.APIMessageComponentInteraction, commandHandler: CommandHandler) {
        super(interaction, commandHandler);

        this.component = {
            id: interaction.data.custom_id,
            type: interaction.data.component_type
        };
        this.message = interaction.message;
    }

    /**
     * The same as defer, except the expected followup response is an edit to the parent message of the component.
     */
    public async editParentDefer (): Promise<void> {
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, { type: DiscordTypes.InteractionResponseType.DeferredMessageUpdate });

        this._responded = true;
        this._deferredMessageUpdate = true;
    }

    /**
     * Edits the parent message of the component.
     * @param message The new parent message.
     * @param components Components to add to the message.
     */
    public async editParent (message: FactoryMessage, components?: FactoryComponents): Promise<void> {
        const factoryMessage = messageFactory(message, components);

        if (this._responded) {
            await this.client.rest.editFollowupMessage(this.interaction.applicationId, this.interaction.token, `@original`, factoryMessage);
        } else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.UpdateMessage,
                data: factoryMessage
            });

            this._responded = true;
        }
    }
}
