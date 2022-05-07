import * as DiscordTypes from 'discord-api-types/v10';
/**
 * Sanitizes a raw command.
 * @param command The command to sanitize.
 * @returns The sanitized command.
 * @internal
 */
export declare function sanitizeCommand(command: DiscordTypes.RESTPostAPIApplicationCommandsJSONBody): Required<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody>;
