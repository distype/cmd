/**
 * The type of error that has ocurred.
 */
export enum DistypeCmdErrorType {
    /**
     * The bot's application ID is undefined.
     */
    APPLICATION_ID_UNDEFINED = `APPLICATION_ID_UNDEFINED`,
    /**
     * Duplicate command names were found.
     */
    DUPLICATE_COMMAND_NAME = `DUPLICATE_COMMAND_NAME`,
}

/**
 * An error emitted from @distype/cmd.
 */
export class DistypeCmdError extends Error {
    /**
     * The type of error that has ocurred.
     */
    public readonly errorType: DistypeCmdErrorType;
    /**
     * The system the error was emitted from.
     */
    public readonly system = `Command Handler`;

    /**
     * Create a @distype/cmd shard error.
     * @param message The error's message.
     * @param errorType The type of error that has ocurred.
     */
    constructor (message: string, errorType: DistypeCmdErrorType) {
        super(message);

        this.errorType = errorType;
    }

    /**
     * The name of the error.
     */
    public override get name (): `DistypeCmdError` {
        return `DistypeCmdError`;
    }
}
