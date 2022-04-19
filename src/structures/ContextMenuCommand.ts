import { CommandHandler } from './CommandHandler';

import { CommandMessage, messageFactory } from '../functions/messageFactory';

import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';

/**
 * Adds a prop to a command.
 * @internal
 */
type AddProp <K extends keyof Required<ContextMenuCommandProps>, V extends ContextMenuCommandProp<K>, Props> = ContextMenuCommand<Props & Record<K, V>>;

/**
 * A property of a command.
 * @internal
 */
type ContextMenuCommandProp<K extends keyof Required<ContextMenuCommandProps>> = Required<ContextMenuCommandProps>[K];

/**
 * A chat command's props.
 */
export type ContextMenuCommandProps = Omit<DiscordTypes.RESTPostAPIContextMenuApplicationCommandsJSONBody, `options` | `description_localizations`>;

/**
 * The context command command builder.
 */
export class ContextMenuCommand<PR extends Partial<ContextMenuCommandProps> = Record<string, never>> {
    /**
     * The command's props.
     */
    public props: PR = {} as PR;
    /**
     * The command's execute method.
     * @internal
     */
    public run: ((ctx: ContextMenuCommandContext<PR>) => void | Promise<void>) | null = null;

    /**
     * Set the command's type.
     * @param name The name to use.
     * @returns The command.
     */
    public setType <T extends `message` | `user`> (name: T): AddProp<`type`, T extends `message` ? DiscordTypes.ApplicationCommandType.Message : DiscordTypes.ApplicationCommandType.User, PR> {
        this.props.type = name === `message` ? DiscordTypes.ApplicationCommandType.Message : DiscordTypes.ApplicationCommandType.User;
        return this as any;
    }

    /**
     * Set the command's name.
     * @param name The name to use.
     * @returns The command.
     */
    public setName <T extends ContextMenuCommandProp<`name`>> (name: T): AddProp<`name`, T, PR> {
        this.props.name = name;
        return this as any;
    }

    /**
     * Set the command's name localizations.
     * @param nameLocalizaions The name localizations to use.
     * @returns The command.
     */
    public setNameLocalizations <T extends ContextMenuCommandProp<`name_localizations`>> (nameLocalizaions: T): AddProp<`name_localizations`, T, PR> {
        this.props.name_localizations = nameLocalizaions;
        return this as any;
    }

    /**
     * Set the command's default permission.
     * @param defaultPermission The default permission to use.
     * @returns The command.
     */
    public setDefaultPermission <T extends ContextMenuCommandProp<`default_permission`>> (defaultPermission: T): AddProp<`default_permission`, T, PR> {
        this.props.default_permission = defaultPermission;
        return this as any;
    }

    /**
     * Sets the command's execute method.
     * @param exec The callback to execute when an interaction is received.
     */
    public setExecute (exec: (ctx: ContextMenuCommandContext<PR>) => void | Promise<void>): this {
        if (!this.props.type || !this.props.name) throw new Error(`A context menu command's type and name must be present to set its execute method`);
        this.run = exec;
        return this;
    }
}

/**
 * ContextMenu command context.
 */
export class ContextMenuCommandContext<PR extends Partial<ContextMenuCommandProps>> {
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
    public readonly command: ContextMenuCommand<PR>[`props`] & { id: Snowflake };
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
     * The executed command's target.
     */
    public readonly target: PR[`type`] extends DiscordTypes.ApplicationCommandType.Message ? DiscordTypes.APIMessage : {
        user: DiscordTypes.APIUser
        member?: DiscordTypes.APIInteractionDataResolvedGuildMember
    };
    /**
     * The ID of the executed command's target.
     */
    public readonly targetId: Snowflake;
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
    constructor (client: Client, commandHandler: CommandHandler, command: ContextMenuCommand<PR>, interaction: PR[`type`] extends DiscordTypes.ApplicationCommandType.Message ? DiscordTypes.APIMessageApplicationCommandInteraction : DiscordTypes.APIUserApplicationCommandInteraction) {
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
        this.target = command.props.type === DiscordTypes.ApplicationCommandType.Message
            ? (interaction.data.resolved as DiscordTypes.APIMessageApplicationCommandInteractionDataResolved).messages[interaction.data.target_id]
            : {
                user: (interaction.data.resolved as DiscordTypes.APIUserApplicationCommandInteractionDataResolved).users[interaction.data.target_id],
                member: (interaction.data.resolved as DiscordTypes.APIUserApplicationCommandInteractionDataResolved).members?.[interaction.data.target_id]
            } as any;
        this.targetId = interaction.data.target_id;
        this.user = {
            ...(interaction.member?.user ?? interaction.user!),
            locale: interaction.locale ?? interaction.locale
        };
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
