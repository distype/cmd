import * as DiscordTypes from "discord-api-types/v10";

export type RemoveDeprecated<T> = Omit<
  T,
  `default_permission` | `dm_permission` | `handler`
>;

export type SanitizedCommand = Required<
  RemoveDeprecated<DiscordTypes.RESTPostAPIApplicationCommandsJSONBody>
> & { description: string };
export type SanitizedGuildCommand = Required<
  RemoveDeprecated<DiscordTypes.RESTPostAPIApplicationGuildCommandsJSONBody>
> & { description: string };

/**
 * Sanitizes a raw global command.
 * @param command The command to sanitize.
 * @returns The sanitized command.
 * @internal
 */
export function sanitizeCommand(
  command: DiscordTypes.APIApplicationCommand,
): SanitizedCommand {
  const raw: SanitizedCommand = {
    contexts: command.contexts ?? [],
    description: (command as any).description ?? ``,
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
export function sanitizeGuildCommand(
  command: Omit<DiscordTypes.APIApplicationCommand, "dm_permission">,
): SanitizedGuildCommand {
  const raw: SanitizedGuildCommand = {
    contexts: command.contexts ?? [],
    description: (command as any).description ?? ``,
    default_member_permissions: command.default_member_permissions ?? null,
    description_localizations: command.description_localizations ?? {},
    integration_types: command.integration_types ?? [],
    name: command.name,
    name_localizations: command.name_localizations ?? {},
    nsfw: command.nsfw ?? false,
    options: command.options ?? [],
    type:
      (command.type as any) ?? DiscordTypes.ApplicationCommandType.ChatInput,
  };

  traverseCommand(raw);
  return raw;
}

/**
 * Traverses a command to sanitize options.
 */
function traverseCommand(command: any): void {
  traverseObject(command, (obj) => {
    if (obj.options) {
      obj.options = obj.options.map((option: any) => ({
        ...option,
        autocomplete: option.autocomplete ?? false,
        description_localizations: obj.description_localizations ?? {},
        name_localizations: obj.name_localizations ?? {},
        required: option.required ?? false,
      }));
    }

    Object.keys(obj).forEach((key) => {
      if (obj[key] === undefined) delete obj[key];
    });
  });
}

function traverseObject(
  obj: Record<string, any>,
  callback: (obj: Record<string, any>) => void,
): void {
  if (obj === null || typeof obj !== `object`) return;

  const traversedProps = new Set();
  const traverse = (currentObj: Record<string, any>): void => {
    if (traversedProps.has(currentObj)) return;
    traversedProps.add(currentObj);
    callback(currentObj);

    Object.keys(currentObj).forEach((key) => {
      if (currentObj[key] !== null && typeof currentObj[key] === `object`)
        traverse(currentObj[key]);
    });
  };

  traverse(obj);
}
