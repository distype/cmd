"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeCommand = void 0;
const node_utils_1 = require("@br88c/node-utils");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * Sanitizes a raw command.
 * @param command The command to sanitize.
 * @returns The sanitized command.
 */
function sanitizeCommand(command) {
    const raw = (0, node_utils_1.deepClone)({
        default_permission: command.default_permission ?? true,
        description: command.description ?? ``,
        description_localizations: command.description_localizations ?? {},
        name: command.name,
        name_localizations: command.name_localizations ?? {},
        options: command.options ?? [],
        type: command.type ?? DiscordTypes.ApplicationCommandType.ChatInput
    });
    (0, node_utils_1.traverseObject)(raw, (obj) => {
        if (typeof obj.autocomplete === `boolean` && !obj.autocomplete)
            delete obj.autocomplete;
        if (typeof obj.required === `boolean` && !obj.required)
            delete obj.required;
        Object.keys(obj).forEach((key) => {
            if (obj[key] === undefined)
                delete obj[key];
        });
    });
    return raw;
}
exports.sanitizeCommand = sanitizeCommand;
