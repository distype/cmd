import {
  BaseComponentContext,
  BaseComponentContextCallback,
} from "./base/BaseComponent";
import { BaseSelect, SelectInteraction } from "./base/BaseSelect";

import { CommandHandler } from "../CommandHandler";

import * as DiscordTypes from "discord-api-types/v10";

/**
 * The mentionable select menu builder.
 *
 * @example
 * ```ts
 * new MentionableSelect()
 *   .setId(`foo`)
 *   .setPlaceholder(`Select a mentionable`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You selected a mentionable with ID ${ctx.options[0].id}!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 */
export class MentionableSelect extends BaseSelect<DiscordTypes.ComponentType.MentionableSelect> {
  declare setExecute: (
    executeCallback: BaseComponentContextCallback<MentionableSelectContext>,
  ) => this;
  declare getExecute: () => BaseComponentContextCallback<MentionableSelectContext>;
  declare protected _execute: BaseComponentContextCallback<MentionableSelectContext>;

  /**
   * Create the select menu builder.
   */
  constructor() {
    super(DiscordTypes.ComponentType.MentionableSelect);
  }
}

/**
 * {@link MentionableSelect Mentionable select} context.
 */
export class MentionableSelectContext extends BaseComponentContext {
  /**
   * Selected values from the user.
   */
  public readonly options: Array<
    | {
        user: DiscordTypes.APIUser;
        member?: DiscordTypes.APIInteractionDataResolvedGuildMember;
      }
    | DiscordTypes.APIRole
  >;

  /**
   * Create {@link SelectMenu select menu} context.
   * @param interaction The interaction payload.
   * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
   */
  constructor(
    interaction: SelectInteraction<DiscordTypes.ComponentType.MentionableSelect>,
    commandHandler: CommandHandler,
  ) {
    super(interaction as any, commandHandler);

    this.options = [
      ...(interaction.data.resolved.users
        ? Object.keys(interaction.data.resolved.users).map((id) => ({
            user: interaction.data.resolved.users![id],
            member: interaction.data.resolved.members?.[id],
          }))
        : []),
      ...Object.values(interaction.data.resolved.roles ?? {}),
    ];
  }
}
