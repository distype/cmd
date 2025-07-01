import { CommandHandler } from "./CommandHandler";

import {
  FactoryComponents,
  FactoryMessage,
  messageFactory,
} from "../utils/messageFactory";

import * as DiscordTypes from "discord-api-types/v10";
import { Client, Snowflake } from "distype";

/**
 * Interaction context.
 */
export class InteractionContext<GuildOnly extends boolean = false> {
  /**
   * The {@link Client client} the context is bound to.
   */
  public client: Client;
  /**
   * The {@link CommandHandler command handler} that invoked the context.
   */
  public commandHandler: CommandHandler;

  /**
   * The ID of the channel that the interaction was invoked in.
   */
  public readonly channelId: Snowflake;
  /**
   * The ID of the guild that the interaction was invoked in.
   */
  public readonly guildId: GuildOnly extends true
    ? Snowflake
    : Snowflake | undefined;
  /**
   * The guild's preferred locale, if the interaction was invoked in a guild.
   */
  public readonly guildLocale: GuildOnly extends true
    ? DiscordTypes.LocaleString
    : DiscordTypes.LocaleString | undefined;
  /**
   * Interaction data.
   */
  public readonly interaction: {
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
    raw:
      | DiscordTypes.APIApplicationCommandInteraction
      | DiscordTypes.APIMessageComponentInteraction
      | DiscordTypes.APIModalSubmitInteraction
      | DiscordTypes.APIApplicationCommandAutocompleteInteraction;
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
  public readonly member: GuildOnly extends true
    ? DiscordTypes.APIInteractionGuildMember
    : DiscordTypes.APIInteractionGuildMember | undefined;
  /**
   * The permissions the bot has in the channel the interaction was invoked in.
   */
  public readonly permissions: GuildOnly extends true
    ? bigint
    : bigint | undefined;
  /**
   * The invoking user.
   */
  public readonly user: DiscordTypes.APIUser & {
    locale: Required<DiscordTypes.APIUser>[`locale`];
  };

  /**
   * If the interaction has been responded to yet.
   */
  protected _responded = false;

  /**
   * Create interaction context.
   * @param interaction Interaction data.
   * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
   */
  constructor(
    interaction:
      | DiscordTypes.APIApplicationCommandInteraction
      | DiscordTypes.APIMessageComponentInteraction
      | DiscordTypes.APIModalSubmitInteraction
      | DiscordTypes.APIApplicationCommandAutocompleteInteraction,
    commandHandler: CommandHandler,
  ) {
    this.client = commandHandler.client;
    this.commandHandler = commandHandler;

    this.channelId = interaction.channel_id!;
    this.guildId = interaction.guild_id ?? (interaction.data as any)?.guild_id;
    this.guildLocale = interaction.guild_locale as any;
    this.interaction = {
      applicationId: interaction.application_id,
      id: interaction.id,
      raw: interaction,
      token: interaction.token,
      type: interaction.type,
      version: interaction.version,
    };
    this.member = interaction.member as any;
    this.permissions = interaction.app_permissions as any;
    this.user = {
      locale: interaction.locale,
      ...(interaction.member?.user ?? interaction.user!),
    };
  }

  /**
   * Defers the interaction (displays a loading state to the user).
   * @param flags Message flags for the followup after the defer. Specifying `true` is a shorthand for the ephemeral flag.
   */
  public async defer(
    flags?: DiscordTypes.MessageFlags | number | true,
  ): Promise<void> {
    await this.client.rest.createInteractionResponse(
      this.interaction.id,
      this.interaction.token,
      {
        type: DiscordTypes.InteractionResponseType
          .DeferredChannelMessageWithSource,
        data: {
          flags: flags === true ? DiscordTypes.MessageFlags.Ephemeral : flags,
        },
      },
    );

    this._responded = true;
  }

  /**
   * Sends a message.
   * @param message The message to send.
   * @param components Components to add to the message.
   * @returns The ID of the created message, or `@original`.
   */
  public async send(
    message: FactoryMessage,
    components?: FactoryComponents,
  ): Promise<`@original` | Snowflake> {
    const factoryMessage = messageFactory(message, components);

    let id: `@original` | Snowflake;
    if (this._responded) {
      id = (
        await this.client.rest.createFollowupMessage(
          this.interaction.applicationId,
          this.interaction.token,
          factoryMessage,
        )
      ).id;
    } else {
      await this.client.rest.createInteractionResponse(
        this.interaction.id,
        this.interaction.token,
        {
          type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
          data: factoryMessage,
        },
      );
      id = `@original`;

      this._responded = true;
    }

    return id;
  }

  /**
   * A shorthand for sending messages with the ephemeral flag.
   * @param message The message to send.
   * @param components Components to add to the message.
   * @returns The ID of the created message, or `@original`.
   */
  public async sendEphemeral(
    message: FactoryMessage,
    components?: FactoryComponents,
  ): Promise<`@original` | Snowflake> {
    const factoryMessage = messageFactory(message, components);

    const id = await this.send({
      ...factoryMessage,
      flags: (factoryMessage.flags ?? 0) | DiscordTypes.MessageFlags.Ephemeral,
    });

    return id;
  }

  /**
   * Edit a response.
   * @param id The ID of the response to edit (`@original` if it is the original response).
   * @param message The new response.
   * @param components Components to add to the message.
   * @returns The new created response.
   */
  public async edit(
    id: `@original` | Snowflake,
    message: FactoryMessage,
    components?: FactoryComponents,
  ): Promise<DiscordTypes.RESTPatchAPIInteractionFollowupResult> {
    const factoryMessage = messageFactory(message, components);

    const edit = await this.client.rest.editFollowupMessage(
      this.interaction.applicationId,
      this.interaction.token,
      id,
      factoryMessage,
    );

    return edit;
  }

  /**
   * Delete a response.
   * @param id The ID of the response to delete.
   */
  public async delete(id: `@original` | Snowflake): Promise<void> {
    await this.client.rest.deleteFollowupMessage(
      this.interaction.applicationId,
      this.interaction.token,
      id,
    );
  }
}
