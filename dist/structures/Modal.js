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
    /**
     * The modal's props.
     * @internal
     */
    props = {};
    /**
     * The modal's parameters.
     * @internal
     */
    parameters = [];
    /**
     * The modal's execute method.
     * @internal
     */
    runExecute = null;
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
     * @param executeCallback The callback to execute when an interaction is received.
     */
    setExecute(executeCallback) {
        this.runExecute = executeCallback;
        return this;
    }
    /**
     * Converts a modal to a Discord API compatible object.
     * @returns The raw modal.
     */
    getRaw() {
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
 * {@link Modal} context.
 */
class ModalContext extends BaseContext_1.BaseInteractionContext {
    /**
     * The ID of the channel that the modal was submitted in.
     */
    channelId;
    /**
     * The {@link Modal modal} the context originates from.
     */
    contextParent;
    /**
     * Modal data.
     */
    modal;
    /**
     * Parameter values from the user.
     */
    parameters;
    /**
     * Create {@link Modal modal} context.
     * @param interaction Interaction data.
     * @param modal The {@link Modal modal} the context originates from.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(interaction, modal, commandHandler, logCallback = () => { }, logThisArg) {
        super(interaction, commandHandler, logCallback, logThisArg);
        this.channelId = interaction.channel_id;
        this.contextParent = modal;
        this.modal = {
            customId: modal.props.custom_id,
            title: modal.props.title
        };
        this.parameters = (interaction.data.components?.map((component) => component.components).flat() ?? []).reduce((p, c) => Object.assign(p, { [c.custom_id]: c.value?.length ? c.value : undefined }), {});
    }
    /**
     * Unbinds the modal's execution callback from the command handler.
     * Use this method to prevent memory leaks from inactive modals.
     */
    unbind() {
        this.commandHandler.unbindModal(this.modal.customId);
    }
}
exports.ModalContext = ModalContext;
