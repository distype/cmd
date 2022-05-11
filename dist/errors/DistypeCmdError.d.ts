/**
 * The type of error that has ocurred.
 */
export declare enum DistypeCmdErrorType {
    /**
     * An interaction already has a response.
     */
    ALREADY_RESPONDED = "ALREADY_RESPONDED",
    /**
     * The bot's application ID is undefined.
     */
    APPLICATION_ID_UNDEFINED = "APPLICATION_ID_UNDEFINED",
    /**
     * Duplicate command names were found.
     */
    DUPLICATE_COMMAND_NAME = "DUPLICATE_COMMAND_NAME"
}
/**
 * An error emitted from @distype/cmd.
 */
export declare class DistypeCmdError extends Error {
    /**
     * The type of error that has ocurred.
     */
    readonly errorType: DistypeCmdErrorType;
    /**
     * The system the error was emitted from.
     */
    readonly system = "Command Handler";
    /**
     * Create a @distype/cmd shard error.
     * @param message The error's message.
     * @param errorType The type of error that has ocurred.
     */
    constructor(message: string, errorType: DistypeCmdErrorType);
    /**
     * The name of the error.
     */
    get name(): `DistypeCmdError`;
}
