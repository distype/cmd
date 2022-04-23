"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistypeCmdError = exports.DistypeCmdErrorType = void 0;
/**
 * The type of error that has ocurred.
 */
var DistypeCmdErrorType;
(function (DistypeCmdErrorType) {
    /**
     * The bot's application ID is undefined.
     */
    DistypeCmdErrorType["APPLICATION_ID_UNDEFINED"] = "APPLICATION_ID_UNDEFINED";
    /**
     * A defer was called after a response was already created.
     */
    DistypeCmdErrorType["CANNOT_DEFER"] = "CANNOT_DEFER";
    /**
     * A modal open was called after a response was already created.
     */
    DistypeCmdErrorType["CANNOT_OPEN_MODAL"] = "CANNOT_OPEN_MODAL";
    /**
     * Duplicate command names were found.
     */
    DistypeCmdErrorType["DUPLICATE_COMMAND_NAME"] = "DUPLICATE_COMMAND_NAME";
    /**
     * An invalid value was used while modifying a button.
     */
    DistypeCmdErrorType["INVALID_BUTTON_VALUE"] = "INVALID_BUTTON_VALUE";
    /**
     * While converting a button to raw, invalid parameters were found.
     */
    DistypeCmdErrorType["INVALID_BUTTON_PARAMETERS_FOR_RAW"] = "INVALID_BUTTON_PARAMETERS_FOR_RAW";
    /**
     * An invalid value was used while modifying a chat command.
     */
    DistypeCmdErrorType["INVALID_CHAT_COMMAND_VALUE"] = "INVALID_CHAT_COMMAND_VALUE";
    /**
     * While converting a chat command to raw, invalid parameters were found.
     */
    DistypeCmdErrorType["INVALID_CHAT_COMMAND_PARAMETERS_FOR_RAW"] = "INVALID_CHAT_COMMAND_PARAMETERS_FOR_RAW";
    /**
     * An invalid value was used while modifying a context menu command.
     */
    DistypeCmdErrorType["INVALID_CONTEXT_MENU_COMMAND_VALUE"] = "INVALID_CONTEXT_MENU_COMMAND_VALUE";
    /**
     * While converting a context menu command to raw, invalid parameters were found.
     */
    DistypeCmdErrorType["INVALID_CONTEXT_MENU_COMMAND_PARAMETERS_FOR_RAW"] = "INVALID_CONTEXT_MENU_COMMAND_PARAMETERS_FOR_RAW";
    /**
     * An invalid value was used while modifying an embed.
     */
    DistypeCmdErrorType["INVALID_EMBED_VALUE"] = "INVALID_EMBED_VALUE";
    /**
     * While converting an embed to raw, invalid parameters were found.
     */
    DistypeCmdErrorType["INVALID_EMBED_PARAMETERS_FOR_RAW"] = "INVALID_EMBED_PARAMETERS_FOR_RAW";
    /**
     * An invalid value was used while modifying a modal.
     */
    DistypeCmdErrorType["INVALID_MODAL_VALUE"] = "INVALID_MODAL_VALUE";
    /**
     * While converting a modal to raw, invalid parameters were found.
     */
    DistypeCmdErrorType["INVALID_MODAL_PARAMETERS_FOR_RAW"] = "INVALID_MODAL_PARAMETERS_FOR_RAW";
    /**
     * An interaction response was not found.
     */
    DistypeCmdErrorType["RESPONSE_NOT_FOUND"] = "RESPONSE_NOT_FOUND";
})(DistypeCmdErrorType = exports.DistypeCmdErrorType || (exports.DistypeCmdErrorType = {}));
/**
 * An error emitted from @distype/cmd.
 */
class DistypeCmdError extends Error {
    /**
     * The type of error that has ocurred.
     */
    errorType;
    /**
     * The system the error was emitted from.
     */
    system = `Command Handler`;
    /**
     * Create a @distype/cmd shard error.
     * @param message The error's message.
     * @param errorType The type of error that has ocurred.
     */
    constructor(message, errorType) {
        super(message);
        this.errorType = errorType;
    }
    /**
     * The name of the error.
     */
    get name() {
        return `DistypeCmdError`;
    }
}
exports.DistypeCmdError = DistypeCmdError;
