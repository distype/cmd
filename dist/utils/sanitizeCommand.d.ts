import * as DiscordTypes from "discord-api-types/v10";
export type RemoveDeprecated<T> = Omit<T, `default_permission` | `dm_permission` | `handler`>;
export type SanitizedCommand = Required<RemoveDeprecated<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody>> & {
    description: string;
};
export type SanitizedGuildCommand = Required<RemoveDeprecated<DiscordTypes.RESTPostAPIApplicationGuildCommandsJSONBody>> & {
    description: string;
};
/**
 * Sanitizes a raw global command.
 * @param command The command to sanitize.
 * @returns The sanitized command.
 * @internal
 */
export declare function sanitizeCommand(command: DiscordTypes.APIApplicationCommand): SanitizedCommand;
/**
 * Sanitizes a raw guild command.
 * @param command The command to sanitize.
 * @returns The sanitized command.
 * @internal
 */
export declare function sanitizeGuildCommand(command: Omit<DiscordTypes.APIApplicationCommand, "dm_permission">): SanitizedGuildCommand;
