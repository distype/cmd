import { BaseComponentContext, BaseComponentContextCallback } from './base/BaseComponent';
import { BaseSelect, SelectInteraction } from './base/BaseSelect';
import { CommandHandler } from '../CommandHandler';
import * as DiscordTypes from 'discord-api-types/v10';
/**
 * The user select menu builder.
 *
 * @example
 * ```ts
 * new UserSelect()
 *   .setId(`foo`)
 *   .setPlaceholder(`Select a user`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You selected <@${ctx.options[0].user.id}>!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 */
export declare class UserSelect extends BaseSelect<DiscordTypes.ComponentType.UserSelect> {
    setExecute: (executeCallback: BaseComponentContextCallback<UserSelectContext>) => this;
    getExecute: () => BaseComponentContextCallback<UserSelectContext>;
    protected _execute: BaseComponentContextCallback<UserSelectContext>;
    /**
     * Create the select menu builder.
     */
    constructor();
}
/**
 * {@link UserSelect User select} context.
 */
export declare class UserSelectContext extends BaseComponentContext {
    /**
     * Selected values from the user.
     */
    readonly options: Array<{
        user: DiscordTypes.APIUser;
        member?: DiscordTypes.APIInteractionDataResolvedGuildMember;
    }>;
    /**
     * Create {@link SelectMenu select menu} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: SelectInteraction<DiscordTypes.ComponentType.UserSelect>, commandHandler: CommandHandler);
}
