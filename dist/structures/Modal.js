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
exports.ModalContext = exports.Modal = void 0;
const BaseContext_1 = require("./BaseContext");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * A modal builder.
 *
 * @example
 * ```ts
 * new Modal()
 *   .setId(`foo`)
 *   .setTitle(`Bar`)
 *   .addField(true, `field0`, `How are you?`, `paragraph`, { placeholder: `Doing great!` })
 *   .addField(false, `field1`, `A non-required field`, `short`)
 *   .setExecute(async (ctx) => {
 *     await ctx.send(`This is how you said you were feeling:\n${ctx.parameters.field0}\n\nThis was what you put in the non-required field:\n${ctx.parameters.field1 ?? `\`nothing :(\``}`);
 *   });
 * ```
 */
class Modal {
    constructor() {
        /**
         * The modal's props.
         */
        this.props = {};
        /**
         * The modal's parameters.
         */
        this.parameters = [];
        /**
         * The modal's execute method.
         * @internal
         */
        this.run = null;
    }
    /**
     * Set the modal's ID.
     * @param id The custom ID to use.
     * @returns The modal.
     */
    setId(id) {
        this.props.custom_id = id;
        return this;
    }
    /**
     * Set the modal's title.
     * @param title The title to use.
     * @returns The modal.
     */
    setTitle(title) {
        this.props.title = title;
        return this;
    }
    addField(required, id, label, style, options) {
        if (this.parameters.find((parameter) => parameter.custom_id === id))
            throw new Error(`A field already exists with the ID "${id}"`);
        this.parameters.push({
            type: DiscordTypes.ComponentType.TextInput,
            required,
            custom_id: id,
            label,
            style: style === `short` ? DiscordTypes.TextInputStyle.Short : DiscordTypes.TextInputStyle.Paragraph,
            max_length: options?.maxLength,
            min_length: options?.minLength,
            placeholder: options?.placeholder
        });
        return this;
    }
    /**
     * Sets the command's execute method.
     * @param exec The callback to execute when an interaction is received.
     */
    setExecute(exec) {
        if (!this.props.custom_id || !this.props.title)
            throw new Error(`A modal's ID and title must be present to set its execute method`);
        this.run = exec;
        return this;
    }
    /**
     * Converts a modal to a Discord API compatible object.
     * @returns The raw modal.
     */
    getRaw() {
        if (typeof this.props.custom_id !== `string`)
            throw new Error(`Cannot convert a modal with a missing "custom_id" parameter to raw`);
        if (typeof this.props.title !== `string`)
            throw new Error(`Cannot convert a modal with a missing "title" parameter to raw`);
        return {
            ...this.props,
            components: this.parameters.map((parameter) => ({
                type: DiscordTypes.ComponentType.ActionRow,
                components: [parameter]
            }))
        };
    }
}
exports.Modal = Modal;
/**
 * Modal context.
 */
class ModalContext extends BaseContext_1.BaseContext {
    /**
     * Create a modal's context.
     * @param commandHandler The command handler that invoked the context.
     * @param modal The modal that invoked the context.
     * @param interaction Interaction data.
     */
    constructor(commandHandler, modal, interaction) {
        super(commandHandler, interaction);
        this.channelId = interaction.channel_id;
        this.modal = modal.props;
        this.parameters = (interaction.data.components?.map((component) => component.components).flat() ?? []).reduce((p, c) => Object.assign(p, { [c.custom_id]: c.value?.length ? c.value : undefined }), {});
    }
    /**
     * Unbinds the modal's execution callback from the command handler.
     * Use this method to prevent memory leaks from inactive modals.
     */
    unbind() {
        this.commandHandler.unbindModal(this.modal.custom_id);
    }
}
exports.ModalContext = ModalContext;
