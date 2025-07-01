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
exports.InteractionContext = void 0;
const messageFactory_1 = require("../utils/messageFactory");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * Interaction context.
 */
class InteractionContext {
    /**
     * The {@link Client client} the context is bound to.
     */
    client;
    /**
     * The {@link CommandHandler command handler} that invoked the context.
     */
    commandHandler;
    /**
     * The ID of the channel that the interaction was invoked in.
     */
    channelId;
    /**
     * The ID of the guild that the interaction was invoked in.
     */
    guildId;
    /**
     * The guild's preferred locale, if the interaction was invoked in a guild.
     */
    guildLocale;
    /**
     * Interaction data.
     */
    interaction;
    /**
     * The invoking user's member data.
     */
    member;
    /**
     * The permissions the bot has in the channel the interaction was invoked in.
     */
    permissions;
    /**
     * The invoking user.
     */
    user;
    /**
     * If the interaction has been responded to yet.
     */
    _responded = false;
    /**
     * Create interaction context.
     * @param interaction Interaction data.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction, commandHandler) {
        this.client = commandHandler.client;
        this.commandHandler = commandHandler;
        this.channelId = interaction.channel_id;
        this.guildId = interaction.guild_id ?? interaction.data?.guild_id;
        this.guildLocale = interaction.guild_locale;
        this.interaction = {
            applicationId: interaction.application_id,
            id: interaction.id,
            raw: interaction,
            token: interaction.token,
            type: interaction.type,
            version: interaction.version,
        };
        this.member = interaction.member;
        this.permissions = interaction.app_permissions;
        this.user = {
            locale: interaction.locale,
            ...(interaction.member?.user ?? interaction.user),
        };
    }
    /**
     * Defers the interaction (displays a loading state to the user).
     * @param flags Message flags for the followup after the defer. Specifying `true` is a shorthand for the ephemeral flag.
     */
    async defer(flags) {
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType
                .DeferredChannelMessageWithSource,
            data: {
                flags: flags === true ? DiscordTypes.MessageFlags.Ephemeral : flags,
            },
        });
        this._responded = true;
    }
    /**
     * Sends a message.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @returns The ID of the created message, or `@original`.
     */
    async send(message, components) {
        const factoryMessage = (0, messageFactory_1.messageFactory)(message, components);
        let id;
        if (this._responded) {
            id = (await this.client.rest.createFollowupMessage(this.interaction.applicationId, this.interaction.token, factoryMessage)).id;
        }
        else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
                data: factoryMessage,
            });
            id = `@original`;
            this._responded = true;
        }
        return id;
    }
    /**
     * A shorthand for sending messages with the ephemeral flag.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @returns The ID of the created message, or `@original`.
     */
    async sendEphemeral(message, components) {
        const factoryMessage = (0, messageFactory_1.messageFactory)(message, components);
        const id = await this.send({
            ...factoryMessage,
            flags: (factoryMessage.flags ?? 0) | DiscordTypes.MessageFlags.Ephemeral,
        });
        return id;
    }
    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @param components Components to add to the message.
     * @returns The new created response.
     */
    async edit(id, message, components) {
        const factoryMessage = (0, messageFactory_1.messageFactory)(message, components);
        const edit = await this.client.rest.editFollowupMessage(this.interaction.applicationId, this.interaction.token, id, factoryMessage);
        return edit;
    }
    /**
     * Delete a response.
     * @param id The ID of the response to delete.
     */
    async delete(id) {
        await this.client.rest.deleteFollowupMessage(this.interaction.applicationId, this.interaction.token, id);
    }
}
exports.InteractionContext = InteractionContext;
