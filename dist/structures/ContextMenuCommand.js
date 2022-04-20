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
    constructor() {
        /**
         * The command's props.
         */
        this.props = {};
        /**
         * The command's execute method.
         * @internal
         */
        this.run = null;
    }
    /**
     * Set the command's type.
     * @param name The name to use.
     * @returns The command.
     */
    setType(name) {
        this.props.type = name === `message` ? DiscordTypes.ApplicationCommandType.Message : DiscordTypes.ApplicationCommandType.User;
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
        if (!this.props.type || !this.props.name)
            throw new Error(`A context menu command's type and name must be present to set its execute method`);
        this.run = exec;
        return this;
    }
}
exports.ContextMenuCommand = ContextMenuCommand;
/**
 * Context menu command context.
 */
class ContextMenuCommandContext extends BaseContext_1.BaseCommandContext {
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
