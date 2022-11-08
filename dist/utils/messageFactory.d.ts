import { Button } from '../structures/components/Button';
import { ChannelSelect } from '../structures/components/ChannelSelect';
import { MentionableSelect } from '../structures/components/MentionableSelect';
import { RoleSelect } from '../structures/components/RoleSelect';
import { StringSelect } from '../structures/components/StringSelect';
import { UserSelect } from '../structures/components/UserSelect';
import { Embed } from '../structures/extras/Embed';
import { APIInteractionResponseCallbackData } from 'discord-api-types/v10';
/**
 * A message body used by the message factory.
 */
export declare type FactoryMessage = string | Embed | APIInteractionResponseCallbackData;
/**
 * Components compatible with the message factory.
 */
export declare type FactoryComponent = Button | ChannelSelect | MentionableSelect | RoleSelect | StringSelect<any> | UserSelect;
/**
 * Multiple components.
 * A single component will be sent as the component alone, a component array will be sent as a component row, a 2d component array will be sent as multiple component rows.
 */
export declare type FactoryComponents = FactoryComponent | FactoryComponent[] | FactoryComponent[][];
/**
 * Converts a message sent through a command to a Discord API compatible object.
 * @param message The message to convert.
 * @param components Components to add to the message.
 * @returns The converted message.
 */
export declare function messageFactory(message: FactoryMessage, components?: FactoryComponents): APIInteractionResponseCallbackData;
