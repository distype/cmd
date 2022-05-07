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
exports.BaseComponentExpireContext = exports.BaseComponentContext = exports.BaseInteractionContextWithModal = exports.BaseInteractionContext = exports.BaseContext = void 0;
const DistypeCmdError_1 = require("../errors/DistypeCmdError");
const messageFactory_1 = require("../utils/messageFactory");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * Base context.
 * @internal
 */
class BaseContext {
    /**
     * The {@link Client client} the context is bound to.
     */
    client;
    /**
     * The {@link CommandHandler command handler} that invoked the context.
     */
    commandHandler;
    /**
     * Log a message using the {@link CommandHandler command handler}'s {@link LogCallback log callback}.
     */
    log;
    /**
     * Create context.
     * @param commandHandler The command handler that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(commandHandler, logCallback = () => { }, logThisArg) {
        this.client = commandHandler.client;
        this.commandHandler = commandHandler;
        this.log = logCallback.bind(logThisArg);
    }
}
exports.BaseContext = BaseContext;
/**
 * Base interaction context.
 * @internal
 */
class BaseInteractionContext extends BaseContext {
    /**
     * Message IDs of sent responses.
     */
    responses = [];
    /**
     * The ID of the guild that the interaction was ran in.
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
     * The invoking user.
     */
    user;
    /**
     * Create interaction context.
     * @param commandHandler The command handler that invoked the context.
     * @param interaction Interaction data.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(commandHandler, interaction, logCallback = () => { }, logThisArg) {
        super(commandHandler, logCallback, logThisArg);
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
        this.commandHandler.runError(this, error instanceof Error ? error : new Error(error), false);
    }
    /**
     * Defers the interaction (displays a loading state to the user).
     * @param flags Message flags for the followup after the defer. Specifying `true` is a shorthand for the ephemeral flag.
     */
    async defer(flags) {
        if (this.responses.length)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot defer, a response has already been created`, DistypeCmdError_1.DistypeCmdErrorType.CANNOT_DEFER);
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.DeferredChannelMessageWithSource,
            data: { flags: flags === true ? DiscordTypes.MessageFlags.Ephemeral : flags }
        });
        this.responses.push(`defer`);
        return `defer`;
    }
    /**
     * Sends a message.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @returns The ID of the created message, or `@original`.
     */
    async send(message, components) {
        let id;
        if (this.responses.length) {
            id = (await this.client.rest.createFollowupMessage(this.interaction.applicationId, this.interaction.token, (0, messageFactory_1.messageFactory)(message))).id;
        }
        else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
                data: (0, messageFactory_1.messageFactory)(message, components)
            });
            id = `@original`;
        }
        this.responses.push(id);
        return id;
    }
    /**
     * A shorthand for sending messages with the ephemeral flag.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @returns The ID of the created message, or `@original`.
     */
    async sendEphemeral(message, components) {
        const data = (0, messageFactory_1.messageFactory)(message, components);
        return await this.send({
            ...data,
            flags: (data.flags ?? 0) | DiscordTypes.MessageFlags.Ephemeral
        });
    }
    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @param components Components to add to the message.
     * @returns The new created response.
     */
    async edit(id, message, components) {
        if (!this.responses.includes(id))
            throw new DistypeCmdError_1.DistypeCmdError(`No response found matching the ID "${id}"`, DistypeCmdError_1.DistypeCmdErrorType.RESPONSE_NOT_FOUND);
        return await this.client.rest.editFollowupMessage(this.interaction.applicationId, this.interaction.token, id, (0, messageFactory_1.messageFactory)(message, components));
    }
    /**
     * Delete a response.
     * @param id The ID of the response to delete.
     */
    async delete(id) {
        if (!this.responses.includes(id))
            throw new DistypeCmdError_1.DistypeCmdError(`No response found matching the ID "${id}"`, DistypeCmdError_1.DistypeCmdErrorType.RESPONSE_NOT_FOUND);
        await this.client.rest.deleteFollowupMessage(this.interaction.applicationId, this.interaction.token, id);
        this.responses = this.responses.filter((response) => response !== id);
    }
}
exports.BaseInteractionContext = BaseInteractionContext;
/**
 * Base interaction context with a modal.
 * @internal
 */
class BaseInteractionContextWithModal extends BaseInteractionContext {
    responses = [];
    /**
     * Respond with a modal.
     * The modal's execute method is automatically bound to the command handler.
     * If the command handler already has a bound modal with the same ID, it will be overwritten.
     * A modal will stay bound to the command handler until it's execution context's "unbind()" method is called.
     * @param modal The modal to respond with.
     */
    async showModal(modal) {
        if (this.responses.length)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot open a modal, a response has already been created`, DistypeCmdError_1.DistypeCmdErrorType.CANNOT_OPEN_MODAL);
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.Modal,
            data: modal.getRaw()
        });
        this.commandHandler.bindModal(modal);
        this.responses.push(`modal`);
        return `modal`;
    }
}
exports.BaseInteractionContextWithModal = BaseInteractionContextWithModal;
/**
 * Base context for components.
 * @internal
 */
class BaseComponentContext extends BaseInteractionContextWithModal {
    responses = [];
    /**
     * Component data.
     */
    component;
    /**
     * Create interaction context.
     * @param commandHandler The command handler that invoked the context.
     * @param interaction Interaction data.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(commandHandler, interaction, logCallback = () => { }, logThisArg) {
        super(commandHandler, interaction, logCallback, logThisArg);
        this.component = {
            customId: interaction.data.custom_id,
            type: interaction.data.component_type
        };
    }
    /**
     * The same as defer, except the expected followup response is an edit to the parent message of the component.
     */
    async editParentDefer() {
        if (this.responses.length)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot defer, a response has already been created`, DistypeCmdError_1.DistypeCmdErrorType.CANNOT_DEFER);
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, { type: DiscordTypes.InteractionResponseType.DeferredMessageUpdate });
        this.responses.push(`deferedit`);
        return `deferedit`;
    }
    /**
     * Edits the parent message of the component.
     * @param message The new parent message.
     * @param components Components to add to the message.
     */
    async editParent(message, components) {
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.UpdateMessage,
            data: (0, messageFactory_1.messageFactory)(message, components)
        });
        return `editparent`;
    }
}
exports.BaseComponentContext = BaseComponentContext;
/**
 * Base component expire context.
 */
class BaseComponentExpireContext extends BaseContext {
    /**
     * Component data.
     */
    component;
    /**
     * Create component expire context.
     * @param commandHandler The command handler that invoked the context.
     * @param customId The component's custom ID.
     * @param type The component's type.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(commandHandler, customId, type, logCallback = () => { }, logThisArg) {
        super(commandHandler, logCallback, logThisArg);
        this.component = {
            customId, type
        };
    }
    /**
     * Calls the command handler's expire error callback.
     * Note that this does not stop the execution of the command's execute method; you must also call `return`.
     * @param error The error encountered.
     */
    error(error) {
        this.commandHandler.runExpireError(this, error instanceof Error ? error : new Error(error), false);
    }
}
exports.BaseComponentExpireContext = BaseComponentExpireContext;
