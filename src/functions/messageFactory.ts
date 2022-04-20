import { Button } from '../structures/Button';
import { Embed } from '../structures/Embed';

import { APIInteractionResponseCallbackData, ComponentType } from 'discord-api-types/v10';

/**
 * A response to a command.
 */
export type Message = string | Button | Embed | APIInteractionResponseCallbackData;

/**
 * Converts a message sent through a command to a Discord API compatible object.
 * @param message The message to convert.
 * @returns The converted message.
 * @internal
 */
export function messageFactory (message: Message): APIInteractionResponseCallbackData {
    if (typeof message === `string`) return { content: message };
    else if (message instanceof Button) return { components: [
        {
            type: ComponentType.ActionRow,
            components: [message.getRaw()]
        }
    ] };
    else if (message instanceof Embed) return { embeds: [message.getRaw()] };
    else return message;
}
