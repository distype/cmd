import { BaseComponentContext, BaseComponentContextCallback } from './base/BaseComponent';
import { BaseSelect, SelectInteraction } from './base/BaseSelect';
import { CommandHandler } from '../CommandHandler';
import * as DiscordTypes from 'discord-api-types/v10';
/**
 * The role select menu builder.
 *
 * @example
 * ```ts
 * new RoleSelect()
 *   .setId(`foo`)
 *   .setPlaceholder(`Select a role`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You selected <@&${ctx.options[0].id}>!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 */
export declare class RoleSelect extends BaseSelect<DiscordTypes.ComponentType.RoleSelect> {
    setExecute: (executeCallback: BaseComponentContextCallback<RoleSelectContext>) => this;
    getExecute: () => BaseComponentContextCallback<RoleSelectContext>;
    protected _execute: BaseComponentContextCallback<RoleSelectContext>;
    /**
     * Create the select menu builder.
     */
    constructor();
}
/**
 * {@link RoleSelect Role select} context.
 */
export declare class RoleSelectContext extends BaseComponentContext {
    /**
     * Selected values from the user.
     */
    readonly options: DiscordTypes.APIRole[];
    /**
     * Create {@link SelectMenu select menu} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: SelectInteraction<DiscordTypes.ComponentType.RoleSelect>, commandHandler: CommandHandler);
}
