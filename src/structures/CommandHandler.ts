import { Button, ButtonContext } from './Button';
import { ChatCommand, ChatCommandContext, ChatCommandProps } from './ChatCommand';
import { ContextMenuCommand, ContextMenuCommandContext, ContextMenuCommandProps } from './ContextMenuCommand';
import { Modal, ModalContext, ModalProps } from './Modal';

import { DistypeCmdError, DistypeCmdErrorType } from '../errors/DistypeCmdError';
import { sanitizeCommand } from '../functions/sanitizeCommand';
import { LogCallback } from '../types/Log';

import { deepEquals, ExtendedMap } from '@br88c/node-utils';
import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';
import { BaseContext } from './BaseContext';

export type Command = ChatCommand<ChatCommandProps, DiscordTypes.APIApplicationCommandBasicOption[]> | ContextMenuCommand<ContextMenuCommandProps>;

export class CommandHandler {
    /**
     * The command handler's buttons.
     */
    public buttons: ExtendedMap<string, Button> = new ExtendedMap();
    /**
     * The client the command handler is bound to.
     */
    public client: Client;
    /**
     * The command handler's commands.
     */
    public commands: ExtendedMap<Snowflake | `unknown${number}`, Command> = new ExtendedMap();
    /**
     * The command handler's modals.
     */
    public modals: ExtendedMap<string, Modal<ModalProps>> = new ExtendedMap();
    /**
     * Called when a command encounters an error.
     * @param error The error encountered.
     * @param unexpected If the error was unexpected (not called via `ctx.error()`).
     * @internal
     */
    public runError: (error: Error, ctx: BaseContext, unexpected: boolean) => void
        = (error, ctx, unexpected) => this._log(`${unexpected ? `Unexpected ` : ``}${error.name} when running interaction ${ctx.interaction.id}: ${error.message}`, {
            level: `ERROR`, system: this.system
        });

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
     * Bind a command to the command handler.
     * @param command The command to add.
     */
    public bindCommand (command: ChatCommand<any, any> | ContextMenuCommand<any>): this {
        command.getRaw();

        if (this.commands.find((c) => c.props.name === command.props.name && c.props.type === command.props.type)) throw new DistypeCmdError(`Commands of the same type cannot share names`, DistypeCmdErrorType.DUPLICATE_COMMAND_NAME);

        this.commands.set(`unknown${this._unknownNonce}`, command);
        this._unknownNonce++;

        this._log(`Added command "${command.props.name}" (${DiscordTypes.ApplicationCommandType[command.props.type]})`, {
            level: `DEBUG`, system: this.system
        });
        return this;
    }

    /**
     * Bind a button to the command handler.
     * @param button The button to bind.
     */
    public bindButton (button: Button): this {
        const raw: DiscordTypes.APIButtonComponentWithCustomId = button.getRaw() as any;
        if (typeof raw.custom_id !== `string` || this.buttons.find((b, customId) => b === button && customId === raw.custom_id)) return this;

        if (this.buttons.find((_, customId) => customId === raw.custom_id)) this._log(`Overriding existing component with ID ${raw.custom_id}`, {
            level: `DEBUG`, system: this.system
        });

        this.buttons.set(raw.custom_id, button);

        this._log(`Bound button with custom ID ${raw.custom_id}`, {
            level: `DEBUG`, system: this.system
        });
        return this;
    }

    /**
     * Unbind a button from the command handler.
     * @param id The button's custom ID.
     */
    public unbindButton (id: string): this {
        this.buttons.delete(id);
        return this;
    }

    /**
     * Bind a modal to the command handler.
     * @param modal The modal to bind.
     */
    public bindModal (modal: Modal<any, any>): this {
        if (this.modals.find((m, customId) => m === modal && customId === modal.props.custom_id)) return this;

        modal.getRaw();

        if (this.modals.find((_, customId) => customId === modal.props.custom_id)) this._log(`Overriding existing modal with ID ${modal.props.custom_id}`, {
            level: `DEBUG`, system: this.system
        });

        this.modals.set(modal.props.custom_id, modal);

        this._log(`Bound modal with custom ID ${modal.props.custom_id}`, {
            level: `DEBUG`, system: this.system
        });
        return this;
    }

