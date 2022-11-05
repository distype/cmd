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
exports.UserCommandContext = exports.UserCommand = void 0;
const BaseCommand_1 = require("./base/BaseCommand");
const DiscordTypes = __importStar(require("discord-api-types/v10"));
/**
 * The user command builder.
 *
 * @example
 * ```ts
 * new UserCommand()
 *   .setName(`foo`)
 *   .setExecute((ctx) => {
 *     ctx.send(`The selected user is <@${ctx.targetId}>!`);
 *   });
 * ```
 * @see [Discord API Reference](https://discord.com/developers/docs/interactions/application-commands#user-commands)
 */
class UserCommand extends BaseCommand_1.BaseCommand {
    /**
     * Create the user command builder.
     */
    constructor() {
        super(DiscordTypes.ApplicationCommandType.User);
    }
}
exports.UserCommand = UserCommand;
/**
 * {@link UserCommand User command} context.
 */
class UserCommandContext extends BaseCommand_1.BaseCommandContext {
    /**
     * The executed context's target.
     */
    target;
    /**
     * The ID of the executed context's target.
     */
    targetId;
    /**
     * Create {@link UserCommand user command} context.
     * @param interaction The interaction payload.
     * @param commandHandler The {@link CommandHandler command handler} that invoked the context.
     */
    constructor(interaction, commandHandler) {
        super(interaction, commandHandler);
        this.target = {
            user: interaction.data.resolved.users[interaction.data.target_id],
            member: interaction.data.resolved.members?.[interaction.data.target_id]
        };
        this.targetId = interaction.data.target_id;
    }
}
exports.UserCommandContext = UserCommandContext;
