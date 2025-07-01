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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const ChatCommand_1 = require("./commands/ChatCommand");
const MessageCommand_1 = require("./commands/MessageCommand");
const UserCommand_1 = require("./commands/UserCommand");
const Button_1 = require("./components/Button");
const ChannelSelect_1 = require("./components/ChannelSelect");
const MentionableSelect_1 = require("./components/MentionableSelect");
const RoleSelect_1 = require("./components/RoleSelect");
const StringSelect_1 = require("./components/StringSelect");
const UserSelect_1 = require("./components/UserSelect");
const Modal_1 = require("./modals/Modal");
const sanitizeCommand_1 = require("../utils/sanitizeCommand");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
const distype_1 = require("distype");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_util_1 = require("node:util");
/**
 * The command handler.
 */
class CommandHandler {
    /**
     * The client the command handler is bound to.
     */
    client;
    /**
     * The system string used for logging.
     */
    system = `Command Handler`;
    /**
     * Bound commands.
     * Key is their ID.
     */
    _boundCommands = new distype_1.ExtendedMap();
    /**
     * Bound components.
     */
    _boundComponents = new Set();
    /**
     * Bound expires.
     */
    _boundExpires = new Set();
    /**
     * Bound modals.
     */
    _boundModals = new Set();
    /**
     * Error function.
     */
    _error = () => { };
    /**
     * Middleware function.
     */
    _middleware = () => true;
    /**
     * Create the command handler.
     * @param client The Distype client to bind the command handler to.
     */
    constructor(client) {
        this.client = client;
        this.client.gateway.on(`INTERACTION_CREATE`, ({ d }) => this._onInteraction(d));
        this.client.log(`Initialized command handler`, {
            level: `DEBUG`,
            system: this.system,
        });
    }
    /**
     * Returns structures found in a directory and its subdirectories.
     * Only loads default exports.
     * @param directories The directory to search.
     * @returns Found structures.
     */
    async extractFromDirectories(...directories) {
        const structures = [];
        for (const directory of directories) {
            const path = (0, node_path_1.isAbsolute)(directory)
                ? directory
                : (0, node_path_1.resolve)(process.cwd(), directory);
            const files = await (0, promises_1.readdir)(path, { withFileTypes: true });
            for (const file in files) {
                if (files[file].isDirectory()) {
                    structures.push(...(await this.extractFromDirectories((0, node_path_1.resolve)(path, files[file].name))));
                    continue;
                }
                if (!files[file].name.endsWith(`.js`))
                    continue;
                delete require.cache[require.resolve((0, node_path_1.resolve)(path, files[file].name))];
                const imported = await Promise.resolve(`${(0, node_path_1.resolve)(path, files[file].name)}`).then(s => __importStar(require(s)));
                const structure = imported.default ?? imported;
                if (CommandHandler.isCompatableStructure(structure))
                    structures.push(structure);
            }
        }
        return structures;
    }
    /**
     * Loads interaction structures from a directory and its subdirectories.
     * Only loads default exports. Note that {@link Expire expire helpers} cannot be loaded.
     * @param directories The directory to search.
     */
    async loadDirectories(...directories) {
        const structures = await this.extractFromDirectories(...directories);
        const commands = structures.filter((structure) => CommandHandler.isCommand(structure));
        const customIds = structures.filter((structure) => CommandHandler.isComponent(structure) ||
            CommandHandler.isModal(structure));
        await this.pushCommands(...commands);
        this.bind(...customIds);
    }
    /**
     * Pushes {@link Command commands} to the API.
     * Note that guilds that already have commands published that dont have any defined locally will not be overwritten.
     * @param commands Commands to load.
     */
    async pushCommands(...commands) {
        this.client.log(`Pushing ${commands.length} commands`, {
            level: `INFO`,
            system: this.system,
        });
        await this._pushGlobalCommands(commands);
        await this._pushGuildCommands(commands);
    }
    /**
     * Binds structures that use custom IDs.
     * @param structures The structures to bind.
     * @returns The command handler.
     */
    bind(...structures) {
        structures.forEach((structure) => {
            if (CommandHandler.isComponent(structure)) {
                this._boundComponents.add(structure);
            }
            else if (CommandHandler.isModal(structure)) {
                this._boundModals.add(structure);
            }
            else {
                structure.commandHandler = this;
                this._boundExpires.add(structure);
                this.bind(...structure.structures);
                structure.resetTimer();
            }
        });
        return this;
    }
    /**
     * Unbind structures that use custom IDs.
     * @param structures The structures to unbind.
     * @returns The command handler.
     */
    unbind(...structures) {
        structures.forEach((structure) => {
            if (CommandHandler.isComponent(structure)) {
                this._boundComponents.delete(structure);
            }
            else if (CommandHandler.isModal(structure)) {
                this._boundModals.delete(structure);
            }
            else {
                this._boundExpires.delete(structure);
                this.unbind(...structure.structures);
                structure.clearTimer();
            }
        });
        return this;
    }
    /**
     * Set the error function for the command handler.
     * @returns The command handler.
     */
    setError(errorFunction) {
        this._error = errorFunction;
        return this;
    }
    /**
     * Set the middleware function for the command handler.
     * @returns The command handler.
     */
    setMiddleware(middlewareFunction) {
        this._middleware = middlewareFunction;
        return this;
    }
    /**
     * Checks if a structure is a {@link Command command}.
     */
    static isCommand(structure) {
        return (structure instanceof ChatCommand_1.ChatCommand ||
            structure instanceof MessageCommand_1.MessageCommand ||
            structure instanceof UserCommand_1.UserCommand);
    }
    /**
     * Checks if a structure is a {@link Component component}.
     */
    static isComponent(structure) {
        return (structure instanceof Button_1.Button ||
            structure instanceof ChannelSelect_1.ChannelSelect ||
            structure instanceof MentionableSelect_1.MentionableSelect ||
            structure instanceof RoleSelect_1.RoleSelect ||
            structure instanceof StringSelect_1.StringSelect ||
            structure instanceof UserSelect_1.UserSelect);
    }
    /**
     * Checks if a structure is a {@link Modal modal}.
     */
    static isModal(structure) {
        return structure instanceof Modal_1.Modal;
    }
    /**
     * Checks if a structure is compatible with the command handler.
     */
    static isCompatableStructure(structure) {
        return (this.isCommand(structure) ||
            this.isComponent(structure) ||
            this.isModal(structure));
    }
    /**
     * Pushes global {@link Command commands} to the API.
     * @param commands Commands to load.
     */
    async _pushGlobalCommands(commands) {
        if (!this.client.gateway.user?.id)
            throw new Error(`Unable to push global commands: application ID is undefined (client.gateway.user.id)`);
        const local = commands
            .filter((command) => !command.getGuild())
            .map((command) => (0, sanitizeCommand_1.sanitizeCommand)(command.getRaw()));
        const published = await this.client.rest.getGlobalApplicationCommands(this.client.gateway.user.id, { with_localizations: true });
        this.client.log(`Found ${published.length} published global commands`, {
            level: `DEBUG`,
            system: this.system,
        });
        const deletedCommands = published.filter((published) => !local.find((local) => (0, node_util_1.isDeepStrictEqual)(local, (0, sanitizeCommand_1.sanitizeCommand)(published))));
        const newCommands = local.filter((local) => !published.find((published) => (0, node_util_1.isDeepStrictEqual)(local, (0, sanitizeCommand_1.sanitizeCommand)(published))));
        if (deletedCommands.length)
            this.client.log(`Delete (Global): ${deletedCommands.map((command) => `"${command.name}"`).join(`, `)}`, {
                level: `DEBUG`,
                system: this.system,
            });
        if (newCommands.length)
            this.client.log(`New (Global): ${newCommands.map((command) => `"${command.name}"`).join(`, `)}`, {
                level: `DEBUG`,
                system: this.system,
            });
        if (deletedCommands.length === published.length) {
            await this.client.rest.bulkOverwriteGlobalApplicationCommands(this.client.gateway.user.id, newCommands);
        }
        else {
            for (const command of deletedCommands) {
                await this.client.rest.deleteGlobalApplicationCommand(this.client.gateway.user.id, command.id);
            }
            for (const command of newCommands) {
                await this.client.rest.createGlobalApplicationCommand(this.client.gateway.user.id, command);
            }
        }
        const newPublished = newCommands.length + deletedCommands.length
            ? await this.client.rest.getGlobalApplicationCommands(this.client.gateway.user.id, {})
            : published;
        newPublished.forEach((command) => {
            const foundLocal = commands.find((local) => !local.getGuild() && local.getRaw().name === command.name);
            if (foundLocal)
                this._boundCommands.set(command.id, foundLocal);
        });
        this.client.log(`Created ${newCommands.length} global commands and deleted ${deletedCommands.length} global commands (Application now owns ${newPublished.length} global commands)`, {
            level: `INFO`,
            system: this.system,
        });
    }
    /**
     * Pushes guild {@link Command commands} to the API.
     * @param commands Commands to load.
     */
    async _pushGuildCommands(commands) {
        if (!this.client.gateway.user?.id)
            throw new Error(`Unable to push guild commands: application ID is undefined (client.gateway.user.id)`);
        const guilds = new Set(commands
            .map((command) => command.getGuild())
            .filter((guild) => guild));
        for (const guild of guilds) {
            const local = commands
                .filter((command) => command.getGuild() === guild)
                .map((command) => (0, sanitizeCommand_1.sanitizeGuildCommand)(command.getRaw()));
            const published = await this.client.rest.getGuildApplicationCommands(this.client.gateway.user.id, guild, { with_localizations: true });
            this.client.log(`Found ${published.length} published commands in guild ${guild}`, {
                level: `DEBUG`,
                system: this.system,
            });
            const deletedCommands = published.filter((published) => !local.find((local) => (0, node_util_1.isDeepStrictEqual)(local, (0, sanitizeCommand_1.sanitizeGuildCommand)(published))));
            const newCommands = local.filter((local) => !published.find((published) => (0, node_util_1.isDeepStrictEqual)(local, (0, sanitizeCommand_1.sanitizeGuildCommand)(published))));
            if (deletedCommands.length)
                this.client.log(`Delete (${guild}): ${deletedCommands.map((command) => `"${command.name}"`).join(`, `)}`, {
                    level: `DEBUG`,
                    system: this.system,
                });
            if (newCommands.length)
                this.client.log(`New (${guild}): ${newCommands.map((command) => `"${command.name}"`).join(`, `)}`, {
                    level: `DEBUG`,
                    system: this.system,
                });
            if (deletedCommands.length === published.length) {
                await this.client.rest.bulkOverwriteGuildApplicationCommands(this.client.gateway.user.id, guild, newCommands);
            }
            else {
                for (const command of deletedCommands) {
                    await this.client.rest.deleteGuildApplicationCommand(this.client.gateway.user.id, guild, command.id);
                }
                for (const command of newCommands) {
                    await this.client.rest.createGuildApplicationCommand(this.client.gateway.user.id, guild, command);
                }
            }
            const newPublished = newCommands.length + deletedCommands.length
                ? await this.client.rest.getGuildApplicationCommands(this.client.gateway.user.id, guild, {})
                : published;
            newPublished.forEach((command) => {
                const foundLocal = commands.find((local) => local.getRaw().name === command.name);
                if (foundLocal)
                    this._boundCommands.set(command.id, foundLocal);
            });
            this.client.log(`Created ${newCommands.length} commands and deleted ${deletedCommands.length} commands in guild ${guild} (Application now owns ${newPublished.length} commands in guild ${guild})`, {
                level: `INFO`,
                system: this.system,
            });
        }
    }
    /**
     * Callback to run when receiving an interaction.
     * @param interaction The received interaction.
     */
    async _onInteraction(interaction) {
        let structure;
        let context;
        switch (interaction.type) {
            case DiscordTypes.InteractionType.ApplicationCommand: {
                structure = this._boundCommands.get(interaction.data.id);
                switch (interaction.data.type) {
                    case DiscordTypes.ApplicationCommandType.ChatInput: {
                        if (structure)
                            context = new ChatCommand_1.ChatCommandContext(interaction, this);
                        break;
                    }
                    case DiscordTypes.ApplicationCommandType.Message: {
                        if (structure)
                            context = new MessageCommand_1.MessageCommandContext(interaction, this);
                        break;
                    }
                    case DiscordTypes.ApplicationCommandType.User: {
                        if (structure)
                            context = new UserCommand_1.UserCommandContext(interaction, this);
                        break;
                    }
                }
                break;
            }
            case DiscordTypes.InteractionType.MessageComponent: {
                structure = Array.from(this._boundComponents).find((component) => component.getCustomId() === interaction.data.custom_id &&
                    component.getType() === interaction.data.component_type);
                switch (interaction.data.component_type) {
                    case DiscordTypes.ComponentType.Button: {
                        if (structure)
                            context = new Button_1.ButtonContext(interaction, this);
                        break;
                    }
                    case DiscordTypes.ComponentType.ChannelSelect: {
                        if (structure)
                            context = new ChannelSelect_1.ChannelSelectContext(interaction, this);
                        break;
                    }
                    case DiscordTypes.ComponentType.MentionableSelect: {
                        if (structure)
                            context = new MentionableSelect_1.MentionableSelectContext(interaction, this);
                        break;
                    }
                    case DiscordTypes.ComponentType.RoleSelect: {
                        if (structure)
                            context = new RoleSelect_1.RoleSelectContext(interaction, this);
                        break;
                    }
                    case DiscordTypes.ComponentType.StringSelect: {
                        if (structure)
                            context = new StringSelect_1.StringSelectContext(interaction, this);
                        break;
                    }
                    case DiscordTypes.ComponentType.UserSelect: {
                        if (structure)
                            context = new UserSelect_1.UserSelectContext(interaction, this);
                        break;
                    }
                }
                break;
            }
            case DiscordTypes.InteractionType.ModalSubmit: {
                structure = Array.from(this._boundModals).find((modal) => modal.getCustomId() === interaction.data.custom_id);
                if (structure)
                    context = new Modal_1.ModalContext(interaction, this);
                break;
            }
        }
        if (!structure || !context)
            return;
        if (CommandHandler.isComponent(structure) ||
            CommandHandler.isModal(structure)) {
            const expire = Array.from(this._boundExpires).find((expire) => expire.structures.find((s) => s === structure));
            if (expire)
                expire.resetTimer();
        }
        this.client.log(`Running interaction ${interaction.id}`, {
            level: `DEBUG`,
            system: this.system,
        });
        try {
            const middlewareCall = this._middleware(context, structure.getMiddlewareMeta());
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
            const call = structure.getExecute()(context);
            if (call instanceof Promise) {
                const reject = await call.then(() => { }).catch((error) => error);
                if (reject instanceof Error)
                    throw reject;
            }
        }
        catch (error) {
            try {
                const call = this._error(context, error instanceof Error ? error : new Error(error));
                if (call instanceof Promise) {
                    const reject = await call
                        .then(() => { })
                        .catch((error) => error);
                    if (reject instanceof Error)
                        throw reject;
                }
            }
            catch (eError) {
                this.client.log(`Unable to run error callback on interaction ${interaction.id}: ${eError?.message ?? eError ?? `Unknown reason`}`, {
                    level: `ERROR`,
                    system: this.system,
                });
            }
        }
    }
}
exports.CommandHandler = CommandHandler;
