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
     * Duplicate command names were found.
     */
    DistypeCmdErrorType["DUPLICATE_COMMAND_NAME"] = "DUPLICATE_COMMAND_NAME";
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
