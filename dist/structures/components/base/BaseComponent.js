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
exports.BaseComponentContext = exports.BaseComponent = void 0;
const InteractionContext_1 = require("../../InteractionContext");
const messageFactory_1 = require("../../../utils/messageFactory");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * The base component builder.
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components)
 * @internal
 */
class BaseComponent {
    /**
     * The component's execute method.
     */
    _execute = () => { };
    /**
     * Middleware metadata.
     */
    _middlewareMeta = null;
    /**
     * The raw component.
     */
    _raw;
    /**
     * Create the base component builder.
     * @param type The component's type.
     */
    constructor(type) {
        this._raw = { type };
    }
    /**
     * Set the component's ID.
     * @param id The ID to use.
     * @returns The component.
     */
    setId(id) {
        this._raw.custom_id = id;
        return this;
    }
    /**
     * Set the component's disabled state.
     * @param disabled The disabled state to use.
     * @returns The component.
     */
    setDisabled(disabled) {
        this._raw.disabled = disabled;
        return this;
    }
    /**
     * Set middleware metadata.
     * @param meta The metadata to set.
     * @returns The component.
     */
    setMiddlewareMeta(meta) {
        this._middlewareMeta = meta;
        return this;
    }
    /**
     * Gets the component's middleware meta.
     * @returns The middleware meta.
     */
    getMiddlewareMeta() {
        return this._middlewareMeta;
    }
    /**
     * Sets the component's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     * @returns The component.
     */
    setExecute(executeCallback) {
        this._execute = executeCallback;
        return this;
    }
    /**
     * Gets the component's execute method.
     * @returns The execute method.
     */
    getExecute() {
        return this._execute;
    }
    /**
     * Converts the component to a Discord API compatible object.
     * @returns The converted component.
     */
    getRaw() {
        if (!this._raw.custom_id)
            throw new Error(`An ID must be specified`);
        return { ...this._raw };
    }
    /**
     * Gets the component's custom ID.
     * @returns The custom ID.
     */
    getCustomId() {
        return this._raw.custom_id ?? null;
    }
    /**
     * Gets the component's type.
     * @returns The component's type.
     */
    getType() {
        return this._raw.type;
    }
    /**
     * Bind the component to the {@link CommandHandler command handler}.
     * Note that components are not bound in an immutable fashion.
     * Changing the execute method, middleware, or custom ID will propagate to the command handler.
     * However, changing "visual" props, such as a button style or placeholder text, will not have an effect.
     * As an extension, changing the custom ID after sending a component only propogates to interaction handling, not to the sent component.
     * "Visual" props, along with the custom ID, are rendered when sending a message (`.getRaw()`) and sent messages are not edited.
     * @param commandHandler The command handler to bind to.
     * @returns The component.
     */
    bind(commandHandler) {
        if (!this._raw.custom_id)
            throw new Error(`An ID must be specified`);
        commandHandler.bind(this);
        return this;
    }
    /**
     * Unbind the component from the {@link CommandHandler command handler}.
     * @param commandHandler The command handler to unbind from.
     * @returns The component.
     */
    unbind(commandHandler) {
        commandHandler.unbind(this);
        return this;
    }
}
exports.BaseComponent = BaseComponent;
/**
 * {@link BaseComponent Base component} context.
 * @internal
 */
class BaseComponentContext extends InteractionContext_1.InteractionContext {
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
     * Create {@link BaseComponent base component} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction, commandHandler) {
        super(interaction, commandHandler);
        this.component = {
            id: interaction.data.custom_id,
            type: interaction.data.component_type
        };
        this.message = interaction.message;
    }
    /**
     * The same as defer, except the expected followup response is an edit to the parent message of the component.
     */
    async editParentDefer() {
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, { type: DiscordTypes.InteractionResponseType.DeferredMessageUpdate });
        this._responded = true;
        this._deferredMessageUpdate = true;
    }
    /**
     * Edits the parent message of the component.
     * @param message The new parent message.
     * @param components Components to add to the message.
     */
    async editParent(message, components) {
        const factoryMessage = (0, messageFactory_1.messageFactory)(message, components);
        if (this._responded) {
            await this.client.rest.editFollowupMessage(this.interaction.applicationId, this.interaction.token, `@original`, factoryMessage);
        }
        else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.UpdateMessage,
                data: factoryMessage
            });
            this._responded = true;
        }
    }
}
exports.BaseComponentContext = BaseComponentContext;
