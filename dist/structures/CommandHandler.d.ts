import { BaseContext } from './BaseContext';
import { Button, ButtonContext } from './Button';
import { ChatCommand, ChatCommandContext, ChatCommandProps } from './ChatCommand';
import { ContextMenuCommand, ContextMenuCommandContext, ContextMenuCommandProps } from './ContextMenuCommand';
import { Modal, ModalContext, ModalProps } from './Modal';
import { LogCallback } from '../types/Log';
import { ExtendedMap } from '@br88c/node-utils';
import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';
export declare type Command = ChatCommand<ChatCommandProps, DiscordTypes.APIApplicationCommandBasicOption[]> | ContextMenuCommand<ContextMenuCommandProps>;
export declare class CommandHandler {
    /**
     * The command handler's buttons.
     */
    buttons: ExtendedMap<string, Button>;
    /**
     * The client the command handler is bound to.
     */
    client: Client;
    /**
     * The command handler's commands.
     */
    commands: ExtendedMap<Snowflake | `unknown${number}`, Command>;
    /**
     * The command handler's modals.
     */
    modals: ExtendedMap<string, Modal<ModalProps>>;
    /**
     * Called when a command encounters an error.
     * @param error The error encountered.
     * @param unexpected If the error was unexpected (not called via `ctx.error()`).
     * @internal
     */
    runError: (error: Error, ctx: BaseContext, unexpected: boolean) => (void | Promise<void>);
    /**
     * The system string used for emitting errors and for the {@link LogCallback log callback}.
     */
    readonly system = "Command Handler";
    /**
     * The {@link LogCallback log callback} used by the command handler.
     */
    private _log;
    /**
     * A value to use as `this` in the `this#_log`.
     */
    private _logThisArg?;
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
    private _unknownNonce;
    /**
     * Create the command handler.
     * @param client The client to bind the command handler to.
     * @param logCallback A {@link LogCallback callback} to be used for logging events internally throughout the command handler.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(client: Client, logCallback?: LogCallback, logThisArg?: any);
    /**
     * Load commands / components / modals from a directory.
     * @param directory The directory to load from.
     */
    load(directory: string): Promise<void>;
    /**
     * Bind a command to the command handler.
     * @param command The command to add.
     */
    bindCommand(command: ChatCommand<any, any> | ContextMenuCommand<any>): this;
    /**
     * Bind a button to the command handler.
     * @param button The button to bind.
     */
    bindButton(button: Button): this;
    /**
     * Unbind a button from the command handler.
     * @param id The button's custom ID.
     */
    unbindButton(id: string): this;
    /**
     * Bind a modal to the command handler.
     * @param modal The modal to bind.
     */
    bindModal(modal: Modal<any, any>): this;
    /**
     * Unbind a modal from the command handler.
     * @param id The modal's custom ID.
     */
    unbindModal(id: string): this;
    /**
     * Pushes added / changed / deleted slash commands to Discord.
     */
    push(applicationId?: Snowflake | undefined): Promise<void>;
    /**
     * Set the error callback function to run when a command's execution fails
     * @param errorCallback The callback to use.
     */
    setError(errorCallback: CommandHandler[`runError`]): this;
    /**
     * Set middleware for buttons.
     * @param middleware The middleware callback. If it returns `false`, the button will not be executed.
     */
    setButtonMiddleware(middleware: (ctx: ButtonContext) => boolean): this;
    /**
     * Set middleware for chat commands.
     * @param middleware The middleware callback. If it returns `false`, the button will not be executed.
     */
    setChatCommandMiddleware(middleware: (ctx: ChatCommandContext<ChatCommandProps, DiscordTypes.APIApplicationCommandBasicOption[]>) => boolean): this;
    /**
     * Set middleware for context menu commands.
     * @param middleware The middleware callback. If it returns `false`, the button will not be executed.
     */
    setContextMenuCommandMiddleware(middleware: (ctx: ContextMenuCommandContext<ContextMenuCommandProps>) => boolean): this;
    /**
     * Set middleware for modals.
     * @param middleware The middleware callback. If it returns `false`, the button will not be executed.
     */
    setModalMiddleware(middleware: (ctx: ModalContext<ModalProps, DiscordTypes.APITextInputComponent[]>) => boolean): this;
    /**
     * Callback to run when receiving an interaction.
     * @param interaction The received interaction.
     */
    private _onInteraction;
}
