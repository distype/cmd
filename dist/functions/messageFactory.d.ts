import { Embed } from '../structures/Embed';
import { APIInteractionResponseCallbackData } from 'discord-api-types/v10';
/**
 * A response to a command.
 */
export declare type CommandMessage = string | Embed | APIInteractionResponseCallbackData;
/**
 * Converts a message sent through a command to a Discord API compatible object.
 * @param message The message to convert.
 * @returns The converted message.
 * @internal
 */
export declare function messageFactory(message: CommandMessage): APIInteractionResponseCallbackData;