    /**
     * Unbind a modal from the command handler.
     * @param id The modal's custom ID.
     */
    public unbindModal (id: string): this {
        this.modals.delete(id);
        return this;
    }

    /**
     * Pushes added / changed / deleted slash commands to Discord.
     */
    public async push (applicationId: Snowflake | undefined = this.client.gateway.user?.id ?? undefined): Promise<void> {
        if (!applicationId) throw new DistypeCmdError(`Application ID is undefined`, DistypeCmdErrorType.APPLICATION_ID_UNDEFINED);

        const commands = this.commands.map((command) => command.getRaw());
        this._log(`Pushing ${commands.length} commands`, {
            level: `INFO`, system: this.system
        });

        const applicationCommands = await this.client.rest.getGlobalApplicationCommands(applicationId);
        this._log(`Found ${applicationCommands.length} registered commands`, {
            level: `DEBUG`, system: this.system
        });

        const newCommands = commands.filter((command) => !applicationCommands.find((applicationCommand) => deepEquals(command, sanitizeCommand(applicationCommand))));
        const deletedCommands = applicationCommands.filter((applicationCommand) => !commands.find((command) => deepEquals(command, sanitizeCommand(applicationCommand))));

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

        const pushedCommands = newCommands.length + deletedCommands.length ? await this.client.rest.getGlobalApplicationCommands(applicationId) : applicationCommands;
        pushedCommands.forEach((pushedCommand) => {
            const matchingCommandKey = this.commands.findKey((command) => deepEquals(command.getRaw(), sanitizeCommand(pushedCommand)));
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
     * Set the error callback function to run when a command's execution fails
     * @param erroCallback The callback to use.
     */
    public setError (erroCallback: CommandHandler[`runError`]): void {
        this.runError = erroCallback;
    }

    /**
     * Callback to run when receiving an interaction.
     * @param interaction The received interaction.
     */
    private async _onInteraction (interaction: DiscordTypes.APIInteraction): Promise<void> {
        let run: any;
        let ctx: any;

        switch (interaction.type) {
            case DiscordTypes.InteractionType.ApplicationCommand: {
                const command = this.commands.get(interaction.data.id);
                if (command) {
                    if (command.props.type === DiscordTypes.ApplicationCommandType.ChatInput) {
                        run = command.run;
                        ctx = new ChatCommandContext(this, command as any, interaction as any);
                    } else {
                        run = command.run;
                        ctx = new ContextMenuCommandContext(this, command as any, interaction as any);
                    }
                }

                break;
            }

            case DiscordTypes.InteractionType.MessageComponent: {
                if (interaction.data.component_type === DiscordTypes.ComponentType.Button) {
                    const button = this.buttons.get(interaction.data.custom_id);
                    if (button) {
                        run = button.run;
                        ctx = new ButtonContext(this, interaction);
                    }
                }

                break;
            }

            case DiscordTypes.InteractionType.ModalSubmit: {
                const modal = this.modals.get(interaction.data.custom_id);
                if (modal) {
                    run = modal.run;
                    ctx = new ModalContext(this, modal, interaction);
                }

                break;
            }
        }

        if (typeof run === `function` && ctx) {
            try {
                const call = run(ctx);

                if (call instanceof Promise) {
                    const reject = await call.then(() => false).catch((error: Error) => error);
                    if (reject !== false) throw reject;
                }
            } catch (error: any) {
                try {
                    this.runError(error instanceof Error ? error : new Error(error), ctx, true);
                } catch (eError: any) {
                    this._log(`Unable to run error callback on interaction ${interaction.id}: ${(eError?.message ?? eError) ?? `Unknown reason`}`, {
                        level: `ERROR`, system: this.system
                    });
                }
            }
        }
    }
}
