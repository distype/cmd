import { CommandHandler } from './CommandHandler';
import { Modal } from './Modal';

import { DistypeCmdError, DistypeCmdErrorType } from '../errors/DistypeCmdError';
import { LogCallback } from '../types/Log';
import { FactoryComponents, FactoryMessage, messageFactory } from '../utils/messageFactory';

import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';

/**
 * Base interaction context.
 * @internal
 */
export class BaseInteractionContext {
    /**
     * The {@link Client client} the context is bound to.
     */
    public client: Client;
    /**
     * The {@link CommandHandler command handler} that invoked the context.
     */
    public commandHandler: CommandHandler;
    /**
     * Log a message using the {@link CommandHandler command handler}'s {@link LogCallback log callback}.
     */
    public log: LogCallback;
    /**
     * Message IDs of sent responses.
     */
    public responses: Array<Snowflake | `@original` | `defer`> = [];

    /**
     * The ID of the guild that the interaction was ran in.
     */
    public readonly guildId?: Snowflake;
    /**
     * The guild's preferred locale, if the interaction was invoked in a guild.
     */
    public readonly guildLocale?: DiscordTypes.LocaleString;
    /**
     * Interaction data.
     */
    public readonly interaction: {
        /**
         * The ID of the application the interaction belongs to.
         */
        applicationId: Snowflake
        /**
         * The interaction's ID.
         */
        id: Snowflake
        /**
         * The interaction's token.
         */
        token: string
        /**
         * The interaction's type.
         */
        type: DiscordTypes.InteractionType
        /**
         * The interaction's version.
         */
        version: 1
    };
    /**
     * The invoking user's member data.
     */
    public readonly member?: DiscordTypes.APIInteractionGuildMember;
    /**
     * The invoking user.
     */
    public readonly user: DiscordTypes.APIUser;

    /**
     * Create interaction context.
     * @param commandHandler The command handler that invoked the context.
     * @param interaction Interaction data.
     */
    constructor (commandHandler: CommandHandler, interaction: DiscordTypes.APIApplicationCommandInteraction | DiscordTypes.APIMessageComponentInteraction | DiscordTypes.APIModalSubmitInteraction, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
        this.client = commandHandler.client;
        this.commandHandler = commandHandler;

        this.guildId = interaction.guild_id ?? (interaction.data as any)?.guild_id;
        this.guildLocale = interaction.guild_locale;
        this.interaction = {
            applicationId: interaction.application_id,
            id: interaction.id,
            token: interaction.token,
            type: interaction.type,
            version: interaction.version
        };
        this.member = interaction.member;
        this.user = {
            ...(interaction.member?.user ?? interaction.user!),
            locale: interaction.locale ?? interaction.locale
        };

        this.log = logCallback.bind(logThisArg);
    }

    /**
     * Calls the command handler's error callback.
     * Note that this does not stop the execution of the command's execute method; you must also call `return`.
     * @param error The error encountered.
     */
    public error (error: string | Error): void {
        this.commandHandler.runError(error instanceof Error ? error : new Error(error), this as any, false);
    }

