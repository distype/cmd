import { traverseObject } from '@br88c/node-utils';
import * as DiscordTypes from 'discord-api-types/v10';

export type RemoveDeprecated <T> = Omit<T, `default_permission`>;

export type SanitizedCommand = Required<Omit<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody, `default_permission` | `dm_permission`>> & { description: string, dm_permission?: boolean };
export type SanitizedGuildCommand = Required<Omit<DiscordTypes.RESTPostAPIApplicationGuildCommandsJSONBody, `default_permission`>> & { description: string };

/**
 * Sanitizes a raw global command.
 * @param command The command to sanitize.
 * @returns The sanitized command.
 * @internal
 */
export function sanitizeCommand (command: RemoveDeprecated<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody>): SanitizedCommand {
    const raw: SanitizedCommand = {
        description: (command as any).description ?? ``,
        default_member_permissions: command.default_member_permissions ?? null,
        description_localizations: command.description_localizations ?? {},
        dm_permission: command.dm_permission === false ? false : undefined,
        name: command.name,
        name_localizations: command.name_localizations ?? {},
        options: command.options ?? [],
        type: command.type ?? DiscordTypes.ApplicationCommandType.ChatInput
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
export function sanitizeGuildCommand (command: RemoveDeprecated<DiscordTypes.RESTPostAPIApplicationGuildCommandsJSONBody>): SanitizedGuildCommand {
    const raw: SanitizedCommand = {
        description: (command as any).description ?? ``,
        default_member_permissions: command.default_member_permissions ?? null,
        description_localizations: command.description_localizations ?? {},
        name: command.name,
        name_localizations: command.name_localizations ?? {},
        options: command.options ?? [],
        type: command.type ?? DiscordTypes.ApplicationCommandType.ChatInput
    };

    traverseCommand(raw);
    return raw;
}

/**
 * Traverses a command to sanitize options.
 */
function traverseCommand (command: any): void {
    traverseObject(command, (obj) => {
        if (typeof obj.autocomplete === `boolean` && !obj.autocomplete) delete obj.autocomplete;
        if (typeof obj.required === `boolean` && !obj.required) delete obj.required;

        Object.keys(obj).forEach((key) => {
            if (obj[key] === undefined) delete obj[key];
        });
    });
}
