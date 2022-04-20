import { CommandHandler } from './CommandHandler';
import { Modal } from './Modal';

import { Message, messageFactory } from '../functions/messageFactory';

import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';

/**
 * Base context.
 */
export class BaseContext {
    /**
     * The client the context is bound to.
     */
    public client: Client;
    /**
     * The command handler that invoked the context.
     */
    public commandHandler: CommandHandler;
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
    constructor (commandHandler: CommandHandler, interaction: DiscordTypes.APIApplicationCommandInteraction | DiscordTypes.APIMessageComponentInteraction | DiscordTypes.APIModalSubmitInteraction) {
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
    }

    /**
     * Calls the command handler's error callback.
     * Note that this does not stop the execution of the command's execute method; you must also call `return`.
     * @param error The error encountered.
     */
    public error (error: Error): void {
        this.commandHandler.runError(error, this as any, false);
    }

    /**
     * Defers the interaction (displays a loading state to the user).
     * @param flags Message flags for the followup after the defer.
     */
    public async defer (flags?: DiscordTypes.MessageFlags): Promise<`defer`> {
        if (this.responses.length) throw new Error(`Cannot defer, a response has already been created`);

        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.DeferredChannelMessageWithSource,
            data: { flags }
        });

        this.responses.push(`defer`);
        return `defer`;
    }

    /**
     * Sends a message.
     * @param message The message to send.
     * @returns The ID of the created message, or `@original`.
     */
    public async send (message: Message): Promise<Snowflake | `@original`> {
        let id: Snowflake | `@original`;

        if (this.responses.length) {
            id = (await this.client.rest.createFollowupMessage(this.interaction.applicationId, this.interaction.token, messageFactory(message))).id;
        } else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
                data: messageFactory(message)
            });
            id = `@original`;
        }

        this.responses.push(id);
        return id;
    }

    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @returns The new created response.
     */
    public async edit (id: Snowflake | `@original`, message: Message): Promise<DiscordTypes.RESTPatchAPIInteractionFollowupResult> {
        if (!this.responses.includes(id)) throw new Error(`No response found matching the ID "${id}"`);
        return await this.client.rest.editFollowupMessage(this.interaction.applicationId, this.interaction.token, id, messageFactory(message));
    }

    /**
     * Delete a response.
     * @param id The ID of the reponse to delete.
     */
    public async delete (id: Snowflake | `@original`): Promise<void> {
        if (!this.responses.includes(id)) throw new Error(`No response found matching the ID "${id}"`);
        await this.client.rest.deleteFollowupMessage(this.interaction.applicationId, this.interaction.token, id);
        this.responses = this.responses.filter((response) => response !== id);
    }
}

/**
 * Base context with a modal.
 */
export class BaseContextWithModal extends BaseContext {
    public override responses: Array<Snowflake | `@original` | `defer` | `modal`> = [];

    /**
     * Respond with a modal.
     * The modal's execute method is automatically bound to the command handler.
     * If the command handler already has a bound modal with the same ID, it will be overwritten.
     * A modal will stay bound to the command handler until it's exection context's "unbind()" method is called.
     * @param modal The modal to respond with.
     */
    public async showModal (modal: Modal<any, DiscordTypes.APIModalActionRowComponent[]>): Promise<`modal`> {
        if (this.responses.length) throw new Error(`Cannot open a modal, a response has already been created`);

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
 */
export class BaseComponentContext extends BaseContextWithModal {
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
    constructor (commandHandler: CommandHandler, interaction: DiscordTypes.APIMessageComponentInteraction) {
        super(commandHandler, interaction);

        this.component = {
            customId: interaction.data.custom_id,
            type: interaction.data.component_type
        };
    }

    /**
     * The same as defer, except the expected followup response is an edit to the parent message of the component.
     */
    public async editParentDefer (): Promise<`deferedit`> {
        if (this.responses.length) throw new Error(`Cannot defer, a response has already been created`);

        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, { type: DiscordTypes.InteractionResponseType.DeferredMessageUpdate });

        this.responses.push(`deferedit`);
        return `deferedit`;
    }

    /**
     * Edits the parent message of the component.
     * @param message The new parent message.
     */
    public async editParent (message: Message): Promise<`editparent`> {
        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.UpdateMessage,
            data: messageFactory(message)
        });

        return `editparent`;
    }
}
