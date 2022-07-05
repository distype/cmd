import { CommandHandler } from './CommandHandler';
import { Modal } from './Modal';

import { DistypeCmdError, DistypeCmdErrorType } from '../errors/DistypeCmdError';
import { LogCallback } from '../types/Log';
import { FactoryComponents, FactoryMessage, messageFactory } from '../utils/messageFactory';

import * as DiscordTypes from 'discord-api-types/v10';
import { Client, Snowflake } from 'distype';

/**
 * Base context.
 * @internal
 */
export abstract class BaseContext {
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
     * Create context.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor (commandHandler: CommandHandler, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
        this.client = commandHandler.client;
        this.commandHandler = commandHandler;
        this.log = logCallback.bind(logThisArg);
    }
}

/**
 * Base interaction context.
 * @internal
 */
export abstract class BaseInteractionContext<Guild extends boolean> extends BaseContext {
    /**
     * If the interaction has been responded to yet.
     */
    public responded = false;

    /**
     * The ID of the guild that the interaction was ran in.
     */
    public readonly guildId: Guild extends true ? Snowflake : undefined;
    /**
     * The guild's preferred locale, if the interaction was invoked in a guild.
     */
    public readonly guildLocale: Guild extends true ? DiscordTypes.LocaleString : undefined;
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
        version: number
    };
    /**
     * The invoking user's member data.
     */
    public readonly member: Guild extends true ? DiscordTypes.APIInteractionGuildMember : undefined;
    /**
     * The invoking user.
     */
    public readonly user: DiscordTypes.APIUser;

    /**
     * Create interaction context.
     * @param interaction Interaction data.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor (interaction: DiscordTypes.APIApplicationCommandInteraction | DiscordTypes.APIMessageComponentInteraction | DiscordTypes.APIModalSubmitInteraction, commandHandler: CommandHandler, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
        super(commandHandler, logCallback, logThisArg);

        this.guildId = interaction.guild_id ?? (interaction.data as any)?.guild_id;
        this.guildLocale = interaction.guild_locale as any;
        this.interaction = {
            applicationId: interaction.application_id,
            id: interaction.id,
            token: interaction.token,
            type: interaction.type,
            version: interaction.version
        };
        this.member = interaction.member as any;
        this.user = {
            locale: interaction.locale,
            ...(interaction.member?.user ?? interaction.user!)
        };
    }

    /**
     * Calls the command handler's error callback.
     * Note that this does not stop the execution of the command's execute method; you must also call `return`.
     * @param error The error encountered.
     */
    public error (error: string | Error): void {
        this.commandHandler.runError(this, error instanceof Error ? error : new Error(error), false);
    }

    /**
     * Defers the interaction (displays a loading state to the user).
     * @param flags Message flags for the followup after the defer. Specifying `true` is a shorthand for the ephemeral flag.
     */
    public async defer (flags?: DiscordTypes.MessageFlags | number | true): Promise<void> {
        if (this.responded) throw new DistypeCmdError(`Already responded to interaction ${this.interaction.id}`, DistypeCmdErrorType.ALREADY_RESPONDED);

        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.DeferredChannelMessageWithSource,
            data: { flags: flags === true ? DiscordTypes.MessageFlags.Ephemeral : flags }
        });

        this.responded = true;
    }

    /**
     * Sends a message.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     * @returns The ID of the created message, or `@original`.
     */
    public async send (message: FactoryMessage, components?: FactoryComponents, bindComponents = true): Promise<`@original` | Snowflake> {
        const factoryMessage = messageFactory(message, components);

        let id: `@original` | Snowflake;
        if (this.responded) {
            id = (await this.client.rest.createFollowupMessage(this.interaction.applicationId, this.interaction.token, factoryMessage)).id;
        } else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.ChannelMessageWithSource,
                data: factoryMessage
            });
            id = `@original`;

            this.responded = true;
        }

        if (components && bindComponents) this.commandHandler.bindComponents(components);

        return id;
    }

    /**
     * A shorthand for sending messages with the ephemeral flag.
     * @param message The message to send.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     * @returns The ID of the created message, or `@original`.
     */
    public async sendEphemeral (message: FactoryMessage, components?: FactoryComponents, bindComponents = true): Promise<`@original` | Snowflake> {
        const factoryMessage = messageFactory(message, components);

        const id = await this.send({
            ...factoryMessage,
            flags: (factoryMessage.flags ?? 0) | DiscordTypes.MessageFlags.Ephemeral
        });

        if (components && bindComponents) this.commandHandler.bindComponents(components);

        return id;
    }

    /**
     * Edit a response.
     * @param id The ID of the response to edit (`@original` if it is the original response).
     * @param message The new response.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     * @returns The new created response.
     */
    public async edit (id: `@original` | Snowflake, message: FactoryMessage, components?: FactoryComponents, bindComponents = true): Promise<DiscordTypes.RESTPatchAPIInteractionFollowupResult> {
        const factoryMessage = messageFactory(message, components);

        const edit = await this.client.rest.editFollowupMessage(this.interaction.applicationId, this.interaction.token, id, factoryMessage);

        if (components && bindComponents) this.commandHandler.bindComponents(components);

        return edit;
    }

    /**
     * Delete a response.
     * @param id The ID of the response to delete.
     */
    public async delete (id: `@original` | Snowflake): Promise<void> {
        await this.client.rest.deleteFollowupMessage(this.interaction.applicationId, this.interaction.token, id);
    }
}

