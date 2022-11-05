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
exports.StringSelectContext = exports.StringSelect = void 0;
const BaseComponent_1 = require("./base/BaseComponent");
const BaseSelect_1 = require("./base/BaseSelect");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * The string select menu builder.
 *
 * @example
 * ```ts
 * new StringSelect()
 *   .setId(`foo`)
 *   .setPlaceholder(`Select a string`)
 *   .addOption(`foo`, `foo`)
 *   .addOption(`bar`, `bar`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You selected <@&${ctx.options[0]}>!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 */
class StringSelect extends BaseSelect_1.BaseSelect {
    /**
     * Create the select menu builder.
     */
    constructor() {
        super(DiscordTypes.ComponentType.StringSelect);
    }
    /**
     * Add an option.
     * @param label The option's label.
     * @param value The option's value.
     * @param description The option's description.
     * @param emoji The option's emoji.
     * @param defaultOption If the option should be the default option.
     * @returns The component.
     */
    addOption(label, value, description, emoji, defaultOption) {
        this._raw.options ??= [];
        this._raw.options.push({
            label,
            value,
            description,
            emoji,
            default: defaultOption
        });
        return this;
    }
}
exports.StringSelect = StringSelect;
/**
 * {@link StringSelect String select} context.
 */
class StringSelectContext extends BaseComponent_1.BaseComponentContext {
    /**
     * Selected values from the user.
     */
    options;
    /**
     * Create {@link SelectMenu select menu} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction, commandHandler) {
        super(interaction, commandHandler);
        this.options = interaction.data.values;
    }
}
exports.StringSelectContext = StringSelectContext;
