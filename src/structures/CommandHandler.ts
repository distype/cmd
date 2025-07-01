import { InteractionContext } from "./InteractionContext";
import { ChatCommand, ChatCommandContext } from "./commands/ChatCommand";
import {
  MessageCommand,
  MessageCommandContext,
} from "./commands/MessageCommand";
import { UserCommand, UserCommandContext } from "./commands/UserCommand";
import { Button, ButtonContext } from "./components/Button";
import {
  ChannelSelect,
  ChannelSelectContext,
} from "./components/ChannelSelect";
import {
  MentionableSelect,
  MentionableSelectContext,
} from "./components/MentionableSelect";
import { RoleSelect, RoleSelectContext } from "./components/RoleSelect";
import { StringSelect, StringSelectContext } from "./components/StringSelect";
import { UserSelect, UserSelectContext } from "./components/UserSelect";
import { Expire } from "./extras/Expire";
import { Modal, ModalContext } from "./modals/Modal";

import type { MiddlewareMeta } from "../middleware";
import {
  sanitizeCommand,
  sanitizeGuildCommand,
} from "../utils/sanitizeCommand";

import * as DiscordTypes from "discord-api-types/v10";
import { Client, ExtendedMap } from "distype";
import { readdir } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";

/**
 * A command.
 */
export type Command =
  | ChatCommand<any, any>
  | MessageCommand<any>
  | UserCommand<any>;

/**
 * A component.
 */
export type Component =
  | Button
  | ChannelSelect
  | MentionableSelect
  | RoleSelect
  | StringSelect<any>
  | UserSelect;

/**
 * A structure compatible with the {@link CommandHandler command handler}.
 */
export type CommandHandlerStructure = Command | Component | Modal<any>;

/**
 * The command handler.
 */
export class CommandHandler {
  /**
   * The client the command handler is bound to.
   */
  public client: Client;

  /**
   * The system string used for logging.
   */
  public readonly system = `Command Handler`;

  /**
   * Bound commands.
   * Key is their ID.
   */
  private _boundCommands: ExtendedMap<string, Command> = new ExtendedMap();
  /**
   * Bound components.
   */
  private _boundComponents: Set<Component> = new Set();
  /**
   * Bound expires.
   */
  private _boundExpires: Set<Expire> = new Set();
  /**
   * Bound modals.
   */
  private _boundModals: Set<Modal<any>> = new Set();
  /**
   * Error function.
   */
  private _error: (
    ctx: InteractionContext,
    error: Error,
  ) => void | Promise<void> = () => {};
  /**
   * Middleware function.
   */
  private _middleware: (
    ctx: InteractionContext,
    meta: MiddlewareMeta | null,
  ) => boolean | Promise<boolean> = () => true;

  /**
   * Create the command handler.
   * @param client The Distype client to bind the command handler to.
   */
  constructor(client: Client) {
    this.client = client;

    this.client.gateway.on(`INTERACTION_CREATE`, ({ d }) =>
      this._onInteraction(d),
    );

    this.client.log(`Initialized command handler`, {
      level: `DEBUG`,
      system: this.system,
    });
  }

  /**
   * Returns structures found in a directory and its subdirectories.
   * Only loads default exports.
   * @param directories The directory to search.
   * @returns Found structures.
   */
  public async extractFromDirectories(
    ...directories: string[]
  ): Promise<CommandHandlerStructure[]> {
    const structures: CommandHandlerStructure[] = [];

    for (const directory of directories) {
      const path = isAbsolute(directory)
        ? directory
        : resolve(process.cwd(), directory);
      const files = await readdir(path, { withFileTypes: true });

      for (const file in files) {
        if (files[file].isDirectory()) {
          structures.push(
            ...(await this.extractFromDirectories(
              resolve(path, files[file].name),
            )),
          );
          continue;
        }
        if (!files[file].name.endsWith(`.js`)) continue;

        delete require.cache[require.resolve(resolve(path, files[file].name))];
        const imported = await import(resolve(path, files[file].name));
        const structure = imported.default ?? imported;

        if (CommandHandler.isCompatableStructure(structure))
          structures.push(structure);
      }
    }

    return structures;
  }

