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
exports.BaseCommandContext = exports.BaseCommand = void 0;
const InteractionContext_1 = require("../../InteractionContext");
const sanitizeCommand_1 = require("../../../utils/sanitizeCommand");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
const distype_1 = require("distype");
/**
 * The base command builder.
 * @internal
 */
class BaseCommand {
    /**
     * The command's execute method.
     */
    _execute = () => { };
    /**
     * The guild the command belongs to.
     */
    _guild = null;
    /**
     * Middleware metadata.
     */
    _middlewareMeta = null;
    /**
     * The raw command.
     */
    _raw;
    /**
     * Create the base command builder.
     * @param type The command's type.
     */
    constructor(type) {
        this._raw = { type };
    }
    /**
     * Set the command's name.
     * @param name The name to use.
     * @param localization Name localization.
     * @returns The command.
     */
    setName(name, localization) {
        this._raw.name = name;
        this._raw.name_localizations = localization;
        return this;
    }
    /**
     * Set the command's default member permissions.
     * @param permissions The permissions a guild member must have to run the command.
     * @returns The command.
     */
    setDefaultMemberPermissions(...permissions) {
        this._raw.default_member_permissions = distype_1.PermissionsUtils.combine(...permissions).toString();
        return this;
    }
    /**
     * Set the guild the command belongs to.
     * @param id The guild's ID.
     * @returns The command.
     */
    setGuild(id) {
        this._guild = id;
        return this;
    }
    /**
     * Set if the command should be locked to just guilds (`dm_permission`).
     * Ignored if the command has a set guild.
     * @param guildOnly If the command should be guild only.
     * @returns The command.
     */
    setGuildOnly(guildOnly) {
        this._raw.dm_permission = !guildOnly;
        return this;
    }
    /**
     * Get the guild the command belongs to.
     * @returns The guild's ID, or `null` if the command is global.
     */
    getGuild() {
        return this._guild;
    }
    /**
     * Set middleware metadata.
     * @param meta The metadata to set.
     * @returns The command.
     */
    setMiddlewareMeta(meta) {
        this._middlewareMeta = meta;
        return this;
    }
    /**
     * Gets the command's middleware meta.
     * @returns The middleware meta.
     */
    getMiddlewareMeta() {
        return this._middlewareMeta;
    }
    /**
     * Sets the command's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     * @returns The command.
     */
    setExecute(executeCallback) {
        this._execute = executeCallback;
        return this;
    }
    /**
     * Gets the command's execute method.
     * @returns The execute method.
     */
    getExecute() {
        return this._execute;
    }
    /**
     * Converts the command to a Discord API compatible object.
     * @returns The converted command.
     */
    getRaw() {
        if (this._raw.name)
            throw new Error(`Command name must be defined`);
        return this._guild !== null ? (0, sanitizeCommand_1.sanitizeGuildCommand)(this._raw) : (0, sanitizeCommand_1.sanitizeCommand)(this._raw);
    }
}
exports.BaseCommand = BaseCommand;
/**
 * {@link BaseCommand Base command} context.
 * @internal
 */
class BaseCommandContext extends InteractionContext_1.InteractionContext {
    /**
     * Command data.
     */
    command;
    /**
     * Create {@link BaseCommand base command} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction, commandHandler) {
        super(interaction, commandHandler);
        this.command = {
            guildId: interaction.data.guild_id,
            id: interaction.data.id,
            name: interaction.data.name,
            type: interaction.data.type
        };
    }
    /**
     * Respond with a modal.
     * @param modal The modal to respond with.
     */
    async showModal(modal) {
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.Modal,
            data: modal.getRaw()
        });
    }
}
exports.BaseCommandContext = BaseCommandContext;
