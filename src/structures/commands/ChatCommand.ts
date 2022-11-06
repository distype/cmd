import { BaseCommand, BaseCommandContext, BaseCommandContextCallback } from './base/BaseCommand';

import { CommandHandler } from '../CommandHandler';

import * as DiscordTypes from 'discord-api-types/v10';

/**
 * Add an option to a command.
 */
type AddOption <T, R extends boolean, K extends string, GuildOnly extends boolean, Options extends Record<string, any>> = ChatCommand<GuildOnly, Options & { [key in K]: R extends true ? T : T | undefined }>

/**
 * Base options for chat command options.
 */
type ChatCommandBaseOptionOptions = {
    description_localizations?: DiscordTypes.LocalizationMap
    name_localizations?: DiscordTypes.LocalizationMap
}

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
export class ChatCommand<GuildOnly extends boolean = false, Options extends Record<string, any> = Record<string, never>> extends BaseCommand<DiscordTypes.RESTPostAPIChatInputApplicationCommandsJSONBody> {
    declare setGuild: (id: string) => ChatCommand<true, Options>;
    declare setGuildOnly: <T extends boolean>(guildOnly: T) => ChatCommand<T, Options>;
    declare setExecute: (executeCallback: BaseCommandContextCallback<ChatCommandContext<GuildOnly, Options>>) => this;
    declare getExecute: () => BaseCommandContextCallback<ChatCommandContext<GuildOnly, Options>>;
    declare protected _execute: BaseCommandContextCallback<ChatCommandContext<GuildOnly, Options>>;

    /**
     * Create the chat command builder.
     */
    constructor () {
        super(DiscordTypes.ApplicationCommandType.ChatInput);
    }

    /**
     * Set the command's description.
     * @param description The description to use.
     * @param localization Description localization.
     * @returns The command.
     */
    public setDescription (description: string, localization?: DiscordTypes.LocalizationMap): this {
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
    public addStringOption<R extends boolean, K extends string> (required: R, name: K, description:string, options?: ChatCommandBaseOptionOptions & { choices?: Array<DiscordTypes.APIApplicationCommandOptionChoice<string>>, max_length?: number, min_length?: number }): AddOption<string, R, K, GuildOnly, Options> {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.String,
            required,
            ...options
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
    public addIntegerOption<R extends boolean, K extends string> (required: R, name: K, description:string, options?: ChatCommandBaseOptionOptions & { choices?: Array<DiscordTypes.APIApplicationCommandOptionChoice<number>>, max_value?: number, min_value?: number }): AddOption<number, R, K, GuildOnly, Options> {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Integer,
            required,
            ...options
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
    public addBooleanOption<R extends boolean, K extends string> (required: R, name: K, description:string, options?: ChatCommandBaseOptionOptions): AddOption<boolean, R, K, GuildOnly, Options> {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Boolean,
            required,
            ...options
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
    public addUserOption<R extends boolean, K extends string> (required: R, name: K, description:string, options?: ChatCommandBaseOptionOptions): AddOption<{ user: DiscordTypes.APIUser, member?: DiscordTypes.APIInteractionDataResolvedGuildMember }, R, K, GuildOnly, Options> {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.User,
            required,
            ...options
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
    public addChannelOption<R extends boolean, K extends string> (required: R, name: K, description:string, options?: ChatCommandBaseOptionOptions & { channel_types?: DiscordTypes.APIApplicationCommandChannelOption[`channel_types`] }): AddOption<DiscordTypes.APIInteractionDataResolvedChannel, R, K, GuildOnly, Options> {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Channel,
            required,
            ...options
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
    public addRoleOption<R extends boolean, K extends string> (required: R, name: K, description:string, options?: ChatCommandBaseOptionOptions): AddOption<DiscordTypes.APIRole, R, K, GuildOnly, Options> {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Role,
            required,
            ...options
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
    public addMentionableOption<R extends boolean, K extends string> (required: R, name: K, description:string, options?: ChatCommandBaseOptionOptions): AddOption<{ user: DiscordTypes.APIUser, member?: DiscordTypes.APIInteractionDataResolvedGuildMember } | DiscordTypes.APIRole, R, K, GuildOnly, Options> {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Mentionable,
            required,
            ...options
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
    public addNumberOption<R extends boolean, K extends string> (required: R, name: K, description:string, options?: ChatCommandBaseOptionOptions & { choices?: Array<DiscordTypes.APIApplicationCommandOptionChoice<number>>, max_value?: number, min_value?: number }): AddOption<number, R, K, GuildOnly, Options> {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Number,
            required,
            ...options
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
    public addAttachmentOption<R extends boolean, K extends string> (required: R, name: K, description:string, options?: ChatCommandBaseOptionOptions): AddOption<DiscordTypes.APIAttachment, R, K, GuildOnly, Options> {
        this._raw.options ??= [];
        this._raw.options.push({
            description,
            name,
            type: DiscordTypes.ApplicationCommandOptionType.Attachment,
            required,
            ...options
        });
        return this;
    }
}

/**
 * {@link ChatCommand Chat command} context.
 */
export class ChatCommandContext<GuildOnly extends boolean = false, Options extends Record<string, any> = Record<string, never>> extends BaseCommandContext<GuildOnly> {
    /**
     * Parameter values from the user.
     */
    public readonly options: Options;

    /**
     * Create {@link ChatCommand chat command} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor (interaction: DiscordTypes.APIChatInputApplicationCommandInteraction, commandHandler: CommandHandler) {
        super(interaction, commandHandler);

        this.options = interaction.data?.options?.reduce((p, c) => {
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
