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
exports.ContextMenuCommandContext = exports.ContextMenuCommand = void 0;
const BaseContext_1 = require("./BaseContext");
const DistypeCmdError_1 = require("../errors/DistypeCmdError");
const sanitizeCommand_1 = require("../functions/sanitizeCommand");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
const distype_1 = require("distype");
/**
 * The context command command builder.
 *
 * @example
 * ```ts
 * new ContextMenuCommand()
 *   .setType(`user`)
 *   .setName(`User Command`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You selected "${ctx.target.user.username}""`);
 *   });
 * ```
 */
class ContextMenuCommand {
    /**
     * The command's props.
     */
    props = {};
    /**
     * The command's execute method.
     * @internal
     */
    run = null;
    /**
     * Set the command's type.
     * @param type The type to use.
     * @returns The command.
     */
    setType(type) {
        this.props.type = type === `message` ? DiscordTypes.ApplicationCommandType.Message : DiscordTypes.ApplicationCommandType.User;
        return this;
    }
    /**
     * Set the command's name.
     * @param name The name to use.
     * @returns The command.
     */
    setName(name) {
        if (name.length > distype_1.DiscordConstants.APPLICATION_COMMAND_LIMITS.NAME)
            throw new DistypeCmdError_1.DistypeCmdError(`Specified name is longer than maximum length ${distype_1.DiscordConstants.APPLICATION_COMMAND_LIMITS.NAME}`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_CONTEX_MENU_COMMAND_VALUE);
        this.props.name = name;
        return this;
    }
    /**
     * Set the command's name localizations.
     * @param nameLocalizaions The name localizations to use.
     * @returns The command.
     */
    setNameLocalizations(nameLocalizaions) {
        this.props.name_localizations = nameLocalizaions;
        return this;
    }
    /**
     * Set the command's default permission.
     * @param defaultPermission The default permission to use.
     * @returns The command.
     */
    setDefaultPermission(defaultPermission) {
        this.props.default_permission = defaultPermission;
        return this;
    }
    /**
     * Sets the command's execute method.
     * @param exec The callback to execute when an interaction is received.
     */
    setExecute(exec) {
        this.run = exec;
        return this;
    }
    /**
     * Converts a command to a Discord API compatible object.
     * @returns The converted command.
     */
    getRaw() {
        if (typeof this.props.type !== `number`)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot convert a command with a missing "type" parameter to raw`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_CONTEX_MENU_COMMAND_PARAMETERS_FOR_RAW);
        if (typeof this.props.name !== `string`)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot convert a command with a missing "name" parameter to raw`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_CONTEX_MENU_COMMAND_PARAMETERS_FOR_RAW);
        return (0, sanitizeCommand_1.sanitizeCommand)(this.props);
    }
}
exports.ContextMenuCommand = ContextMenuCommand;
/**
 * Context menu command context.
 */
class ContextMenuCommandContext extends BaseContext_1.BaseContextWithModal {
    /**
     * The ID of the channel that the command was ran in.
     */
    channelId;
    /**
     * Command data.
     */
    command;
    /**
     * The executed command's target.
     */
    target;
    /**
     * The ID of the executed command's target.
     */
    targetId;
    /**
     * Create a context menu command's context.
     * @param commandHandler The command handler that invoked the context.
     * @param command The command that invoked the context.
     * @param interaction Interaction data.
     */
    constructor(commandHandler, command, interaction) {
        super(commandHandler, interaction);
        this.channelId = interaction.channel_id;
        this.command = {
            ...command.props,
            id: interaction.data.id
        };
        this.target = command.props.type === DiscordTypes.ApplicationCommandType.Message
            ? interaction.data.resolved.messages[interaction.data.target_id]
            : {
                user: interaction.data.resolved.users[interaction.data.target_id],
                member: interaction.data.resolved.members?.[interaction.data.target_id]
            };
        this.targetId = interaction.data.target_id;
    }
}
exports.ContextMenuCommandContext = ContextMenuCommandContext;
