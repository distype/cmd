/// <reference types="node" />
import { BaseComponentContext, BaseComponentExpireContext } from './BaseContext';
import * as DiscordTypes from 'discord-api-types/v10';
/**
 * A button's style.
 */
export declare enum ButtonStyle {
    PRIMARY = 1,
    SECONDARY = 2,
    SUCCESS = 3,
    DANGER = 4,
    LINK = 5
}
/**
 * A button.
 * Note that to send a button, you must define a style, as well as an ID or a URL.
 */
export declare class Button {
    /**
     * The amount of time in milliseconds for the button to be inactive for it to be considered expired and unbound from the command handler.
     * @internal
     */
    expireTime: number | null;
    /**
     * A timeout for the button to expire.
     * @internal
     */
    expireTimeout: NodeJS.Timeout | null;
    /**
     * The button's execute method.
     * @internal
     */
    runExecute: ((ctx: ButtonContext) => (void | Promise<void>)) | null;
    /**
     * The button's expire execute method.
     * @internal
     */
    runExecuteExpire: ((ctx: BaseComponentExpireContext) => (boolean | Promise<boolean>)) | null;
    /**
     * The raw button.
     */
    private _raw;
    /**
     * Create a button.
     * @param base A button to use as a base.
     */
    constructor(base?: Partial<Omit<DiscordTypes.APIButtonComponent, `type`>>);
    /**
     * Set the button's style
     * @param style The style to use.
     * @returns The button.
     */
    setStyle(style: ButtonStyle): this;
    /**
     * Set the button's ID.
     * Note that the button cannot use the `ButtonStyle.LINK` style with a custom ID.
     * @param id The ID to use.
     * @returns The button.
     */
    setId(id: string): this;
    /**
     * Set the button's URL.
     * Note that the button must use the `ButtonStyle.LINK` style with a URL.
     * @param url The URL to use.
     * @returns The button.
     */
    setURL(url: string): this;
    /**
     * Set the button's label.
     * @param label The label to use.
     * @returns The button.
     */
    setLabel(label: string): this;
    /**
     * Set the button's emoji.
     * @param emoji The emoji to use.
     * @returns The button.
     */
    setEmoji(emoji: DiscordTypes.APIMessageComponentEmoji): this;
    /**
     * Set the button's disabled state.
     * @param disabled The disabled state to use.
     * @returns The button.
     */
    setDisabled(disabled: boolean): this;
    /**
     * Set the button's expire properties.
     * @param time The amount of time in milliseconds for the button to be inactive for it to be considered expired and unbound from the command handler.
     * @param expireCallback A callback that is called when the button expires. It should return a boolean that specifies if the current expire should be cancelled and the button's expire time should be waited again. `true` will unbind the button (it will expire), `false` will preserve it.
     */
    setExpire(time: number, expireCallback?: this[`runExecuteExpire`]): this;
    /**
     * Sets the button's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     */
    setExecute(executeCallback: this[`runExecute`]): this;
    /**
     * Get the raw button.
     * Note that the returned button is immutable.
     */
    getRaw(): DiscordTypes.APIButtonComponent;
}
/**
 * Button context.
 */
export declare class ButtonContext extends BaseComponentContext {
    /**
     * Unbinds the button's execution callback from the command handler.
     * Use this method to prevent memory leaks from inactive buttons.
     */
    unbind(): void;
}
