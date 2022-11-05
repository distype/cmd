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
exports.RoleSelectContext = exports.RoleSelect = void 0;
const BaseComponent_1 = require("./base/BaseComponent");
const BaseSelect_1 = require("./base/BaseSelect");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * The role select menu builder.
 *
 * @example
 * ```ts
 * new RoleSelect()
 *   .setId(`foo`)
 *   .setPlaceholder(`Select a role`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You selected <@&${ctx.options[0].id}>!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 */
class RoleSelect extends BaseSelect_1.BaseSelect {
    /**
     * Create the select menu builder.
     */
    constructor() {
        super(DiscordTypes.ComponentType.RoleSelect);
    }
}
exports.RoleSelect = RoleSelect;
/**
 * {@link RoleSelect Role select} context.
 */
class RoleSelectContext extends BaseComponent_1.BaseComponentContext {
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
        this.options = Object.values(interaction.data.resolved.roles);
    }
}
exports.RoleSelectContext = RoleSelectContext;
