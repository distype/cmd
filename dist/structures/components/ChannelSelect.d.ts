import { BaseComponentContext, BaseComponentContextCallback } from './base/BaseComponent';
import { BaseSelect, SelectInteraction } from './base/BaseSelect';
import { CommandHandler } from '../CommandHandler';
import * as DiscordTypes from 'discord-api-types/v10';
/**
 * Channel select types.
 */
export declare enum ChannelSelectTypes {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_ANNOUNCEMENT = 5,
    ANNOUNCEMENT_THREAD = 10,
    PUBLIC_THREAD = 11,
    PRIVATE_THREAD = 12,
    GUILD_STAGE_VOICE = 13,
    GUILD_DIRECTORY = 14,
    GUILD_FORUM = 15
}
/**
 * The channel select menu builder.
 *
 * @example
 * ```ts
 * new ChannelSelect()
 *   .setId(`foo`)
 *   .setPlaceholder(`Select a channel`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You selected <#${ctx.options[0].id}>!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 */
export declare class ChannelSelect extends BaseSelect<DiscordTypes.ComponentType.ChannelSelect> {
    setExecute: (executeCallback: BaseComponentContextCallback<ChannelSelectContext>) => this;
    getExecute: () => BaseComponentContextCallback<ChannelSelectContext>;
    protected _execute: BaseComponentContextCallback<ChannelSelectContext>;
    /**
     * Create the select menu builder.
     */
    constructor();
    setChannelTypes(...types: Array<ChannelSelectTypes | DiscordTypes.ChannelType>): this;
}
/**
 * {@link ChannelSelect Channel select} context.
 */
export declare class ChannelSelectContext extends BaseComponentContext {
    /**
     * Selected values from the user.
     */
    readonly options: DiscordTypes.APIInteractionDataResolvedChannel[];
    /**
     * Create {@link SelectMenu select menu} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: SelectInteraction<DiscordTypes.ComponentType.ChannelSelect>, commandHandler: CommandHandler);
}
