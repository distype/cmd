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
exports.ChatCommandContext = exports.ChatCommand = void 0;
const BaseCommand_1 = require("./base/BaseCommand");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * The chat command builder.
 *
 * @example
 * ```ts
 * new ChatCommand()
 *   .setName(`foo`)
 *   .setDescription(`Foo command`)
 *   .addStringParameter(true, `bar`, `Describe bar`)
 *   .addUserParameter(true, `baz`, `Which user is baz?`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You said bar is "${ctx.options.bar}", and that ${ctx.options.baz.user.username} is baz!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/application-commands#slash-commands)
 */
class ChatCommand extends BaseCommand_1.BaseCommand {
    /**
     * Create the chat command builder.
     */
    constructor() {
        super(DiscordTypes.ApplicationCommandType.ChatInput);
    }
    /**
     * Set the command's description.
     * @param description The description to use.
     * @param localization Description localization.
     * @returns The command.
     */
    setDescription(description, localization) {
        this._raw.description = description;
        this._raw.description_localizations = localization;
        return this;
    }
    /**
     * Add a string option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addStringOption(required, name, description, options) {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.String,
            required,
            ...options,
        });
        return this;
    }
    /**
     * Add an integer option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addIntegerOption(required, name, description, options) {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Integer,
            required,
            ...options,
        });
        return this;
    }
    /**
     * Add a boolean option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addBooleanOption(required, name, description, options) {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Boolean,
            required,
            ...options,
        });
        return this;
    }
    /**
     * Add a user option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addUserOption(required, name, description, options) {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.User,
            required,
            ...options,
        });
        return this;
    }
    /**
     * Add a channel option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addChannelOption(required, name, description, options) {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Channel,
            required,
            ...options,
        });
        return this;
    }
    /**
     * Add a role option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addRoleOption(required, name, description, options) {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Role,
            required,
            ...options,
        });
        return this;
    }
    /**
     * Add a mentionable option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addMentionableOption(required, name, description, options) {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Mentionable,
            required,
            ...options,
        });
        return this;
    }
    /**
     * Add a number option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addNumberOption(required, name, description, options) {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Number,
            required,
            ...options,
        });
        return this;
    }
    /**
     * Add an attachment option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addAttachmentOption(required, name, description, options) {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Attachment,
            required,
            ...options,
        });
        return this;
    }
}
exports.ChatCommand = ChatCommand;
/**
 * {@link ChatCommand Chat command} context.
 */
class ChatCommandContext extends BaseCommand_1.BaseCommandContext {
    /**
     * Parameter values from the user.
     */
    options;
    /**
     * Create {@link ChatCommand chat command} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction, commandHandler) {
        super(interaction, commandHandler);
        this.options =
            interaction.data?.options?.reduce((p, c) => {
                let newParam;
                switch (c.type) {
                    case DiscordTypes.ApplicationCommandOptionType.User: {
                        newParam = {
                            user: interaction.data.resolved?.users?.[c.value],
                            member: interaction.data.resolved?.members?.[c.value],
                        };
                        break;
                    }
                    case DiscordTypes.ApplicationCommandOptionType.Channel: {
                        newParam = interaction.data.resolved?.channels?.[c.value];
                        break;
                    }
                    case DiscordTypes.ApplicationCommandOptionType.Role: {
                        newParam = interaction.data.resolved?.roles?.[c.value];
                        break;
                    }
                    case DiscordTypes.ApplicationCommandOptionType.Mentionable: {
                        newParam = interaction.data.resolved?.roles?.[c.value] ?? {
                            user: interaction.data.resolved?.users?.[c.value],
                            member: interaction.data.resolved?.members?.[c.value],
                        };
                        break;
                    }
                    case DiscordTypes.ApplicationCommandOptionType.Attachment: {
                        newParam = interaction.data.resolved?.attachments?.[c.value];
                        break;
                    }
                }
                newParam ??= c.value;
                return Object.assign(p, { [c.name]: newParam });
            }, {}) ?? {};
    }
}
exports.ChatCommandContext = ChatCommandContext;
