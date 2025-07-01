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
exports.ChannelSelectContext = exports.ChannelSelect = exports.ChannelSelectTypes = void 0;
const BaseComponent_1 = require("./base/BaseComponent");
const BaseSelect_1 = require("./base/BaseSelect");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * Channel select types.
 */
var ChannelSelectTypes;
(function (ChannelSelectTypes) {
    ChannelSelectTypes[ChannelSelectTypes["GUILD_TEXT"] = 0] = "GUILD_TEXT";
    ChannelSelectTypes[ChannelSelectTypes["DM"] = 1] = "DM";
    ChannelSelectTypes[ChannelSelectTypes["GUILD_VOICE"] = 2] = "GUILD_VOICE";
    ChannelSelectTypes[ChannelSelectTypes["GROUP_DM"] = 3] = "GROUP_DM";
    ChannelSelectTypes[ChannelSelectTypes["GUILD_CATEGORY"] = 4] = "GUILD_CATEGORY";
    ChannelSelectTypes[ChannelSelectTypes["GUILD_ANNOUNCEMENT"] = 5] = "GUILD_ANNOUNCEMENT";
    ChannelSelectTypes[ChannelSelectTypes["ANNOUNCEMENT_THREAD"] = 10] = "ANNOUNCEMENT_THREAD";
    ChannelSelectTypes[ChannelSelectTypes["PUBLIC_THREAD"] = 11] = "PUBLIC_THREAD";
    ChannelSelectTypes[ChannelSelectTypes["PRIVATE_THREAD"] = 12] = "PRIVATE_THREAD";
    ChannelSelectTypes[ChannelSelectTypes["GUILD_STAGE_VOICE"] = 13] = "GUILD_STAGE_VOICE";
    ChannelSelectTypes[ChannelSelectTypes["GUILD_DIRECTORY"] = 14] = "GUILD_DIRECTORY";
    ChannelSelectTypes[ChannelSelectTypes["GUILD_FORUM"] = 15] = "GUILD_FORUM";
})(ChannelSelectTypes || (exports.ChannelSelectTypes = ChannelSelectTypes = {}));
/**
 * The channel select menu builder.
 *
 * @example
 * ```ts
 * new ChannelSelect()
 *   .setId(`foo`)
 *   .setPlaceholder(`Select a channel`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You selected <#${ctx.options[0].id}>!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 */
class ChannelSelect extends BaseSelect_1.BaseSelect {
    /**
     * Create the select menu builder.
     */
    constructor() {
        super(DiscordTypes.ComponentType.ChannelSelect);
    }
    setChannelTypes(...types) {
        this._raw.channel_types = types;
        return this;
    }
}
exports.ChannelSelect = ChannelSelect;
/**
 * {@link ChannelSelect Channel select} context.
 */
class ChannelSelectContext extends BaseComponent_1.BaseComponentContext {
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
        this.options = Object.values(interaction.data.resolved.channels);
    }
}
exports.ChannelSelectContext = ChannelSelectContext;
