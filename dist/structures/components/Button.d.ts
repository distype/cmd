import { BaseComponent, BaseComponentContext, BaseComponentContextCallback } from "./base/BaseComponent";
import { CommandHandler } from "../CommandHandler";
import * as DiscordTypes from "discord-api-types/v10";
/**
 * A button's style.
 */
export declare enum ButtonStyle {
    PRIMARY = 1,
    SECONDARY = 2,
    SUCCESS = 3,
    DANGER = 4
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
export declare class Button extends BaseComponent<DiscordTypes.APIButtonComponentWithCustomId> {
    setExecute: (executeCallback: BaseComponentContextCallback<ButtonContext>) => this;
    getExecute: () => BaseComponentContextCallback<ButtonContext>;
    protected _execute: BaseComponentContextCallback<ButtonContext>;
    /**
     * Create the button builder.
     */
    constructor();
    /**
     * Set the component's style
     * @param style The style to use.
     * @returns The component.
     */
    setStyle(style: ButtonStyle): this;
    /**
     * Set the component's label.
     * @param label The label to use.
     * @returns The component.
     */
    setLabel(label: string): this;
    /**
     * Set the component's emoji.
     * @param emoji The emoji to use.
     * @returns The component.
     */
    setEmoji(emoji: DiscordTypes.APIMessageComponentEmoji): this;
}
/**
 * {@link Button} context.
 */
export declare class ButtonContext extends BaseComponentContext {
    /**
     * Create {@link Button button} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: DiscordTypes.APIMessageComponentButtonInteraction, commandHandler: CommandHandler);
}
