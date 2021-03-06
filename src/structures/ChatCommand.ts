import { BaseInteractionContext } from './BaseContext';
import { CommandHandler } from './CommandHandler';
import { Modal } from './Modal';

import { DistypeCmdError, DistypeCmdErrorType } from '../errors/DistypeCmdError';
import { sanitizeCommand } from '../functions/sanitizeCommand';
import { LocalizedText } from '../types/LocalizedText';
import { LogCallback } from '../types/Log';

import * as DiscordTypes from 'discord-api-types/v10';
import { Snowflake } from 'distype';

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
export type ChatCommandProps = Omit<DiscordTypes.RESTPostAPIChatInputApplicationCommandsJSONBody, `default_permission` | `options`>;

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
    public runExecute: ((ctx: ChatCommandContext<PR, PA>) => (void | Promise<void>)) | null = null;

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
     * Set the command's default member permissions.
     * @param defaultMemberPermissions The permissions a guild member must have to run the command.
     * @returns The command.
     */
    public setDefaultMemberPermissions <T extends ChatCommandProp<`default_member_permissions`>> (defaultMemberPermissions: T): AddProp<`default_member_permissions`, T, PR, PA> {
        this.props.default_member_permissions = defaultMemberPermissions;
        return this as any;
    }

    /**
     * Set the command's DM permission.
     * @param dmPermission If the command should be enabled in DMs.
     * @returns The command.
     */
    public setDmPermission <T extends ChatCommandProp<`dm_permission`>> (dmPermission: T): AddProp<`dm_permission`, T, PR, PA> {
        this.props.dm_permission = dmPermission;
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
     * @param executeCallback The callback to execute when an interaction is received.
     */
    public setExecute (executeCallback: this[`runExecute`]): this {
        this.runExecute = executeCallback;
        return this;
    }

    /**
     * Converts a command to a Discord API compatible object.
     * @returns The converted command.
     */
    public getRaw (): Required<Omit<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody, `default_permission`>> {
        return sanitizeCommand({
            ...this.props as any,
            options: this.parameters ?? []
        });
    }
}

/**
 * {@link ChatCommand Chat command} context.
 */
export class ChatCommandContext<PR extends Partial<ChatCommandProps>, PA extends DiscordTypes.APIApplicationCommandBasicOption[]> extends BaseInteractionContext<PR[`dm_permission`] extends false ? true : boolean> {
    /**
     * The ID of the channel that the command was ran in.
     */
    public readonly channelId: Snowflake;
    /**
     * Command data.
     */
    public readonly command: ChatCommand<PR, PA>[`props`] & { id: Snowflake };
    /**
     * The {@link ChatCommand chat command} the context originates from.
     */
    public readonly contextParent: ChatCommand<PR, PA>;
    /**
     * Parameter values from the user.
     */
    public readonly parameters: { [K in PA[number][`name`]]: ParameterValue<Extract<PA[number], { name: K }>[`type`], Extract<PA[number], { name: K }>[`required`]> };

    /**
     * Create {@link ChatCommand chat command} context.
     * @param interaction Interaction data.
     * @param chatCommand The {@link ChatCommand chat command} the context originates from.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor (interaction: DiscordTypes.APIChatInputApplicationCommandInteraction, chatCommand: ChatCommand<PR, PA>, commandHandler: CommandHandler, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
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

            newParam ??= (c as any).value;
            return Object.assign(p, { [c.name]: newParam });
        }, {}) as any ?? {};
    }

    /**
     * Respond with a modal.
     * The modal's execute method is automatically bound to the command handler.
     * If the command handler already has a bound modal with the same ID, it will be overwritten.
     * A modal will stay bound to the command handler until it's execution context's "unbind()" method is called.
     * @param modal The modal to respond with.
     */
    public async showModal (modal: Modal<any, DiscordTypes.APIModalActionRowComponent[]>): Promise<void> {
        if (this.responded) throw new DistypeCmdError(`Already responded to interaction ${this.interaction.id}`, DistypeCmdErrorType.ALREADY_RESPONDED);

        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.Modal,
            data: modal.getRaw()
        });

        this.commandHandler.bindModal(modal);
    }
}
