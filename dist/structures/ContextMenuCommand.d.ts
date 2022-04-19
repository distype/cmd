import { BaseCommandContext } from './BaseContext';
import { CommandHandler } from './CommandHandler';
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
export declare type ContextMenuCommandProps = Omit<DiscordTypes.RESTPostAPIContextMenuApplicationCommandsJSONBody, `options` | `description_localizations`>;
/**
 * The context command command builder.
 */
export declare class ContextMenuCommand<PR extends Partial<ContextMenuCommandProps> = Record<string, never>> {
    /**
     * The command's props.
     */
    props: PR;
    /**
     * The command's execute method.
     * @internal
     */
    run: ((ctx: ContextMenuCommandContext<PR>) => (void | Promise<void>)) | null;
    /**
     * Set the command's type.
     * @param name The name to use.
     * @returns The command.
     */
    setType<T extends `message` | `user`>(name: T): AddProp<`type`, T extends `message` ? DiscordTypes.ApplicationCommandType.Message : DiscordTypes.ApplicationCommandType.User, PR>;
    /**
     * Set the command's name.
     * @param name The name to use.
     * @returns The command.
     */
    setName<T extends ContextMenuCommandProp<`name`>>(name: T): AddProp<`name`, T, PR>;
    /**
     * Set the command's name localizations.
     * @param nameLocalizaions The name localizations to use.
     * @returns The command.
     */
    setNameLocalizations<T extends ContextMenuCommandProp<`name_localizations`>>(nameLocalizaions: T): AddProp<`name_localizations`, T, PR>;
    /**
     * Set the command's default permission.
     * @param defaultPermission The default permission to use.
     * @returns The command.
     */
    setDefaultPermission<T extends ContextMenuCommandProp<`default_permission`>>(defaultPermission: T): AddProp<`default_permission`, T, PR>;
    /**
     * Sets the command's execute method.
     * @param exec The callback to execute when an interaction is received.
     */
    setExecute(exec: (ctx: ContextMenuCommandContext<PR>) => (void | Promise<void>)): this;
}
/**
 * Context menu command context.
 */
export declare class ContextMenuCommandContext<PR extends Partial<ContextMenuCommandProps>> extends BaseCommandContext {
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
     * Create a context menu command's context.
     * @param commandHandler The command handler that invoked the context.
     * @param command The command that invoked the context.
     * @param interaction Interaction data.
     */
    constructor(commandHandler: CommandHandler, command: ContextMenuCommand<PR>, interaction: PR[`type`] extends DiscordTypes.ApplicationCommandType.Message ? DiscordTypes.APIMessageApplicationCommandInteraction : DiscordTypes.APIUserApplicationCommandInteraction);
}
export {};
