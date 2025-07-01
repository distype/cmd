import { BaseComponentContext, BaseComponentContextCallback } from "./base/BaseComponent";
import { BaseSelect, SelectInteraction } from "./base/BaseSelect";
import { CommandHandler } from "../CommandHandler";
import * as DiscordTypes from "discord-api-types/v10";
/**
 * The string select menu builder.
 *
 * @example
 * ```ts
 * new StringSelect()
 *   .setId(`foo`)
 *   .setPlaceholder(`Select a string`)
 *   .addOption(`foo`, `foo`)
 *   .addOption(`bar`, `bar`)
 *   .setExecute((ctx) => {
 *     ctx.send(`You selected <@&${ctx.options[0]}>!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/message-components#select-menus)
 */
export declare class StringSelect<Options extends string[] = []> extends BaseSelect<DiscordTypes.ComponentType.StringSelect> {
    setExecute: (executeCallback: BaseComponentContextCallback<StringSelectContext<Options>>) => this;
    getExecute: () => BaseComponentContextCallback<StringSelectContext<Options>>;
    protected _execute: BaseComponentContextCallback<StringSelectContext<Options>>;
    /**
     * Create the select menu builder.
     */
    constructor();
    /**
     * Add an option.
     * @param label The option's label.
     * @param value The option's value.
     * @param description The option's description.
     * @param emoji The option's emoji.
     * @param defaultOption If the option should be the default option.
     * @returns The component.
     */
    addOption<T extends string>(label: string, value: T, description?: string, emoji?: DiscordTypes.APIMessageComponentEmoji, defaultOption?: boolean): StringSelect<Array<Options[number] | T>>;
}
/**
 * {@link StringSelect String select} context.
 */
export declare class StringSelectContext<Options extends string[] = []> extends BaseComponentContext {
    /**
     * Selected values from the user.
     */
    readonly options: Options;
    /**
     * Create {@link SelectMenu select menu} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction: SelectInteraction<DiscordTypes.ComponentType.StringSelect>, commandHandler: CommandHandler);
}
