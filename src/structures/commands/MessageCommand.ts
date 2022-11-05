import { BaseCommand, BaseCommandContext, BaseCommandContextCallback } from './base/BaseCommand';

import { CommandHandler } from '../CommandHandler';

import * as DiscordTypes from 'discord-api-types/v10';
import { Snowflake } from 'distype';

/**
 * The message command builder.
 *
 * @example
 * ```ts
 * new MessageCommand()
 *   .setName(`foo`)
 *   .setExecute((ctx) => {
 *     ctx.send(`The selected message said "${ctx.target.content}"!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/application-commands#message-commands)
 */
export class MessageCommand<GuildOnly extends boolean = false> extends BaseCommand<DiscordTypes.RESTPostAPIContextMenuApplicationCommandsJSONBody> {
    declare setGuild: (id: string) => MessageCommand<true>;
    declare setGuildOnly: <T extends boolean>(guildOnly: T) => MessageCommand<T>;
    declare setExecute: (executeCallback: BaseCommandContextCallback<MessageCommandContext<GuildOnly>>) => this;
    declare getExecute: () => BaseCommandContextCallback<MessageCommandContext<GuildOnly>>;
    declare protected _execute: BaseCommandContextCallback<MessageCommandContext<GuildOnly>>;

    /**
     * Create the message command builder.
     */
    constructor () {
        super(DiscordTypes.ApplicationCommandType.Message);
    }
}

/**
 * {@link MessageCommand Message command} context.
 */
export class MessageCommandContext<GuildOnly extends boolean = false> extends BaseCommandContext<GuildOnly> {
    /**
     * The executed context's target.
     */
    public readonly target: DiscordTypes.APIMessage;
    /**
     * The ID of the executed context's target.
     */
    public readonly targetId: Snowflake;

    /**
     * Create {@link MessageCommand message command} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor (interaction: DiscordTypes.APIMessageApplicationCommandInteraction, commandHandler: CommandHandler) {
        super(interaction, commandHandler);

        this.target = interaction.data.resolved.messages[interaction.data.target_id];
        this.targetId = interaction.data.target_id;
    }
}
