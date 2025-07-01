import { Component } from "../structures/CommandHandler";
import { Embed } from "../structures/extras/Embed";

import {
  APIInteractionResponseCallbackData,
  ComponentType,
} from "discord-api-types/v10";

/**
 * A message body used by the message factory.
 */
export type FactoryMessage =
  | string
  | Embed
  | APIInteractionResponseCallbackData;

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
export function messageFactory(
  message: FactoryMessage,
  components?: FactoryComponents,
): APIInteractionResponseCallbackData {
  let res: APIInteractionResponseCallbackData;
  if (typeof message === `string`) res = { content: message };
  else if (message instanceof Embed) res = { embeds: [message.getRaw()] };
  else res = message;

  if (components) {
    let componentMap: Component[][];

    if (!Array.isArray(components)) {
      componentMap = [[components]];
    } else if (!Array.isArray(components[0])) {
      const buttons = (components as Component[]).filter(
        (component) => component.getRaw().type === ComponentType.Button,
      );
      const selects = (components as Component[]).filter(
        (component) => component.getRaw().type !== ComponentType.Button,
      );
      componentMap = buttons
        .reduce(
          (p, c) =>
            p[p.length - 1].length === 5
              ? p.concat([[c]])
              : p.map((v, i) => (i !== p.length - 1 ? v : [...v, c])),
          [[]] as Component[][],
        )
        .filter((row) => row.length);
    } else {
      componentMap = components as Component[][];
    }

    res.components = componentMap
      .filter((row) => row.length)
      .map((row) => ({
        type: ComponentType.ActionRow,
        components: row.map((component) => component.getRaw()),
      }));
  }

  return {
    embeds: [],
    components: [],
    ...res,
  };
}
