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
export class UserSelect extends BaseSelect<DiscordTypes.ComponentType.UserSelect> {
    declare setExecute: (executeCallback: BaseComponentContextCallback<UserSelectContext>) => this;
    declare getExecute: () => BaseComponentContextCallback<UserSelectContext>;
    declare protected _execute: BaseComponentContextCallback<UserSelectContext>;

    /**
     * Create the select menu builder.
     */
    constructor () {
        super(DiscordTypes.ComponentType.UserSelect);
    }
}

/**
 * {@link UserSelect User select} context.
 */
export class UserSelectContext extends BaseComponentContext {
    /**
     * Selected values from the user.
     */
    public readonly options: Array<{ user: DiscordTypes.APIUser, member?: DiscordTypes.APIInteractionDataResolvedGuildMember }>;

    /**
     * Create {@link SelectMenu select menu} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor (interaction: SelectInteraction<DiscordTypes.ComponentType.UserSelect>, commandHandler: CommandHandler) {
        super(interaction, commandHandler);

        this.options = Object.keys(interaction.data.resolved.users).map((id) => ({
            user: interaction.data.resolved.users![id], member: interaction.data.resolved.members?.[id]
        }));
    }
}
