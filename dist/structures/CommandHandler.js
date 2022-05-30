"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const Button_1 = require("./Button");
const ChatCommand_1 = require("./ChatCommand");
const ContextMenuCommand_1 = require("./ContextMenuCommand");
const Modal_1 = require("./Modal");
const DistypeCmdError_1 = require("../errors/DistypeCmdError");
const sanitizeCommand_1 = require("../functions/sanitizeCommand");
const messageFactory_1 = require("../utils/messageFactory");
const node_utils_1 = require("@br88c/node-utils");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_util_1 = require("node:util");
/**
 * The command handler.
 */
class CommandHandler {
    /**
     * The command handler's {@link Button buttons}.
     */
    buttons = new node_utils_1.ExtendedMap();
    /**
     * The client the command handler is bound to.
     */
    client;
    /**
     * The command handler's {@link CommandHandlerCommand commands}.
     */
    commands = new node_utils_1.ExtendedMap();
    /**
     * The command handler's {@link Modal modals}.
     */
    modals = new node_utils_1.ExtendedMap();
    /**
     * Called when an interaction encounters an error.
     * @param ctx The command context.
     * @param error The error encountered.
     * @param unexpected If the error was unexpected (not called via `ctx.error()`).
     * @internal
     */
    runError = (ctx, error, unexpected) => this._log(`${unexpected ? `Unexpected ` : ``}${error.name} when running interaction ${ctx.interaction.id}: ${error.message}`, {
        level: `ERROR`, system: this.system
    });
    /**
     * Called when a component expire context encounters an error.
     * @param ctx The command context.
     * @param error The error encountered.
     * @param unexpected If the error was unexpected (not called via `ctx.error()`).
     * @internal
     */
    runExpireError = (ctx, error, unexpected) => this._log(`${unexpected ? `Unexpected ` : ``}${error.name} when running expire callback for component "${ctx.component.customId}" (${DiscordTypes.ComponentType[ctx.component.type]})`, {
        level: `ERROR`, system: this.system
    });
    /**
     * The system string used for emitting errors and for the {@link LogCallback log callback}.
     */
    system = `Command Handler`;
    /**
     * The {@link LogCallback log callback} used by the command handler.
     */
    _log;
    /**
     * A value to use as `this` in the `this#_log`.
     */
    _logThisArg;
    /**
     * Button middleware.
     */
    _runButtonMiddleware = () => true;
    /**
     * Chat command middleware.
     */
    _runChatCommandMiddleware = () => true;
    /**
     * Context menu command middleware.
     */
    _runContextMenuCommandMiddleware = () => true;
    /**
     * Modal middleware.
     */
    _runModalMiddleware = () => true;
    /**
     * The nonce to use for indexing commands with an unknown ID.
     */
    _unknownCommandIdNonce = 0;
    /**
     * Create the command handler.
     * @param client The Distype client to bind the command handler to.
     * @param logCallback A {@link LogCallback callback} to be used for logging events internally throughout the command handler.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(client, logCallback = () => { }, logThisArg) {
        this.client = client;
        this.client.gateway.on(`INTERACTION_CREATE`, ({ d }) => this._onInteraction(d));
        this._log = logCallback.bind(logThisArg);
        this._logThisArg = logThisArg;
        this._log(`Initialized command handler`, {
            level: `DEBUG`, system: this.system
        });
    }
    /**
     * Sends a message.
     * @param channelId The channel to send the message in.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     */
    async sendMessage(channelId, message, components, bindComponents = true) {
        const sent = await this.client.rest.createMessage(channelId, (0, messageFactory_1.messageFactory)(message, components));
        if (components && bindComponents)
            this.bindComponents(components);
        return sent;
    }
    /**
     * Edits a message.
     * @param channelId The channel the message was sent in.
     * @param messageId The ID of the message to edit.
     * @param message The new message.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     */
    async editMessage(channelId, messageId, message, components, bindComponents = true) {
        const edited = await this.client.rest.editMessage(channelId, messageId, (0, messageFactory_1.messageFactory)(message, components));
        if (components && bindComponents)
            this.bindComponents(components);
        return edited;
    }
    /**
     * Load {@link CommandHandlerCommand commands} / {@link Button buttons} / {@link Modal modals} from a directory.
     * @param directory The directory to load from.
     */
    async load(directory) {
        if (!(0, node_path_1.isAbsolute)(directory))
            directory = (0, node_path_1.resolve)(process.cwd(), directory);
        const files = await (0, promises_1.readdir)(directory, { withFileTypes: true });
        for (const file in files) {
            if (files[file].isDirectory()) {
                await this.load((0, node_path_1.resolve)(directory, files[file].name));
                continue;
            }
            if (!files[file].name.endsWith(`.js`))
                continue;
            delete require.cache[require.resolve((0, node_path_1.resolve)(directory, files[file].name))];
            const imported = await Promise.resolve().then(() => __importStar(require((0, node_path_1.resolve)(directory, files[file].name))));
            const structure = imported.default ?? imported;
            if (structure instanceof ChatCommand_1.ChatCommand || structure instanceof ContextMenuCommand_1.ContextMenuCommand) {
                this.bindCommand(structure);
            }
            else if (structure instanceof Button_1.Button) {
                this.bindButton(structure);
            }
            else if (structure instanceof Modal_1.Modal) {
                this.bindModal(structure);
            }
        }
    }
    /**
     * Bind a {@link CommandHandlerCommand command} to the command handler.
     * @param command The {@link CommandHandlerCommand command} to add.
     */
    bindCommand(command) {
        if (this.commands.find((c) => c.props.name === command.props.name && c.props.type === command.props.type))
            throw new DistypeCmdError_1.DistypeCmdError(`Commands of the same type cannot share names`, DistypeCmdError_1.DistypeCmdErrorType.DUPLICATE_COMMAND_NAME);
        this.commands.set(`unknown${this._unknownCommandIdNonce}`, command);
        this._unknownCommandIdNonce++;
        this._log(`Added command "${command.props.name}" (${DiscordTypes.ApplicationCommandType[command.props.type]})`, {
            level: `DEBUG`, system: this.system
        });
        return this;
    }
    /**
     * Bind a {@link Button button} to the command handler.
     * @param button The {@link Button button} to bind.
     */
    bindButton(button) {
        const raw = button.getRaw();
        if (typeof raw.custom_id !== `string` || this.buttons.find((b, customId) => b === button && customId === raw.custom_id))
            return this;
        if (this.buttons.find((_, customId) => customId === raw.custom_id))
            this._log(`Overriding existing component with ID ${raw.custom_id}`, {
                level: `DEBUG`, system: this.system
            });
        this.buttons.set(raw.custom_id, button);
        this._setButtonExpireTimeout(button);
        this._log(`Bound button with custom ID ${raw.custom_id}`, {
            level: `DEBUG`, system: this.system
        });
        return this;
    }
    /**
     * Unbind a {@link Button button} from the command handler.
     * @param id The {@link Button button}'s custom ID.
     */
    unbindButton(id) {
        const button = this.buttons.get(id);
        if (button?.expireTimeout)
            clearTimeout(button.expireTimeout);
        this.buttons.delete(id);
        return this;
    }
    /**
     * Bind a {@link Modal modal} to the command handler.
     * @param modal The {@link Modal modal} to bind.
     */
    bindModal(modal) {
        if (this.modals.find((m, customId) => m === modal && customId === modal.props.custom_id))
            return this;
        if (this.modals.find((_, customId) => customId === modal.props.custom_id))
            this._log(`Overriding existing modal with ID ${modal.props.custom_id}`, {
                level: `DEBUG`, system: this.system
            });
        this.modals.set(modal.props.custom_id, modal);
        this._log(`Bound modal with custom ID ${modal.props.custom_id}`, {
            level: `DEBUG`, system: this.system
        });
        return this;
    }
    /**
     * Unbind a {@link Modal modal} from the command handler.
     * @param id The {@link Modal modal}'s custom ID.
     */
    unbindModal(id) {
        this.modals.delete(id);
        return this;
    }
    /**
     * Binds message components to the command handler.
     * @param components The components to bind.
     */
    bindComponents(components) {
        if (!Array.isArray(components)) {
            if (components instanceof Button_1.Button)
                this.bindButton(components);
        }
        else {
            components.flat().forEach((component) => {
                if (component instanceof Button_1.Button)
                    this.bindButton(component);
            });
        }
    }
    /**
     * Unbinds message components to the command handler.
     * @param components The components to unbind.
     */
    unbindComponents(components) {
        if (!Array.isArray(components)) {
            if (components instanceof Button_1.Button)
                this.unbindButton(components.getRaw().custom_id);
        }
        else {
            components.flat().forEach((component) => {
                if (component instanceof Button_1.Button)
                    this.unbindButton(component.getRaw().custom_id);
            });
        }
    }
    /**
     * Pushes added / changed / deleted {@link CommandHandlerCommand commands} to Discord.
     */
    async push(applicationId = this.client.gateway.user?.id ?? undefined) {
        if (!applicationId)
            throw new DistypeCmdError_1.DistypeCmdError(`Application ID is undefined`, DistypeCmdError_1.DistypeCmdErrorType.APPLICATION_ID_UNDEFINED);
        const commands = this.commands.map((command) => command.getRaw());
        this._log(`Pushing ${commands.length} commands`, {
            level: `INFO`, system: this.system
        });
        const applicationCommands = await this.client.rest.getGlobalApplicationCommands(applicationId);
        this._log(`Found ${applicationCommands.length} registered commands`, {
            level: `DEBUG`, system: this.system
        });
        const newCommands = commands.filter((command) => !applicationCommands.find((applicationCommand) => (0, node_util_1.isDeepStrictEqual)(command, (0, sanitizeCommand_1.sanitizeCommand)(applicationCommand))));
        const deletedCommands = applicationCommands.filter((applicationCommand) => !commands.find((command) => (0, node_util_1.isDeepStrictEqual)(command, (0, sanitizeCommand_1.sanitizeCommand)(applicationCommand))));
        if (newCommands.length)
            this._log(`New: ${newCommands.map((command) => `"${command.name}"`).join(`, `)}`, {
                level: `DEBUG`, system: this.system
            });
        if (deletedCommands.length)
            this._log(`Delete: ${deletedCommands.map((command) => `"${command.name}"`).join(`, `)}`, {
                level: `DEBUG`, system: this.system
            });
        for (const command of newCommands) {
            await this.client.rest.createGlobalApplicationCommand(applicationId, command);
        }
        for (const command of deletedCommands) {
            await this.client.rest.deleteGlobalApplicationCommand(applicationId, command.id);
        }
        const pushedCommands = newCommands.length + deletedCommands.length ? await this.client.rest.getGlobalApplicationCommands(applicationId) : applicationCommands;
        pushedCommands.forEach((pushedCommand) => {
            const matchingCommandKey = this.commands.findKey((command) => (0, node_util_1.isDeepStrictEqual)(command.getRaw(), (0, sanitizeCommand_1.sanitizeCommand)(pushedCommand)));
            const matchingCommand = this.commands.get(matchingCommandKey ?? ``);
            if (matchingCommandKey && matchingCommand) {
                this.commands.delete(matchingCommandKey);
                this.commands.set(pushedCommand.id, matchingCommand);
            }
        });
        this._log(`Created ${newCommands.length} commands, deleted ${deletedCommands.length} commands (Application now owns ${pushedCommands.length} commands)`, {
            level: `INFO`, system: this.system
        });
    }
    /**
     * Set the error callback function to run when an interaction's execution fails.
     * @param errorCallback The callback to use.
     */
    setError(errorCallback) {
        this.runError = errorCallback;
        return this;
    }
    /**
     * Set the error callback function to run when a component's expire callback fails.
     * @param errorCallback The callback to use.
     */
    setExpireError(errorCallback) {
        this.runExpireError = errorCallback;
        return this;
    }
    /**
     * Set middleware for {@link Button buttons}.
     * @param middleware The middleware callback. If it returns `false`, the {@link Button button} will not be executed.
     */
    setButtonMiddleware(middleware) {
        this._runButtonMiddleware = middleware;
        return this;
    }
    /**
     * Set middleware for {@link ChatCommand chat command}.
     * @param middleware The middleware callback. If it returns `false`, the {@link ChatCommand chat command} will not be executed.
     */
    setChatCommandMiddleware(middleware) {
        this._runChatCommandMiddleware = middleware;
        return this;
    }
    /**
     * Set middleware for {@link ContextMenuCommand context menu commands}.
     * @param middleware The middleware callback. If it returns `false`, the {@link ContextMenuCommand context menu command} will not be executed.
     */
    setContextMenuCommandMiddleware(middleware) {
        this._runContextMenuCommandMiddleware = middleware;
        return this;
    }
    /**
     * Set middleware for {@link Modal modals}.
     * @param middleware The middleware callback. If it returns `false`, the {@link Modal modal} will not be executed.
     */
    setModalMiddleware(middleware) {
        this._runModalMiddleware = middleware;
        return this;
    }
    /**
     * Callback to run when receiving an interaction.
     * @param interaction The received interaction.
     */
    async _onInteraction(interaction) {
        let middleware;
        let run;
        let ctx;
        switch (interaction.type) {
            case DiscordTypes.InteractionType.ApplicationCommand: {
                const command = this.commands.get(interaction.data.id);
                if (command) {
                    if (command.props.type === DiscordTypes.ApplicationCommandType.ChatInput) {
                        middleware = this._runChatCommandMiddleware;
                        run = command.runExecute;
                        ctx = new ChatCommand_1.ChatCommandContext(interaction, command, this, this._log, this._logThisArg);
                    }
                    else {
                        middleware = this._runContextMenuCommandMiddleware;
                        run = command.runExecute;
                        ctx = new ContextMenuCommand_1.ContextMenuCommandContext(interaction, command, this, this._log, this._logThisArg);
                    }
                }
                break;
            }
            case DiscordTypes.InteractionType.MessageComponent: {
                if (interaction.data.component_type === DiscordTypes.ComponentType.Button) {
                    const button = this.buttons.get(interaction.data.custom_id);
                    if (button) {
                        middleware = this._runButtonMiddleware;
                        run = button.runExecute;
                        ctx = new Button_1.ButtonContext(interaction, button, this, this._log, this._logThisArg);
                        this._setButtonExpireTimeout(button);
                    }
                }
                break;
            }
            case DiscordTypes.InteractionType.ModalSubmit: {
                const modal = this.modals.get(interaction.data.custom_id);
                if (modal) {
                    middleware = this._runModalMiddleware;
                    run = modal.runExecute;
                    ctx = new Modal_1.ModalContext(interaction, modal, this, this._log, this._logThisArg);
                }
                break;
            }
        }
        if (typeof middleware === `function` && typeof run === `function` && ctx) {
            this._log(`Running interaction ${interaction.id}`, {
                level: `DEBUG`, system: this.system
            });
            try {
                const middlewareCall = middleware(ctx);
                let middlewareResult;
                if (middlewareCall instanceof Promise) {
                    const reject = await middlewareCall.catch((error) => error);
                    if (reject instanceof Error)
                        throw reject;
                    else
                        middlewareResult = reject;
                }
                else {
                    middlewareResult = middlewareCall;
                }
                if (middlewareResult === false)
                    return;
                const call = run(ctx);
                if (call instanceof Promise) {
                    const reject = await call.then(() => { }).catch((error) => error);
                    if (reject instanceof Error)
                        throw reject;
                }
            }
            catch (error) {
                try {
                    const call = this.runError(ctx, error instanceof Error ? error : new Error(error), true);
                    if (call instanceof Promise) {
                        const reject = await call.then(() => { }).catch((error) => error);
                        if (reject instanceof Error)
                            throw reject;
                    }
                }
                catch (eError) {
                    this._log(`Unable to run error callback on interaction ${interaction.id}: ${(eError?.message ?? eError) ?? `Unknown reason`}`, {
                        level: `ERROR`, system: this.system
                    });
                }
            }
        }
    }
    /**
     * Set the expire timeout for a button.
     * @param button The button to set the timeout for.
     */
    _setButtonExpireTimeout(button) {
        if (button.expireTimeout)
            clearTimeout(button.expireTimeout);
        if (button.expireTime === null)
            return;
        button.expireTimeout = setTimeout(async () => {
            const raw = button.getRaw();
            const ctx = new Button_1.ButtonExpireContext(raw.custom_id, raw.type, button, this, this._log, this._logThisArg);
            try {
                if (typeof button.runExecuteExpire === `function`) {
                    const call = button.runExecuteExpire(ctx);
                    if (call instanceof Promise) {
                        const result = await call.then((res) => Boolean(res)).catch((error) => error);
                        if (result instanceof Error)
                            throw result;
                        if (result) {
                            this._log(`Component "${ctx.component.customId}" (${DiscordTypes.ComponentType[ctx.component.type]}) expired`, {
                                level: `DEBUG`, system: this.system
                            });
                            this.buttons.delete(raw.custom_id);
                        }
                        else {
                            this._setButtonExpireTimeout(button);
                        }
                    }
                    else if (call) {
                        this._log(`Component "${ctx.component.customId}" (${DiscordTypes.ComponentType[ctx.component.type]}) expired`, {
                            level: `DEBUG`, system: this.system
                        });
                        this.buttons.delete(raw.custom_id);
                    }
                    else {
                        this._setButtonExpireTimeout(button);
                    }
                }
                else {
                    this._log(`Component "${ctx.component.customId}" (${DiscordTypes.ComponentType[ctx.component.type]}) expired`, {
                        level: `DEBUG`, system: this.system
                    });
                    this.buttons.delete(raw.custom_id);
                }
            }
            catch (error) {
                try {
                    const call = this.runExpireError(ctx, error instanceof Error ? error : new Error(error), true);
                    if (call instanceof Promise) {
                        const reject = await call.then(() => { }).catch((error) => error);
                        if (reject instanceof Error)
                            throw reject;
                    }
                }
                catch (eError) {
                    this._log(`Unable to run expire callback for component "${ctx.component.customId}" (${DiscordTypes.ComponentType[ctx.component.type]}): ${(eError?.message ?? eError) ?? `Unknown reason`}`, {
                        level: `ERROR`, system: this.system
                    });
                }
            }
        }, button.expireTime);
    }
}
exports.CommandHandler = CommandHandler;
