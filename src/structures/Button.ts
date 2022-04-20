import { BaseComponentContext } from './BaseContext';

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
     * The button's execute method.
     * @internal
     */
    public run: ((ctx: ButtonContext) => (void | Promise<void>)) | null = null;

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
        if (typeof this._raw.label === `string` && style === ButtonStyle.LINK) throw new Error(`Cannot use style "LINK" when the button has a "label" property assigned`);
        if (typeof (this._raw as any).url === `string` && style !== ButtonStyle.LINK) throw new Error(`Cannot use style "${ButtonStyle[style]}" when the button has a "url" property assigned`);

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
        if (this._raw.style === DiscordTypes.ButtonStyle.Link) throw new Error(`Cannot set custom_id when the button has the "LINK" style`);

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
        if (this._raw.style !== undefined && this._raw.style !== DiscordTypes.ButtonStyle.Link) throw new Error(`Cannot set URL when the button has the "${ButtonStyle[this._raw.style]}" style`);

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

    public setExecute (exec: (ctx: ButtonContext) => (void | Promise<void>)): this {
        this.run = exec;
        return this;
    }

    /**
     * Get the raw button.
     * Note that the returned button is immutable.
     */
    public getRaw (): DiscordTypes.APIButtonComponent {
        if (typeof this._raw.style !== `number`) throw new Error(`Cannot convert a button with a missing "style" parameter to raw`);
        if (typeof (this._raw as any).custom_id !== `string` && typeof (this._raw as any).url !== `string`) throw new Error(`Cannot convert a button with a missing "custom_id" or "url" parameter to raw`);
        if (typeof (this._raw as any).custom_id === `string` && typeof (this._raw as any).url === `string`) throw new Error(`Cannot convert a button with both "custom_id" and "url" parameters defined to raw`);
        if ((this._raw as any).custom_id !== undefined && this._raw.style === DiscordTypes.ButtonStyle.Link) throw new Error(`Cannot convert a button to raw when the button has the "LINK" style with a "custom_id" parameter`);
        if ((this._raw as any).url !== undefined && this._raw.style !== DiscordTypes.ButtonStyle.Link) throw new Error(`Cannot convert a button to raw when the button has the "${ButtonStyle[this._raw.style]}" style with a "url" parameter`);

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
