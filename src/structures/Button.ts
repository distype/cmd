import { BaseComponentContext, BaseComponentExpireContext } from './BaseContext';
import { CommandHandler } from './CommandHandler';

import { LogCallback } from '../types/Log';

import * as DiscordTypes from 'discord-api-types/v10';

/**
 * A button's style.
 */
export enum ButtonStyle {
    PRIMARY = 1,
    SECONDARY,
    SUCCESS,
    DANGER,
    LINK
}

/**
 * A button.
 * Note that to send a button, you must define a style, as well as an ID or a URL.
 */
export class Button {
    /**
     * The amount of time in milliseconds for the button to be inactive for it to be considered expired and unbound from the command handler.
     * @internal
     */
    public expireTime: number | null = null;
    /**
     * A timeout for the button to expire.
     * @internal
     */
    public expireTimeout: NodeJS.Timeout | null = null;
    /**
     * The button's execute method.
     * @internal
     */
    public runExecute: ((ctx: ButtonContext) => (void | Promise<void>)) | null = null;
    /**
     * The button's expire execute method.
     * @internal
     */
    public runExecuteExpire: ((ctx: ButtonExpireContext) => (boolean | Promise<boolean>)) | null = null;

    /**
     * The raw button.
     */
    private _raw: Partial<Omit<DiscordTypes.APIButtonComponent, `type`>>;

    /**
     * Create a button.
     * @param base A button to use as a base.
     */
    constructor (base: Partial<Omit<DiscordTypes.APIButtonComponent, `type`>> = {}) {
        this._raw = base;
    }

    /**
     * Set the button's style
     * @param style The style to use.
     * @returns The button.
     */
    public setStyle (style: ButtonStyle): this {
        this._raw.style = style as any;
        return this;
    }

    /**
     * Set the button's ID.
     * Note that the button cannot use the `ButtonStyle.LINK` style with a custom ID.
     * @param id The ID to use.
     * @returns The button.
     */
    public setId (id: string): this {
        (this._raw as any).custom_id = id;
        return this;
    }

    /**
     * Set the button's URL.
     * Note that the button must use the `ButtonStyle.LINK` style with a URL.
     * @param url The URL to use.
     * @returns The button.
     */
    public setURL (url: string): this {
        (this._raw as any).url = url;
        return this;
    }

    /**
     * Set the button's label.
     * @param label The label to use.
     * @returns The button.
     */
    public setLabel (label: string): this {
        this._raw.label = label;
        return this;
    }

    /**
     * Set the button's emoji.
     * @param emoji The emoji to use.
     * @returns The button.
     */
    public setEmoji (emoji: DiscordTypes.APIMessageComponentEmoji): this {
        this._raw.emoji = emoji;
        return this;
    }

    /**
     * Set the button's disabled state.
     * @param disabled The disabled state to use.
     * @returns The button.
     */
    public setDisabled (disabled: boolean): this {
        this._raw.disabled = disabled;
        return this;
    }

    /**
     * Set the button's expire properties.
     * @param time The amount of time in milliseconds for the button to be inactive for it to be considered expired and unbound from the command handler.
     * @param expireCallback A callback that is called when the button expires. It should return a boolean that specifies if the current expire should be cancelled and the button's expire time should be waited again. `true` will unbind the button (it will expire), `false` will preserve it.
     */
    public setExpire (time: number, expireCallback?: this[`runExecuteExpire`]): this {
        this.expireTime = time;
        if (typeof expireCallback === `function`) this.runExecuteExpire = expireCallback;
        return this;
    }

    /**
     * Sets the button's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     */
    public setExecute (executeCallback: this[`runExecute`]): this {
        this.runExecute = executeCallback;
        return this;
    }

    /**
     * Get the raw button.
     * Note that the returned button is immutable.
     */
    public getRaw (): DiscordTypes.APIButtonComponent {
        return {
            type: DiscordTypes.ComponentType.Button,
            ...this._raw as any
        };
    }
}

/**
 * {@link Button} context.
 */
export class ButtonContext extends BaseComponentContext {
    /**
     * The {@link Button button} the context originates from.
     */
    public readonly contextParent: Button;

    /**
     * Create {@link Button button} context.
     * @param interaction Interaction data.
     * @param button The {@link Button button} the context originates from.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor (interaction: DiscordTypes.APIMessageComponentInteraction, button: Button, commandHandler: CommandHandler, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
        super(interaction, commandHandler, logCallback, logThisArg);

        this.contextParent = button;
    }

    /**
     * Unbinds the button's execution callback from the command handler.
     * Use this method to prevent memory leaks from inactive buttons.
     */
    public unbind (): void {
        this.commandHandler.unbindButton(this.component.customId);
    }
}

/**
 * {@link Button} expire context.
 */
export class ButtonExpireContext extends BaseComponentExpireContext {
    /**
     * The {@link Button button} the expire context originates from.
     */
    public readonly contextParent: Button;

    /**
     * Create {@link Button button} expire context.
     * @param customId The component's custom ID.
     * @param type The component's type.
     * @param button The {@link Button button} the context originates from.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor (customId: string, type: DiscordTypes.ComponentType, button: Button, commandHandler: CommandHandler, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
        super(customId, type, commandHandler, logCallback, logThisArg);

        this.contextParent = button;
    }
}
