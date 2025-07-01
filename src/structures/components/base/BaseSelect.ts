import { BaseComponent } from "./BaseComponent";

import * as DiscordTypes from "discord-api-types/v10";

/**
 * Select interaction data.
 * @internal
 */
export type SelectInteraction<
  T extends DiscordTypes.APISelectMenuComponent[`type`],
> = DiscordTypes.APIBaseInteraction<
  DiscordTypes.InteractionType.MessageComponent,
  Extract<
    DiscordTypes.APIMessageSelectMenuInteractionData,
    { component_type: T }
  >
> &
  Required<
    Pick<
      DiscordTypes.APIBaseInteraction<
        DiscordTypes.InteractionType.MessageComponent,
        Extract<
          DiscordTypes.APIMessageSelectMenuInteractionData,
          { component_type: T }
        >
      >,
      `channel_id` | `data` | `message`
    >
  >;

/**
 * The base select menu builder.
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 * @internal
 */
export class BaseSelect<
  T extends DiscordTypes.APISelectMenuComponent[`type`],
> extends BaseComponent<
  Extract<DiscordTypes.APISelectMenuComponent, { type: T }>
> {
  /**
   * Set the component's placeholder text.
   * @param placeholder The placeholder to use.
   * @returns The component.
   */
  public setPlaceholder(placeholder: string): this {
    this._raw.placeholder = placeholder;
    return this;
  }

  /**
   * Set the minimum number of values allowed to be selected.
   * @param minValues The minimum number of values allowed.
   * @returns The component.
   */
  public setMinValues(minValues: number): this {
    this._raw.min_values = minValues;
    return this;
  }

  /**
   * Set the maximum number of values allowed to be selected.
   * @param maxValues The maximum number of values allowed.
   * @returns The component.
   */
  public setMaxValues(maxValues: number): this {
    this._raw.max_values = maxValues;
    return this;
  }
}
