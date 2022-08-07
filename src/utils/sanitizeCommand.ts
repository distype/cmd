import { traverseObject } from '@br88c/node-utils';
import * as DiscordTypes from 'discord-api-types/v10';

/**
 * Sanitizes a raw command.
 * @param command The command to sanitize.
 * @returns The sanitized command.
 * @internal
 */
export function sanitizeCommand (command: Omit<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody, `default_permission`>): Required<Omit<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody, `default_permission`>> & { description?: string } {
    const raw: Required<Omit<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody, `default_permission`>> & { description?: string } = {
        description: (command as any).description,
        default_member_permissions: command.default_member_permissions ?? null,
        description_localizations: command.description_localizations ?? {},
        dm_permission: command.dm_permission ?? true,
        name: command.name,
        name_localizations: command.name_localizations ?? {},
        options: command.options ?? [],
        type: command.type ?? DiscordTypes.ApplicationCommandType.ChatInput
    };

    traverseObject(raw, (obj) => {
        if (typeof obj.autocomplete === `boolean` && !obj.autocomplete) delete obj.autocomplete;
        if (typeof obj.required === `boolean` && !obj.required) delete obj.required;

        Object.keys(obj).forEach((key) => {
            if (obj[key] === undefined) delete obj[key];
        });
    });

    return raw;
}
