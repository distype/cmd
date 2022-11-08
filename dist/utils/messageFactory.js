"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageFactory = void 0;
const Button_1 = require("../structures/components/Button");
const Embed_1 = require("../structures/extras/Embed");
const node_utils_1 = require("@br88c/node-utils");
const v10_1 = require("discord-api-types/v10");
/**
 * Converts a message sent through a command to a Discord API compatible object.
 * @param message The message to convert.
 * @param components Components to add to the message.
 * @returns The converted message.
 */
function messageFactory(message, components) {
    let res;
    if (typeof message === `string`)
        res = { content: message };
    else if (message instanceof Embed_1.Embed)
        res = { embeds: [message.getRaw()] };
    else
        res = message;
    if (components) {
        let componentMap;
        if (!Array.isArray(components)) {
            componentMap = [[components]];
        }
        else if (!Array.isArray(components[0])) {
            const buttons = components.filter((component) => component instanceof Button_1.Button);
            const selects = components.filter((component) => !(component instanceof Button_1.Button));
            componentMap = (0, node_utils_1.to2dArray)(buttons, 5).concat(...selects.map((select) => [select]));
        }
        else {
            componentMap = components;
        }
        res.components = componentMap.filter((row) => row.length).map((row) => ({
            type: v10_1.ComponentType.ActionRow,
            components: row.map((component) => component.getRaw())
        }));
    }
    return {
        embeds: [],
        components: [],
        ...res
    };
}
exports.messageFactory = messageFactory;
