import { BaseComponent } from './BaseComponent';
import * as DiscordTypes from 'discord-api-types/v10';
/**
 * Select interaction data.
 * @internal
 */
export declare type SelectInteraction<T extends DiscordTypes.APISelectMenuComponent[`type`]> = DiscordTypes.APIBaseInteraction<DiscordTypes.InteractionType.MessageComponent, Extract<DiscordTypes.APIMessageSelectMenuInteractionData, {
    component_type: T;
}>> & Required<Pick<DiscordTypes.APIBaseInteraction<DiscordTypes.InteractionType.MessageComponent, Extract<DiscordTypes.APIMessageSelectMenuInteractionData, {
    component_type: T;
}>>, `channel_id` | `data` | `message`>>;
/**
 * The base select menu builder.
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 * @internal
 */
export declare class BaseSelect<T extends DiscordTypes.APISelectMenuComponent[`type`]> extends BaseComponent<Extract<DiscordTypes.APISelectMenuComponent, {
    type: T;
}>> {
    /**
     * Set the component's placeholder text.
     * @param placeholder The placeholder to use.
     * @returns The component.
     */
    setPlaceholder(placeholder: string): this;
    /**
     * Set the minimum number of values allowed to be selected.
     * @param minValues The minimum number of values allowed.
     * @returns The component.
     */
    setMinValues(minValues: number): this;
    /**
     * Set the maximum number of values allowed to be selected.
     * @param maxValues The maximum number of values allowed.
     * @returns The component.
     */
    setMaxValues(maxValues: number): this;
}
