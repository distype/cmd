import { Modal } from "../../modals/Modal";
import { CommandHandler } from "../../CommandHandler";
import { InteractionContext } from "../../InteractionContext";
import type { MiddlewareMeta } from "../../../middleware";

import {
  RemoveDeprecated,
  sanitizeCommand,
  SanitizedCommand,
  sanitizeGuildCommand,
} from "../../../utils/sanitizeCommand";

import * as DiscordTypes from "discord-api-types/v10";
import { PermissionsUtils, Snowflake } from "distype";

/**
 * Base command context callback.
 * @internal
 */
export type BaseCommandContextCallback<T> = (ctx: T) => void | Promise<void>;

/**
 * The base command builder.
 * @internal
 */
export abstract class BaseCommand<
  Raw extends DiscordTypes.RESTPostAPIApplicationCommandsJSONBody,
> {
  /**
   * The command's execute method.
   */
  protected _execute: BaseCommandContextCallback<any> = () => {};
  /**
   * The guild the command belongs to.
   */
  protected _guild: Snowflake | null = null;
  /**
   * Middleware metadata.
   */
  protected _middlewareMeta: MiddlewareMeta | null = null;
  /**
   * The raw command.
   */
  protected _raw: Partial<Omit<RemoveDeprecated<Raw>, `type`>> & {
    type: Required<Raw>[`type`];
  };

  /**
   * Create the base command builder.
   * @param type The command's type.
   */
  constructor(type: Required<Raw>[`type`]) {
    this._raw = { type } as any;
  }

  /**
   * Set the command's name.
   * @param name The name to use.
   * @param localization Name localization.
   * @returns The command.
   */
  public setName(
    name: string,
    localization?: DiscordTypes.LocalizationMap,
  ): this {
    this._raw.name = name;
    this._raw.name_localizations = localization;
    return this;
  }

  /**
   * Set the command's default member permissions.
   * @param permissions The permissions a guild member must have to run the command.
   * @returns The command.
   */
  public setDefaultMemberPermissions(
    ...permissions: Parameters<typeof PermissionsUtils.combine>
  ): this {
    this._raw.default_member_permissions = PermissionsUtils.combine(
      ...permissions,
    ).toString();
    return this;
  }

  /**
   * Set the guild the command belongs to.
   * @param id The guild's ID.
   * @returns The command.
   */
  public setGuild(id: Snowflake): BaseCommand<Raw> {
    this._guild = id;
    return this;
  }

  /**
   * Set if the command should be locked to just guilds.
   * Ignored if the command has a set guild.
   * @returns The command.
   */
  public setGuildOnly(): BaseCommand<Raw> {
    this._raw.contexts = [DiscordTypes.InteractionContextType.Guild];
    return this;
  }

  /**
   * Get the guild the command belongs to.
   * @returns The guild's ID, or `null` if the command is global.
   */
  public getGuild(): Snowflake | null {
    return this._guild;
  }

  /**
   * Set middleware metadata.
   * @param meta The metadata to set.
   * @returns The command.
   */
  public setMiddlewareMeta(meta: MiddlewareMeta): this {
    this._middlewareMeta = meta;
    return this;
  }

  /**
   * Gets the command's middleware meta.
   * @returns The middleware meta.
   */
  public getMiddlewareMeta(): MiddlewareMeta | null {
    return this._middlewareMeta;
  }

  /**
   * Sets the command's execute method.
   * @param executeCallback The callback to execute when an interaction is received.
   * @returns The command.
   */
  public setExecute(executeCallback: BaseCommandContextCallback<any>): this {
    this._execute = executeCallback;
    return this;
  }

  /**
   * Gets the command's execute method.
   * @returns The execute method.
   */
  public getExecute(): BaseCommandContextCallback<any> {
    return this._execute;
  }

  /**
   * Converts the command to a Discord API compatible object.
   * @returns The converted command.
   */
  public getRaw(): SanitizedCommand {
    if (!this._raw.name) throw new Error(`Command name must be defined`);
    return this._guild !== null
      ? sanitizeGuildCommand(this._raw as any)
      : sanitizeCommand(this._raw as any);
  }
}

/**
 * {@link BaseCommand Base command} context.
 * @internal
 */
export abstract class BaseCommandContext<
  GuildOnly extends boolean,
> extends InteractionContext<GuildOnly> {
  /**
   * Command data.
   */
  public readonly command: {
    /**
     * The ID of the guild the command is registered to.
     */
    guildId?: Snowflake;
    /**
     * The command's ID.
     */
    id: Snowflake;
    /**
     * The command's name.
     */
    name: string;
    /**
     * The command's type.
     */
    type: DiscordTypes.ApplicationCommandType;
  };

  /**
   * Create {@link BaseCommand base command} context.
   * @param interaction The interaction payload.
   * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
   */
  constructor(
    interaction: DiscordTypes.APIApplicationCommandInteraction,
    commandHandler: CommandHandler,
  ) {
    super(interaction, commandHandler);

    this.command = {
      guildId: interaction.data.guild_id,
      id: interaction.data.id,
      name: interaction.data.name,
      type: interaction.data.type,
    };
  }

  /**
   * Respond with a modal.
   * @param modal The modal to respond with.
   */
  public async showModal(modal: Modal<any>): Promise<void> {
    await this.client.rest.createInteractionResponse(
      this.interaction.id,
      this.interaction.token,
      {
        type: DiscordTypes.InteractionResponseType.Modal,
        data: modal.getRaw(),
      },
    );
  }
}
