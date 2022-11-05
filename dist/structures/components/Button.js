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
const BaseComponent_1 = require("./base/BaseComponent");
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
})(ButtonStyle = exports.ButtonStyle || (exports.ButtonStyle = {}));
/**
 * The button builder.
 *
 * @example
 * ```ts
 * new Button()
 *   .setId(`foo`)
 *   .setStyle(ButtonStyle.PRIMARY)
 *   .setLabel(`Click me!`)
 *   .setExecute((ctx) => {
 *     ctx.send(`Boo! :ghost:`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#buttons)
 */
class Button extends BaseComponent_1.BaseComponent {
    /**
     * Create the button builder.
     */
    constructor() {
        super(DiscordTypes.ComponentType.Button);
    }
    /**
     * Set the component's style
     * @param style The style to use.
     * @returns The component.
     */
    setStyle(style) {
        this._raw.style = style;
        return this;
    }
    /**
     * Set the component's label.
     * @param label The label to use.
     * @returns The component.
     */
    setLabel(label) {
        this._raw.label = label;
        return this;
    }
    /**
     * Set the component's emoji.
     * @param emoji The emoji to use.
     * @returns The component.
     */
    setEmoji(emoji) {
        this._raw.emoji = emoji;
        return this;
    }
}
exports.Button = Button;
/**
 * {@link Button} context.
 */
class ButtonContext extends BaseComponent_1.BaseComponentContext {
    /**
     * Create {@link Button button} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction, commandHandler) {
        super(interaction, commandHandler);
    }
}
exports.ButtonContext = ButtonContext;
