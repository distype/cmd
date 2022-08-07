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
exports.ButtonExpireContext = exports.ButtonContext = exports.Button = exports.ButtonStyle = void 0;
const BaseContext_1 = require("./BaseContext");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
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
     * The amount of time in milliseconds for the button to be inactive for it to be considered expired and unbound from the command handler.
     * @internal
     */
    expireTime = null;
    /**
     * A timeout for the button to expire.
     * @internal
     */
    expireTimeout = null;
    /**
     * The button's execute method.
     * @internal
     */
    runExecute = null;
    /**
     * The button's expire execute method.
     * @internal
     */
    runExecuteExpire = null;
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
        this._raw.url = url;
        return this;
    }
    /**
     * Set the button's label.
     * @param label The label to use.
     * @returns The button.
     */
    setLabel(label) {
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
    /**
     * Set the button's expire properties.
     * @param time The amount of time in milliseconds for the button to be inactive for it to be considered expired and unbound from the command handler.
     * @param expireCallback A callback that is called when the button expires. It should return a boolean that specifies if the current expire should be cancelled and the button's expire time should be waited again. `true` will unbind the button (it will expire), `false` will preserve it.
     */
    setExpire(time, expireCallback) {
        this.expireTime = time;
        if (typeof expireCallback === `function`)
            this.runExecuteExpire = expireCallback;
        return this;
    }
    /**
     * Sets the button's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     */
    setExecute(executeCallback) {
        this.runExecute = executeCallback;
        return this;
    }
    /**
     * Get the raw button.
     * Note that the returned button is immutable.
     */
    getRaw() {
        return {
            type: DiscordTypes.ComponentType.Button,
            ...this._raw
        };
    }
}
exports.Button = Button;
/**
 * {@link Button} context.
 */
class ButtonContext extends BaseContext_1.BaseMessageComponentContext {
    /**
     * The {@link Button button} the context originates from.
     */
    contextParent;
    /**
     * Create {@link Button button} context.
     * @param interaction Interaction data.
     * @param button The {@link Button button} the context originates from.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction, button, commandHandler) {
        super(interaction, commandHandler);
        this.contextParent = button;
    }
    /**
     * Unbinds the button's execution callback from the command handler.
     * Use this method to prevent memory leaks from inactive buttons.
     */
    unbind() {
        this.commandHandler.unbindButton(this.component.customId);
    }
}
exports.ButtonContext = ButtonContext;
/**
 * {@link Button} expire context.
 */
class ButtonExpireContext extends BaseContext_1.BaseComponentExpireContext {
    /**
     * The {@link Button button} the expire context originates from.
     */
    contextParent;
    /**
     * Create {@link Button button} expire context.
     * @param customId The component's custom ID.
     * @param type The component's type.
     * @param button The {@link Button button} the context originates from.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(customId, type, button, commandHandler) {
        super(customId, type, commandHandler);
        this.contextParent = button;
    }
}
exports.ButtonExpireContext = ButtonExpireContext;
