import { BaseComponentContext, BaseComponentExpireContext } from './BaseContext';

import { DistypeCmdError, DistypeCmdErrorType } from '../errors/DistypeCmdError';

import * as DiscordTypes from 'discord-api-types/v10';
import { DiscordConstants } from 'distype';

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
    public run: ((ctx: ButtonContext) => (void | Promise<void>)) | null = null;
    /**
     * The button's expire method.
     * @internal
     */
    public runExpire: ((ctx: BaseComponentExpireContext) => (void | Promise<void>)) | null = null;

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
        if (typeof this._raw.label === `string` && style === ButtonStyle.LINK) throw new DistypeCmdError(`Cannot use style "LINK" when the button has a "label" property assigned`, DistypeCmdErrorType.INVALID_BUTTON_VALUE);
        if (typeof (this._raw as any).url === `string` && style !== ButtonStyle.LINK) throw new DistypeCmdError(`Cannot use style "${ButtonStyle[style]}" when the button has a "url" property assigned`, DistypeCmdErrorType.INVALID_BUTTON_VALUE);

        this._raw.style = style as any;
        return this as any;
    }

    /**
     * Set the button's ID.
     * Note that the button cannot use the `ButtonStyle.LINK` style with a custom ID.
     * @param id The ID to use.
     * @returns The button.
     */
    public setId (id: string): this {
        if (id.length > DiscordConstants.COMPONENT_LIMITS.BUTTON.CUSTOM_ID) throw new DistypeCmdError(`Specified ID is longer than maximum length ${DiscordConstants.COMPONENT_LIMITS.BUTTON.CUSTOM_ID}`, DistypeCmdErrorType.INVALID_MODAL_VALUE);
        if (this._raw.style === DiscordTypes.ButtonStyle.Link) throw new DistypeCmdError(`Cannot set custom_id when the button has the "LINK" style`, DistypeCmdErrorType.INVALID_BUTTON_VALUE);

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
        if (this._raw.style !== undefined && this._raw.style !== DiscordTypes.ButtonStyle.Link) throw new DistypeCmdError(`Cannot set URL when the button has the "${ButtonStyle[this._raw.style]}" style`, DistypeCmdErrorType.INVALID_BUTTON_VALUE);

        (this._raw as any).url = url;
        return this;
    }

    /**
     * Set the button's label.
     * @param label The label to use.
     * @returns The button.
     */
    public setLabel (label: string): this {
        if (label.length > DiscordConstants.COMPONENT_LIMITS.BUTTON.LABEL) throw new DistypeCmdError(`Specified label is longer than maximum length ${DiscordConstants.COMPONENT_LIMITS.BUTTON.LABEL}`, DistypeCmdErrorType.INVALID_MODAL_VALUE);
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
     * @param callback A callback that is called when the button expires.
     */
    public setExpire (time: number, callback: this[`runExpire`]): this {
        this.expireTime = time;
        this.runExpire = callback;
        return this;
    }

    /**
     * Sets the button's execute method.
     * @param exec The callback to execute when an interaction is received.
     */
    public setExecute (exec: this[`run`]): this {
        this.run = exec;
        return this;
    }

    /**
     * Get the raw button.
     * Note that the returned button is immutable.
     */
    public getRaw (): DiscordTypes.APIButtonComponent {
        if (typeof this._raw.style !== `number`) throw new DistypeCmdError(`Cannot convert a button with a missing "style" parameter to raw`, DistypeCmdErrorType.INVALID_BUTTON_PARAMETERS_FOR_RAW);
        if (typeof (this._raw as any).custom_id !== `string` && typeof (this._raw as any).url !== `string`) throw new DistypeCmdError(`Cannot convert a button with a missing "custom_id" or "url" parameter to raw`, DistypeCmdErrorType.INVALID_BUTTON_PARAMETERS_FOR_RAW);
        if (typeof (this._raw as any).custom_id === `string` && typeof (this._raw as any).url === `string`) throw new DistypeCmdError(`Cannot convert a button with both "custom_id" and "url" parameters defined to raw`, DistypeCmdErrorType.INVALID_BUTTON_PARAMETERS_FOR_RAW);
        if ((this._raw as any).custom_id !== undefined && this._raw.style === DiscordTypes.ButtonStyle.Link) throw new DistypeCmdError(`Cannot convert a button to raw when the button has the "LINK" style with a "custom_id" parameter`, DistypeCmdErrorType.INVALID_BUTTON_PARAMETERS_FOR_RAW);
        if ((this._raw as any).url !== undefined && this._raw.style !== DiscordTypes.ButtonStyle.Link) throw new DistypeCmdError(`Cannot convert a button to raw when the button has the "${ButtonStyle[this._raw.style]}" style with a "url" parameter`, DistypeCmdErrorType.INVALID_BUTTON_PARAMETERS_FOR_RAW);

        return {
            type: DiscordTypes.ComponentType.Button,
            ...this._raw as any
        };
    }
}

/**
 * Button context.
 */
export class ButtonContext extends BaseComponentContext {
    /**
     * Unbinds the button's execution callback from the command handler.
     * Use this method to prevent memory leaks from inactive buttons.
     */
    public unbind (): void {
        this.commandHandler.unbindButton(this.component.customId);
    }
}
