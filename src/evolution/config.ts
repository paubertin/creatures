export class Config {
  private static _instance: Config;

  private _values: Record<string, any> = {};

  private constructor () {}

  public static get instance () {
    if (!this._instance) {
      this._instance = new Config();
    }
    return this._instance;
  }

  public static get <T> (key: string): T {
    return this.instance._values[key];
  }

  public static has (key: string): boolean {
    return Object.keys(this.instance._values).includes(key);
  }

  public static set <T> (key: string, value: T, force: boolean = false) {
    const exists = this.has(key);
    if ((exists && force) || !exists) {
      this.instance._values[key] = value;
    }
    return this;
  } 

}