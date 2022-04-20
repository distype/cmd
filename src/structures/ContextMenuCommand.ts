import { BaseContextWithModal } from './BaseContext';
import { CommandHandler } from './CommandHandler';

import { sanitizeCommand } from '../functions/sanitizeCommand';

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
export type ContextMenuCommandProps = Omit<DiscordTypes.RESTPostAPIContextMenuApplicationCommandsJSONBody, `options` | `description_localizations`>;

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
     */
    public props: PR = {} as PR;
    /**
     * The command's execute method.
     * @internal
     */
    public run: ((ctx: ContextMenuCommandContext<PR>) => (void | Promise<void>)) | null = null;

    /**
     * Set the command's type.
     * @param name The name to use.
     * @returns The command.
     */
    public setType <T extends `message` | `user`> (name: T): AddProp<`type`, T extends `message` ? DiscordTypes.ApplicationCommandType.Message : DiscordTypes.ApplicationCommandType.User, PR> {
        this.props.type = name === `message` ? DiscordTypes.ApplicationCommandType.Message : DiscordTypes.ApplicationCommandType.User;
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
     * @param nameLocalizaions The name localizations to use.
     * @returns The command.
     */
    public setNameLocalizations <T extends ContextMenuCommandProp<`name_localizations`>> (nameLocalizaions: T): AddProp<`name_localizations`, T, PR> {
        this.props.name_localizations = nameLocalizaions;
        return this as any;
    }

    /**
     * Set the command's default permission.
     * @param defaultPermission The default permission to use.
     * @returns The command.
     */
    public setDefaultPermission <T extends ContextMenuCommandProp<`default_permission`>> (defaultPermission: T): AddProp<`default_permission`, T, PR> {
        this.props.default_permission = defaultPermission;
        return this as any;
    }

    /**
     * Sets the command's execute method.
     * @param exec The callback to execute when an interaction is received.
     */
    public setExecute (exec: (ctx: ContextMenuCommandContext<PR>) => (void | Promise<void>)): this {
        if (!this.props.type || !this.props.name) throw new Error(`A context menu command's type and name must be present to set its execute method`);
        this.run = exec;
        return this;
    }

    /**
     * Converts a command to a Discord API compatible object.
     * @returns The converted command.
     */
    public getRaw (): Required<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody> {
        if (typeof this.props.type !== `number`) throw new Error(`Cannot convert a command with a missing "type" parameter to raw`);
        if (typeof this.props.name !== `string`) throw new Error(`Cannot convert a command with a missing "name" parameter to raw`);

        return sanitizeCommand(this.props as any);
    }
}

/**
 * Context menu command context.
 */
export class ContextMenuCommandContext<PR extends Partial<ContextMenuCommandProps>> extends BaseContextWithModal {
    /**
     * The ID of the channel that the command was ran in.
     */
    public readonly channelId: Snowflake;
    /**
     * Command data.
     */
    public readonly command: ContextMenuCommand<PR>[`props`] & { id: Snowflake };
    /**
     * The executed command's target.
     */
    public readonly target: PR[`type`] extends DiscordTypes.ApplicationCommandType.Message ? DiscordTypes.APIMessage : {
        user: DiscordTypes.APIUser
        member?: DiscordTypes.APIInteractionDataResolvedGuildMember
    };
    /**
     * The ID of the executed command's target.
     */
    public readonly targetId: Snowflake;

    /**
     * Create a context menu command's context.
     * @param commandHandler The command handler that invoked the context.
     * @param command The command that invoked the context.
     * @param interaction Interaction data.
     */
    constructor (commandHandler: CommandHandler, command: ContextMenuCommand<PR>, interaction: PR[`type`] extends DiscordTypes.ApplicationCommandType.Message ? DiscordTypes.APIMessageApplicationCommandInteraction : DiscordTypes.APIUserApplicationCommandInteraction) {
        super(commandHandler, interaction);

        this.channelId = interaction.channel_id;
        this.command = {
            ...command.props,
            id: interaction.data.id
        };
        this.target = command.props.type === DiscordTypes.ApplicationCommandType.Message
            ? (interaction.data.resolved as DiscordTypes.APIMessageApplicationCommandInteractionDataResolved).messages[interaction.data.target_id]
            : {
                user: (interaction.data.resolved as DiscordTypes.APIUserApplicationCommandInteractionDataResolved).users[interaction.data.target_id],
                member: (interaction.data.resolved as DiscordTypes.APIUserApplicationCommandInteractionDataResolved).members?.[interaction.data.target_id]
            } as any;
        this.targetId = interaction.data.target_id;
    }
}
