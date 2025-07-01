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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentionableSelectContext = exports.MentionableSelect = void 0;
const BaseComponent_1 = require("./base/BaseComponent");
const BaseSelect_1 = require("./base/BaseSelect");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * The mentionable select menu builder.
 *
 * @example
 * ```ts
 * new MentionableSelect()
 *   .setId(`foo`)
 *   .setPlaceholder(`Select a mentionable`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You selected a mentionable with ID ${ctx.options[0].id}!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 */
class MentionableSelect extends BaseSelect_1.BaseSelect {
    /**
     * Create the select menu builder.
     */
    constructor() {
        super(DiscordTypes.ComponentType.MentionableSelect);
    }
}
exports.MentionableSelect = MentionableSelect;
/**
 * {@link MentionableSelect Mentionable select} context.
 */
class MentionableSelectContext extends BaseComponent_1.BaseComponentContext {
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
        this.options = [
            ...(interaction.data.resolved.users
                ? Object.keys(interaction.data.resolved.users).map((id) => ({
                    user: interaction.data.resolved.users[id],
                    member: interaction.data.resolved.members?.[id],
                }))
                : []),
            ...Object.values(interaction.data.resolved.roles ?? {}),
        ];
    }
}
exports.MentionableSelectContext = MentionableSelectContext;
