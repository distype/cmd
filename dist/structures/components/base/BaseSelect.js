"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSelect = void 0;
const BaseComponent_1 = require("./BaseComponent");
/**
 * The base select menu builder.
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 * @internal
 */
class BaseSelect extends BaseComponent_1.BaseComponent {
    /**
     * Set the component's placeholder text.
     * @param placeholder The placeholder to use.
     * @returns The component.
     */
    setPlaceholder(placeholder) {
        this._raw.placeholder = placeholder;
        return this;
    }
    /**
     * Set the minimum number of values allowed to be selected.
     * @param minValues The minimum number of values allowed.
     * @returns The component.
     */
    setMinValues(minValues) {
        this._raw.min_values = minValues;
        return this;
    }
    /**
     * Set the maximum number of values allowed to be selected.
     * @param maxValues The maximum number of values allowed.
     * @returns The component.
     */
    setMaxValues(maxValues) {
        this._raw.max_values = maxValues;
        return this;
    }
}
exports.BaseSelect = BaseSelect;
