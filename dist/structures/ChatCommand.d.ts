import { BaseInteractionContext } from './BaseContext';
import { CommandHandler } from './CommandHandler';
import { Modal } from './Modal';
import { LocalizedText } from '../types/LocalizedText';
import { LogCallback } from '../types/Log';
import * as DiscordTypes from 'discord-api-types/v10';
import { Snowflake } from 'distype';
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
export declare type ChatCommandProps = Omit<DiscordTypes.RESTPostAPIChatInputApplicationCommandsJSONBody, `default_permission` | `options`>;
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
export declare class ChatCommand<PR extends Partial<ChatCommandProps> = {
    type: DiscordTypes.ApplicationCommandType.ChatInput;
}, PA extends DiscordTypes.APIApplicationCommandBasicOption[] = []> {
    /**
     * The command's props.
     * @internal
     */
    props: PR;
    /**
     * The command's parameters.
     * @internal
     */
    parameters: PA;
    /**
     * The command's execute method.
     * @internal
     */
    runExecute: ((ctx: ChatCommandContext<PR, PA>) => (void | Promise<void>)) | null;
    /**
     * Set the command's name.
     * @param name The name to use.
     * @returns The command.
     */
    setName<T extends ChatCommandProp<`name`>>(name: T): AddProp<`name`, T, PR, PA>;
    /**
     * Set the command's name localizations.
     * @param nameLocalizations The name localizations to use.
     * @returns The command.
     */
    setNameLocalizations<T extends ChatCommandProp<`name_localizations`>>(nameLocalizations: T): AddProp<`name_localizations`, T, PR, PA>;
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
     * Set the command's default member permissions.
     * @param defaultMemberPermissions The permissions a guild member must have to run the command.
     * @returns The command.
     */
    setDefaultMemberPermissions<T extends ChatCommandProp<`default_member_permissions`>>(defaultMemberPermissions: T): AddProp<`default_member_permissions`, T, PR, PA>;
    /**
     * Set the command's DM permission.
     * @param dmPermission If the command should be enabled in DMs.
     * @returns The command.
     */
    setDmPermission<T extends ChatCommandProp<`dm_permission`>>(dmPermission: T): AddProp<`dm_permission`, T, PR, PA>;
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
     * @param executeCallback The callback to execute when an interaction is received.
     */
    setExecute(executeCallback: this[`runExecute`]): this;
    /**
     * Converts a command to a Discord API compatible object.
     * @returns The converted command.
     */
    getRaw(): Required<Omit<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody, `default_permission`>>;
}
/**
 * {@link ChatCommand Chat command} context.
 */
export declare class ChatCommandContext<PR extends Partial<ChatCommandProps>, PA extends DiscordTypes.APIApplicationCommandBasicOption[]> extends BaseInteractionContext<PR[`dm_permission`] extends false ? true : boolean> {
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
     * The {@link ChatCommand chat command} the context originates from.
     */
    readonly contextParent: ChatCommand<PR, PA>;
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
     * Create {@link ChatCommand chat command} context.
     * @param interaction Interaction data.
     * @param chatCommand The {@link ChatCommand chat command} the context originates from.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(interaction: DiscordTypes.APIChatInputApplicationCommandInteraction, chatCommand: ChatCommand<PR, PA>, commandHandler: CommandHandler, logCallback?: LogCallback, logThisArg?: any);
    /**
     * Respond with a modal.
     * The modal's execute method is automatically bound to the command handler.
     * If the command handler already has a bound modal with the same ID, it will be overwritten.
     * A modal will stay bound to the command handler until it's execution context's "unbind()" method is called.
     * @param modal The modal to respond with.
     */
    showModal(modal: Modal<any, DiscordTypes.APIModalActionRowComponent[]>): Promise<void>;
}
export {};
