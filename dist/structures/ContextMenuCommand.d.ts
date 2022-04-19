import { CommandHandler } from './CommandHandler';
import { CommandMessage } from '../functions/messageFactory';
import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';
/**
 * Adds a prop to a command.
 * @internal
 */
declare type AddProp<K extends keyof Required<ContextMenuCommandProps>, V extends ContextMenuCommandProp<K>, Props> = ContextMenuCommand<Props & Record<K, V>>;
/**
 * A property of a command.
 * @internal
 */
declare type ContextMenuCommandProp<K extends keyof Required<ContextMenuCommandProps>> = Required<ContextMenuCommandProps>[K];
/**
 * A chat command's props.
 */
export declare type ContextMenuCommandProps = Omit<DiscordTypes.RESTPostAPIContextMenuApplicationCommandsJSONBody, `options` | `description_localizations`>;
/**
 * The context command command builder.
 */
export declare class ContextMenuCommand<PR extends Partial<ContextMenuCommandProps> = Record<string, never>> {
    /**
     * The command's props.
     */
    props: PR;
    /**
     * The command's execute method.
     * @internal
     */
    run: ((ctx: ContextMenuCommandContext<PR>) => (void | Promise<void>)) | null;
    /**
     * Set the command's type.
     * @param name The name to use.
     * @returns The command.
     */
    setType<T extends `message` | `user`>(name: T): AddProp<`type`, T extends `message` ? DiscordTypes.ApplicationCommandType.Message : DiscordTypes.ApplicationCommandType.User, PR>;
    /**
     * Set the command's name.
     * @param name The name to use.
     * @returns The command.
     */
    setName<T extends ContextMenuCommandProp<`name`>>(name: T): AddProp<`name`, T, PR>;
    /**
     * Set the command's name localizations.
     * @param nameLocalizaions The name localizations to use.
     * @returns The command.
     */
    setNameLocalizations<T extends ContextMenuCommandProp<`name_localizations`>>(nameLocalizaions: T): AddProp<`name_localizations`, T, PR>;
    /**
     * Set the command's default permission.
     * @param defaultPermission The default permission to use.
     * @returns The command.
     */
    setDefaultPermission<T extends ContextMenuCommandProp<`default_permission`>>(defaultPermission: T): AddProp<`default_permission`, T, PR>;
    /**
     * Sets the command's execute method.
     * @param exec The callback to execute when an interaction is received.
     */
    setExecute(exec: (ctx: ContextMenuCommandContext<PR>) => (void | Promise<void>)): this;
}
/**
 * ContextMenu command context.
 */
export declare class ContextMenuCommandContext<PR extends Partial<ContextMenuCommandProps>> {
    /**
     * The client that received the interaction.
     */
    client: Client;
    /**
     * The command handler that invoked the context.
     */
    commandHandler: CommandHandler;
    /**
     * If the original response was a defer.
     */
    deferred: boolean | null;
    /**
     * Message IDs of sent responses.
     */
    responses: Array<Snowflake | `@original`>;
    /**
     * The ID of the channel that the command was ran in.
     */
    readonly channelId: Snowflake;
    /**
     * Command data.
     */
    readonly command: ContextMenuCommand<PR>[`props`] & {
        id: Snowflake;
    };
    /**
     * The ID of the guild that the command was ran in.
     */
    readonly guildId?: Snowflake;
    /**
     * The guild's preferred locale, if the command was invoked in a guild.
     */
    readonly guildLocale?: DiscordTypes.LocaleString;
    /**
     * Interaction data.
     */
    readonly interaction: {
        /**
         * The ID of the application the interaction belongs to.
         */
        applicationId: Snowflake;
        /**
         * The interaction's ID.
         */
        id: Snowflake;
        /**
         * The interaction's token.
         */
        token: string;
        /**
         * The interaction's type.
         */
        type: DiscordTypes.InteractionType.ApplicationCommand;
        /**
         * The interaction's version.
         */
        version: 1;
    };
    /**
     * The invoking user's member data.
     */
    readonly member?: DiscordTypes.APIInteractionGuildMember;
    /**
     * The executed command's target.
     */
    readonly target: PR[`type`] extends DiscordTypes.ApplicationCommandType.Message ? DiscordTypes.APIMessage : {
        user: DiscordTypes.APIUser;
        member?: DiscordTypes.APIInteractionDataResolvedGuildMember;
    };
    /**
     * The ID of the executed command's target.
     */
    readonly targetId: Snowflake;
    /**
     * The invoking user.
     */
    readonly user: DiscordTypes.APIUser;
    /**
     * Create a chat command's context.
     * @param client The client that received the interaction.
     * @param commandHandler The command handler that invoked the context.
     * @param interaction Interaction data.
     */
    constructor(client: Client, commandHandler: CommandHandler, command: ContextMenuCommand<PR>, interaction: PR[`type`] extends DiscordTypes.ApplicationCommandType.Message ? DiscordTypes.APIMessageApplicationCommandInteraction : DiscordTypes.APIUserApplicationCommandInteraction);
    /**
     * Calls the command handler's error callback.
     * Note that this does not stop the execution of the command's execute method; you must also call `return`.
     * @param error The error encountered.
     */
    error(error: Error): void;
    /**
     * Defers the interaction (displays a loading state to the user).
     */
    defer(flags?: DiscordTypes.MessageFlags): Promise<`@original`>;
    /**
     * Sends a message.
     * @param message The message to send.
     */
    send(message: CommandMessage): Promise<Snowflake | `@original`>;
    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @returns The new created response.
     */
    edit(id: Snowflake | `@original`, message: CommandMessage): Promise<DiscordTypes.RESTPatchAPIInteractionFollowupResult>;
    /**
     * Delete a response.
     * @param id The ID of the reponse to delete.
     */
    delete(id: Snowflake | `@original`): Promise<void>;
}
export {};
