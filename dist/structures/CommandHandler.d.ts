import { InteractionContext } from "./InteractionContext";
import { ChatCommand } from "./commands/ChatCommand";
import { MessageCommand } from "./commands/MessageCommand";
import { UserCommand } from "./commands/UserCommand";
import { Button } from "./components/Button";
import { ChannelSelect } from "./components/ChannelSelect";
import { MentionableSelect } from "./components/MentionableSelect";
import { RoleSelect } from "./components/RoleSelect";
import { StringSelect } from "./components/StringSelect";
import { UserSelect } from "./components/UserSelect";
import { Expire } from "./extras/Expire";
import { Modal } from "./modals/Modal";
import type { MiddlewareMeta } from "../middleware";
import { Client } from "distype";
/**
 * A command.
 */
export type Command = ChatCommand<any, any> | MessageCommand<any> | UserCommand<any>;
/**
 * A component.
 */
export type Component = Button | ChannelSelect | MentionableSelect | RoleSelect | StringSelect<any> | UserSelect;
/**
 * A structure compatible with the {@link CommandHandler command handler}.
 */
export type CommandHandlerStructure = Command | Component | Modal<any>;
/**
 * The command handler.
 */
export declare class CommandHandler {
    /**
     * The client the command handler is bound to.
     */
    client: Client;
    /**
     * The system string used for logging.
     */
    readonly system = "Command Handler";
    /**
     * Bound commands.
     * Key is their ID.
     */
    private _boundCommands;
    /**
     * Bound components.
     */
    private _boundComponents;
    /**
     * Bound expires.
     */
    private _boundExpires;
    /**
     * Bound modals.
     */
    private _boundModals;
    /**
     * Error function.
     */
    private _error;
    /**
     * Middleware function.
     */
    private _middleware;
    /**
     * Create the command handler.
     * @param client The Distype client to bind the command handler to.
     */
    constructor(client: Client);
    /**
     * Returns structures found in a directory and its subdirectories.
     * Only loads default exports.
     * @param directories The directory to search.
     * @returns Found structures.
     */
    extractFromDirectories(...directories: string[]): Promise<CommandHandlerStructure[]>;
    /**
     * Loads interaction structures from a directory and its subdirectories.
     * Only loads default exports. Note that {@link Expire expire helpers} cannot be loaded.
     * @param directories The directory to search.
     */
    loadDirectories(...directories: string[]): Promise<void>;
    /**
     * Pushes {@link Command commands} to the API.
     * Note that guilds that already have commands published that dont have any defined locally will not be overwritten.
     * @param commands Commands to load.
     */
    pushCommands(...commands: Command[]): Promise<void>;
    /**
     * Binds structures that use custom IDs.
     * @param structures The structures to bind.
     * @returns The command handler.
     */
    bind(...structures: Array<Component | Modal<any> | Expire>): this;
    /**
     * Unbind structures that use custom IDs.
     * @param structures The structures to unbind.
     * @returns The command handler.
     */
    unbind(...structures: Array<Component | Modal<any> | Expire>): this;
    /**
     * Set the error function for the command handler.
     * @returns The command handler.
     */
    setError(errorFunction: (ctx: InteractionContext, error: Error) => void | Promise<void>): this;
    /**
     * Set the middleware function for the command handler.
     * @returns The command handler.
     */
    setMiddleware(middlewareFunction: (ctx: InteractionContext, meta: MiddlewareMeta | null) => boolean | Promise<boolean>): this;
    /**
     * Checks if a structure is a {@link Command command}.
     */
    static isCommand(structure: any): structure is Command;
    /**
     * Checks if a structure is a {@link Component component}.
     */
    static isComponent(structure: any): structure is Component;
    /**
     * Checks if a structure is a {@link Modal modal}.
     */
    static isModal(structure: any): structure is Modal<any>;
    /**
     * Checks if a structure is compatible with the command handler.
     */
    static isCompatableStructure(structure: any): structure is CommandHandlerStructure;
    /**
     * Pushes global {@link Command commands} to the API.
     * @param commands Commands to load.
     */
    private _pushGlobalCommands;
    /**
     * Pushes guild {@link Command commands} to the API.
     * @param commands Commands to load.
     */
    private _pushGuildCommands;
    /**
     * Callback to run when receiving an interaction.
     * @param interaction The received interaction.
     */
    private _onInteraction;
}
