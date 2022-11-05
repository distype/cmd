import * as DiscordTypes from 'discord-api-types/v10';
export declare type RemoveDeprecated<T> = Omit<T, `default_permission`>;
export declare type SanitizedCommand = Required<Omit<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody, `default_permission` | `dm_permission`>> & {
    description: string;
    dm_permission?: boolean;
};
export declare type SanitizedGuildCommand = Required<Omit<DiscordTypes.RESTPostAPIApplicationGuildCommandsJSONBody, `default_permission`>> & {
    description: string;
};
/**
 * Sanitizes a raw global command.
 * @param command The command to sanitize.
 * @returns The sanitized command.
 * @internal
 */
export declare function sanitizeCommand(command: RemoveDeprecated<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody>): SanitizedCommand;
/**
 * Sanitizes a raw guild command.
 * @param command The command to sanitize.
 * @returns The sanitized command.
 * @internal
 */
export declare function sanitizeGuildCommand(command: RemoveDeprecated<DiscordTypes.RESTPostAPIApplicationGuildCommandsJSONBody>): SanitizedGuildCommand;
