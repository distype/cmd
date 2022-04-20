import { Button } from '../structures/Button';
import { Embed } from '../structures/Embed';

import { APIInteractionResponseCallbackData, ComponentType } from 'discord-api-types/v10';

/**
 * A message body.
 */
export type Message = string | Embed | APIInteractionResponseCallbackData;

/**
 * A component.
 */
export type Component = Button;

/**
 * Multiple components.
 * A single component will be sent as the component alone, a component array will be sent as a component row, a 2d component array will be sent as multiple component rows.
 */
export type Components = Component | Component[] | Component[][]

/**
 * Converts a message sent through a command to a Discord API compatible object.
 * @param message The message to convert.
 * @param components Components to add to the message.
 * @returns The converted message.
 * @internal
 */
export function messageFactory (message: Message, components?: Components): APIInteractionResponseCallbackData {
    let res: APIInteractionResponseCallbackData;
    if (typeof message === `string`) res = { content: message };
    else if (message instanceof Embed) res = { embeds: [message.getRaw()] };
    else res = message;

    if (components) {
        let componentMap: Button[][];
        if (!Array.isArray(components)) componentMap = [[components]];
        else if (!Array.isArray(components[0])) componentMap = [components as any];
        else componentMap = components as any;

        res.components = componentMap.map((row) => ({
            type: ComponentType.ActionRow,
            components: row.map((component) => component.getRaw())
        }));
    }

    return res;
}
