import {
  BaseCommand,
  BaseCommandContext,
  BaseCommandContextCallback,
} from "./base/BaseCommand";

import { CommandHandler } from "../CommandHandler";

import * as DiscordTypes from "discord-api-types/v10";
import { Snowflake } from "distype";

/**
 * The user command builder.
 *
 * @example
 * ```ts
 * new UserCommand()
 *   .setName(`foo`)
 *   .setExecute((ctx) => {
 *     ctx.send(`The selected user is <@${ctx.targetId}>!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/application-commands#user-commands)
 */
export class UserCommand<
  GuildOnly extends boolean = false,
> extends BaseCommand<DiscordTypes.RESTPostAPIContextMenuApplicationCommandsJSONBody> {
  declare setGuild: (id: string) => UserCommand<true>;
  declare setGuildOnly: () => UserCommand<true>;
  declare setExecute: (
    executeCallback: BaseCommandContextCallback<UserCommandContext<GuildOnly>>,
  ) => this;
  declare getExecute: () => BaseCommandContextCallback<
    UserCommandContext<GuildOnly>
  >;
  declare protected _execute: BaseCommandContextCallback<
    UserCommandContext<GuildOnly>
  >;

  /**
   * Create the user command builder.
   */
  constructor() {
    super(DiscordTypes.ApplicationCommandType.User);
  }
}

/**
 * {@link UserCommand User command} context.
 */
export class UserCommandContext<
  GuildOnly extends boolean = false,
> extends BaseCommandContext<GuildOnly> {
  /**
   * The executed context's target.
   */
  public readonly target: {
    user: DiscordTypes.APIUser;
    member: GuildOnly extends true
      ? DiscordTypes.APIInteractionDataResolvedGuildMember
      : DiscordTypes.APIInteractionDataResolvedGuildMember | undefined;
  };
  /**
   * The ID of the executed context's target.
   */
  public readonly targetId: Snowflake;

  /**
   * Create {@link UserCommand user command} context.
   * @param interaction The interaction payload.
   * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
   */
  constructor(
    interaction: DiscordTypes.APIUserApplicationCommandInteraction,
    commandHandler: CommandHandler,
  ) {
    super(interaction, commandHandler);

    this.target = {
      user: interaction.data.resolved.users[interaction.data.target_id],
      member: interaction.data.resolved.members?.[
        interaction.data.target_id
      ] as any,
    };
    this.targetId = interaction.data.target_id;
  }
}
