"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expire = void 0;
/**
 * Expire helper for {@link Component components} and {@link Modal modals}.
 */
class Expire {
    /**
     * The {@link CommandHandler command handler} used when binding structures.
     */
    commandHandler = null;
    /**
     * The bound structures.
     */
    structures;
    /**
     * A function to be called when the structures expire.
     */
    _onExpire;
    /**
     * The timer.
     */
    _timeout = null;
    /**
     * The timeout time in milliseconds.
     */
    _timeoutTime;
    /**
     * Create the expire helper.
     * @param structures The structures to bind.
     * @param time The time in milliseconds for the structures to expire.
     * @param onExpire A function to be called when the structures expire.
     */
    constructor(structures, time, onExpire) {
        this.structures = Array.isArray(structures) ? structures : [structures];
        this._timeoutTime = time;
        this._onExpire = async () => {
            try {
                const call = onExpire?.();
                if (call instanceof Promise) {
                    const reject = await call.catch((error) => error);
                    if (reject instanceof Error)
                        throw reject;
                }
            }
            catch (error) {
                this.commandHandler?.client.log(`Unable to run expire unbind callback: ${error?.message ?? error ?? `Unknown reason`}`, {
                    level: `ERROR`,
                    system: this.commandHandler.system,
                });
            }
        };
    }
    /**
     * Clears the timer (bound structures wont expire).
     */
    clearTimer() {
        if (this._timeout)
            clearTimeout(this._timeout);
        this._timeout = null;
    }
    /**
     * Resets the timer.
     */
    resetTimer() {
        if (this._timeout)
            clearTimeout(this._timeout);
        this._timeout = setTimeout(() => {
            this.unbind();
            this._onExpire();
        }, this._timeoutTime).unref();
    }
    /**
     * Bind the expire helper to the {@link CommandHandler command handler}.
     * @param commandHandler The {@link CommandHandler command handler} to bind to.
     * @returns The expire component.
     */
    bind(commandHandler) {
        this.commandHandler = commandHandler;
        this.commandHandler.bind(this);
        return this;
    }
    /**
     * Unbind the expire helper from the {@link CommandHandler command handler} and clear timeouts.
     * @param commandHandler The {@link CommandHandler command handler} to unbind from.
     * @returns The expire component.
     */
    unbind(commandHandler) {
        (commandHandler ?? this.commandHandler)?.unbind(this);
        return this;
    }
}
exports.Expire = Expire;
