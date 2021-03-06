import { Button } from '../structures/Button';
import { Embed } from '../structures/Embed';

import { to2dArray } from '@br88c/node-utils';
import { APIInteractionResponseCallbackData, ComponentType } from 'discord-api-types/v10';

/**
 * A message body used by the message factory.
 */
export type FactoryMessage = string | Embed | APIInteractionResponseCallbackData;

/**
 * A component used by the message factory.
 */
export type FactoryComponent = Button;

/**
 * Multiple components.
 * A single component will be sent as the component alone, a component array will be sent as a component row, a 2d component array will be sent as multiple component rows.
 */
export type FactoryComponents = FactoryComponent | FactoryComponent[] | FactoryComponent[][]

/**
 * Converts a message sent through a command to a Discord API compatible object.
 * @param message The message to convert.
 * @param components Components to add to the message.
 * @returns The converted message.
 */
export function messageFactory (message: FactoryMessage, components?: FactoryComponents): APIInteractionResponseCallbackData {
    let res: APIInteractionResponseCallbackData;
    if (typeof message === `string`) res = { content: message };
    else if (message instanceof Embed) res = { embeds: [message.getRaw()] };
    else res = message;

    if (components) {
        let componentMap: FactoryComponent[][];
        if (!Array.isArray(components)) componentMap = [[components]];
        else if (!Array.isArray(components[0])) componentMap = to2dArray(components as FactoryComponent[], 5);
        else componentMap = components as FactoryComponent[][];

        res.components = componentMap.filter((row) => row.length).map((row) => ({
            type: ComponentType.ActionRow,
            components: row.map((component) => component.getRaw())
        }));
    }

    return {
        embeds: [],
        components: [],
        ...res
    };
}
