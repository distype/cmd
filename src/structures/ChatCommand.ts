import { BaseInteractionContextWithModal } from './BaseContext';
import { CommandHandler } from './CommandHandler';

import { DistypeCmdError, DistypeCmdErrorType } from '../errors/DistypeCmdError';
import { sanitizeCommand } from '../functions/sanitizeCommand';
import { LocalizedText } from '../types/LocalizedText';
import { LogCallback } from '../types/Log';

import * as DiscordTypes from 'discord-api-types/v10';
import { DiscordConstants, Snowflake } from 'distype';

/**
 * Adds a prop to a command.
 * @internal
 */
type AddProp <K extends keyof Required<ChatCommandProps>, V extends ChatCommandProp<K>, Props, Parameters extends DiscordTypes.APIApplicationCommandBasicOption[]> = ChatCommand<Props & Record<K, V>, Parameters>;

/**
 * Adds a parameter to a command.
 * @internal
 */
type AddParameter <T extends DiscordTypes.APIApplicationCommandBasicOption, Props, Parameters extends DiscordTypes.APIApplicationCommandBasicOption[]> = ChatCommand<Props, [...Parameters, T]>

/**
 * Translates a parameter's type to a tangible type.
 * @internal
 */
 type ParameterTypeTranslation<T extends DiscordTypes.ApplicationCommandOptionType>
 =
 T extends DiscordTypes.ApplicationCommandOptionType.String ? string :
 T extends DiscordTypes.ApplicationCommandOptionType.Integer ? number :
 T extends DiscordTypes.ApplicationCommandOptionType.Boolean ? boolean :
 T extends DiscordTypes.ApplicationCommandOptionType.User ? { user: DiscordTypes.APIUser, member?: DiscordTypes.APIInteractionDataResolvedGuildMember } :
 T extends DiscordTypes.ApplicationCommandOptionType.Channel ? DiscordTypes.APIInteractionDataResolvedChannel :
 T extends DiscordTypes.ApplicationCommandOptionType.Role ? DiscordTypes.APIRole :
 T extends DiscordTypes.ApplicationCommandOptionType.Mentionable ? { user: DiscordTypes.APIUser, member?: DiscordTypes.APIInteractionDataResolvedGuildMember } | DiscordTypes.APIRole :
 T extends DiscordTypes.ApplicationCommandOptionType.Number ? number :
 T extends DiscordTypes.ApplicationCommandOptionType.Attachment ? DiscordTypes.APIAttachment :
 never;

/**
* Generates a parameter's value in an interaction.
* @internal
*/
type ParameterValue<T extends DiscordTypes.ApplicationCommandOptionType, R extends boolean | undefined> = R extends true ? ParameterTypeTranslation<T> : ParameterTypeTranslation<T> | undefined;

/**
 * A property of a command.
 * @internal
 */
type ChatCommandProp<K extends keyof Required<ChatCommandProps>> = Required<ChatCommandProps>[K];

/**
 * A chat command's props.
 */
export type ChatCommandProps = Omit<DiscordTypes.RESTPostAPIChatInputApplicationCommandsJSONBody, `options`>;

/**
 * A parameter's choice.
 */
export interface ParameterChoice<T extends string | number> {
    /**
     * The choice's name.
     */
    name: string
    /**
     * A localization dictionary for the choice's name.
     */
    name_localization?: DiscordTypes.LocalizationMap
    /**
     * The choice's value.
     */
    value: T
}

/**
 * A parameter's value limits.
 */
export interface ParameterLimits {
    /**
     * The minimum permitted value.
     */
    min?: number
    /**
     * The maximum permitted value.
     */
    max?: number
}

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
export class ChatCommand<PR extends Partial<ChatCommandProps> = { type: DiscordTypes.ApplicationCommandType.ChatInput }, PA extends DiscordTypes.APIApplicationCommandBasicOption[] = []> {
    /**
     * The command's props.
     * @internal
     */
    public props: PR = { type: DiscordTypes.ApplicationCommandType.ChatInput } as PR;
    /**
     * The command's parameters.
     * @internal
     */
    public parameters: PA = [] as unknown as PA;
    /**
     * The command's execute method.
     * @internal
     */
    public run: ((ctx: ChatCommandContext<PR, PA>) => (void | Promise<void>)) | null = null;

