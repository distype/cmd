"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanseMarkdown = void 0;
/**
 * Cleanses a string from markdown formatting, adding back slashes to do so.
 * @param str The string to cleanse.
 * @returns The cleansed string.
 */
function cleanseMarkdown(str) {
    return str
        .replaceAll(`\``, `\\\``)
        .replaceAll(`~`, `\\~`)
        .replaceAll(`*`, `\\*`)
        .replaceAll(`_`, `\\_`)
        .replaceAll(`|`, `\\|`);
}
exports.cleanseMarkdown = cleanseMarkdown;
