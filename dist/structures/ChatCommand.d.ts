import { BaseCommandContext } from './BaseContext';
import { LocalizedText } from '../types/LocalizedText';
import * as DiscordTypes from 'discord-api-types/v10';
import { Snowflake } from 'distype';
import { CommandHandler } from './CommandHandler';
/**
 * Adds a prop to a command.
 * @internal
 */
declare type AddProp<K extends keyof Required<ChatCommandProps>, V extends ChatCommandProp<K>, Props, Parameters extends DiscordTypes.APIApplicationCommandBasicOption[]> = ChatCommand<Props & Record<K, V>, Parameters>;
/**
 * Adds a parameter to a command.
 * @internal
 */
declare type AddParameter<T extends DiscordTypes.APIApplicationCommandBasicOption, Props, Parameters extends DiscordTypes.APIApplicationCommandBasicOption[]> = ChatCommand<Props, [...Parameters, T]>;
/**
 * Translates a parameter's type to a tangible type.
 * @internal
 */
declare type ParameterTypeTranslation<T extends DiscordTypes.ApplicationCommandOptionType> = T extends DiscordTypes.ApplicationCommandOptionType.String ? string : T extends DiscordTypes.ApplicationCommandOptionType.Integer ? number : T extends DiscordTypes.ApplicationCommandOptionType.Boolean ? boolean : T extends DiscordTypes.ApplicationCommandOptionType.User ? {
    user: DiscordTypes.APIUser;
    member?: DiscordTypes.APIInteractionDataResolvedGuildMember;
} : T extends DiscordTypes.ApplicationCommandOptionType.Channel ? DiscordTypes.APIInteractionDataResolvedChannel : T extends DiscordTypes.ApplicationCommandOptionType.Role ? DiscordTypes.APIRole : T extends DiscordTypes.ApplicationCommandOptionType.Mentionable ? {
    user: DiscordTypes.APIUser;
    member?: DiscordTypes.APIInteractionDataResolvedGuildMember;
} | DiscordTypes.APIRole : T extends DiscordTypes.ApplicationCommandOptionType.Number ? number : T extends DiscordTypes.ApplicationCommandOptionType.Attachment ? DiscordTypes.APIAttachment : never;
/**
* Generates a parameter's value in an interaction.
* @internal
*/
declare type ParameterValue<T extends DiscordTypes.ApplicationCommandOptionType, R extends boolean | undefined> = R extends true ? ParameterTypeTranslation<T> : ParameterTypeTranslation<T> | undefined;
/**
 * A property of a command.
 * @internal
 */
declare type ChatCommandProp<K extends keyof Required<ChatCommandProps>> = Required<ChatCommandProps>[K];
/**
 * A chat command's props.
 */
export declare type ChatCommandProps = Omit<DiscordTypes.RESTPostAPIChatInputApplicationCommandsJSONBody, `options`>;
/**
 * A parameter's choice.
 */
export interface ParameterChoice<T extends string | number> {
    /**
     * The choice's name.
     */
    name: string;
    /**
     * A localization dictionary for the choice's name.
     */
    name_localization?: DiscordTypes.LocalizationMap;
    /**
     * The choice's value.
     */
    value: T;
}
/**
 * A parameter's value limits.
 */
export interface ParameterLimits {
    /**
     * The minimum permitted value.
     */
    min?: number;
    /**
     * The maximum permitted value.
     */
    max?: number;
}
/**
 * The chat input command builder.
 */
