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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeCommand = sanitizeCommand;
exports.sanitizeGuildCommand = sanitizeGuildCommand;
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * Sanitizes a raw global command.
 * @param command The command to sanitize.
 * @returns The sanitized command.
 * @internal
 */
function sanitizeCommand(command) {
    const raw = {
        contexts: command.contexts ?? [],
        description: command.description ?? ``,
        default_member_permissions: command.default_member_permissions ?? null,
        description_localizations: command.description_localizations ?? {},
        integration_types: command.integration_types ?? [],
        name: command.name,
        name_localizations: command.name_localizations ?? {},
        nsfw: command.nsfw ?? false,
        options: command.options ?? [],
        type: command.type ?? DiscordTypes.ApplicationCommandType.ChatInput,
    };
    traverseCommand(raw);
    return raw;
}
/**
 * Sanitizes a raw guild command.
 * @param command The command to sanitize.
 * @returns The sanitized command.
 * @internal
 */
function sanitizeGuildCommand(command) {
    const raw = {
        contexts: command.contexts ?? [],
        description: command.description ?? ``,
        default_member_permissions: command.default_member_permissions ?? null,
        description_localizations: command.description_localizations ?? {},
        integration_types: command.integration_types ?? [],
        name: command.name,
        name_localizations: command.name_localizations ?? {},
        nsfw: command.nsfw ?? false,
        options: command.options ?? [],
        type: command.type ?? DiscordTypes.ApplicationCommandType.ChatInput,
    };
    traverseCommand(raw);
    return raw;
}
/**
 * Traverses a command to sanitize options.
 */
function traverseCommand(command) {
    traverseObject(command, (obj) => {
        if (obj.options) {
            obj.options = obj.options.map((option) => ({
                ...option,
                autocomplete: option.autocomplete ?? false,
                description_localizations: obj.description_localizations ?? {},
                name_localizations: obj.name_localizations ?? {},
                required: option.required ?? false,
            }));
        }
        Object.keys(obj).forEach((key) => {
            if (obj[key] === undefined)
                delete obj[key];
        });
    });
}
function traverseObject(obj, callback) {
    if (obj === null || typeof obj !== `object`)
        return;
    const traversedProps = new Set();
    const traverse = (currentObj) => {
        if (traversedProps.has(currentObj))
            return;
        traversedProps.add(currentObj);
        callback(currentObj);
        Object.keys(currentObj).forEach((key) => {
            if (currentObj[key] !== null && typeof currentObj[key] === `object`)
                traverse(currentObj[key]);
        });
    };
    traverse(obj);
}
