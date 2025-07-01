import { CommandHandler } from "./CommandHandler";
import { FactoryComponents, FactoryMessage } from "../utils/messageFactory";
import * as DiscordTypes from "discord-api-types/v10";
import { Client, Snowflake } from "distype";
/**
 * Interaction context.
 */
export declare class InteractionContext<GuildOnly extends boolean = false> {
    /**
     * The {@link Client client} the context is bound to.
     */
    client: Client;
    /**
     * The {@link CommandHandler command handler} that invoked the context.
     */
    commandHandler: CommandHandler;
    /**
     * The ID of the channel that the interaction was invoked in.
     */
    readonly channelId: Snowflake;
    /**
     * The ID of the guild that the interaction was invoked in.
     */
    readonly guildId: GuildOnly extends true ? Snowflake : Snowflake | undefined;
    /**
     * The guild's preferred locale, if the interaction was invoked in a guild.
     */
    readonly guildLocale: GuildOnly extends true ? DiscordTypes.LocaleString : DiscordTypes.LocaleString | undefined;
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
         * The raw interaction.
         */
        raw: DiscordTypes.APIApplicationCommandInteraction | DiscordTypes.APIMessageComponentInteraction | DiscordTypes.APIModalSubmitInteraction | DiscordTypes.APIApplicationCommandAutocompleteInteraction;
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
        version: number;
    };
    /**
     * The invoking user's member data.
     */
    readonly member: GuildOnly extends true ? DiscordTypes.APIInteractionGuildMember : DiscordTypes.APIInteractionGuildMember | undefined;
    /**
     * The permissions the bot has in the channel the interaction was invoked in.
     */
    readonly permissions: GuildOnly extends true ? bigint : bigint | undefined;
    /**
     * The invoking user.
     */
    readonly user: DiscordTypes.APIUser & {
        locale: Required<DiscordTypes.APIUser>[`locale`];
    };
    /**
     * If the interaction has been responded to yet.
     */
    protected _responded: boolean;
    /**
     * Create interaction context.
     * @param interaction Interaction data.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: DiscordTypes.APIApplicationCommandInteraction | DiscordTypes.APIMessageComponentInteraction | DiscordTypes.APIModalSubmitInteraction | DiscordTypes.APIApplicationCommandAutocompleteInteraction, commandHandler: CommandHandler);
    /**
     * Defers the interaction (displays a loading state to the user).
     * @param flags Message flags for the followup after the defer. Specifying `true` is a shorthand for the ephemeral flag.
     */
    defer(flags?: DiscordTypes.MessageFlags | number | true): Promise<void>;
    /**
     * Sends a message.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @returns The ID of the created message, or `@original`.
     */
    send(message: FactoryMessage, components?: FactoryComponents): Promise<`@original` | Snowflake>;
    /**
     * A shorthand for sending messages with the ephemeral flag.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @returns The ID of the created message, or `@original`.
     */
    sendEphemeral(message: FactoryMessage, components?: FactoryComponents): Promise<`@original` | Snowflake>;
    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @param components Components to add to the message.
     * @returns The new created response.
     */
    edit(id: `@original` | Snowflake, message: FactoryMessage, components?: FactoryComponents): Promise<DiscordTypes.RESTPatchAPIInteractionFollowupResult>;
    /**
     * Delete a response.
     * @param id The ID of the response to delete.
     */
    delete(id: `@original` | Snowflake): Promise<void>;
}
