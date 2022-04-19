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
const ChatCommand_1 = require("./ChatCommand");
const ContextMenuCommand_1 = require("./ContextMenuCommand");
const Modal_1 = require("./Modal");
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
        this.runError = (error, ctx, unexpected) => this._log(`${unexpected ? `Unexpected ` : ``}${error.name} when running "${ctx.command.name}" (${ctx.command.id}): ${error.message}`, {
            level: `ERROR`, system: this.system
        });
        /**
         * The system string used for emitting errors and for the {@link LogCallback log callback}.
         */
        this.system = `Command Handler`;
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
     * Add a command to the command handler.
     * @param command The command to add.
     */
    add(command) {
        if (typeof command.props.type !== `number`)
            throw new Error(`Cannot push a command with a missing "type" parameter`);
        if (typeof command.props.name !== `string`)
            throw new Error(`Cannot push a command with a missing "name" parameter`);
        if (command instanceof ChatCommand_1.ChatCommand && typeof command.props.description !== `string`)
            throw new Error(`Cannot push a command with a missing "description" parameter`);
        if (this.commands.find((c) => c.props.name === command.props.name && c.props.type === command.props.type))
            throw new Error(`Commands of the same type cannot share names`);
        this.commands.set(`unknown${this._unknownNonce}`, command);
        this._unknownNonce++;
        this._log(`Added command "${command.props.name}" (${DiscordTypes.ApplicationCommandType[command.props.type]})`, {
            level: `DEBUG`, system: this.system
        });
        return this;
    }
    /**
     * Bind a modal to the command handler.
     * @param modal The modal to bind.
     */
    bindModal(modal) {
        if (this.modals.find((m, customId) => m === modal && customId === modal.props.custom_id))
            return this;
        if (typeof modal.props.custom_id !== `string`)
            throw new Error(`Cannot bind a modal will a missing "custom_id" parameter`);
        if (typeof modal.props.title !== `string`)
            throw new Error(`Cannot bind a modal will a missing "title" parameter`);
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
     * Pushes added / changed / deleted slash commands to Discord.
     */
    async push(applicationId = this.client.gateway.user?.id ?? undefined) {
        if (!applicationId)
            throw new Error(`Application ID is undefined`);
        const commands = this.commands.map((command) => this._commandToRaw(command));
        this._log(`Pushing ${commands.length} commands`, {
            level: `INFO`, system: this.system
        });
        const applicationCommands = await this.client.rest.getGlobalApplicationCommands(applicationId);
        this._log(`Found ${applicationCommands.length} registered commands`, {
            level: `DEBUG`, system: this.system
        });
        const newCommands = commands.filter((command) => !applicationCommands.find((applicationCommand) => (0, node_utils_1.deepEquals)(command, this._sanitizeRaw(applicationCommand))));
        const deletedCommands = applicationCommands.filter((applicationCommand) => !commands.find((command) => (0, node_utils_1.deepEquals)(command, this._sanitizeRaw(applicationCommand))));
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
        const pushedCommands = await this.client.rest.getGlobalApplicationCommands(applicationId);
        pushedCommands.forEach((pushedCommand) => {
            const matchingCommandKey = this.commands.findKey((command) => (0, node_utils_1.deepEquals)(this._commandToRaw(command), this._sanitizeRaw(pushedCommand)));
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
    }
    /**
     * Callback to run when receiving an interaction.
     * @param interaction The received interaction.
     */
    async _onInteraction(interaction) {
        let run;
        let ctx;
        switch (interaction.type) {
            case DiscordTypes.InteractionType.ApplicationCommand: {
                const command = this.commands.get(interaction.data.id);
                if (command) {
                    if (command.props.type === DiscordTypes.ApplicationCommandType.ChatInput) {
                        run = command.run;
                        ctx = new ChatCommand_1.ChatCommandContext(this, command, interaction);
                    }
                    else {
                        run = command.run;
                        ctx = new ContextMenuCommand_1.ContextMenuCommandContext(this, command, interaction);
                    }
                }
                break;
            }
            case DiscordTypes.InteractionType.ModalSubmit: {
                const modal = this.modals.get(interaction.data.custom_id);
                if (modal) {
                    run = modal.run;
                    ctx = new Modal_1.ModalContext(this, modal, interaction);
                }
            }
        }
        if (typeof run === `function` && ctx) {
            try {
                const call = run(ctx);
                if (call instanceof Promise) {
                    const reject = await call.then(() => false).catch((error) => error);
                    if (reject)
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
    /**
     * Converts a command to a Discord API compatible object.
     * @param command The command to convert.
     * @returns The converted command.
     */
    _commandToRaw(command) {
        if (typeof command.props.type !== `number`)
            throw new Error(`Cannot push a command with a missing "type" parameter`);
        if (typeof command.props.name !== `string`)
            throw new Error(`Cannot push a command with a missing "name" parameter`);
        if (command instanceof ChatCommand_1.ChatCommand && typeof command.props.description !== `string`)
            throw new Error(`Cannot push a command with a missing "description" parameter`);
        return this._sanitizeRaw({
            ...command.props,
            options: command instanceof ChatCommand_1.ChatCommand ? command.parameters : []
        });
    }
    /**
     * Sanitizes a raw command.
     * @param command The command to sanitize.
     * @returns The sanitized command.
     */
    _sanitizeRaw(command) {
        const raw = (0, node_utils_1.deepClone)({
            default_permission: command.default_permission ?? true,
            description: command.description ?? ``,
            description_localizations: command.description_localizations ?? {},
            name: command.name,
            name_localizations: command.name_localizations ?? {},
            options: command.options ?? [],
            type: command.type ?? DiscordTypes.ApplicationCommandType.ChatInput
        });
        (0, node_utils_1.traverseObject)(raw, (obj) => {
            if (typeof obj.autocomplete === `boolean` && !obj.autocomplete)
                delete obj.autocomplete;
            if (typeof obj.required === `boolean` && !obj.required)
                delete obj.required;
            Object.keys(obj).forEach((key) => {
                if (obj[key] === undefined)
                    delete obj[key];
            });
        });
        return raw;
    }
}
exports.CommandHandler = CommandHandler;
