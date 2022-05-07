import { CommandHandler } from './CommandHandler';
import { Modal } from './Modal';
import { LogCallback } from '../types/Log';
import { FactoryComponents, FactoryMessage } from '../utils/messageFactory';
import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';
/**
 * Base context.
 * @internal
 */
export declare class BaseContext {
    /**
     * The {@link Client client} the context is bound to.
     */
    client: Client;
    /**
     * The {@link CommandHandler command handler} that invoked the context.
     */
    commandHandler: CommandHandler;
    /**
     * Log a message using the {@link CommandHandler command handler}'s {@link LogCallback log callback}.
     */
    log: LogCallback;
    /**
     * Create context.
     * @param commandHandler The command handler that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(commandHandler: CommandHandler, logCallback?: LogCallback, logThisArg?: any);
}
/**
 * Base interaction context.
 * @internal
 */
export declare class BaseInteractionContext extends BaseContext {
    /**
     * Message IDs of sent responses.
     */
    responses: Array<Snowflake | `@original` | `defer`>;
    /**
     * The ID of the guild that the interaction was ran in.
     */
    readonly guildId?: Snowflake;
    /**
     * The guild's preferred locale, if the interaction was invoked in a guild.
     */
    readonly guildLocale?: DiscordTypes.LocaleString;
    /**
     * Interaction data.
     */
    readonly interaction: {
        /**
         * The ID of the application the interaction belongs to.
         */
        applicationId: Snowflake;
        /**
         * The interaction's ID.
         */
        id: Snowflake;
        /**
         * The interaction's token.
         */
        token: string;
        /**
         * The interaction's type.
         */
        type: DiscordTypes.InteractionType;
        /**
         * The interaction's version.
         */
        version: 1;
    };
    /**
     * The invoking user's member data.
     */
    readonly member?: DiscordTypes.APIInteractionGuildMember;
    /**
     * The invoking user.
     */
    readonly user: DiscordTypes.APIUser;
    /**
     * Create interaction context.
     * @param commandHandler The command handler that invoked the context.
     * @param interaction Interaction data.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(commandHandler: CommandHandler, interaction: DiscordTypes.APIApplicationCommandInteraction | DiscordTypes.APIMessageComponentInteraction | DiscordTypes.APIModalSubmitInteraction, logCallback?: LogCallback, logThisArg?: any);
    /**
     * Calls the command handler's error callback.
     * Note that this does not stop the execution of the command's execute method; you must also call `return`.
     * @param error The error encountered.
     */
    error(error: string | Error): void;
    /**
     * Defers the interaction (displays a loading state to the user).
     * @param flags Message flags for the followup after the defer. Specifying `true` is a shorthand for the ephemeral flag.
     */
    defer(flags?: DiscordTypes.MessageFlags | number | true): Promise<`defer`>;
    /**
     * Sends a message.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @returns The ID of the created message, or `@original`.
     */
    send(message: FactoryMessage, components?: FactoryComponents): Promise<Snowflake | `@original`>;
    /**
     * A shorthand for sending messages with the ephemeral flag.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @returns The ID of the created message, or `@original`.
     */
    sendEphemeral(message: FactoryMessage, components?: FactoryComponents): Promise<Snowflake | `@original`>;
    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @param components Components to add to the message.
     * @returns The new created response.
     */
    edit(id: Snowflake | `@original`, message: FactoryMessage, components?: FactoryComponents): Promise<DiscordTypes.RESTPatchAPIInteractionFollowupResult>;
    /**
     * Delete a response.
     * @param id The ID of the response to delete.
     */
    delete(id: Snowflake | `@original`): Promise<void>;
}
/**
 * Base interaction context with a modal.
 * @internal
 */
export declare class BaseInteractionContextWithModal extends BaseInteractionContext {
    responses: Array<Snowflake | `@original` | `defer` | `modal`>;
    /**
     * Respond with a modal.
     * The modal's execute method is automatically bound to the command handler.
     * If the command handler already has a bound modal with the same ID, it will be overwritten.
     * A modal will stay bound to the command handler until it's execution context's "unbind()" method is called.
     * @param modal The modal to respond with.
     */
    showModal(modal: Modal<any, DiscordTypes.APIModalActionRowComponent[]>): Promise<`modal`>;
}
/**
 * Base context for components.
 * @internal
 */
export declare class BaseComponentContext extends BaseInteractionContextWithModal {
    responses: Array<Snowflake | `@original` | `defer` | `modal` | `deferedit` | `editparent`>;
    /**
     * Component data.
     */
    readonly component: {
        /**
         * The component's custom ID.
         */
        customId: string;
        /**
         * The component's type.
         */
        type: DiscordTypes.ComponentType;
    };
    /**
     * Create interaction context.
     * @param commandHandler The command handler that invoked the context.
     * @param interaction Interaction data.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(commandHandler: CommandHandler, interaction: DiscordTypes.APIMessageComponentInteraction, logCallback?: LogCallback, logThisArg?: any);
    /**
     * The same as defer, except the expected followup response is an edit to the parent message of the component.
     */
    editParentDefer(): Promise<`deferedit`>;
    /**
     * Edits the parent message of the component.
     * @param message The new parent message.
     * @param components Components to add to the message.
     */
    editParent(message: FactoryMessage, components?: FactoryComponents): Promise<`editparent`>;
}
/**
 * Base component expire context.
 */
export declare class BaseComponentExpireContext extends BaseContext {
    /**
     * Component data.
     */
    readonly component: {
        /**
         * The component's custom ID.
         */
        customId: string;
        /**
         * The component's type.
         */
        type: DiscordTypes.ComponentType;
    };
    /**
     * Create component expire context.
     * @param commandHandler The command handler that invoked the context.
     * @param customId The component's custom ID.
     * @param type The component's type.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(commandHandler: CommandHandler, customId: string, type: DiscordTypes.ComponentType, logCallback?: LogCallback, logThisArg?: any);
    /**
     * Calls the command handler's expire error callback.
     * Note that this does not stop the execution of the command's execute method; you must also call `return`.
     * @param error The error encountered.
     */
    error(error: string | Error): void;
}
