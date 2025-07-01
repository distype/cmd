import { Component } from "../structures/CommandHandler";
import { Embed } from "../structures/extras/Embed";
import { APIInteractionResponseCallbackData } from "discord-api-types/v10";
/**
 * A message body used by the message factory.
 */
export type FactoryMessage = string | Embed | APIInteractionResponseCallbackData;
/**
 * Multiple components.
 * A single component will be sent as the component alone, a component array will be sent as a component row, a 2d component array will be sent as multiple component rows.
 */
export type FactoryComponents = Component | Component[] | Component[][];
/**
 * Converts a message sent through a command to a Discord API compatible object.
 * @param message The message to convert.
 * @param components Components to add to the message.
 * @returns The converted message.
 */
export declare function messageFactory(message: FactoryMessage, components?: FactoryComponents): APIInteractionResponseCallbackData;
