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
exports.ChatCommandContext = exports.ChatCommand = void 0;
const BaseContext_1 = require("./BaseContext");
const sanitizeCommand_1 = require("../functions/sanitizeCommand");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * The chat input command builder.
 *
 * @example
 * ```ts
 * new ChatCommand()
 *   .setName(`foo`)
 *   .setDescription(`Foo command`)
 *   .addStringParameter(true, `bar`, `Describe bar`)
 *   .addUserParameter(true, `baz`, `Which user is baz?`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You said bar is "${ctx.parameters.bar}", and that ${ctx.parameters.baz.user.username} is baz!`);
 *   });
 * ```
 */
class ChatCommand {
    /**
     * The command's props.
     * @internal
     */
    props = { type: DiscordTypes.ApplicationCommandType.ChatInput };
    /**
     * The command's parameters.
     * @internal
     */
    parameters = [];
    /**
     * The command's execute method.
     * @internal
     */
    runExecute = null;
    /**
     * Set the command's name.
     * @param name The name to use.
     * @returns The command.
     */
    setName(name) {
        this.props.name = name;
        return this;
    }
    /**
     * Set the command's name localizations.
     * @param nameLocalizations The name localizations to use.
     * @returns The command.
     */
    setNameLocalizations(nameLocalizations) {
        this.props.name_localizations = nameLocalizations;
        return this;
    }
    /**
     * Set the command's description.
     * @param description The description to use.
     * @returns The command.
     */
    setDescription(description) {
        this.props.description = description;
        return this;
    }
    /**
     * Set the command's description localizations.
     * @param descriptionLocalizations The description localizations to use.
     * @returns The command.
     */
    setDescriptionLocalizations(descriptionLocalizations) {
        this.props.description_localizations = descriptionLocalizations;
        return this;
    }
    /**
     * Set the command's default permission.
     * @param defaultPermission The default permission to use.
     * @returns The command.
     */
    setDefaultPermission(defaultPermission) {
        this.props.default_permission = defaultPermission;
        return this;
    }
    /**
     * Add a string parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    addStringParameter(required, name, description, restraints) {
        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.String,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization,
            choices: restraints
        });
        return this;
    }
    /**
     * Add an integer parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    addIntegerParameter(required, name, description, restraints) {
        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Integer,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization,
            choices: Array.isArray(restraints) ? restraints : undefined,
            min_value: Array.isArray(restraints) ? undefined : restraints?.min,
            max_value: Array.isArray(restraints) ? undefined : restraints?.max
        });
        return this;
    }
    /**
     * Add a boolean parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    addBooleanParameter(required, name, description) {
        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Boolean,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization
        });
        return this;
    }
    /**
     * Add a user parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    addUserParameter(required, name, description) {
        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.User,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization
        });
        return this;
    }
    /**
     * Add a channel parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    addChannelParameter(required, name, description, restraints) {
        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Channel,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization,
            channel_types: restraints
        });
        return this;
    }
    /**
     * Add a role parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    addRoleParameter(required, name, description) {
        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Role,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization
        });
        return this;
    }
    /**
     * Add a mentionable parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    addMentionableParameter(required, name, description) {
        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Mentionable,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization
        });
        return this;
    }
    /**
     * Add a number parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    addNumberParameter(required, name, description, restraints) {
        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Number,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization,
            choices: Array.isArray(restraints) ? restraints : undefined,
            min_value: Array.isArray(restraints) ? undefined : restraints?.min,
            max_value: Array.isArray(restraints) ? undefined : restraints?.max
        });
        return this;
    }
    /**
     * Add an attachment parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    addAttachmentParameter(required, name, description) {
        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Attachment,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization
        });
        return this;
    }
    /**
     * Sets the command's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     */
    setExecute(executeCallback) {
        this.runExecute = executeCallback;
        return this;
    }
    /**
     * Converts a command to a Discord API compatible object.
     * @returns The converted command.
     */
    getRaw() {
        return (0, sanitizeCommand_1.sanitizeCommand)({
            ...this.props,
            options: this.parameters ?? []
        });
    }
}
exports.ChatCommand = ChatCommand;
/**
 * {@link ChatCommand Chat command} context.
 */
class ChatCommandContext extends BaseContext_1.BaseInteractionContextWithModal {
    /**
     * The ID of the channel that the command was ran in.
     */
    channelId;
    /**
     * Command data.
     */
    command;
    /**
     * The {@link ChatCommand chat command} the context originates from.
     */
    contextParent;
    /**
     * Parameter values from the user.
     */
    parameters;
    /**
     * Create {@link ChatCommand chat command} context.
     * @param interaction Interaction data.
     * @param chatCommand The {@link ChatCommand chat command} the context originates from.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(interaction, chatCommand, commandHandler, logCallback = () => { }, logThisArg) {
        super(interaction, commandHandler, logCallback, logThisArg);
        this.channelId = interaction.channel_id;
        this.command = {
            ...chatCommand.props,
            id: interaction.data.id
        };
        this.contextParent = chatCommand;
        this.parameters = interaction.data?.options?.reduce((p, c) => {
            let newParam;
            switch (c.type) {
                case DiscordTypes.ApplicationCommandOptionType.User: {
                    newParam = {
                        user: interaction.data.resolved?.users?.[c.value],
                        member: interaction.data.resolved?.members?.[c.value]
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
                    newParam = interaction.data.resolved?.roles?.[c.value]
                        ?? {
                            user: interaction.data.resolved?.users?.[c.value], member: interaction.data.resolved?.members?.[c.value]
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
