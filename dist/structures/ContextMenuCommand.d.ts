import { BaseInteractionContextWithModal } from './BaseContext';
import { CommandHandler } from './CommandHandler';
import { LogCallback } from '../types/Log';
import * as DiscordTypes from 'discord-api-types/v10';
import { Snowflake } from 'distype';
/**
 * Adds a prop to a command.
 * @internal
 */
declare type AddProp<K extends keyof Required<ContextMenuCommandProps>, V extends ContextMenuCommandProp<K>, Props> = ContextMenuCommand<Props & Record<K, V>>;
/**
 * A property of a command.
 * @internal
 */
declare type ContextMenuCommandProp<K extends keyof Required<ContextMenuCommandProps>> = Required<ContextMenuCommandProps>[K];
/**
 * A chat command's props.
 */
export declare type ContextMenuCommandProps = Omit<DiscordTypes.RESTPostAPIContextMenuApplicationCommandsJSONBody, `default_permission` | `description_localizations` | `options`>;
/**
 * The context command command builder.
 *
 * @example
 * ```ts
 * new ContextMenuCommand()
 *   .setType(`user`)
 *   .setName(`User Command`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You selected "${ctx.target.user.username}""`);
 *   });
 * ```
 */
export declare class ContextMenuCommand<PR extends Partial<ContextMenuCommandProps> = Record<string, never>> {
    /**
     * The command's props.
     * @internal
     */
    props: PR;
    /**
     * The command's execute method.
     * @internal
     */
    runExecute: ((ctx: ContextMenuCommandContext<PR>) => (void | Promise<void>)) | null;
    /**
     * Set the command's type.
     * @param type The type to use.
     * @returns The command.
     */
    setType<T extends `message` | `user`>(type: T): AddProp<`type`, T extends `message` ? DiscordTypes.ApplicationCommandType.Message : DiscordTypes.ApplicationCommandType.User, PR>;
    /**
     * Set the command's name.
     * @param name The name to use.
     * @returns The command.
     */
    setName<T extends ContextMenuCommandProp<`name`>>(name: T): AddProp<`name`, T, PR>;
    /**
     * Set the command's name localizations.
     * @param nameLocalizations The name localizations to use.
     * @returns The command.
     */
    setNameLocalizations<T extends ContextMenuCommandProp<`name_localizations`>>(nameLocalizations: T): AddProp<`name_localizations`, T, PR>;
    /**
     * Set the command's default member permissions.
     * @param defaultMemberPermissions The permissions a guild member must have to run the command.
     * @returns The command.
     */
    setDefaultMemberPermissions<T extends ContextMenuCommandProp<`default_member_permissions`>>(defaultMemberPermissions: T): AddProp<`default_member_permissions`, T, PR>;
    /**
     * Set the command's DM permission.
     * @param dmPermission If the command should be enabled in DMs.
     * @returns The command.
     */
    setDmPermission<T extends ContextMenuCommandProp<`dm_permission`>>(dmPermission: T): AddProp<`dm_permission`, T, PR>;
    /**
     * Sets the command's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     */
    setExecute(executeCallback: this[`runExecute`]): this;
    /**
     * Converts a command to a Discord API compatible object.
     * @returns The converted command.
     */
    getRaw(): Required<Omit<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody, `default_permission`>>;
}
/**
 * {@link ContextMenuCommand Context menu command} context.
 */
export declare class ContextMenuCommandContext<PR extends Partial<ContextMenuCommandProps>> extends BaseInteractionContextWithModal<PR[`dm_permission`] extends false ? true : false> {
    /**
     * The ID of the channel that the command was ran in.
     */
    readonly channelId: Snowflake;
    /**
     * Command data.
     */
    readonly command: ContextMenuCommand<PR>[`props`] & {
        id: Snowflake;
    };
    /**
     * The {@link ContextMenuCommand context menu command} the context originates from.
     */
    readonly contextParent: ContextMenuCommand<PR>;
    /**
     * The executed command's target.
     */
    readonly target: PR[`type`] extends DiscordTypes.ApplicationCommandType.Message ? DiscordTypes.APIMessage : {
        user: DiscordTypes.APIUser;
        member?: DiscordTypes.APIInteractionDataResolvedGuildMember;
    };
    /**
     * The ID of the executed command's target.
     */
    readonly targetId: Snowflake;
    /**
     * Create {@link ContextMenuCommand context menu command} context.
     * @param interaction Interaction data.
     * @param contextMenuCommand The {@link ContextMenuCommand context menu command} the context originates from.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor(interaction: PR[`type`] extends DiscordTypes.ApplicationCommandType.Message ? DiscordTypes.APIMessageApplicationCommandInteraction : DiscordTypes.APIUserApplicationCommandInteraction, contextMenuCommand: ContextMenuCommand<PR>, commandHandler: CommandHandler, logCallback?: LogCallback, logThisArg?: any);
}
export {};
