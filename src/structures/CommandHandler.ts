import { ChatCommand, ChatCommandContext, ChatCommandProps } from './ChatCommand';
import { ContextMenuCommand, ContextMenuCommandContext, ContextMenuCommandProps } from './ContextMenuCommand';

import { LogCallback } from '../types/Log';

import { deepClone, deepEquals, ExtendedMap, traverseObject } from '@br88c/node-utils';
import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';

export type Command = ChatCommand<ChatCommandProps, DiscordTypes.APIApplicationCommandBasicOption[]> | ContextMenuCommand<ContextMenuCommandProps>;

export class CommandHandler {
    /**
     * The client the command handler is bound to.
     */
    public client: Client;
    /**
     * The command handler's commands
     */
    public commands: ExtendedMap<Snowflake | `unknown${number}`, Command> = new ExtendedMap();

    /**
     * The system string used for emitting errors and for the {@link LogCallback log callback}.
     */
    public readonly system = `Command Handler`;

    /**
     * The {@link LogCallback log callback} used by the command handler..
     */
    private _log: LogCallback;
    /**
     * The nonce to use for indexing commands with an unknown ID.
     */
    private _unknownNonce = 0;

    /**
     * Create the command handler.
     * @param client The client to bind the command handler to.
     * @param logCallback A {@link LogCallback callback} to be used for logging events internally throughout the command handler.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor (client: Client, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
        this.client = client;

        this.client.gateway.on(`INTERACTION_CREATE`, ({ d }) => this._onInteraction(d));

        this._log = logCallback.bind(logThisArg);
        this._log(`Initialized command handler`, {
            level: `DEBUG`, system: this.system
        });
    }

    /**
     * Add a command to the command handler.
     * @param command The command to add.
     */
    public add (command: ChatCommand<any, any> | ContextMenuCommand<any>): this {
        if (typeof command.props.type !== `number`) throw new Error(`Cannot push a command with a missing "type" parameter`);
        if (typeof command.props.name !== `string`) throw new Error(`Cannot push a command with a missing "name" parameter`);
        if (command instanceof ChatCommand && typeof command.props.description !== `string`) throw new Error(`Cannot push a command with a missing "description" parameter`);

        if (this.commands.find((c) => c.props.name === command.props.name && c.props.type === command.props.type)) throw new Error(`Commands of the same type cannot share names`);

        this.commands.set(`unknown${this._unknownNonce}`, command);
        this._unknownNonce++;

        this._log(`Added command "${command.props.name}" (${DiscordTypes.ApplicationCommandType[command.props.type]})`, {
            level: `DEBUG`, system: this.system
        });
        return this;
    }

    /**
     * Pushes added / changed / deleted slash commands to Discord.
     */
    public async push (applicationId: Snowflake | undefined = this.client.gateway.user?.id ?? undefined): Promise<void> {
        if (!applicationId) throw new Error(`Application ID is undefined`);

        const commands = this.commands.map((command) => this._commandToRaw(command));
        this._log(`Pushing ${commands.length} commands`, {
            level: `INFO`, system: this.system
        });

        const applicationCommands = await this.client.rest.getGlobalApplicationCommands(applicationId);
        this._log(`Found ${applicationCommands.length} registered commands`, {
            level: `DEBUG`, system: this.system
        });

        const newCommands = commands.filter((command) => !applicationCommands.find((applicationCommand) => deepEquals(command, this._sanitizeRaw(applicationCommand))));
        const deletedCommands = applicationCommands.filter((applicationCommand) => !commands.find((command) => deepEquals(command, this._sanitizeRaw(applicationCommand))));

        if (newCommands.length) this._log(`New: ${newCommands.map((command) => `"${command.name}"`).join(`, `)}`, {
            level: `DEBUG`, system: this.system
        });
        if (deletedCommands.length) this._log(`Delete: ${deletedCommands.map((command) => `"${command.name}"`).join(`, `)}`, {
            level: `DEBUG`, system: this.system
        });

        const promises: Array<Promise<DiscordTypes.APIApplicationCommand | never>> = [];

        newCommands.forEach((command) => promises.push(this.client.rest.createGlobalApplicationCommand(applicationId, command)));
        deletedCommands.forEach((applicationCommand) => promises.push(this.client.rest.deleteGlobalApplicationCommand(applicationId, applicationCommand.id)));

        await Promise.all(promises);

        const pushedCommands = await this.client.rest.getGlobalApplicationCommands(applicationId);
        pushedCommands.forEach((pushedCommand) => {
            const matchingCommandKey = this.commands.findKey((command) => deepEquals(this._commandToRaw(command), this._sanitizeRaw(pushedCommand)));
            const matchingCommand = this.commands.get(matchingCommandKey ?? ``);

            if (matchingCommandKey && matchingCommand) {
                this.commands.delete(matchingCommandKey);
                this.commands.set(pushedCommand.id, matchingCommand);
            }
        });

        this._log(`Created ${newCommands.length} commands, deleted ${deletedCommands.length} commands (Application now owns ${pushedCommands.length} commands)`, {
            level: `INFO`, system: this.system
        });
    }

    /**
     * Callback to run when receiving an interaction.
     * @param interaction The received interaction.
     */
    private _onInteraction (interaction: DiscordTypes.APIInteraction): void {
        switch (interaction.type) {
            case DiscordTypes.InteractionType.ApplicationCommand: {
                const command = this.commands.get(interaction.data.id);
                if (command) {
                    if (command.props.type === DiscordTypes.ApplicationCommandType.ChatInput) {
                        (command as unknown as ChatCommand)?.run?.(new ChatCommandContext(this.client, this, command as any, interaction as any));
                    } else {
                        (command as unknown as ContextMenuCommand)?.run?.(new ContextMenuCommandContext(this.client, this, command as any, interaction as any));
                    }
                }
            }
        }
    }

    /**
     * Converts a command to a Discord API compatible object.
     * @param command The command to convert.
     * @returns The converted command.
     */
    private _commandToRaw (command: Command): Required<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody> {
        if (typeof command.props.type !== `number`) throw new Error(`Cannot push a command with a missing "type" parameter`);
        if (typeof command.props.name !== `string`) throw new Error(`Cannot push a command with a missing "name" parameter`);
        if (command instanceof ChatCommand && typeof command.props.description !== `string`) throw new Error(`Cannot push a command with a missing "description" parameter`);

        return this._sanitizeRaw({
            ...command.props,
            options: command instanceof ChatCommand ? command.parameters : []
        });
    }

    /**
     * Sanitizes a raw command.
     * @param command The command to sanitize.
     * @returns The sanitized command.
     */
    private _sanitizeRaw (command: DiscordTypes.RESTPostAPIApplicationCommandsJSONBody): Required<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody> {
        const raw: Required<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody> = deepClone({
            default_permission: command.default_permission ?? true,
            description: (command as any).description ?? ``,
            description_localizations: command.description_localizations ?? {},
            name: command.name,
            name_localizations: command.name_localizations ?? {},
            options: command.options ?? [],
            type: command.type ?? DiscordTypes.ApplicationCommandType.ChatInput
        });

        traverseObject(raw, (obj) => {
            if (typeof obj.autocomplete === `boolean` && !obj.autocomplete) delete obj.autocomplete;
            if (typeof obj.required === `boolean` && !obj.required) delete obj.required;

            Object.keys(obj).forEach((key) => {
                if (obj[key] === undefined) delete obj[key];
            });
        });

        return raw;
    }
}
