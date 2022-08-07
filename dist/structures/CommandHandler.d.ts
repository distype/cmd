import { BaseComponentExpireContext, BaseInteractionContext } from './BaseContext';
import { Button, ButtonContext } from './Button';
import { ChatCommand, ChatCommandContext, ChatCommandProps } from './ChatCommand';
import { ContextMenuCommand, ContextMenuCommandContext, ContextMenuCommandProps } from './ContextMenuCommand';
import { Modal, ModalContext, ModalProps } from './Modal';
import { FactoryComponents, FactoryMessage } from '../utils/messageFactory';
import { ExtendedMap } from '@br88c/node-utils';
import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';
/**
 * A command owned by the command handler.
 */
export declare type CommandHandlerCommand = ChatCommand<ChatCommandProps, DiscordTypes.APIApplicationCommandBasicOption[]> | ContextMenuCommand<ContextMenuCommandProps>;
/**
 * The command handler.
 */
export declare class CommandHandler {
    /**
     * The command handler's {@link Button buttons}.
     */
    buttons: ExtendedMap<string, Button>;
    /**
     * The client the command handler is bound to.
     */
    client: Client;
    /**
     * The command handler's {@link CommandHandlerCommand commands}.
     */
    commands: ExtendedMap<Snowflake | `unknown${number}`, CommandHandlerCommand>;
    /**
     * The command handler's {@link Modal modals}.
     */
    modals: ExtendedMap<string, Modal<ModalProps>>;
    /**
     * Called when an interaction encounters an error.
     * @param ctx The command context.
     * @param error The error encountered.
     * @param unexpected If the error was unexpected (not called via `ctx.error()`).
     * @internal
     */
    runError: (ctx: BaseInteractionContext<boolean>, error: Error, unexpected: boolean) => (void | Promise<void>);
    /**
     * Called when a component expire context encounters an error.
     * @param ctx The command context.
     * @param error The error encountered.
     * @param unexpected If the error was unexpected (not called via `ctx.error()`).
     * @internal
     */
    runExpireError: (ctx: BaseComponentExpireContext, error: Error, unexpected: boolean) => (void | Promise<void>);
    /**
     * The system string used for emitting errors and for the {@link LogCallback log callback}.
     */
    readonly system = "Command Handler";
    /**
     * Button middleware.
     */
    private _runButtonMiddleware;
    /**
     * Chat command middleware.
     */
    private _runChatCommandMiddleware;
    /**
     * Context menu command middleware.
     */
    private _runContextMenuCommandMiddleware;
    /**
     * Modal middleware.
     */
    private _runModalMiddleware;
    /**
     * The nonce to use for indexing commands with an unknown ID.
     */
    private _unknownCommandIdNonce;
    /**
     * Create the command handler.
     * @param client The Distype client to bind the command handler to.
     */
    constructor(client: Client);
    /**
     * Sends a message.
     * @param channelId The channel to send the message in.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     */
    sendMessage(channelId: Snowflake, message: FactoryMessage, components?: FactoryComponents, bindComponents?: boolean): Promise<DiscordTypes.RESTPostAPIChannelMessageResult>;
    /**
     * Edits a message.
     * @param channelId The channel the message was sent in.
     * @param messageId The ID of the message to edit.
     * @param message The new message.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     */
    editMessage(channelId: Snowflake, messageId: Snowflake, message: FactoryMessage, components?: FactoryComponents, bindComponents?: boolean): Promise<DiscordTypes.RESTPatchAPIChannelMessageResult>;
    /**
     * Load {@link CommandHandlerCommand commands} / {@link Button buttons} / {@link Modal modals} from a directory.
     * @param directory The directory to load from.
     */
    load(directory: string): Promise<void>;
    /**
     * Bind a {@link CommandHandlerCommand command} to the command handler.
     * @param command The {@link CommandHandlerCommand command} to add.
     */
    bindCommand(command: ChatCommand<any, any> | ContextMenuCommand<any>): this;
    /**
     * Bind a {@link Button button} to the command handler.
     * @param button The {@link Button button} to bind.
     */
    bindButton(button: Button): this;
    /**
     * Unbind a {@link Button button} from the command handler.
     * @param id The {@link Button button}'s custom ID.
     */
    unbindButton(id: string): this;
    /**
     * Bind a {@link Modal modal} to the command handler.
     * @param modal The {@link Modal modal} to bind.
     */
    bindModal(modal: Modal<any, any>): this;
    /**
     * Unbind a {@link Modal modal} from the command handler.
     * @param id The {@link Modal modal}'s custom ID.
     */
    unbindModal(id: string): this;
    /**
     * Binds message components to the command handler.
     * @param components The components to bind.
     */
    bindComponents(components: FactoryComponents): void;
    /**
     * Unbinds message components to the command handler.
     * @param components The components to unbind.
     */
    unbindComponents(components: FactoryComponents): void;
    /**
     * Pushes added / changed / deleted {@link CommandHandlerCommand commands} to Discord.
     */
    push(applicationId?: Snowflake | undefined): Promise<void>;
    /**
     * Set the error callback function to run when an interaction's execution fails.
     * @param errorCallback The callback to use.
     */
    setError(errorCallback: CommandHandler[`runError`]): this;
    /**
     * Set the error callback function to run when a component's expire callback fails.
     * @param errorCallback The callback to use.
     */
    setExpireError(errorCallback: CommandHandler[`runExpireError`]): this;
    /**
     * Set middleware for {@link Button buttons}.
     * @param middleware The middleware callback. If it returns `false`, the {@link Button button} will not be executed.
     */
    setButtonMiddleware(middleware: (ctx: ButtonContext) => boolean): this;
    /**
     * Set middleware for {@link ChatCommand chat command}.
     * @param middleware The middleware callback. If it returns `false`, the {@link ChatCommand chat command} will not be executed.
     */
    setChatCommandMiddleware(middleware: (ctx: ChatCommandContext<ChatCommandProps, DiscordTypes.APIApplicationCommandBasicOption[]>) => boolean): this;
    /**
     * Set middleware for {@link ContextMenuCommand context menu commands}.
     * @param middleware The middleware callback. If it returns `false`, the {@link ContextMenuCommand context menu command} will not be executed.
     */
    setContextMenuCommandMiddleware(middleware: (ctx: ContextMenuCommandContext<ContextMenuCommandProps>) => boolean): this;
    /**
     * Set middleware for {@link Modal modals}.
     * @param middleware The middleware callback. If it returns `false`, the {@link Modal modal} will not be executed.
     */
    setModalMiddleware(middleware: (ctx: ModalContext<ModalProps, DiscordTypes.APITextInputComponent[]>) => boolean): this;
    /**
     * Callback to run when receiving an interaction.
     * @param interaction The received interaction.
     */
    private _onInteraction;
    /**
     * Set the expire timeout for a button.
     * @param button The button to set the timeout for.
     */
    _setButtonExpireTimeout(button: Button): void;
}
