import { FrameIndexPattern } from "./frameIndexPattern";

export class Animations {

  private _patterns: Record<string, FrameIndexPattern>;
  private _activeKey: string;
  private _restoreKey: string;
  private _overriden: boolean = false;

  public constructor (patterns: Record<string, FrameIndexPattern>) {
    this._patterns = patterns
    this._activeKey = Object.keys(this._patterns)[0];
    this._restoreKey = Object.keys(this._patterns)[0];
  }

  public save () {
    this._restoreKey = this._activeKey;
  }

  public restore () {
    this._activeKey = this._restoreKey;
  }

  public playAndOverride (key: string, time: number) {
    if (this._activeKey === key) {
      return;
    }
    if (!this._patterns[key]) {
      return;
    }
    this._activeKey = key;
    this._overriden = true;
    setTimeout(() => this._overriden = false, time);
  }

  public get activeKey () {
    return this._activeKey;
  }

  public get frame () {
    return this._patterns[this._activeKey].frame;
  }

  public play (key: string, startAtTime: number = 0) {
    if (this._overriden) {
      return;
    }
    if (this._activeKey === key) {
      return;
    }
    if (!this._patterns[key]) {
      return;
    }

    this._activeKey = key;
    this._patterns[this._activeKey].currentTime = startAtTime;
  }

  public update (dt: number) {
    this._patterns[this._activeKey].update(dt);
  }
}