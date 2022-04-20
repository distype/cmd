import { CommandHandler } from './CommandHandler';
import { Modal } from './Modal';
import { Message } from '../functions/messageFactory';
import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';
/**
 * Base context.
 */
export declare class BaseContext {
    /**
     * The client the context is bound to.
     */
    client: Client;
    /**
     * The command handler that invoked the context.
     */
    commandHandler: CommandHandler;
    /**
     * Message IDs of sent responses.
     */
    responses: Array<Snowflake | `@original` | `defer` | `modal`>;
    /**
     * The ID of the guild that the interaction was ran in.
     */
    readonly guildId?: Snowflake;
    /**
     * The guild's preferred locale, if the interaction was invoked in a guild.
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
        type: DiscordTypes.InteractionType;
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
     * The invoking user.
     */
    readonly user: DiscordTypes.APIUser;
    /**
     * Create interaction context.
     * @param commandHandler The command handler that invoked the context.
     * @param interaction Interaction data.
     */
    constructor(commandHandler: CommandHandler, interaction: DiscordTypes.APIApplicationCommandInteraction | DiscordTypes.APIMessageComponentInteraction | DiscordTypes.APIApplicationCommandAutocompleteInteraction | DiscordTypes.APIModalSubmitInteraction);
    /**
     * Calls the command handler's error callback.
     * Note that this does not stop the execution of the command's execute method; you must also call `return`.
     * @param error The error encountered.
     */
    error(error: Error): void;
    /**
     * Defers the interaction (displays a loading state to the user).
     */
    defer(flags?: DiscordTypes.MessageFlags): Promise<`defer`>;
    /**
     * Sends a message.
     * @param message The message to send.
     */
    send(message: Message): Promise<Snowflake | `@original`>;
    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @returns The new created response.
     */
    edit(id: Snowflake | `@original`, message: Message): Promise<DiscordTypes.RESTPatchAPIInteractionFollowupResult>;
    /**
     * Delete a response.
     * @param id The ID of the reponse to delete.
     */
    delete(id: Snowflake | `@original`): Promise<void>;
}
/**
 * Base command context.
 */
export declare class BaseCommandContext extends BaseContext {
    /**
     * Respond with a modal.
     * @param modal The modal to respond with.
     */
    showModal(modal: Modal<any, DiscordTypes.APIModalActionRowComponent[]>): Promise<`modal`>;
}
