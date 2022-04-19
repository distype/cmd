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
const messageFactory_1 = require("../functions/messageFactory");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * The context command command builder.
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
 * ContextMenu command context.
 */
class ContextMenuCommandContext {
    /**
     * Create a chat command's context.
     * @param client The client that received the interaction.
     * @param commandHandler The command handler that invoked the context.
     * @param interaction Interaction data.
     */
    constructor(client, commandHandler, command, interaction) {
        /**
         * If the original response was a defer.
         */
        this.deferred = null;
        /**
         * Message IDs of sent responses.
         */
        this.responses = [];
        this.client = client;
        this.commandHandler = commandHandler;
        this.channelId = interaction.channel_id;
        this.command = {
            ...command.props,
            id: interaction.data.id
        };
        this.guildId = interaction.guild_id ?? interaction.data.guild_id;
        this.guildLocale = interaction.guild_locale;
        this.interaction = {
            applicationId: interaction.application_id,
            id: interaction.id,
            token: interaction.token,
            type: interaction.type,
            version: interaction.version
        };
        this.member = interaction.member;
        this.target = command.props.type === DiscordTypes.ApplicationCommandType.Message
            ? interaction.data.resolved.messages[interaction.data.target_id]
            : {
                user: interaction.data.resolved.users[interaction.data.target_id],
                member: interaction.data.resolved.members?.[interaction.data.target_id]
            };
        this.targetId = interaction.data.target_id;
        this.user = {
            ...(interaction.member?.user ?? interaction.user),
            locale: interaction.locale ?? interaction.locale
        };
    }
    /**
     * Calls the command handler's error callback.
     * Note that this does not stop the execution of the command's execute method; you must also call `return`.
     * @param error The error encountered.
     */
    error(error) {
        this.commandHandler.runError(error, this, false);
    }
    /**
     * Defers the interaction (displays a loading state to the user).
     */
    async defer(flags) {
        if (this.responses.length)
            throw new Error(`Cannot defer, a response has already been created`);
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.DeferredChannelMessageWithSource,
            data: { flags }
        });
        this.deferred = true;
        this.responses.push(`@original`);
        return `@original`;
    }
    /**
     * Sends a message.
     * @param message The message to send.
     */
    async send(message) {
        let id;
        if (this.responses.length) {
            id = (await this.client.rest.createFollowupMessage(this.interaction.id, this.interaction.token, (0, messageFactory_1.messageFactory)(message))).id;
        }
        else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
                data: (0, messageFactory_1.messageFactory)(message)
            });
            id = `@original`;
            this.deferred = false;
        }
        this.responses.push(id);
        return id;
    }
    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @returns The new created response.
     */
    async edit(id, message) {
        if (id === `@original` && this.deferred)
            throw new Error(`Cannot edit original response (defer)`);
        return await this.client.rest.editFollowupMessage(this.interaction.id, this.interaction.token, id, (0, messageFactory_1.messageFactory)(message));
    }
    /**
     * Delete a response.
     * @param id The ID of the reponse to delete.
     */
    async delete(id) {
        if (id === `@original` && this.deferred)
            throw new Error(`Cannot delete original response (defer)`);
        await this.client.rest.deleteFollowupMessage(this.interaction.id, this.interaction.token, id);
        this.responses = this.responses.filter((response) => response !== id);
    }
}
exports.ContextMenuCommandContext = ContextMenuCommandContext;