    /**
     * Defers the interaction (displays a loading state to the user).
     * @param flags Message flags for the followup after the defer. Specifying `true` is a shorthand for the ephemeral flag.
     */
    public async defer (flags?: DiscordTypes.MessageFlags | number | true): Promise<`defer`> {
        if (this.responses.length) throw new DistypeCmdError(`Cannot defer, a response has already been created`, DistypeCmdErrorType.CANNOT_DEFER);

        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.DeferredChannelMessageWithSource,
            data: { flags: flags === true ? DiscordTypes.MessageFlags.Ephemeral : flags }
        });

        this.responses.push(`defer`);
        return `defer`;
    }

    /**
     * Sends a message.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @returns The ID of the created message, or `@original`.
     */
    public async send (message: FactoryMessage, components?: FactoryComponents): Promise<Snowflake | `@original`> {
        let id: Snowflake | `@original`;

        if (this.responses.length) {
            id = (await this.client.rest.createFollowupMessage(this.interaction.applicationId, this.interaction.token, messageFactory(message))).id;
        } else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
                data: messageFactory(message, components)
            });
            id = `@original`;
        }

        this.responses.push(id);
        return id;
    }

    /**
     * A shorthand for sending messages with the ephemeral flag.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @returns The ID of the created message, or `@original`.
     */
    public async sendEphemeral (message: FactoryMessage, components?: FactoryComponents): Promise<Snowflake | `@original`> {
        const data = messageFactory(message, components);
        return await this.send({
            ...data,
            flags: (data.flags ?? 0) | DiscordTypes.MessageFlags.Ephemeral
        });
    }

    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @param components Components to add to the message.
     * @returns The new created response.
     */
    public async edit (id: Snowflake | `@original`, message: FactoryMessage, components?: FactoryComponents): Promise<DiscordTypes.RESTPatchAPIInteractionFollowupResult> {
        if (!this.responses.includes(id)) throw new DistypeCmdError(`No response found matching the ID "${id}"`, DistypeCmdErrorType.RESPONSE_NOT_FOUND);
        return await this.client.rest.editFollowupMessage(this.interaction.applicationId, this.interaction.token, id, messageFactory(message, components));
    }

    /**
     * Delete a response.
     * @param id The ID of the response to delete.
     */
    public async delete (id: Snowflake | `@original`): Promise<void> {
        if (!this.responses.includes(id)) throw new DistypeCmdError(`No response found matching the ID "${id}"`, DistypeCmdErrorType.RESPONSE_NOT_FOUND);
        await this.client.rest.deleteFollowupMessage(this.interaction.applicationId, this.interaction.token, id);
        this.responses = this.responses.filter((response) => response !== id);
    }
}

/**
 * Base interaction context with a modal.
 * @internal
 */
export class BaseInteractionContextWithModal extends BaseInteractionContext {
    public override responses: Array<Snowflake | `@original` | `defer` | `modal`> = [];

    /**
     * Respond with a modal.
     * The modal's execute method is automatically bound to the command handler.
     * If the command handler already has a bound modal with the same ID, it will be overwritten.
     * A modal will stay bound to the command handler until it's execution context's "unbind()" method is called.
     * @param modal The modal to respond with.
     */
    public async showModal (modal: Modal<any, DiscordTypes.APIModalActionRowComponent[]>): Promise<`modal`> {
        if (this.responses.length) throw new DistypeCmdError(`Cannot open a modal, a response has already been created`, DistypeCmdErrorType.CANNOT_OPEN_MODAL);

        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.Modal,
            data: modal.getRaw()
        });

        this.commandHandler.bindModal(modal);

        this.responses.push(`modal`);
        return `modal`;
    }
}

/**
 * Base context for components.
 * @internal
 */
export class BaseComponentContext extends BaseInteractionContextWithModal {
    public override responses: Array<Snowflake | `@original` | `defer` | `modal` | `deferedit` | `editparent`> = [];

    /**
     * Component data.
     */
    public readonly component: {
        /**
         * The component's custom ID.
         */
        customId: string
        /**
         * The component's type.
         */
        type: DiscordTypes.ComponentType
    };

    /**
     * Create interaction context.
     * @param commandHandler The command handler that invoked the context.
     * @param interaction Interaction data.
     */
    constructor (commandHandler: CommandHandler, interaction: DiscordTypes.APIMessageComponentInteraction, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
        super(commandHandler, interaction, logCallback, logThisArg);

        this.component = {
            customId: interaction.data.custom_id,
            type: interaction.data.component_type
        };
    }

    /**
     * The same as defer, except the expected followup response is an edit to the parent message of the component.
     */
    public async editParentDefer (): Promise<`deferedit`> {
        if (this.responses.length) throw new DistypeCmdError(`Cannot defer, a response has already been created`, DistypeCmdErrorType.CANNOT_DEFER);

        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, { type: DiscordTypes.InteractionResponseType.DeferredMessageUpdate });

        this.responses.push(`deferedit`);
        return `deferedit`;
    }

    /**
     * Edits the parent message of the component.
     * @param message The new parent message.
     * @param components Components to add to the message.
     */
    public async editParent (message: FactoryMessage, components?: FactoryComponents): Promise<`editparent`> {
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.UpdateMessage,
            data: messageFactory(message, components)
        });

        return `editparent`;
    }
}
