import { BaseCommand, BaseCommandContext, BaseCommandContextCallback } from './base/BaseCommand';
import { CommandHandler } from '../CommandHandler';
import * as DiscordTypes from 'discord-api-types/v10';
/**
 * Add an option to a command.
 */
declare type AddOption<T, R extends boolean, K extends string, GuildOnly extends boolean, Options extends Record<string, any>> = ChatCommand<GuildOnly, Options & {
    [key in K]: R extends true ? T : T | undefined;
}>;
/**
 * Base options for chat command options.
 */
declare type ChatCommandBaseOptionOptions = {
    description_localizations?: DiscordTypes.LocalizationMap;
    name_localizations?: DiscordTypes.LocalizationMap;
};
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
export declare class ChatCommand<GuildOnly extends boolean = false, Options extends Record<string, any> = Record<string, never>> extends BaseCommand<DiscordTypes.RESTPostAPIChatInputApplicationCommandsJSONBody> {
    setGuild: (id: string) => ChatCommand<true, Options>;
    setGuildOnly: <T extends boolean>(guildOnly: T) => ChatCommand<T, Options>;
    setExecute: (executeCallback: BaseCommandContextCallback<ChatCommandContext<GuildOnly, Options>>) => this;
    getExecute: () => BaseCommandContextCallback<ChatCommandContext<GuildOnly, Options>>;
    protected _execute: BaseCommandContextCallback<ChatCommandContext<GuildOnly, Options>>;
    /**
     * Create the chat command builder.
     */
    constructor();
    /**
     * Set the command's description.
     * @param description The description to use.
     * @param localization Description localization.
     * @returns The command.
     */
    setDescription(description: string, localization?: DiscordTypes.LocalizationMap): this;
    /**
     * Add a string option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addStringOption<R extends boolean, K extends string>(required: R, name: K, description: string, options?: ChatCommandBaseOptionOptions & {
        choices?: Array<DiscordTypes.APIApplicationCommandOptionChoice<string>>;
        max_length?: number;
        min_length?: number;
    }): AddOption<string, R, K, GuildOnly, Options>;
    /**
     * Add an integer option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addIntegerOption<R extends boolean, K extends string>(required: R, name: K, description: string, options?: ChatCommandBaseOptionOptions & {
        choices?: Array<DiscordTypes.APIApplicationCommandOptionChoice<number>>;
        max_value?: number;
        min_value?: number;
    }): AddOption<number, R, K, GuildOnly, Options>;
    /**
     * Add a boolean option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addBooleanOption<R extends boolean, K extends string>(required: R, name: K, description: string, options?: ChatCommandBaseOptionOptions): AddOption<boolean, R, K, GuildOnly, Options>;
    /**
     * Add a user option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addUserOption<R extends boolean, K extends string>(required: R, name: K, description: string, options?: ChatCommandBaseOptionOptions): AddOption<{
        user: DiscordTypes.APIUser;
        member?: DiscordTypes.APIInteractionDataResolvedGuildMember;
    }, R, K, GuildOnly, Options>;
    /**
     * Add a channel option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addChannelOption<R extends boolean, K extends string>(required: R, name: K, description: string, options?: ChatCommandBaseOptionOptions & {
        channel_types?: DiscordTypes.APIApplicationCommandChannelOption[`channel_types`];
    }): AddOption<DiscordTypes.APIInteractionDataResolvedChannel, R, K, GuildOnly, Options>;
    /**
     * Add a role option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addRoleOption<R extends boolean, K extends string>(required: R, name: K, description: string, options?: ChatCommandBaseOptionOptions): AddOption<DiscordTypes.APIRole, R, K, GuildOnly, Options>;
    /**
     * Add a mentionable option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addMentionableOption<R extends boolean, K extends string>(required: R, name: K, description: string, options?: ChatCommandBaseOptionOptions): AddOption<{
        user: DiscordTypes.APIUser;
        member?: DiscordTypes.APIInteractionDataResolvedGuildMember;
    } | DiscordTypes.APIRole, R, K, GuildOnly, Options>;
    /**
     * Add a number option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addNumberOption<R extends boolean, K extends string>(required: R, name: K, description: string, options?: ChatCommandBaseOptionOptions & {
        choices?: Array<DiscordTypes.APIApplicationCommandOptionChoice<number>>;
        max_value?: number;
        min_value?: number;
    }): AddOption<number, R, K, GuildOnly, Options>;
    /**
     * Add an attachment option.
     * @param required If the option is required.
     * @param name The option's name.
     * @param description The option's description.
     * @param options Options for the option.
     * @returns The command.
     */
    addAttachmentOption<R extends boolean, K extends string>(required: R, name: K, description: string, options?: ChatCommandBaseOptionOptions): AddOption<DiscordTypes.APIAttachment, R, K, GuildOnly, Options>;
}
/**
 * {@link ChatCommand Chat command} context.
 */
export declare class ChatCommandContext<GuildOnly extends boolean = false, Options extends Record<string, any> = Record<string, never>> extends BaseCommandContext<GuildOnly> {
    /**
     * Parameter values from the user.
     */
    readonly options: Options;
    /**
     * Create {@link ChatCommand chat command} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: DiscordTypes.APIChatInputApplicationCommandInteraction, commandHandler: CommandHandler);
}
export {};
