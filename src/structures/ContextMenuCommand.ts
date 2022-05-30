import { BaseInteractionContextWithModal } from './BaseContext';
import { CommandHandler } from './CommandHandler';

import { sanitizeCommand } from '../functions/sanitizeCommand';
import { LogCallback } from '../types/Log';

import * as DiscordTypes from 'discord-api-types/v10';
import { Snowflake } from 'distype';

/**
 * Adds a prop to a command.
 * @internal
 */
type AddProp <K extends keyof Required<ContextMenuCommandProps>, V extends ContextMenuCommandProp<K>, Props> = ContextMenuCommand<Props & Record<K, V>>;

/**
 * A property of a command.
 * @internal
 */
type ContextMenuCommandProp<K extends keyof Required<ContextMenuCommandProps>> = Required<ContextMenuCommandProps>[K];

/**
 * A chat command's props.
 */
export type ContextMenuCommandProps = Omit<DiscordTypes.RESTPostAPIContextMenuApplicationCommandsJSONBody, `default_permission` | `description_localizations` | `options`>;

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
export class ContextMenuCommand<PR extends Partial<ContextMenuCommandProps> = Record<string, never>> {
    /**
     * The command's props.
     * @internal
     */
    public props: PR = {} as PR;
    /**
     * The command's execute method.
     * @internal
     */
    public runExecute: ((ctx: ContextMenuCommandContext<PR>) => (void | Promise<void>)) | null = null;

    /**
     * Set the command's type.
     * @param type The type to use.
     * @returns The command.
     */
    public setType <T extends `message` | `user`> (type: T): AddProp<`type`, T extends `message` ? DiscordTypes.ApplicationCommandType.Message : DiscordTypes.ApplicationCommandType.User, PR> {
        this.props.type = type === `message` ? DiscordTypes.ApplicationCommandType.Message : DiscordTypes.ApplicationCommandType.User;
        return this as any;
    }

    /**
     * Set the command's name.
     * @param name The name to use.
     * @returns The command.
     */
    public setName <T extends ContextMenuCommandProp<`name`>> (name: T): AddProp<`name`, T, PR> {
        this.props.name = name;
        return this as any;
    }

    /**
     * Set the command's name localizations.
     * @param nameLocalizations The name localizations to use.
     * @returns The command.
     */
    public setNameLocalizations <T extends ContextMenuCommandProp<`name_localizations`>> (nameLocalizations: T): AddProp<`name_localizations`, T, PR> {
        this.props.name_localizations = nameLocalizations;
        return this as any;
    }

    /**
     * Set the command's default member permissions.
     * @param defaultMemberPermissions The permissions a guild member must have to run the command.
     * @returns The command.
     */
    public setDefaultMemberPermissions <T extends ContextMenuCommandProp<`default_member_permissions`>> (defaultMemberPermissions: T): AddProp<`default_member_permissions`, T, PR> {
        this.props.default_member_permissions = defaultMemberPermissions;
        return this as any;
    }

    /**
     * Set the command's DM permission.
     * @param dmPermission If the command should be enabled in DMs.
     * @returns The command.
     */
    public setDmPermission <T extends ContextMenuCommandProp<`dm_permission`>> (dmPermission: T): AddProp<`dm_permission`, T, PR> {
        this.props.dm_permission = dmPermission;
        return this as any;
    }

    /**
     * Sets the command's execute method.
     * @param executeCallback The callback to execute when an interaction is received.
     */
    public setExecute (executeCallback: this[`runExecute`]): this {
        this.runExecute = executeCallback;
        return this;
    }

    /**
     * Converts a command to a Discord API compatible object.
     * @returns The converted command.
     */
    public getRaw (): Required<Omit<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody, `default_permission`>> {
        return sanitizeCommand(this.props as any);
    }
}

/**
 * {@link ContextMenuCommand Context menu command} context.
 */
export class ContextMenuCommandContext<PR extends Partial<ContextMenuCommandProps>> extends BaseInteractionContextWithModal<PR[`dm_permission`] extends never ? boolean : PR[`dm_permission`] extends false ? true : boolean> {
    /**
     * The ID of the channel that the command was ran in.
     */
    public readonly channelId: Snowflake;
    /**
     * Command data.
     */
    public readonly command: ContextMenuCommand<PR>[`props`] & { id: Snowflake };
    /**
     * The {@link ContextMenuCommand context menu command} the context originates from.
     */
    public readonly contextParent: ContextMenuCommand<PR>;
    /**
     * The executed command's target.
     */
    public readonly target: PR[`type`] extends DiscordTypes.ApplicationCommandType.Message ? DiscordTypes.APIMessage : {
        user: DiscordTypes.APIUser
        member: PR[`dm_permission`] extends never ? DiscordTypes.APIInteractionDataResolvedGuildMember | undefined : PR[`dm_permission`] extends false ? DiscordTypes.APIInteractionDataResolvedGuildMember : DiscordTypes.APIInteractionDataResolvedGuildMember | undefined
    };
    /**
     * The ID of the executed command's target.
     */
    public readonly targetId: Snowflake;

    /**
     * Create {@link ContextMenuCommand context menu command} context.
     * @param interaction Interaction data.
     * @param contextMenuCommand The {@link ContextMenuCommand context menu command} the context originates from.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor (interaction: PR[`type`] extends DiscordTypes.ApplicationCommandType.Message ? DiscordTypes.APIMessageApplicationCommandInteraction : DiscordTypes.APIUserApplicationCommandInteraction, contextMenuCommand: ContextMenuCommand<PR>, commandHandler: CommandHandler, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
        super(interaction, commandHandler, logCallback, logThisArg);

        this.channelId = interaction.channel_id;
        this.command = {
            ...contextMenuCommand.props,
            id: interaction.data.id
        };
        this.contextParent = contextMenuCommand;
        this.target = contextMenuCommand.props.type === DiscordTypes.ApplicationCommandType.Message
            ? (interaction.data.resolved as DiscordTypes.APIMessageApplicationCommandInteractionDataResolved).messages[interaction.data.target_id]
            : {
                user: (interaction.data.resolved as DiscordTypes.APIUserApplicationCommandInteractionDataResolved).users[interaction.data.target_id],
                member: (interaction.data.resolved as DiscordTypes.APIUserApplicationCommandInteractionDataResolved).members?.[interaction.data.target_id]
            } as any;
        this.targetId = interaction.data.target_id;
    }
}
