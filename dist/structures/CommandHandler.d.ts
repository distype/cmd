import { ChatCommand, ChatCommandContext, ChatCommandProps } from './ChatCommand';
import { ContextMenuCommand, ContextMenuCommandContext, ContextMenuCommandProps } from './ContextMenuCommand';
import { Modal, ModalProps } from './Modal';
import { LogCallback } from '../types/Log';
import { ExtendedMap } from '@br88c/node-utils';
import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';
export declare type Command = ChatCommand<ChatCommandProps, DiscordTypes.APIApplicationCommandBasicOption[]> | ContextMenuCommand<ContextMenuCommandProps>;
export declare class CommandHandler {
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
    runError: (error: Error, ctx: ChatCommandContext<ChatCommandProps, DiscordTypes.APIApplicationCommandBasicOption[]> | ContextMenuCommandContext<ContextMenuCommandProps>, unexpected: boolean) => void;
    /**
     * The system string used for emitting errors and for the {@link LogCallback log callback}.
     */
    readonly system = "Command Handler";
    /**
     * The {@link LogCallback log callback} used by the command handler..
     */
    private _log;
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
     * Add a command to the command handler.
     * @param command The command to add.
     */
    add(command: ChatCommand<any, any> | ContextMenuCommand<any>): this;
    /**
     * Bind a modal to the command handler.
     * @param modal The modal to bind.
     */
    bindModal(modal: Modal<any, any>): this;
    /**
     * Pushes added / changed / deleted slash commands to Discord.
     */
    push(applicationId?: Snowflake | undefined): Promise<void>;
    /**
     * Set the error callback function to run when a command's execution fails
     * @param erroCallback The callback to use.
     */
    setError(erroCallback: CommandHandler[`runError`]): void;
    /**
     * Callback to run when receiving an interaction.
     * @param interaction The received interaction.
     */
    private _onInteraction;
    /**
     * Converts a command to a Discord API compatible object.
     * @param command The command to convert.
     * @returns The converted command.
     */
    private _commandToRaw;
    /**
     * Sanitizes a raw command.
     * @param command The command to sanitize.
     * @returns The sanitized command.
     */
    private _sanitizeRaw;
}
