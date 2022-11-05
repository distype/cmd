import { BaseCommand, BaseCommandContext, BaseCommandContextCallback } from './base/BaseCommand';
import { CommandHandler } from '../CommandHandler';
import * as DiscordTypes from 'discord-api-types/v10';
import { Snowflake } from 'distype';
/**
 * The user command builder.
 *
 * @example
 * ```ts
 * new UserCommand()
 *   .setName(`foo`)
 *   .setExecute((ctx) => {
 *     ctx.send(`The selected user is <@${ctx.targetId}>!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/application-commands#user-commands)
 */
export declare class UserCommand<GuildOnly extends boolean = false> extends BaseCommand<DiscordTypes.RESTPostAPIContextMenuApplicationCommandsJSONBody> {
    setGuild: (id: string) => UserCommand<true>;
    setGuildOnly: <T extends boolean>(guildOnly: T) => UserCommand<T>;
    setExecute: (executeCallback: BaseCommandContextCallback<UserCommandContext<GuildOnly>>) => this;
    getExecute: () => BaseCommandContextCallback<UserCommandContext<GuildOnly>>;
    protected _execute: BaseCommandContextCallback<UserCommandContext<GuildOnly>>;
    /**
     * Create the user command builder.
     */
    constructor();
}
/**
 * {@link UserCommand User command} context.
 */
export declare class UserCommandContext<GuildOnly extends boolean = false> extends BaseCommandContext<GuildOnly> {
    /**
     * The executed context's target.
     */
    readonly target: {
        user: DiscordTypes.APIUser;
        member: GuildOnly extends true ? DiscordTypes.APIInteractionDataResolvedGuildMember : DiscordTypes.APIInteractionDataResolvedGuildMember | undefined;
    };
    /**
     * The ID of the executed context's target.
     */
    readonly targetId: Snowflake;
    /**
     * Create {@link UserCommand user command} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: DiscordTypes.APIUserApplicationCommandInteraction, commandHandler: CommandHandler);
}
