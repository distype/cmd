import { Modal } from '../../modals/Modal';
import { CommandHandler } from '../../CommandHandler';
import { InteractionContext } from '../../InteractionContext';
import type { MiddlewareMeta } from '../../../middleware';
import { RemoveDeprecated, SanitizedCommand } from '../../../utils/sanitizeCommand';
import * as DiscordTypes from 'discord-api-types/v10';
import { PermissionsUtils, Snowflake } from 'distype';
/**
 * Base command context callback.
 * @internal
 */
export declare type BaseCommandContextCallback<T> = (ctx: T) => (void | Promise<void>);
/**
 * The base command builder.
 * @internal
 */
export declare abstract class BaseCommand<Raw extends DiscordTypes.RESTPostAPIApplicationCommandsJSONBody> {
    /**
     * The command's execute method.
     */
    protected _execute: BaseCommandContextCallback<any>;
    /**
     * The guild the command belongs to.
     */
    protected _guild: Snowflake | null;
    /**
     * Middleware metadata.
     */
    protected _middlewareMeta: MiddlewareMeta | null;
    /**
     * The raw command.
     */
    protected _raw: Partial<Omit<RemoveDeprecated<Raw>, `type`>> & {
        type: Required<Raw>[`type`];
    };
    /**
     * Create the base command builder.
     * @param type The command's type.
     */
    constructor(type: Required<Raw>[`type`]);
    /**
     * Set the command's name.
     * @param name The name to use.
     * @param localization Name localization.
     * @returns The command.
     */
    setName(name: string, localization?: DiscordTypes.LocalizationMap): this;
    /**
     * Set the command's default member permissions.
     * @param permissions The permissions a guild member must have to run the command.
     * @returns The command.
     */
    setDefaultMemberPermissions(...permissions: Parameters<typeof PermissionsUtils.combine>): this;
    /**
     * Set the guild the command belongs to.
     * @param id The guild's ID.
     * @returns The command.
     */
    setGuild(id: Snowflake): BaseCommand<Raw>;
    /**
     * Set if the command should be locked to just guilds (`dm_permission`).
     * Ignored if the command has a set guild.
     * @param guildOnly If the command should be guild only.
     * @returns The command.
     */
    setGuildOnly<T extends boolean>(guildOnly: T): BaseCommand<Raw>;
    /**
     * Get the guild the command belongs to.
     * @returns The guild's ID, or `null` if the command is global.
     */
    getGuild(): Snowflake | null;
    /**
     * Set middleware metadata.
     * @param meta The metadata to set.
     * @returns The command.
     */
    setMiddlewareMeta(meta: MiddlewareMeta): this;
    /**
     * Gets the command's middleware meta.
     * @returns The middleware meta.
     */
    getMiddlewareMeta(): MiddlewareMeta | null;
    /**
     * Sets the command's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     * @returns The command.
     */
    setExecute(executeCallback: BaseCommandContextCallback<any>): this;
    /**
     * Gets the command's execute method.
     * @returns The execute method.
     */
    getExecute(): BaseCommandContextCallback<any>;
    /**
     * Converts the command to a Discord API compatible object.
     * @returns The converted command.
     */
    getRaw(): SanitizedCommand;
}
/**
 * {@link BaseCommand Base command} context.
 * @internal
 */
export declare abstract class BaseCommandContext<GuildOnly extends boolean> extends InteractionContext<GuildOnly> {
    /**
     * Command data.
     */
    readonly command: {
        /**
         * The ID of the guild the command is registered to.
         */
        guildId?: Snowflake;
        /**
         * The command's ID.
         */
        id: Snowflake;
        /**
         * The command's name.
         */
        name: string;
        /**
         * The command's type.
         */
        type: DiscordTypes.ApplicationCommandType;
    };
    /**
     * Create {@link BaseCommand base command} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: DiscordTypes.APIApplicationCommandInteraction, commandHandler: CommandHandler);
    /**
     * Respond with a modal.
     * @param modal The modal to respond with.
     */
    showModal(modal: Modal): Promise<void>;
}
