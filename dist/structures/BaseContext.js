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
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
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
     * If the interaction has been responded to yet.
     */
    responded = false;
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
     * @param interaction Interaction data.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(interaction, commandHandler, logCallback = () => { }, logThisArg) {
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
            locale: interaction.locale,
            ...(interaction.member?.user ?? interaction.user)
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
        if (this.responded)
            throw new DistypeCmdError_1.DistypeCmdError(`Already responded to interaction ${this.interaction.id}`, DistypeCmdError_1.DistypeCmdErrorType.ALREADY_RESPONDED);
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.DeferredChannelMessageWithSource,
            data: { flags: flags === true ? DiscordTypes.MessageFlags.Ephemeral : flags }
        });
        this.responded = true;
    }
    /**
     * Sends a message.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     * @returns The ID of the created message, or `@original`.
     */
    async send(message, components, bindComponents = true) {
        const factoryMessage = (0, messageFactory_1.messageFactory)(message, components);
        let id;
        if (this.responded) {
            id = (await this.client.rest.createFollowupMessage(this.interaction.applicationId, this.interaction.token, factoryMessage)).id;
        }
        else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
                data: factoryMessage
            });
            id = `@original`;
            this.responded = true;
        }
        if (components && bindComponents)
            this.commandHandler.bindComponents(components);
        return id;
    }
    /**
     * A shorthand for sending messages with the ephemeral flag.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     * @returns The ID of the created message, or `@original`.
     */
    async sendEphemeral(message, components, bindComponents = true) {
        const factoryMessage = (0, messageFactory_1.messageFactory)(message, components);
        const id = await this.send({
            ...factoryMessage,
            flags: (factoryMessage.flags ?? 0) | DiscordTypes.MessageFlags.Ephemeral
        });
        if (components && bindComponents)
            this.commandHandler.bindComponents(components);
        return id;
    }
    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     * @returns The new created response.
     */
    async edit(id, message, components, bindComponents = true) {
        const factoryMessage = (0, messageFactory_1.messageFactory)(message, components);
        const edit = await this.client.rest.editFollowupMessage(this.interaction.applicationId, this.interaction.token, id, factoryMessage);
        if (components && bindComponents)
            this.commandHandler.bindComponents(components);
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
exports.BaseInteractionContext = BaseInteractionContext;
/**
 * Base interaction context with support for a modal response.
 * @internal
 */
class BaseInteractionContextWithModal extends BaseInteractionContext {
    /**
     * Respond with a modal.
     * The modal's execute method is automatically bound to the command handler.
     * If the command handler already has a bound modal with the same ID, it will be overwritten.
     * A modal will stay bound to the command handler until it's execution context's "unbind()" method is called.
     * @param modal The modal to respond with.
     */
    async showModal(modal) {
        if (this.responded)
            throw new DistypeCmdError_1.DistypeCmdError(`Already responded to interaction ${this.interaction.id}`, DistypeCmdError_1.DistypeCmdErrorType.ALREADY_RESPONDED);
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.Modal,
            data: modal.getRaw()
        });
        this.commandHandler.bindModal(modal);
    }
}
exports.BaseInteractionContextWithModal = BaseInteractionContextWithModal;
/**
 * Base component context.
 * @internal
 */
class BaseComponentContext extends BaseInteractionContextWithModal {
    /**
     * Component data.
     */
    component;
    /**
     * The message the component is attached to.
     */
    message;
    /**
     * If a deferred message update was sent.
     */
    _deferredMessageUpdate = false;
    /**
     * Create component context.
     * @param interaction Interaction data.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(interaction, commandHandler, logCallback = () => { }, logThisArg) {
        super(interaction, commandHandler, logCallback, logThisArg);
        this.component = {
            customId: interaction.data.custom_id,
            type: interaction.data.component_type
        };
        this.message = interaction.message;
    }
    /**
     * The same as defer, except the expected followup response is an edit to the parent message of the component.
     */
    async editParentDefer() {
        if (this.responded)
            throw new DistypeCmdError_1.DistypeCmdError(`Already responded to interaction ${this.interaction.id}`, DistypeCmdError_1.DistypeCmdErrorType.ALREADY_RESPONDED);
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, { type: DiscordTypes.InteractionResponseType.DeferredMessageUpdate });
        this.responded = true;
        this._deferredMessageUpdate = true;
    }
    /**
     * Edits the parent message of the component.
     * @param message The new parent message.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     */
    async editParent(message, components, bindComponents = true) {
        if (this.responded && !this._deferredMessageUpdate)
            throw new DistypeCmdError_1.DistypeCmdError(`Already responded to interaction ${this.interaction.id}`, DistypeCmdError_1.DistypeCmdErrorType.ALREADY_RESPONDED);
        if (this.responded) {
            await this.client.rest.editFollowupMessage(this.interaction.applicationId, this.interaction.token, `@original`, (0, messageFactory_1.messageFactory)(message, components));
        }
        else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.UpdateMessage,
                data: (0, messageFactory_1.messageFactory)(message, components)
            });
            this.responded = true;
        }
        if (components && bindComponents)
            this.commandHandler.bindComponents(components);
    }
}
exports.BaseComponentContext = BaseComponentContext;
/**
 * Base component expire context.
 * @internal
 */
class BaseComponentExpireContext extends BaseContext {
    /**
     * Component data.
     */
    component;
    /**
     * Create component expire context.
     * @param customId The component's custom ID.
     * @param type The component's type.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(customId, type, commandHandler, logCallback = () => { }, logThisArg) {
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
