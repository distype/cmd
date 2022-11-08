import { Component } from '../structures/CommandHandler';
import { Button } from '../structures/components/Button';
import { ChannelSelect } from '../structures/components/ChannelSelect';
import { MentionableSelect } from '../structures/components/MentionableSelect';
import { RoleSelect } from '../structures/components/RoleSelect';
import { StringSelect } from '../structures/components/StringSelect';
import { UserSelect } from '../structures/components/UserSelect';
import { Embed } from '../structures/extras/Embed';

import { to2dArray } from '@br88c/node-utils';
import { APIInteractionResponseCallbackData, ComponentType } from 'discord-api-types/v10';

/**
 * A message body used by the message factory.
 */
export type FactoryMessage = string | Embed | APIInteractionResponseCallbackData;

/**
 * Components compatible with the message factory.
 */
export type FactoryComponent = Button | ChannelSelect | MentionableSelect | RoleSelect | StringSelect<any> | UserSelect;

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
        let componentMap: Component[][];

        if (!Array.isArray(components)) {
            componentMap = [[components]];
        } else if (!Array.isArray(components[0])) {
            const buttons = (components as Component[]).filter((component) => component instanceof Button);
            const selects = (components as Component[]).filter((component) => !(component instanceof Button));
            componentMap = to2dArray(buttons, 5).concat(...selects.map((select) => [select]));
        } else {
            componentMap = components as Component[][];
        }

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
