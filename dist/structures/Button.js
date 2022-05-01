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
exports.ButtonContext = exports.Button = exports.ButtonStyle = void 0;
const BaseContext_1 = require("./BaseContext");
const DistypeCmdError_1 = require("../errors/DistypeCmdError");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
const distype_1 = require("distype");
/**
 * A button's style.
 */
var ButtonStyle;
(function (ButtonStyle) {
    ButtonStyle[ButtonStyle["PRIMARY"] = 1] = "PRIMARY";
    ButtonStyle[ButtonStyle["SECONDARY"] = 2] = "SECONDARY";
    ButtonStyle[ButtonStyle["SUCCESS"] = 3] = "SUCCESS";
    ButtonStyle[ButtonStyle["DANGER"] = 4] = "DANGER";
    ButtonStyle[ButtonStyle["LINK"] = 5] = "LINK";
})(ButtonStyle = exports.ButtonStyle || (exports.ButtonStyle = {}));
/**
 * A button.
 * Note that to send a button, you must define a style, as well as an ID or a URL.
 */
class Button {
    /**
     * The button's execute method.
     * @internal
     */
    run = null;
    /**
     * The raw button.
     */
    _raw;
    /**
     * Create a button.
     * @param base A button to use as a base.
     */
    constructor(base = {}) {
        this._raw = base;
    }
    /**
     * Set the button's style
     * @param style The style to use.
     * @returns The button.
     */
    setStyle(style) {
        if (typeof this._raw.label === `string` && style === ButtonStyle.LINK)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot use style "LINK" when the button has a "label" property assigned`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_BUTTON_VALUE);
        if (typeof this._raw.url === `string` && style !== ButtonStyle.LINK)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot use style "${ButtonStyle[style]}" when the button has a "url" property assigned`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_BUTTON_VALUE);
        this._raw.style = style;
        return this;
    }
    /**
     * Set the button's ID.
     * Note that the button cannot use the `ButtonStyle.LINK` style with a custom ID.
     * @param id The ID to use.
     * @returns The button.
     */
    setId(id) {
        if (id.length > distype_1.DiscordConstants.COMPONENT_LIMITS.BUTTON.CUSTOM_ID)
            throw new DistypeCmdError_1.DistypeCmdError(`Specified ID is longer than maximum length ${distype_1.DiscordConstants.COMPONENT_LIMITS.BUTTON.CUSTOM_ID}`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_MODAL_VALUE);
        if (this._raw.style === DiscordTypes.ButtonStyle.Link)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot set custom_id when the button has the "LINK" style`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_BUTTON_VALUE);
        this._raw.custom_id = id;
        return this;
    }
    /**
     * Set the button's URL.
     * Note that the button must use the `ButtonStyle.LINK` style with a URL.
     * @param url The URL to use.
     * @returns The button.
     */
    setURL(url) {
        if (this._raw.style !== undefined && this._raw.style !== DiscordTypes.ButtonStyle.Link)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot set URL when the button has the "${ButtonStyle[this._raw.style]}" style`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_BUTTON_VALUE);
        this._raw.url = url;
        return this;
    }
    /**
     * Set the button's label.
     * @param label The label to use.
     * @returns The button.
     */
    setLabel(label) {
        if (label.length > distype_1.DiscordConstants.COMPONENT_LIMITS.BUTTON.LABEL)
            throw new DistypeCmdError_1.DistypeCmdError(`Specified label is longer than maximum length ${distype_1.DiscordConstants.COMPONENT_LIMITS.BUTTON.LABEL}`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_MODAL_VALUE);
        this._raw.label = label;
        return this;
    }
    /**
     * Set the button's emoji.
     * @param emoji The emoji to use.
     * @returns The button.
     */
    setEmoji(emoji) {
        this._raw.emoji = emoji;
        return this;
    }
    /**
     * Set the button's disabled state.
     * @param disabled The disabled state to use.
     * @returns The button.
     */
    setDisabled(disabled) {
        this._raw.disabled = disabled;
        return this;
    }
    setExecute(exec) {
        this.run = exec;
        return this;
    }
    /**
     * Get the raw button.
     * Note that the returned button is immutable.
     */
    getRaw() {
        if (typeof this._raw.style !== `number`)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot convert a button with a missing "style" parameter to raw`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_BUTTON_PARAMETERS_FOR_RAW);
        if (typeof this._raw.custom_id !== `string` && typeof this._raw.url !== `string`)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot convert a button with a missing "custom_id" or "url" parameter to raw`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_BUTTON_PARAMETERS_FOR_RAW);
        if (typeof this._raw.custom_id === `string` && typeof this._raw.url === `string`)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot convert a button with both "custom_id" and "url" parameters defined to raw`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_BUTTON_PARAMETERS_FOR_RAW);
        if (this._raw.custom_id !== undefined && this._raw.style === DiscordTypes.ButtonStyle.Link)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot convert a button to raw when the button has the "LINK" style with a "custom_id" parameter`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_BUTTON_PARAMETERS_FOR_RAW);
        if (this._raw.url !== undefined && this._raw.style !== DiscordTypes.ButtonStyle.Link)
            throw new DistypeCmdError_1.DistypeCmdError(`Cannot convert a button to raw when the button has the "${ButtonStyle[this._raw.style]}" style with a "url" parameter`, DistypeCmdError_1.DistypeCmdErrorType.INVALID_BUTTON_PARAMETERS_FOR_RAW);
        return {
            type: DiscordTypes.ComponentType.Button,
            ...this._raw
        };
    }
}
exports.Button = Button;
/**
 * Button context.
 */
class ButtonContext extends BaseContext_1.BaseComponentContext {
    /**
     * Unbinds the button's execution callback from the command handler.
     * Use this method to prevent memory leaks from inactive buttons.
     */
    unbind() {
        this.commandHandler.unbindButton(this.component.customId);
    }
}
exports.ButtonContext = ButtonContext;