  /**
   * Loads interaction structures from a directory and its subdirectories.
   * Only loads default exports. Note that {@link Expire expire helpers} cannot be loaded.
   * @param directories The directory to search.
   */
  public async loadDirectories(...directories: string[]): Promise<void> {
    const structures = await this.extractFromDirectories(...directories);

    const commands = structures.filter((structure) =>
      CommandHandler.isCommand(structure),
    );
    const customIds = structures.filter(
      (structure) =>
        CommandHandler.isComponent(structure) ||
        CommandHandler.isModal(structure),
    );

    await this.pushCommands(...(commands as any));
    this.bind(...(customIds as any));
  }

  /**
   * Pushes {@link Command commands} to the API.
   * Note that guilds that already have commands published that dont have any defined locally will not be overwritten.
   * @param commands Commands to load.
   */
  public async pushCommands(...commands: Command[]): Promise<void> {
    this.client.log(`Pushing ${commands.length} commands`, {
      level: `INFO`,
      system: this.system,
    });

    await this._pushGlobalCommands(commands);
    await this._pushGuildCommands(commands);
  }

  /**
   * Binds structures that use custom IDs.
   * @param structures The structures to bind.
   * @returns The command handler.
   */
  public bind(...structures: Array<Component | Modal<any> | Expire>): this {
    structures.forEach((structure) => {
      if (CommandHandler.isComponent(structure)) {
        this._boundComponents.add(structure);
      } else if (CommandHandler.isModal(structure)) {
        this._boundModals.add(structure);
      } else {
        structure.commandHandler = this;
        this._boundExpires.add(structure);
        this.bind(...structure.structures);
        structure.resetTimer();
      }
    });

    return this;
  }

  /**
   * Unbind structures that use custom IDs.
   * @param structures The structures to unbind.
   * @returns The command handler.
   */
  public unbind(...structures: Array<Component | Modal<any> | Expire>): this {
    structures.forEach((structure) => {
      if (CommandHandler.isComponent(structure)) {
        this._boundComponents.delete(structure);
      } else if (CommandHandler.isModal(structure)) {
        this._boundModals.delete(structure);
      } else {
        this._boundExpires.delete(structure);
        this.unbind(...structure.structures);
        structure.clearTimer();
      }
    });

    return this;
  }

  /**
   * Set the error function for the command handler.
   * @returns The command handler.
   */
  public setError(
    errorFunction: (
      ctx: InteractionContext,
      error: Error,
    ) => void | Promise<void>,
  ): this {
    this._error = errorFunction;
    return this;
  }

  /**
   * Set the middleware function for the command handler.
   * @returns The command handler.
   */
  public setMiddleware(
    middlewareFunction: (
      ctx: InteractionContext,
      meta: MiddlewareMeta | null,
    ) => boolean | Promise<boolean>,
  ): this {
    this._middleware = middlewareFunction;
    return this;
  }

  /**
   * Checks if a structure is a {@link Command command}.
   */
  public static isCommand(structure: any): structure is Command {
    return (
      structure instanceof ChatCommand ||
      structure instanceof MessageCommand ||
      structure instanceof UserCommand
    );
  }

  /**
   * Checks if a structure is a {@link Component component}.
   */
  public static isComponent(structure: any): structure is Component {
    return (
      structure instanceof Button ||
      structure instanceof ChannelSelect ||
      structure instanceof MentionableSelect ||
      structure instanceof RoleSelect ||
      structure instanceof StringSelect ||
      structure instanceof UserSelect
    );
  }

  /**
   * Checks if a structure is a {@link Modal modal}.
   */
  public static isModal(structure: any): structure is Modal<any> {
    return structure instanceof Modal;
  }

  /**
   * Checks if a structure is compatible with the command handler.
   */
  public static isCompatableStructure(
    structure: any,
  ): structure is CommandHandlerStructure {
    return (
      this.isCommand(structure) ||
      this.isComponent(structure) ||
      this.isModal(structure)
    );
  }

