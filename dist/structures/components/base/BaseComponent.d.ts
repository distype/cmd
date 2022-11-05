import { CommandHandler } from '../../CommandHandler';
import { InteractionContext } from '../../InteractionContext';
import { FactoryComponents, FactoryMessage } from '../../../utils/messageFactory';
import type { MiddlewareMeta } from '../../../middleware';
import * as DiscordTypes from 'discord-api-types/v10';
/**
 * Base component context callback.
 * @internal
 */
export declare type BaseComponentContextCallback<T> = (ctx: T) => (void | Promise<void>);
/**
 * The base component builder.
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components)
 * @internal
 */
export declare abstract class BaseComponent<Raw extends DiscordTypes.APIButtonComponentWithCustomId | DiscordTypes.APISelectMenuComponent> {
    /**
     * The component's execute method.
     */
    protected _execute: BaseComponentContextCallback<any>;
    /**
     * Middleware metadata.
     */
    protected _middlewareMeta: MiddlewareMeta | null;
    /**
     * The raw component.
     */
    protected _raw: Partial<Omit<Raw, `type`>> & {
        type: Required<Raw>[`type`];
    };
    /**
     * Create the base component builder.
     * @param type The component's type.
     */
    constructor(type: Required<Raw>[`type`]);
    /**
     * Set the component's ID.
     * @param id The ID to use.
     * @returns The component.
     */
    setId(id: string): this;
    /**
     * Set the component's disabled state.
     * @param disabled The disabled state to use.
     * @returns The component.
     */
    setDisabled(disabled: boolean): this;
    /**
     * Set middleware metadata.
     * @param meta The metadata to set.
     * @returns The component.
     */
    setMiddlewareMeta(meta: MiddlewareMeta): this;
    /**
     * Gets the component's middleware meta.
     * @returns The middleware meta.
     */
    getMiddlewareMeta(): MiddlewareMeta | null;
    /**
     * Sets the component's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     * @returns The component.
     */
    setExecute(executeCallback: BaseComponentContextCallback<any>): this;
    /**
     * Gets the component's execute method.
     * @returns The execute method.
     */
    getExecute(): BaseComponentContextCallback<any>;
    /**
     * Converts the component to a Discord API compatible object.
     * @returns The converted component.
     */
    getRaw(): Raw;
    /**
     * Gets the component's custom ID.
     * @returns The custom ID.
     */
    getCustomId(): string | null;
    /**
     * Gets the component's type.
     * @returns The component's type.
     */
    getType(): number;
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
    bind(commandHandler: CommandHandler): this;
    /**
     * Unbind the component from the {@link CommandHandler command handler}.
     * @param commandHandler The command handler to unbind from.
     * @returns The component.
     */
    unbind(commandHandler: CommandHandler): this;
}
/**
 * {@link BaseComponent Base component} context.
 * @internal
 */
export declare abstract class BaseComponentContext extends InteractionContext {
    /**
     * Component data.
     */
    readonly component: {
        /**
         * The component's custom ID.
         */
        id: string;
        /**
         * The component's type.
         */
        type: DiscordTypes.ComponentType;
    };
    /**
     * The message the component is attached to.
     */
    readonly message: DiscordTypes.APIMessage;
    /**
     * If a deferred message update was sent.
     */
    protected _deferredMessageUpdate: boolean;
    /**
     * Create {@link BaseComponent base component} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: DiscordTypes.APIMessageComponentInteraction, commandHandler: CommandHandler);
    /**
     * The same as defer, except the expected followup response is an edit to the parent message of the component.
     */
    editParentDefer(): Promise<void>;
    /**
     * Edits the parent message of the component.
     * @param message The new parent message.
     * @param components Components to add to the message.
     */
    editParent(message: FactoryMessage, components?: FactoryComponents): Promise<void>;
}