    /**
     * Set the command's name.
     * @param name The name to use.
     * @returns The command.
     */
    public setName <T extends ChatCommandProp<`name`>> (name: T): AddProp<`name`, T, PR, PA> {
        if (name.length > DiscordConstants.APPLICATION_COMMAND_LIMITS.NAME) throw new DistypeCmdError(`Specified name is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.NAME}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        this.props.name = name;
        return this as any;
    }

    /**
     * Set the command's name localizations.
     * @param nameLocalizations The name localizations to use.
     * @returns The command.
     */
    public setNameLocalizations <T extends ChatCommandProp<`name_localizations`>> (nameLocalizations: T): AddProp<`name_localizations`, T, PR, PA> {
        this.props.name_localizations = nameLocalizations;
        return this as any;
    }

    /**
     * Set the command's description.
     * @param description The description to use.
     * @returns The command.
     */
    public setDescription <T extends ChatCommandProp<`description`>> (description: T): AddProp<`description`, T, PR, PA> {
        if (description.length > DiscordConstants.APPLICATION_COMMAND_LIMITS.DESCRIPTION) throw new DistypeCmdError(`Specified description is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.DESCRIPTION}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        this.props.description = description;
        return this as any;
    }

    /**
     * Set the command's description localizations.
     * @param descriptionLocalizations The description localizations to use.
     * @returns The command.
     */
    public setDescriptionLocalizations <T extends ChatCommandProp<`description_localizations`>> (descriptionLocalizations: T): AddProp<`description_localizations`, T, PR, PA> {
        this.props.description_localizations = descriptionLocalizations;
        return this as any;
    }

    /**
     * Set the command's default permission.
     * @param defaultPermission The default permission to use.
     * @returns The command.
     */
    public setDefaultPermission <T extends ChatCommandProp<`default_permission`>> (defaultPermission: T): AddProp<`default_permission`, T, PR, PA> {
        this.props.default_permission = defaultPermission;
        return this as any;
    }