  /**
   * Pushes global {@link Command commands} to the API.
   * @param commands Commands to load.
   */
  private async _pushGlobalCommands(commands: Command[]): Promise<void> {
    if (!this.client.gateway.user?.id)
      throw new Error(
        `Unable to push global commands: application ID is undefined (client.gateway.user.id)`,
      );

    const local = commands
      .filter((command) => !command.getGuild())
      .map((command) => sanitizeCommand(command.getRaw() as any));
    const published = await this.client.rest.getGlobalApplicationCommands(
      this.client.gateway.user.id,
      { with_localizations: true },
    );
    this.client.log(`Found ${published.length} published global commands`, {
      level: `DEBUG`,
      system: this.system,
    });

    const deletedCommands = published.filter(
      (published) =>
        !local.find((local) =>
          isDeepStrictEqual(local, sanitizeCommand(published)),
        ),
    );
    const newCommands = local.filter(
      (local) =>
        !published.find((published) =>
          isDeepStrictEqual(local, sanitizeCommand(published)),
        ),
    );

    if (deletedCommands.length)
      this.client.log(
        `Delete (Global): ${deletedCommands.map((command) => `"${command.name}"`).join(`, `)}`,
        {
          level: `DEBUG`,
          system: this.system,
        },
      );
    if (newCommands.length)
      this.client.log(
        `New (Global): ${newCommands.map((command) => `"${command.name}"`).join(`, `)}`,
        {
          level: `DEBUG`,
          system: this.system,
        },
      );

    if (deletedCommands.length === published.length) {
      await this.client.rest.bulkOverwriteGlobalApplicationCommands(
        this.client.gateway.user.id,
        newCommands,
      );
    } else {
      for (const command of deletedCommands) {
        await this.client.rest.deleteGlobalApplicationCommand(
          this.client.gateway.user.id,
          command.id,
        );
      }

      for (const command of newCommands) {
        await this.client.rest.createGlobalApplicationCommand(
          this.client.gateway.user.id,
          command as any,
        );
      }
    }

    const newPublished =
      newCommands.length + deletedCommands.length
        ? await this.client.rest.getGlobalApplicationCommands(
            this.client.gateway.user.id,
            {},
          )
        : published;
    newPublished.forEach((command) => {
      const foundLocal = commands.find(
        (local) => !local.getGuild() && local.getRaw().name === command.name,
      );
      if (foundLocal) this._boundCommands.set(command.id, foundLocal);
    });

    this.client.log(
      `Created ${newCommands.length} global commands and deleted ${deletedCommands.length} global commands (Application now owns ${newPublished.length} global commands)`,
      {
        level: `INFO`,
        system: this.system,
      },
    );
  }

  /**
   * Pushes guild {@link Command commands} to the API.
   * @param commands Commands to load.
   */
  private async _pushGuildCommands(commands: Command[]): Promise<void> {
    if (!this.client.gateway.user?.id)
      throw new Error(
        `Unable to push guild commands: application ID is undefined (client.gateway.user.id)`,
      );

    const guilds = new Set(
      commands
        .map((command) => command.getGuild())
        .filter((guild) => guild) as string[],
    );

    for (const guild of guilds) {
      const local = commands
        .filter((command) => command.getGuild() === guild)
        .map((command) => sanitizeGuildCommand(command.getRaw() as any));
      const published = await this.client.rest.getGuildApplicationCommands(
        this.client.gateway.user.id,
        guild,
        { with_localizations: true },
      );

      this.client.log(
        `Found ${published.length} published commands in guild ${guild}`,
        {
          level: `DEBUG`,
          system: this.system,
        },
      );

      const deletedCommands = published.filter(
        (published) =>
          !local.find((local) =>
            isDeepStrictEqual(local, sanitizeGuildCommand(published)),
          ),
      );
      const newCommands = local.filter(
        (local) =>
          !published.find((published) =>
            isDeepStrictEqual(local, sanitizeGuildCommand(published)),
          ),
      );

      if (deletedCommands.length)
        this.client.log(
          `Delete (${guild}): ${deletedCommands.map((command) => `"${command.name}"`).join(`, `)}`,
          {
            level: `DEBUG`,
            system: this.system,
          },
        );
      if (newCommands.length)
        this.client.log(
          `New (${guild}): ${newCommands.map((command) => `"${command.name}"`).join(`, `)}`,
          {
            level: `DEBUG`,
            system: this.system,
          },
        );

      if (deletedCommands.length === published.length) {
        await this.client.rest.bulkOverwriteGuildApplicationCommands(
          this.client.gateway.user.id,
          guild,
          newCommands,
        );
      } else {
        for (const command of deletedCommands) {
          await this.client.rest.deleteGuildApplicationCommand(
            this.client.gateway.user.id,
            guild,
            command.id,
          );
        }

        for (const command of newCommands) {
          await this.client.rest.createGuildApplicationCommand(
            this.client.gateway.user.id,
            guild,
            command as any,
          );
        }
      }

      const newPublished =
        newCommands.length + deletedCommands.length
          ? await this.client.rest.getGuildApplicationCommands(
              this.client.gateway.user.id,
              guild,
              {},
            )
          : published;
      newPublished.forEach((command) => {
        const foundLocal = commands.find(
          (local) => local.getRaw().name === command.name,
        );
        if (foundLocal) this._boundCommands.set(command.id, foundLocal);
      });

      this.client.log(
        `Created ${newCommands.length} commands and deleted ${deletedCommands.length} commands in guild ${guild} (Application now owns ${newPublished.length} commands in guild ${guild})`,
        {
          level: `INFO`,
          system: this.system,
        },
      );
    }
  }