/**
 * Base interaction context with support for a modal response.
 * @internal
 */
export abstract class BaseInteractionContextWithEditParent<Guild extends boolean> extends BaseInteractionContext<Guild> {
    /**
     * If a deferred message update was sent.
     */
    private _deferredMessageUpdate = false;

    /**
     * The same as defer, except the expected followup response is an edit to the parent message of the component.
     */
    public async editParentDefer (): Promise<void> {
        if (this.responded) throw new DistypeCmdError(`Already responded to interaction ${this.interaction.id}`, DistypeCmdErrorType.ALREADY_RESPONDED);

        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, { type: DiscordTypes.InteractionResponseType.DeferredMessageUpdate });

        this.responded = true;
        this._deferredMessageUpdate = true;
    }

    /**
     * Edits the parent message of the component.
     * @param message The new parent message.
     * @param components Components to add to the message.
     * @param bindComponents If the specified components should be bound to the command handler. Defaults to true.
     */
    public async editParent (message: FactoryMessage, components?: FactoryComponents, bindComponents = true): Promise<void> {
        if (this.responded && !this._deferredMessageUpdate) throw new DistypeCmdError(`Already responded to interaction ${this.interaction.id}`, DistypeCmdErrorType.ALREADY_RESPONDED);

        if (this.responded) {
            await this.client.rest.editFollowupMessage(this.interaction.applicationId, this.interaction.token, `@original`, messageFactory(message, components));
        } else {
            await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
                type: DiscordTypes.InteractionResponseType.UpdateMessage,
                data: messageFactory(message, components)
            });

            this.responded = true;
        }

        if (components && bindComponents) this.commandHandler.bindComponents(components);
    }
}

/**
 * Base message component context.
 * @internal
 */
export abstract class BaseMessageComponentContext<Guild extends boolean> extends BaseInteractionContextWithEditParent<Guild> {
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
     * The message the component is attached to.
     */
    public readonly message: DiscordTypes.APIMessage;

    /**
     * Create component context.
     * @param interaction Interaction data.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor (interaction: DiscordTypes.APIMessageComponentInteraction, commandHandler: CommandHandler, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
        super(interaction, commandHandler, logCallback, logThisArg);

        this.component = {
            customId: interaction.data.custom_id,
            type: interaction.data.component_type
        };
        this.message = interaction.message;
    }

    /**
     * Respond with a modal.
     * The modal's execute method is automatically bound to the command handler.
     * If the command handler already has a bound modal with the same ID, it will be overwritten.
     * A modal will stay bound to the command handler until it's execution context's "unbind()" method is called.
     * @param modal The modal to respond with.
     */
    public async showModal (modal: Modal<any, DiscordTypes.APIModalActionRowComponent[]>): Promise<void> {
        if (this.responded) throw new DistypeCmdError(`Already responded to interaction ${this.interaction.id}`, DistypeCmdErrorType.ALREADY_RESPONDED);

        await this.client.rest.createInteractionResponse(this.interaction.id, this.interaction.token, {
            type: DiscordTypes.InteractionResponseType.Modal,
            data: modal.getRaw()
        });

        this.commandHandler.bindModal(modal);
    }
}

/**
 * Base component expire context.
 * @internal
 */
export abstract class BaseComponentExpireContext extends BaseContext {
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
     * Create component expire context.
     * @param customId The component's custom ID.
     * @param type The component's type.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     * @param logCallback A {@link LogCallback callback}.
     * @param logThisArg A value to use as `this` in the `logCallback`.
     */
    constructor (customId: string, type: DiscordTypes.ComponentType, commandHandler: CommandHandler, logCallback: LogCallback = (): void => {}, logThisArg?: any) {
        super(commandHandler, logCallback, logThisArg);

        this.component = {
            customId, type
        };
    }

    /**
     * Calls the command handler's expire error callback.
     * Note that this does not stop the execution of the command's execute method; you must also call `return`.
     * @param error The error encountered.
     */
    public error (error: string | Error): void {
        this.commandHandler.runExpireError(this, error instanceof Error ? error : new Error(error), false);
    }
}