    /**
     * Add a string parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    public addStringParameter <
        R extends boolean,
        N extends string,
        NL extends DiscordTypes.LocalizationMap,
        D extends string,
        DL extends DiscordTypes.LocalizationMap,
        RS extends Array<ParameterChoice<string>> | undefined = undefined
    > (required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>, restraints?: RS): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.String
        required: R
        name: N
        description: D
        choices: RS
    }, PR, PA> {
        if ((typeof name === `string` ? name : name.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME) throw new DistypeCmdError(`Specified name is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((typeof description === `string` ? description : description.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION) throw new DistypeCmdError(`Specified description is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((restraints ?? []).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.CHOICES) throw new DistypeCmdError(`Maximum number of choices exceeded (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.CHOICES})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        if (this.parameters.length === DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS) throw new DistypeCmdError(`Command already contains maximum number of options (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if (this.parameters.find((parameter) => parameter.name === name)) throw new DistypeCmdError(`A parameter already exists with the name "${name}"`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.String,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization,
            choices: restraints
        });
        return this as any;
    }

    /**
     * Add an integer parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    public addIntegerParameter <
        R extends boolean,
        N extends string,
        NL extends DiscordTypes.LocalizationMap,
        D extends string,
        DL extends DiscordTypes.LocalizationMap,
        RS extends Array<ParameterChoice<number>> | ParameterLimits | undefined = undefined
    > (required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>, restraints?: RS): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Integer
        required: R
        name: N
        description: D
        choices: RS extends ParameterLimits ? undefined : RS
        min_value: RS extends ParameterLimits ? RS[`min`] extends number ? RS[`min`] : undefined : undefined
        max_value: RS extends ParameterLimits ? RS[`max`] extends number ? RS[`max`] : undefined : undefined
    }, PR, PA> {
        if ((typeof name === `string` ? name : name.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME) throw new DistypeCmdError(`Specified name is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((typeof description === `string` ? description : description.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION) throw new DistypeCmdError(`Specified description is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((Array.isArray(restraints) ? restraints : []).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.CHOICES) throw new DistypeCmdError(`Maximum number of choices exceeded (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.CHOICES})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        if (this.parameters.length === DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS) throw new DistypeCmdError(`Command already contains maximum number of options (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if (this.parameters.find((parameter) => parameter.name === name)) throw new DistypeCmdError(`A parameter already exists with the name "${name}"`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

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
        return this as any;
    }

    /**
     * Add a boolean parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    public addBooleanParameter <
        R extends boolean,
        N extends string,
        NL extends DiscordTypes.LocalizationMap,
        D extends string,
        DL extends DiscordTypes.LocalizationMap,
    > (required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Boolean
        required: R
        name: N
        description: D
    }, PR, PA> {
        if ((typeof name === `string` ? name : name.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME) throw new DistypeCmdError(`Specified name is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((typeof description === `string` ? description : description.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION) throw new DistypeCmdError(`Specified description is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        if (this.parameters.length === DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS) throw new DistypeCmdError(`Command already contains maximum number of options (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if (this.parameters.find((parameter) => parameter.name === name)) throw new DistypeCmdError(`A parameter already exists with the name "${name}"`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Boolean,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization
        });
        return this as any;
    }

    /**
     * Add a user parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    public addUserParameter <
        R extends boolean,
        N extends string,
        NL extends DiscordTypes.LocalizationMap,
        D extends string,
        DL extends DiscordTypes.LocalizationMap,
    > (required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.User
        required: R
        name: N
        description: D
    }, PR, PA> {
        if ((typeof name === `string` ? name : name.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME) throw new DistypeCmdError(`Specified name is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((typeof description === `string` ? description : description.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION) throw new DistypeCmdError(`Specified description is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        if (this.parameters.length === DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS) throw new DistypeCmdError(`Command already contains maximum number of options (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if (this.parameters.find((parameter) => parameter.name === name)) throw new DistypeCmdError(`A parameter already exists with the name "${name}"`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.User,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization
        });
        return this as any;
    }

    /**
     * Add a channel parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    public addChannelParameter <
        R extends boolean,
        N extends string,
        NL extends DiscordTypes.LocalizationMap,
        D extends string,
        DL extends DiscordTypes.LocalizationMap,
        RS extends Array<Exclude<DiscordTypes.ChannelType, DiscordTypes.ChannelType.DM | DiscordTypes.ChannelType.GroupDM>> | undefined = undefined
    > (required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>, restraints?: RS): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Channel
        required: R
        name: N
        description: D
        channel_types: RS
    }, PR, PA> {
        if ((typeof name === `string` ? name : name.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME) throw new DistypeCmdError(`Specified name is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((typeof description === `string` ? description : description.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION) throw new DistypeCmdError(`Specified description is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        if (this.parameters.length === DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS) throw new DistypeCmdError(`Command already contains maximum number of options (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if (this.parameters.find((parameter) => parameter.name === name)) throw new DistypeCmdError(`A parameter already exists with the name "${name}"`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Channel,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization,
            channel_types: restraints
        });
        return this as any;
    }

    /**
     * Add a role parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    public addRoleParameter <
        R extends boolean,
        N extends string,
        NL extends DiscordTypes.LocalizationMap,
        D extends string,
        DL extends DiscordTypes.LocalizationMap,
    > (required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Role
        required: R
        name: N
        description: D
    }, PR, PA> {
        if ((typeof name === `string` ? name : name.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME) throw new DistypeCmdError(`Specified name is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((typeof description === `string` ? description : description.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION) throw new DistypeCmdError(`Specified description is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        if (this.parameters.length === DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS) throw new DistypeCmdError(`Command already contains maximum number of options (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if (this.parameters.find((parameter) => parameter.name === name)) throw new DistypeCmdError(`A parameter already exists with the name "${name}"`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Role,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization
        });
        return this as any;
    }

    /**
     * Add a mentionable parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    public addMentionableParameter <
        R extends boolean,
        N extends string,
        NL extends DiscordTypes.LocalizationMap,
        D extends string,
        DL extends DiscordTypes.LocalizationMap,
    > (required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Mentionable
        required: R
        name: N
        description: D
    }, PR, PA> {
        if ((typeof name === `string` ? name : name.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME) throw new DistypeCmdError(`Specified name is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((typeof description === `string` ? description : description.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION) throw new DistypeCmdError(`Specified description is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        if (this.parameters.length === DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS) throw new DistypeCmdError(`Command already contains maximum number of options (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if (this.parameters.find((parameter) => parameter.name === name)) throw new DistypeCmdError(`A parameter already exists with the name "${name}"`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Mentionable,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization
        });
        return this as any;
    }

    /**
     * Add a number parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    public addNumberParameter <
        R extends boolean,
        N extends string,
        NL extends DiscordTypes.LocalizationMap,
        D extends string,
        DL extends DiscordTypes.LocalizationMap,
        RS extends Array<ParameterChoice<number>> | ParameterLimits | undefined = undefined
    > (required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>, restraints?: RS): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Number
        required: R
        name: N
        description: D
        choices: RS extends ParameterLimits ? undefined : RS
        min_value: RS extends ParameterLimits ? RS[`min`] extends number ? RS[`min`] : undefined : undefined
        max_value: RS extends ParameterLimits ? RS[`max`] extends number ? RS[`max`] : undefined : undefined
    }, PR, PA> {
        if ((typeof name === `string` ? name : name.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME) throw new DistypeCmdError(`Specified name is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((typeof description === `string` ? description : description.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION) throw new DistypeCmdError(`Specified description is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((Array.isArray(restraints) ? restraints : []).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.CHOICES) throw new DistypeCmdError(`Maximum number of choices exceeded (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.CHOICES})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        if (this.parameters.length === DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS) throw new DistypeCmdError(`Command already contains maximum number of options (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if (this.parameters.find((parameter) => parameter.name === name)) throw new DistypeCmdError(`A parameter already exists with the name "${name}"`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

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
        return this as any;
    }

    /**
     * Add an attachment parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    public addAttachmentParameter <
        R extends boolean,
        N extends string,
        NL extends DiscordTypes.LocalizationMap,
        D extends string,
        DL extends DiscordTypes.LocalizationMap,
    > (required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Attachment
        required: R
        name: N
        description: D
    }, PR, PA> {
        if ((typeof name === `string` ? name : name.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME) throw new DistypeCmdError(`Specified name is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.NAME}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if ((typeof description === `string` ? description : description.default).length > DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION) throw new DistypeCmdError(`Specified description is longer than maximum length ${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTION.DESCRIPTION}`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        if (this.parameters.length === DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS) throw new DistypeCmdError(`Command already contains maximum number of options (${DiscordConstants.APPLICATION_COMMAND_LIMITS.OPTIONS})`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);
        if (this.parameters.find((parameter) => parameter.name === name)) throw new DistypeCmdError(`A parameter already exists with the name "${name}"`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_VALUE);

        this.parameters.push({
            type: DiscordTypes.ApplicationCommandOptionType.Attachment,
            required,
            name: typeof name === `string` ? name : name.default,
            name_localizations: typeof name === `string` ? undefined : name.localization,
            description: typeof description === `string` ? description : description.default,
            description_localizations: typeof description === `string` ? undefined : description.localization
        });
        return this as any;
    }

    /**
     * Sets the command's execute method.
     * @param exec The callback to execute when an interaction is received.
     */
    public setExecute (exec: (ctx: ChatCommandContext<PR, PA>) => (void | Promise<void>)): this {
        this.run = exec;
        return this;
    }

