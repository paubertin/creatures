import { GameObject } from "./gameObject";

interface EventCallback {
  id: number;
  eventName: string;
  caller: GameObject;
  callback: (...Args: any[]) => void;
}

export class Events {

  private _callbacks: EventCallback[] = [];
  private _nextId: number = 0;

  private static _instance: Events;

  public static get initialized () {
    return this._instance !== undefined;
  }

  public static init () {
    if (!this._instance) {
      this._instance = new Events();
    }
  }

  private static _ckeckInitialized () {
    if (!this.initialized) {
      throw new Error('Events not initialized');
    }
  }

  private constructor () {}

  public static emit (eventName: string, ...Args: any[]) {
    this._ckeckInitialized();
    this._instance._callbacks.forEach((cb) => {
      if (cb.eventName === eventName) {
        cb.callback(...Args);
      }
    });
  }

  public static on (eventName: string, caller: GameObject, callback: (...Args: any[]) => void) {
    this._ckeckInitialized();
    this._instance._nextId += 1;
    this._instance._callbacks.push({
      id: this._instance._nextId,
      eventName,
      caller,
      callback,
    });
    return this._instance._nextId;
  }

  public static off (id: number) {
    this._ckeckInitialized();
    this._instance._callbacks = this._instance._callbacks.filter((cb) => cb.id !== id);
  }

  public static unsubscribe (caller: GameObject) {
    this._ckeckInitialized();
    this._instance._callbacks = this._instance._callbacks.filter((cb) => cb.caller.id !== caller.id);
  }

}