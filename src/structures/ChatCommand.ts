import { CommandMessage, messageFactory } from '../functions/messageFactory';
import { LocalizedText } from '../types/LocalizedText';

import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';
import { CommandHandler } from './CommandHandler';

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
 */
export class ChatCommand<PR extends Partial<ChatCommandProps> = { type: DiscordTypes.ApplicationCommandType.ChatInput }, PA extends DiscordTypes.APIApplicationCommandBasicOption[] = []> {
    /**
     * The command's props.
     */
    public props: PR = { type: DiscordTypes.ApplicationCommandType.ChatInput } as PR;
    /**
     * The command's parameters.
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
        this.props.name = name;
        return this as any;
    }

    /**
     * Set the command's name localizations.
     * @param nameLocalizaions The name localizations to use.
     * @returns The command.
     */
    public setNameLocalizations <T extends ChatCommandProp<`name_localizations`>> (nameLocalizaions: T): AddProp<`name_localizations`, T, PR, PA> {
        this.props.name_localizations = nameLocalizaions;
        return this as any;
    }

    /**
     * Set the command's description.
     * @param description The description to use.
     * @returns The command.
     */
    public setDescription <T extends ChatCommandProp<`description`>> (description: T): AddProp<`description`, T, PR, PA> {
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
        if (this.parameters.find((parameter) => parameter.name === name)) throw new Error(`A parameter alreadt exists with the name "${name}"`);

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
        if (this.parameters.find((parameter) => parameter.name === name)) throw new Error(`A parameter alreadt exists with the name "${name}"`);

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
        if (this.parameters.find((parameter) => parameter.name === name)) throw new Error(`A parameter alreadt exists with the name "${name}"`);

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
        if (this.parameters.find((parameter) => parameter.name === name)) throw new Error(`A parameter alreadt exists with the name "${name}"`);

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
        if (this.parameters.find((parameter) => parameter.name === name)) throw new Error(`A parameter alreadt exists with the name "${name}"`);

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
        if (this.parameters.find((parameter) => parameter.name === name)) throw new Error(`A parameter alreadt exists with the name "${name}"`);

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
        if (this.parameters.find((parameter) => parameter.name === name)) throw new Error(`A parameter alreadt exists with the name "${name}"`);

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
        if (this.parameters.find((parameter) => parameter.name === name)) throw new Error(`A parameter alreadt exists with the name "${name}"`);

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
        if (this.parameters.find((parameter) => parameter.name === name)) throw new Error(`A parameter alreadt exists with the name "${name}"`);

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
        if (!this.props.name || !this.props.description) throw new Error(`A chat input command's name and description must be present to set its execute method`);
        this.run = exec;
        return this;
    }
}

/**
 * Chat command context.
 */
export class ChatCommandContext<PR extends Partial<ChatCommandProps>, PA extends DiscordTypes.APIApplicationCommandBasicOption[]> {
    /**
     * The client that received the interaction.
     */
    public client: Client;
    /**
     * The command handler that invoked the context.
     */
    public commandHandler: CommandHandler;
    /**
     * If the original response was a defer.
     */
    public deferred: boolean | null = null;
    /**
     * Message IDs of sent responses.
     */
    public responses: Array<Snowflake | `@original`> = [];

    /**
     * The ID of the channel that the command was ran in.
     */
    public readonly channelId: Snowflake;
    /**
     * Command data.
     */
    public readonly command: ChatCommand<PR, PA>[`props`] & { id: Snowflake };
    /**
     * The ID of the guild that the command was ran in.
     */
    public readonly guildId?: Snowflake;
    /**
     * The guild's preferred locale, if the command was invoked in a guild.
     */
    public readonly guildLocale?: DiscordTypes.LocaleString;
    /**
     * Interaction data.
     */
    public readonly interaction: {
        /**
         * The ID of the application the interaction belongs to.
         */
        applicationId: Snowflake
        /**
         * The interaction's ID.
         */
        id: Snowflake
        /**
         * The interaction's token.
         */
        token: string
        /**
         * The interaction's type.
         */
        type: DiscordTypes.InteractionType.ApplicationCommand
        /**
         * The interaction's version.
         */
        version: 1
    };
    /**
     * The invoking user's member data.
     */
    public readonly member?: DiscordTypes.APIInteractionGuildMember;
    /**
     * Parameter values from the user.
     */
    public readonly parameters: { [K in PA[number][`name`]]: ParameterValue<Extract<PA[number], { name: K }>[`type`], Extract<PA[number], { name: K }>[`required`]> };
    /**
     * The invoking user.
     */
    public readonly user: DiscordTypes.APIUser;

    /**
     * Create a chat command's context.
     * @param client The client that received the interaction.
     * @param commandHandler The command handler that invoked the context.
     * @param interaction Interaction data.
     */
    constructor (client: Client, commandHandler: CommandHandler, command: ChatCommand<PR, PA>, interaction: DiscordTypes.APIChatInputApplicationCommandInteraction) {
        this.client = client;
        this.commandHandler = commandHandler;

        this.channelId = interaction.channel_id;
        this.command = {
            ...command.props,
            id: interaction.data.id
        };
        this.guildId = interaction.guild_id ?? interaction.data.guild_id;
        this.guildLocale = interaction.guild_locale;
        this.interaction = {
            applicationId: interaction.application_id,
            id: interaction.id,
            token: interaction.token,
            type: interaction.type,
            version: interaction.version
        };
        this.member = interaction.member;
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
        this.user = {
            ...(interaction.member?.user ?? interaction.user!),
            locale: interaction.locale ?? interaction.locale
        };
    }

    /**
     * Calls the command handler's error callback.
     * Note that this does not stop the execution of the command's execute method; you must also call `return`.
     * @param error The error encountered.
     */
    public error (error: Error): void {
        this.commandHandler.runError(error, this as any, false);
    }

    /**
     * Defers the interaction (displays a loading state to the user).
     */
    public async defer (flags?: DiscordTypes.MessageFlags): Promise<`@original`> {
        if (this.responses.length) throw new Error(`Cannot defer, a response has already been created`);

        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.DeferredChannelMessageWithSource,
            data: { flags }
        });

        this.deferred = true;

        this.responses.push(`@original`);
        return `@original`;
    }

    /**
     * Sends a message.
     * @param message The message to send.
     */
    public async send (message: CommandMessage): Promise<Snowflake | `@original`> {
        let id: Snowflake | `@original`;

        if (this.responses.length) {
            id = (await this.client.rest.createFollowupMessage(this.interaction.id, this.interaction.token, messageFactory(message))).id;
        } else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
                data: messageFactory(message)
            });
            id = `@original`;
            this.deferred = false;
        }

        this.responses.push(id);
        return id;
    }

    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @returns The new created response.
     */
    public async edit (id: Snowflake | `@original`, message: CommandMessage): Promise<DiscordTypes.RESTPatchAPIInteractionFollowupResult> {
        if (id === `@original` && this.deferred) throw new Error(`Cannot edit original response (defer)`);
        return await this.client.rest.editFollowupMessage(this.interaction.id, this.interaction.token, id, messageFactory(message));
    }

    /**
     * Delete a response.
     * @param id The ID of the reponse to delete.
     */
    public async delete (id: Snowflake | `@original`): Promise<void> {
        if (id === `@original` && this.deferred) throw new Error(`Cannot delete original response (defer)`);
        await this.client.rest.deleteFollowupMessage(this.interaction.id, this.interaction.token, id);
        this.responses = this.responses.filter((response) => response !== id);
    }
}
