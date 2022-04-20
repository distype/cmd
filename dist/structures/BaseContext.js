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
exports.BaseCommandContext = exports.BaseContext = void 0;
const messageFactory_1 = require("../functions/messageFactory");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * Base context.
 */
class BaseContext {
    /**
     * Create interaction context.
     * @param commandHandler The command handler that invoked the context.
     * @param interaction Interaction data.
     */
    constructor(commandHandler, interaction) {
        /**
         * Message IDs of sent responses.
         */
        this.responses = [];
        this.client = commandHandler.client;
        this.commandHandler = commandHandler;
        this.guildId = interaction.guild_id ?? interaction.data?.guild_id;
        this.guildLocale = interaction.guild_locale;
        this.interaction = {
            applicationId: interaction.application_id,
            id: interaction.id,
            token: interaction.token,
            type: interaction.type,
            version: interaction.version
        };
        this.member = interaction.member;
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
        this.responses.push(`defer`);
        return `defer`;
    }
    /**
     * Sends a message.
     * @param message The message to send.
     */
    async send(message) {
        let id;
        if (this.responses.length) {
            id = (await this.client.rest.createFollowupMessage(this.interaction.applicationId, this.interaction.token, (0, messageFactory_1.messageFactory)(message))).id;
        }
        else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
                data: (0, messageFactory_1.messageFactory)(message)
            });
            id = `@original`;
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
        if (!this.responses.includes(id))
            throw new Error(`No response found matching the ID "${id}"`);
        return await this.client.rest.editFollowupMessage(this.interaction.applicationId, this.interaction.token, id, (0, messageFactory_1.messageFactory)(message));
    }
    /**
     * Delete a response.
     * @param id The ID of the reponse to delete.
     */
    async delete(id) {
        if (!this.responses.includes(id))
            throw new Error(`No response found matching the ID "${id}"`);
        await this.client.rest.deleteFollowupMessage(this.interaction.applicationId, this.interaction.token, id);
        this.responses = this.responses.filter((response) => response !== id);
    }
}
exports.BaseContext = BaseContext;
/**
 * Base command context.
 */
class BaseCommandContext extends BaseContext {
    /**
     * Respond with a modal.
     * The modal's execute method is automatically bound to the command handler.
     * If the command handler already has a bound modal with the same ID, it will be overwritten.
     * A modal will stay bound to the command handler until it's exection context's "unbind()" method is called.
     * @param modal The modal to respond with.
     */
    async showModal(modal) {
        if (this.responses.length)
            throw new Error(`Cannot open a modal, a response has already been created`);
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.Modal,
            data: modal.getRaw()
        });
        this.commandHandler.bindModal(modal);
        this.responses.push(`modal`);
        return `modal`;
    }
}
exports.BaseCommandContext = BaseCommandContext;
