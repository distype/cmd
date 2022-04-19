"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageFactory = void 0;
const Embed_1 = require("../structures/Embed");
/**
 * Converts a message sent through a command to a Discord API compatible object.
 * @param message The message to convert.
 * @returns The converted message.
 * @internal
 */
function messageFactory(message) {
    if (typeof message === `string`)
        return { content: message };
    else if (message instanceof Embed_1.Embed)
        return { embeds: [message.getRaw()] };
    else
        return message;
}
exports.messageFactory = messageFactory;
