import { CommandHandler, Component } from '../CommandHandler';
import { Modal } from '../modals/Modal';
/**
 * Expire helper for {@link Component components} and {@link Modal modals}.
 */
export declare class Expire {
    /**
     * The {@link CommandHandler command handler} used when binding structures.
     */
    commandHandler: CommandHandler | null;
    /**
     * The bound structures.
     */
    structures: Array<Component | Modal<any>>;
    /**
     * A function to be called when the structures expire.
     */
    private _onExpire;
    /**
     * The timer.
     */
    private _timeout;
    /**
     * The timeout time in milliseconds.
     */
    private _timeoutTime;
    /**
     * Create the expire helper.
     * @param structures The structures to bind.
     * @param time The time in milliseconds for the structures to expire.
     * @param onExpire A function to be called when the structures expire.
     */
    constructor(structures: (Component | Modal<any>) | (Array<Component | Modal<any>>), time: number, onExpire?: () => void | Promise<void>);
    /**
     * Clears the timer (bound structures wont expire).
     */
    clearTimer(): void;
    /**
     * Resets the timer.
     */
    resetTimer(): void;
    /**
     * Bind the expire helper to the {@link CommandHandler command handler}.
     * @param commandHandler The {@link CommandHandler command handler} to bind to.
     * @returns The expire component.
     */
    bind(commandHandler: CommandHandler): this;
    /**
     * Unbind the expire helper from the {@link CommandHandler command handler} and clear timeouts.
     * @param commandHandler The {@link CommandHandler command handler} to unbind from.
     * @returns The expire component.
     */
    unbind(commandHandler?: CommandHandler): this;
}