export declare class ChatCommand<PR extends Partial<ChatCommandProps> = {
    type: DiscordTypes.ApplicationCommandType.ChatInput;
}, PA extends DiscordTypes.APIApplicationCommandBasicOption[] = []> {
    /**
     * The command's props.
     */
    props: PR;
    /**
     * The command's parameters.
     */
    parameters: PA;
    /**
     * The command's execute method.
     * @internal
     */
    run: ((ctx: ChatCommandContext<PR, PA>) => (void | Promise<void>)) | null;
    /**
     * Set the command's name.
     * @param name The name to use.
     * @returns The command.
     */
    setName<T extends ChatCommandProp<`name`>>(name: T): AddProp<`name`, T, PR, PA>;
    /**
     * Set the command's name localizations.
     * @param nameLocalizaions The name localizations to use.
     * @returns The command.
     */
    setNameLocalizations<T extends ChatCommandProp<`name_localizations`>>(nameLocalizaions: T): AddProp<`name_localizations`, T, PR, PA>;
    /**
     * Set the command's description.
     * @param description The description to use.
     * @returns The command.
     */
    setDescription<T extends ChatCommandProp<`description`>>(description: T): AddProp<`description`, T, PR, PA>;
    /**
     * Set the command's description localizations.
     * @param descriptionLocalizations The description localizations to use.
     * @returns The command.
     */
    setDescriptionLocalizations<T extends ChatCommandProp<`description_localizations`>>(descriptionLocalizations: T): AddProp<`description_localizations`, T, PR, PA>;
    /**
     * Set the command's default permission.
     * @param defaultPermission The default permission to use.
     * @returns The command.
     */
    setDefaultPermission<T extends ChatCommandProp<`default_permission`>>(defaultPermission: T): AddProp<`default_permission`, T, PR, PA>;
    /**
     * Add a string parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    addStringParameter<R extends boolean, N extends string, NL extends DiscordTypes.LocalizationMap, D extends string, DL extends DiscordTypes.LocalizationMap, RS extends Array<ParameterChoice<string>> | undefined = undefined>(required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>, restraints?: RS): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.String;
        required: R;
        name: N;
        description: D;
        choices: RS;
    }, PR, PA>;
    /**
     * Add an integer parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    addIntegerParameter<R extends boolean, N extends string, NL extends DiscordTypes.LocalizationMap, D extends string, DL extends DiscordTypes.LocalizationMap, RS extends Array<ParameterChoice<number>> | ParameterLimits | undefined = undefined>(required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>, restraints?: RS): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Integer;
        required: R;
        name: N;
        description: D;
        choices: RS extends ParameterLimits ? undefined : RS;
        min_value: RS extends ParameterLimits ? RS[`min`] extends number ? RS[`min`] : undefined : undefined;
        max_value: RS extends ParameterLimits ? RS[`max`] extends number ? RS[`max`] : undefined : undefined;
    }, PR, PA>;
    /**
     * Add a boolean parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    addBooleanParameter<R extends boolean, N extends string, NL extends DiscordTypes.LocalizationMap, D extends string, DL extends DiscordTypes.LocalizationMap>(required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Boolean;
        required: R;
        name: N;
        description: D;
    }, PR, PA>;
    /**
     * Add a user parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    addUserParameter<R extends boolean, N extends string, NL extends DiscordTypes.LocalizationMap, D extends string, DL extends DiscordTypes.LocalizationMap>(required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.User;
        required: R;
        name: N;
        description: D;
    }, PR, PA>;
    /**
     * Add a channel parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    addChannelParameter<R extends boolean, N extends string, NL extends DiscordTypes.LocalizationMap, D extends string, DL extends DiscordTypes.LocalizationMap, RS extends Array<Exclude<DiscordTypes.ChannelType, DiscordTypes.ChannelType.DM | DiscordTypes.ChannelType.GroupDM>> | undefined = undefined>(required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>, restraints?: RS): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Channel;
        required: R;
        name: N;
        description: D;
        channel_types: RS;
    }, PR, PA>;
    /**
     * Add a role parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    addRoleParameter<R extends boolean, N extends string, NL extends DiscordTypes.LocalizationMap, D extends string, DL extends DiscordTypes.LocalizationMap>(required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Role;
        required: R;
        name: N;
        description: D;
    }, PR, PA>;
    /**
     * Add a mentionable parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    addMentionableParameter<R extends boolean, N extends string, NL extends DiscordTypes.LocalizationMap, D extends string, DL extends DiscordTypes.LocalizationMap>(required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Mentionable;
        required: R;
        name: N;
        description: D;
    }, PR, PA>;
    /**
     * Add a number parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @param restraints Restraints for the parameter.
     * @returns The command.
     */
    addNumberParameter<R extends boolean, N extends string, NL extends DiscordTypes.LocalizationMap, D extends string, DL extends DiscordTypes.LocalizationMap, RS extends Array<ParameterChoice<number>> | ParameterLimits | undefined = undefined>(required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>, restraints?: RS): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Number;
        required: R;
        name: N;
        description: D;
        choices: RS extends ParameterLimits ? undefined : RS;
        min_value: RS extends ParameterLimits ? RS[`min`] extends number ? RS[`min`] : undefined : undefined;
        max_value: RS extends ParameterLimits ? RS[`max`] extends number ? RS[`max`] : undefined : undefined;
    }, PR, PA>;
    /**
     * Add an attachment parameter to the command.
     * @param required If the parameter is required.
     * @param name The parameter's name.
     * @param description The parameter's description.
     * @returns The command.
     */
    addAttachmentParameter<R extends boolean, N extends string, NL extends DiscordTypes.LocalizationMap, D extends string, DL extends DiscordTypes.LocalizationMap>(required: R, name: N | LocalizedText<N, NL>, description: D | LocalizedText<D, DL>): AddParameter<{
        type: DiscordTypes.ApplicationCommandOptionType.Attachment;
        required: R;
        name: N;
        description: D;
    }, PR, PA>;
    /**
     * Sets the command's execute method.
     * @param exec The callback to execute when an interaction is received.
     */
    setExecute(exec: (ctx: ChatCommandContext<PR, PA>) => (void | Promise<void>)): this;
}
/**
 * Chat command context.
 */
export declare class ChatCommandContext<PR extends Partial<ChatCommandProps>, PA extends DiscordTypes.APIApplicationCommandBasicOption[]> extends BaseCommandContext {
    /**
     * The ID of the channel that the command was ran in.
     */
    readonly channelId: Snowflake;
    /**
     * Command data.
     */
    readonly command: ChatCommand<PR, PA>[`props`] & {
        id: Snowflake;
    };
    /**
     * Parameter values from the user.
     */
    readonly parameters: {
        [K in PA[number][`name`]]: ParameterValue<Extract<PA[number], {
            name: K;
        }>[`type`], Extract<PA[number], {
            name: K;
        }>[`required`]>;
    };
    /**
     * Create a chat command's context.
     * @param commandHandler The command handler that invoked the context.
     * @param command The command that invoked the context.
     * @param interaction Interaction data.
     */
    constructor(commandHandler: CommandHandler, command: ChatCommand<PR, PA>, interaction: DiscordTypes.APIChatInputApplicationCommandInteraction);
}
export {};
