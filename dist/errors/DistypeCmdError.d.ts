/**
 * The type of error that has occured.
 */
export declare enum DistypeCmdErrorType {
    /**
     * The bot's application ID is undefined.
     */
    APPLICATION_ID_UNDEFINED = "APPLICATION_ID_UNDEFINED",
    /**
     * A defer was called after a response was already created.
     */
    CANNOT_DEFER = "CANNOT_DEFER",
    /**
     * A modal open was called after a response was already created.
     */
    CANNOT_OPEN_MODAL = "CANNOT_OPEN_MODAL",
    /**
     * Dupplicate command names were found.
     */
    DUPLICATE_COMMAND_NAME = "DUPLICATE_COMMAND_NAME",
    /**
     * An invalid value was used while modifying a button.
     */
    INVALID_BUTTON_VALUE = "INVALID_BUTTON_VALUE",
    /**
     * While converting a button to raw, invalid parameters were found.
     */
    INVALID_BUTTON_PARAMETERS_FOR_RAW = "INVALID_BUTTON_PARAMETERS_FOR_RAW",
    /**
     * An invalid value was used while modifying a chat command.
     */
    INVALID_CHAT_COMMAND_VALUE = "INVALID_CHAT_COMMAND_VALUE",
    /**
     * While converting a chat command to raw, invalid parameters were found.
     */
    INVALID_CHAT_COMMAND_PARAMETERS_FOR_RAW = "INVALID_CHAT_COMMAND_PARAMETERS_FOR_RAW",
    /**
     * An invalid value was used while modifying a context menu command.
     */
    INVALID_CONTEX_MENU_COMMAND_VALUE = "INVALID_CONTEX_MENU_COMMAND_VALUE",
    /**
     * While converting a context menu command to raw, invalid parameters were found.
     */
    INVALID_CONTEX_MENU_COMMAND_PARAMETERS_FOR_RAW = "INVALID_CONTEX_MENU_COMMAND_PARAMETERS_FOR_RAW",
    /**
     * An invalid value was used while modifying an embed.
     */
    INVALID_EMBED_VALUE = "INVALID_EMBED_VALUE",
    /**
     * While converting an embed to raw, invalid parameters were found.
     */
    INVALID_EMBED_PARAMETERS_FOR_RAW = "INVALID_EMBED_PARAMETERS_FOR_RAW",
    /**
     * An invalid value was used while modifying a modal.
     */
    INVALID_MODAL_VALUE = "INVALID_MODAL_VALUE",
    /**
     * While converting a modal to raw, invalid parameters were found.
     */
    INVALID_MODAL_PARAMETERS_FOR_RAW = "INVALID_MODAL_PARAMETERS_FOR_RAW",
    /**
     * An interaction response was not found.
     */
    RESPONSE_NOT_FOUND = "RESPONSE_NOT_FOUND"
}
/**
 * An error emitted from @distype/cmd.
 */
export declare class DistypeCmdError extends Error {
    /**
     * The type of error that has occured.
     */
    readonly errorType: DistypeCmdErrorType;
    /**
     * The system the error was emitted from.
     */
    readonly system = "Command Handler";
    /**
     * Create a @distype/cmd shard error.
     * @param message The error's message.
     * @param errorType The type of error that has occured.
     */
    constructor(message: string, errorType: DistypeCmdErrorType);
    /**
     * The name of the error.
     */
    get name(): `DistypeCmdError`;
}
