import { BaseCommand, BaseCommandContext, BaseCommandContextCallback } from "./base/BaseCommand";
import { CommandHandler } from "../CommandHandler";
import * as DiscordTypes from "discord-api-types/v10";
import { Snowflake } from "distype";
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
export declare class MessageCommand<GuildOnly extends boolean = false> extends BaseCommand<DiscordTypes.RESTPostAPIContextMenuApplicationCommandsJSONBody> {
    setGuild: (id: string) => MessageCommand<true>;
    setGuildOnly: () => MessageCommand<true>;
    setExecute: (executeCallback: BaseCommandContextCallback<MessageCommandContext<GuildOnly>>) => this;
    getExecute: () => BaseCommandContextCallback<MessageCommandContext<GuildOnly>>;
    protected _execute: BaseCommandContextCallback<MessageCommandContext<GuildOnly>>;
    /**
     * Create the message command builder.
     */
    constructor();
}
/**
 * {@link MessageCommand Message command} context.
 */
export declare class MessageCommandContext<GuildOnly extends boolean = false> extends BaseCommandContext<GuildOnly> {
    /**
     * The executed context's target.
     */
    readonly target: DiscordTypes.APIMessage;
    /**
     * The ID of the executed context's target.
     */
    readonly targetId: Snowflake;
    /**
     * Create {@link MessageCommand message command} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: DiscordTypes.APIMessageApplicationCommandInteraction, commandHandler: CommandHandler);
}