    /**
     * Converts a command to a Discord API compatible object.
     * @returns The converted command.
     */
    public getRaw (): Required<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody> {
        if (typeof this.props.type !== `number`) throw new DistypeCmdError(`Cannot convert a command with a missing "type" parameter to raw`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_PARAMETERS_FOR_RAW);
        if (typeof this.props.name !== `string`) throw new DistypeCmdError(`Cannot convert a command with a missing "name" parameter to raw`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_PARAMETERS_FOR_RAW);
        if (typeof this.props.description !== `string`) throw new DistypeCmdError(`Cannot convert a command with a missing "description" parameter to raw`, DistypeCmdErrorType.INVALID_CHAT_COMMAND_PARAMETERS_FOR_RAW);

        return sanitizeCommand({
            ...this.props as any,
            options: this.parameters ?? []
        });
    }
}

/**
 * Chat command context.
 */
export class ChatCommandContext<PR extends Partial<ChatCommandProps>, PA extends DiscordTypes.APIApplicationCommandBasicOption[]> extends BaseInteractionContextWithModal {
    /**
     * The ID of the channel that the command was ran in.
     */
    public readonly channelId: Snowflake;
    /**
     * Command data.
     */
    public readonly command: ChatCommand<PR, PA>[`props`] & { id: Snowflake };
    /**
     * Parameter values from the user.
     */
    public readonly parameters: { [K in PA[number][`name`]]: ParameterValue<Extract<PA[number], { name: K }>[`type`], Extract<PA[number], { name: K }>[`required`]> };

    /**
     * Create a chat command's context.
     * @param commandHandler The command handler that invoked the context.
     * @param command The command that invoked the context.
     * @param interaction Interaction data.
     */
    constructor (commandHandler: CommandHandler, command: ChatCommand<PR, PA>, interaction: DiscordTypes.APIChatInputApplicationCommandInteraction, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
        super(commandHandler, interaction, logCallback, logThisArg);

        this.channelId = interaction.channel_id;
        this.command = {
            ...command.props,
            id: interaction.data.id
        };
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

            newParam ??= (c as any).value;
            return Object.assign(p, { [c.name]: newParam });
        }, {}) as any ?? {};
    }
}
