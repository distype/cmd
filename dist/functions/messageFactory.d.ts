import { Button } from '../structures/Button';
import { Embed } from '../structures/Embed';
import { APIInteractionResponseCallbackData } from 'discord-api-types/v10';
/**
 * A message body.
 */
export declare type Message = string | Embed | APIInteractionResponseCallbackData;
/**
 * A component.
 */
export declare type Component = Button;
/**
 * Multiple components.
 * A single component will be sent as the component alone, a component array will be sent as a component row, a 2d component array will be sent as multiple component rows.
 */
export declare type Components = Component | Component[] | Component[][];
/**
 * Converts a message sent through a command to a Discord API compatible object.
 * @param message The message to convert.
 * @param components Components to add to the message.
 * @returns The converted message.
 * @internal
 */
export declare function messageFactory(message: Message, components?: Components): APIInteractionResponseCallbackData;
