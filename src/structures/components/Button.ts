import {
  BaseComponent,
  BaseComponentContext,
  BaseComponentContextCallback,
} from "./base/BaseComponent";

import { CommandHandler } from "../CommandHandler";

import * as DiscordTypes from "discord-api-types/v10";

/**
 * A button's style.
 */
export enum ButtonStyle {
  PRIMARY = 1,
  SECONDARY,
  SUCCESS,
  DANGER,
}

/**
 * The button builder.
 *
 * @example
 * ```ts
 * new Button()
 *   .setId(`foo`)
 *   .setStyle(ButtonStyle.PRIMARY)
 *   .setLabel(`Click me!`)
 *   .setExecute((ctx) => {
 *     ctx.send(`Boo! :ghost:`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#buttons)
 */
export class Button extends BaseComponent<DiscordTypes.APIButtonComponentWithCustomId> {
  declare setExecute: (
    executeCallback: BaseComponentContextCallback<ButtonContext>,
  ) => this;
  declare getExecute: () => BaseComponentContextCallback<ButtonContext>;
  declare protected _execute: BaseComponentContextCallback<ButtonContext>;

  /**
   * Create the button builder.
   */
  constructor() {
    super(DiscordTypes.ComponentType.Button);
  }

  /**
   * Set the component's style
   * @param style The style to use.
   * @returns The component.
   */
  public setStyle(style: ButtonStyle): this {
    this._raw.style = style as any;
    return this;
  }

  /**
   * Set the component's label.
   * @param label The label to use.
   * @returns The component.
   */
  public setLabel(label: string): this {
    this._raw.label = label;
    return this;
  }

  /**
   * Set the component's emoji.
   * @param emoji The emoji to use.
   * @returns The component.
   */
  public setEmoji(emoji: DiscordTypes.APIMessageComponentEmoji): this {
    this._raw.emoji = emoji;
    return this;
  }
}

/**
 * {@link Button} context.
 */
export class ButtonContext extends BaseComponentContext {
  /**
   * Create {@link Button button} context.
   * @param interaction The interaction payload.
   * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
   */
  constructor(
    interaction: DiscordTypes.APIMessageComponentButtonInteraction,
    commandHandler: CommandHandler,
  ) {
    // eslint-disable-line no-useless-constructor
    super(interaction, commandHandler);
  }
}