  /**
   * Callback to run when receiving an interaction.
   * @param interaction The received interaction.
   */
  private async _onInteraction(
    interaction: DiscordTypes.APIInteraction,
  ): Promise<void> {
    let structure: CommandHandlerStructure | undefined;
    let context: InteractionContext | undefined;

    switch (interaction.type) {
      case DiscordTypes.InteractionType.ApplicationCommand: {
        structure = this._boundCommands.get(interaction.data.id);

        switch (interaction.data.type) {
          case DiscordTypes.ApplicationCommandType.ChatInput: {
            if (structure)
              context = new ChatCommandContext(interaction as any, this);
            break;
          }
          case DiscordTypes.ApplicationCommandType.Message: {
            if (structure)
              context = new MessageCommandContext(interaction as any, this);
            break;
          }
          case DiscordTypes.ApplicationCommandType.User: {
            if (structure)
              context = new UserCommandContext(interaction as any, this);
            break;
          }
        }
        break;
      }
      case DiscordTypes.InteractionType.MessageComponent: {
        structure = Array.from(this._boundComponents).find(
          (component) =>
            component.getCustomId() === interaction.data.custom_id &&
            component.getType() === interaction.data.component_type,
        );

        switch (interaction.data.component_type) {
          case DiscordTypes.ComponentType.Button: {
            if (structure)
              context = new ButtonContext(interaction as any, this);
            break;
          }
          case DiscordTypes.ComponentType.ChannelSelect: {
            if (structure)
              context = new ChannelSelectContext(interaction as any, this);
            break;
          }
          case DiscordTypes.ComponentType.MentionableSelect: {
            if (structure)
              context = new MentionableSelectContext(interaction as any, this);
            break;
          }
          case DiscordTypes.ComponentType.RoleSelect: {
            if (structure)
              context = new RoleSelectContext(interaction as any, this);
            break;
          }
          case DiscordTypes.ComponentType.StringSelect: {
            if (structure)
              context = new StringSelectContext(interaction as any, this);
            break;
          }
          case DiscordTypes.ComponentType.UserSelect: {
            if (structure)
              context = new UserSelectContext(interaction as any, this);
            break;
          }
        }
        break;
      }
      case DiscordTypes.InteractionType.ModalSubmit: {
        structure = Array.from(this._boundModals).find(
          (modal) => modal.getCustomId() === interaction.data.custom_id,
        );
        if (structure) context = new ModalContext(interaction, this);
        break;
      }
    }

    if (!structure || !context) return;

    if (
      CommandHandler.isComponent(structure) ||
      CommandHandler.isModal(structure)
    ) {
      const expire = Array.from(this._boundExpires).find((expire) =>
        expire.structures.find((s) => s === structure),
      );
      if (expire) expire.resetTimer();
    }

    this.client.log(`Running interaction ${interaction.id}`, {
      level: `DEBUG`,
      system: this.system,
    });

    try {
      const middlewareCall = this._middleware(
        context,
        structure.getMiddlewareMeta(),
      );
      let middlewareResult;
      if (middlewareCall instanceof Promise) {
        const reject = await middlewareCall.catch((error: Error) => error);
        if (reject instanceof Error) throw reject;
        else middlewareResult = reject;
      } else {
        middlewareResult = middlewareCall;
      }
      if (middlewareResult === false) return;

      const call = structure.getExecute()(context as any);
      if (call instanceof Promise) {
        const reject = await call.then(() => {}).catch((error: Error) => error);
        if (reject instanceof Error) throw reject;
      }
    } catch (error: any) {
      try {
        const call = this._error(
          context,
          error instanceof Error ? error : new Error(error),
        );
        if (call instanceof Promise) {
          const reject = await call
            .then(() => {})
            .catch((error: Error) => error);
          if (reject instanceof Error) throw reject;
        }
      } catch (eError: any) {
        this.client.log(
          `Unable to run error callback on interaction ${interaction.id}: ${eError?.message ?? eError ?? `Unknown reason`}`,
          {
            level: `ERROR`,
            system: this.system,
          },
        );
      }
    }
  }
}
