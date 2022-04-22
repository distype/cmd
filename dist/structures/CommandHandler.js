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
const node_utils_1 = require("@br88c/node-utils");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
class CommandHandler {
    /**
     * Create the command handler.
     * @param client The client to bind the command handler to.
     * @param logCallback A {@link LogCallback callback} to be used for logging events internally throughout the command handler.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(client, logCallback = () => { }, logThisArg) {
        /**
         * The command handler's buttons.
         */
        this.buttons = new node_utils_1.ExtendedMap();
        /**
         * The command handler's commands.
         */
        this.commands = new node_utils_1.ExtendedMap();
        /**
         * The command handler's modals.
         */
        this.modals = new node_utils_1.ExtendedMap();
        /**
         * Called when a command encounters an error.
         * @param error The error encountered.
         * @param unexpected If the error was unexpected (not called via `ctx.error()`).
         * @internal
         */
        this.runError = (error, ctx, unexpected) => this._log(`${unexpected ? `Unexpected ` : ``}${error.name} when running interaction ${ctx.interaction.id}: ${error.message}`, {
            level: `ERROR`, system: this.system
        });
        /**
         * The system string used for emitting errors and for the {@link LogCallback log callback}.
         */
        this.system = `Command Handler`;
        /**
         * Button middleware.
         */
        this._runButtonMiddleware = () => true;
        /**
         * Chat command middleware.
         */
        this._runChatCommandMiddleware = () => true;
        /**
         * Context menu command middleware.
         */
        this._runContextMenuCommandMiddleware = () => true;
        /**
         * Modal middleware.
         */
        this._runModalMiddleware = () => true;
        /**
         * The nonce to use for indexing commands with an unknown ID.
         */
        this._unknownNonce = 0;
        this.client = client;
        this.client.gateway.on(`INTERACTION_CREATE`, ({ d }) => this._onInteraction(d));
        this._log = logCallback.bind(logThisArg);
        this._log(`Initialized command handler`, {
            level: `DEBUG`, system: this.system
        });
    }
    /**
     * Bind a command to the command handler.
     * @param command The command to add.
     */
    bindCommand(command) {
        command.getRaw();
        if (this.commands.find((c) => c.props.name === command.props.name && c.props.type === command.props.type))
            throw new DistypeCmdError_1.DistypeCmdError(`Commands of the same type cannot share names`, DistypeCmdError_1.DistypeCmdErrorType.DUPLICATE_COMMAND_NAME);
        this.commands.set(`unknown${this._unknownNonce}`, command);
        this._unknownNonce++;
        this._log(`Added command "${command.props.name}" (${DiscordTypes.ApplicationCommandType[command.props.type]})`, {
            level: `DEBUG`, system: this.system
        });
        return this;
    }
    /**
     * Bind a button to the command handler.
     * @param button The button to bind.
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
        this._log(`Bound button with custom ID ${raw.custom_id}`, {
            level: `DEBUG`, system: this.system
        });
        return this;
    }
    /**
     * Unbind a button from the command handler.
     * @param id The button's custom ID.
     */
    unbindButton(id) {
        this.buttons.delete(id);
        return this;
    }
    /**
     * Bind a modal to the command handler.
     * @param modal The modal to bind.
     */
    bindModal(modal) {
        if (this.modals.find((m, customId) => m === modal && customId === modal.props.custom_id))
            return this;
        modal.getRaw();
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
     * Unbind a modal from the command handler.
     * @param id The modal's custom ID.
     */
    unbindModal(id) {
        this.modals.delete(id);
        return this;
    }
    /**
     * Pushes added / changed / deleted slash commands to Discord.
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
        const newCommands = commands.filter((command) => !applicationCommands.find((applicationCommand) => (0, node_utils_1.deepEquals)(command, (0, sanitizeCommand_1.sanitizeCommand)(applicationCommand))));
        const deletedCommands = applicationCommands.filter((applicationCommand) => !commands.find((command) => (0, node_utils_1.deepEquals)(command, (0, sanitizeCommand_1.sanitizeCommand)(applicationCommand))));
        if (newCommands.length)
            this._log(`New: ${newCommands.map((command) => `"${command.name}"`).join(`, `)}`, {
                level: `DEBUG`, system: this.system
            });
        if (deletedCommands.length)
            this._log(`Delete: ${deletedCommands.map((command) => `"${command.name}"`).join(`, `)}`, {
                level: `DEBUG`, system: this.system
            });
        const promises = [];
        newCommands.forEach((command) => promises.push(this.client.rest.createGlobalApplicationCommand(applicationId, command)));
        deletedCommands.forEach((applicationCommand) => promises.push(this.client.rest.deleteGlobalApplicationCommand(applicationId, applicationCommand.id)));
        await Promise.all(promises);
        const pushedCommands = newCommands.length + deletedCommands.length ? await this.client.rest.getGlobalApplicationCommands(applicationId) : applicationCommands;
        pushedCommands.forEach((pushedCommand) => {
            const matchingCommandKey = this.commands.findKey((command) => (0, node_utils_1.deepEquals)(command.getRaw(), (0, sanitizeCommand_1.sanitizeCommand)(pushedCommand)));
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
     * Set the error callback function to run when a command's execution fails
     * @param erroCallback The callback to use.
     */
    setError(erroCallback) {
        this.runError = erroCallback;
        return this;
    }
    /**
     * Set middleware for buttons.
     * @param middleware The middleware callback. If it returns `false`, the button will not be executed.
     */
    setButtonMiddleware(middleware) {
        this._runButtonMiddleware = middleware;
        return this;
    }
    /**
     * Set middleware for chat commands.
     * @param middleware The middleware callback. If it returns `false`, the button will not be executed.
     */
    setChatCommandMiddleware(middleware) {
        this._runChatCommandMiddleware = middleware;
        return this;
    }
    /**
     * Set middleware for context menu commands.
     * @param middleware The middleware callback. If it returns `false`, the button will not be executed.
     */
    setContextMenuCommandMiddleware(middleware) {
        this._runContextMenuCommandMiddleware = middleware;
        return this;
    }
    /**
     * Set middleware for modals.
     * @param middleware The middleware callback. If it returns `false`, the button will not be executed.
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
                        run = command.run;
                        ctx = new ChatCommand_1.ChatCommandContext(this, command, interaction);
                    }
                    else {
                        middleware = this._runContextMenuCommandMiddleware;
                        run = command.run;
                        ctx = new ContextMenuCommand_1.ContextMenuCommandContext(this, command, interaction);
                    }
                }
                break;
            }
            case DiscordTypes.InteractionType.MessageComponent: {
                if (interaction.data.component_type === DiscordTypes.ComponentType.Button) {
                    const button = this.buttons.get(interaction.data.custom_id);
                    if (button) {
                        middleware = this._runButtonMiddleware;
                        run = button.run;
                        ctx = new Button_1.ButtonContext(this, interaction);
                    }
                }
                break;
            }
            case DiscordTypes.InteractionType.ModalSubmit: {
                const modal = this.modals.get(interaction.data.custom_id);
                if (modal) {
                    middleware = this._runModalMiddleware;
                    run = modal.run;
                    ctx = new Modal_1.ModalContext(this, modal, interaction);
                }
                break;
            }
        }
        if (typeof middleware === `function` && typeof run === `function` && ctx) {
            try {
                const middlwareCall = middleware(ctx);
                let middlewareResult;
                if (middlwareCall instanceof Promise) {
                    const reject = await middlwareCall.catch((error) => error);
                    if (reject instanceof Error)
                        throw reject;
                    else
                        middlewareResult = reject;
                }
                else {
                    middlewareResult = middlwareCall;
                }
                if (middlewareResult === false)
                    return;
                const call = run(ctx);
                if (call instanceof Promise) {
                    const reject = await call.catch((error) => error);
                    if (reject instanceof Error)
                        throw reject;
                }
            }
            catch (error) {
                try {
                    this.runError(error instanceof Error ? error : new Error(error), ctx, true);
                }
                catch (eError) {
                    this._log(`Unable to run error callback on interaction ${interaction.id}: ${(eError?.message ?? eError) ?? `Unknown reason`}`, {
                        level: `ERROR`, system: this.system
                    });
                }
            }
        }
    }
}
exports.CommandHandler = CommandHandler;
