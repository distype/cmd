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
const sanitizeCommand_1 = require("../functions/sanitizeCommand");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
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
     * @internal
     */
    props = {};
    /**
     * The command's execute method.
     * @internal
     */
    runExecute = null;
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
        this.props.name = name;
        return this;
    }
    /**
     * Set the command's name localizations.
     * @param nameLocalizations The name localizations to use.
     * @returns The command.
     */
    setNameLocalizations(nameLocalizations) {
        this.props.name_localizations = nameLocalizations;
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
     * @param executeCallback The callback to execute when an interaction is received.
     */
    setExecute(executeCallback) {
        this.runExecute = executeCallback;
        return this;
    }
    /**
     * Converts a command to a Discord API compatible object.
     * @returns The converted command.
     */
    getRaw() {
        return (0, sanitizeCommand_1.sanitizeCommand)(this.props);
    }
}
exports.ContextMenuCommand = ContextMenuCommand;
/**
 * {@link ContextMenuCommand Context menu command} context.
 */
class ContextMenuCommandContext extends BaseContext_1.BaseInteractionContextWithModal {
    /**
     * The ID of the channel that the command was ran in.
     */
    channelId;
    /**
     * Command data.
     */
    command;
    /**
     * The {@link ContextMenuCommand context menu command} the context originates from.
     */
    contextParent;
    /**
     * The executed command's target.
     */
    target;
    /**
     * The ID of the executed command's target.
     */
    targetId;
    /**
     * Create {@link ContextMenuCommand context menu command} context.
     * @param interaction Interaction data.
     * @param contextMenuCommand The {@link ContextMenuCommand context menu command} the context originates from.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(interaction, contextMenuCommand, commandHandler, logCallback = () => { }, logThisArg) {
        super(interaction, commandHandler, logCallback, logThisArg);
        this.channelId = interaction.channel_id;
        this.command = {
            ...contextMenuCommand.props,
            id: interaction.data.id
        };
        this.contextParent = contextMenuCommand;
        this.target = contextMenuCommand.props.type === DiscordTypes.ApplicationCommandType.Message
            ? interaction.data.resolved.messages[interaction.data.target_id]
            : {
                user: interaction.data.resolved.users[interaction.data.target_id],
                member: interaction.data.resolved.members?.[interaction.data.target_id]
            };
        this.targetId = interaction.data.target_id;
    }
}
exports.ContextMenuCommandContext = ContextMenuCommandContext;
