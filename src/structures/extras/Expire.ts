import { CommandHandler, Component } from "../CommandHandler";
import { Modal } from "../modals/Modal";

/**
 * Expire helper for {@link Component components} and {@link Modal modals}.
 */
export class Expire {
  /**
   * The {@link CommandHandler command handler} used when binding structures.
   */
  public commandHandler: CommandHandler | null = null;
  /**
   * The bound structures.
   */
  public structures: Array<Component | Modal<any>>;

  /**
   * A function to be called when the structures expire.
   */
  private _onExpire: () => Promise<void>;
  /**
   * The timer.
   */
  private _timeout: NodeJS.Timeout | null = null;
  /**
   * The timeout time in milliseconds.
   */
  private _timeoutTime: number;

  /**
   * Create the expire helper.
   * @param structures The structures to bind.
   * @param time The time in milliseconds for the structures to expire.
   * @param onExpire A function to be called when the structures expire.
   */
  constructor(
    structures: (Component | Modal<any>) | Array<Component | Modal<any>>,
    time: number,
    onExpire?: () => void | Promise<void>,
  ) {
    this.structures = Array.isArray(structures) ? structures : [structures];
    this._timeoutTime = time;
    this._onExpire = async (): Promise<void> => {
      try {
        const call = onExpire?.();
        if (call instanceof Promise) {
          const reject = await call.catch((error) => error);
          if (reject instanceof Error) throw reject;
        }
      } catch (error: any) {
        this.commandHandler?.client.log(
          `Unable to run expire unbind callback: ${error?.message ?? error ?? `Unknown reason`}`,
          {
            level: `ERROR`,
            system: this.commandHandler.system,
          },
        );
      }
    };
  }

  /**
   * Clears the timer (bound structures wont expire).
   */
  public clearTimer(): void {
    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = null;
  }

  /**
   * Resets the timer.
   */
  public resetTimer(): void {
    if (this._timeout) clearTimeout(this._timeout);
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
  public bind(commandHandler: CommandHandler): this {
    this.commandHandler = commandHandler;
    this.commandHandler.bind(this);
    return this;
  }

  /**
   * Unbind the expire helper from the {@link CommandHandler command handler} and clear timeouts.
   * @param commandHandler The {@link CommandHandler command handler} to unbind from.
   * @returns The expire component.
   */
  public unbind(commandHandler?: CommandHandler): this {
    (commandHandler ?? this.commandHandler)?.unbind(this);
    return this;
  }
}
