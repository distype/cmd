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
exports.ModalContext = exports.Modal = exports.ModalTextFieldStyle = void 0;
const InteractionContext_1 = require("../InteractionContext");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * A modal text field's style.
 */
var ModalTextFieldStyle;
(function (ModalTextFieldStyle) {
    ModalTextFieldStyle[ModalTextFieldStyle["SHORT"] = 1] = "SHORT";
    ModalTextFieldStyle[ModalTextFieldStyle["PARAGRAPH"] = 2] = "PARAGRAPH";
})(ModalTextFieldStyle = exports.ModalTextFieldStyle || (exports.ModalTextFieldStyle = {}));
/**
 * A modal builder.
 *
 * @example
 * ```ts
 * new Modal()
 *   .setId(`foo`)
 *   .setTitle(`Bar`)
 *   .addTextField(true, `field0`, `How are you?`, ModalTextFieldStyle.PARAGRAPH, { placeholder: `Doing great!` })
 *   .addTextField(false, `field1`, `A non-required field`, ModalTextFieldStyle.SHORT)
 *   .setExecute(async (ctx) => {
 *     await ctx.send(`This is how you said you were feeling:\n${ctx.fields.field0}\n\nThis was what you put in the non-required field:\n${ctx.fields.field1 ?? `\`nothing :(\``}`);
 *   });
 * ```
 */
class Modal {
    /**
     * The modal's execute method.
     */
    _execute = () => { };
    /**
     * Middleware metadata.
     */
    _middlewareMeta = null;
    /**
     * The raw modal.
     */
    _raw = {};
    /**
     * Set the modal's ID.
     * @param id The ID to use.
     * @returns The modal.
     */
    setId(id) {
        this._raw.custom_id = id;
        return this;
    }
    /**
     * Set the modal's title.
     * @param title The title to use.
     * @returns The modal.
     */
    setTitle(title) {
        this._raw.title = title;
        return this;
    }
    /**
     * Add a text field.
     * @param required If the field is required.
     * @param id The field's ID.
     * @param label The field's label.
     * @param style The field's style.
     * @param options Options for the field.
     * @returns The modal.
     */
    addTextField(required, id, label, style, options) {
        this._raw.components ??= [];
        this._raw.components.push({
            type: DiscordTypes.ComponentType.ActionRow,
            components: [
                {
                    type: DiscordTypes.ComponentType.TextInput,
                    custom_id: id,
                    label,
                    required,
                    style: style,
                    min_length: options?.minLength,
                    max_length: options?.maxLength,
                    placeholder: options?.placeholder
                }
            ]
        });
        return this;
    }
    /**
     * Set middleware metadata.
     * @param meta The metadata to set.
     * @returns The modal.
     */
    setMiddlewareMeta(meta) {
        this._middlewareMeta = meta;
        return this;
    }
    /**
     * Gets the modal's middleware meta.
     * @returns The middleware meta.
     */
    getMiddlewareMeta() {
        return this._middlewareMeta;
    }
    /**
     * Sets the modal's execute method.
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
     * Converts the modal to a Discord API compatible object.
     * @returns The converted modal.
     */
    getRaw() {
        if (!this._raw.custom_id)
            throw new Error(`An ID must be specified`);
        if (!this._raw.title)
            throw new Error(`Title must be defined`);
        if (!this._raw.components)
            throw new Error(`Fields must be specified`);
        return { ...this._raw };
    }
    /**
     * Gets the modal's custom ID.
     * @returns The custom ID.
     */
    getCustomId() {
        return this._raw.custom_id ?? null;
    }
    /**
     * Bind the modal to the {@link CommandHandler command handler}.
     * Note that modals are not bound in an immutable fashion.
     * Changing the execute method, middleware, or custom ID will propagate to the command handler.
     * However, changing "visual" props, such as the title, will not have an effect.
     * As an extension, changing the custom ID after sending a modal only propogates to interaction handling, not to the sent modal.
     * "Visual" props, along with the custom ID, are rendered when sending a modal (`.getRaw()`) and sent modals are not edited.
     * @param commandHandler The command handler to bind to.
     * @returns The modal.
     */
    bind(commandHandler) {
        if (!this._raw.custom_id)
            throw new Error(`An ID must be specified`);
        commandHandler.bind(this);
        return this;
    }
    /**
     * Unbind the modal from the {@link CommandHandler command handler}.
     * @param commandHandler The command handler to unbind from.
     * @returns The modal.
     */
    unbind(commandHandler) {
        commandHandler.unbind(this);
        return this;
    }
}
exports.Modal = Modal;
/**
 * {@link Modal} context.
 */
class ModalContext extends InteractionContext_1.InteractionContext {
    /**
     * Field values from the user.
     */
    fields;
    /**
     * Modal data.
     */
    modal;
    /**
     * Create {@link Modal modal} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction, commandHandler) {
        super(interaction, commandHandler);
        this.modal = { id: interaction.data.custom_id };
        this.fields = (interaction.data.components?.map((component) => component.components).flat() ?? []).reduce((p, c) => Object.assign(p, { [c.custom_id]: c.value?.length ? c.value : undefined }), {});
    }
}
exports.ModalContext = ModalContext;
