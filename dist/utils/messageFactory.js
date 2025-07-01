"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageFactory = messageFactory;
const Embed_1 = require("../structures/extras/Embed");
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
            const buttons = components.filter((component) => component.getRaw().type === v10_1.ComponentType.Button);
            const selects = components.filter((component) => component.getRaw().type !== v10_1.ComponentType.Button);
            componentMap = buttons
                .reduce((p, c) => p[p.length - 1].length === 5
                ? p.concat([[c]])
                : p.map((v, i) => (i !== p.length - 1 ? v : [...v, c])), [[]])
                .filter((row) => row.length);
        }
        else {
            componentMap = components;
        }
        res.components = componentMap
            .filter((row) => row.length)
            .map((row) => ({
            type: v10_1.ComponentType.ActionRow,
            components: row.map((component) => component.getRaw()),
        }));
    }
    return {
        embeds: [],
        components: [],
        ...res,
    };
}
