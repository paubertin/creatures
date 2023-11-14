import { IAnimation } from "./objects/hero/hero.animations";

export class FrameIndexPattern {
  private _config: IAnimation;
  private _duration: number;

  private _currentTime: number = 0;

  public constructor (animation: IAnimation) {
    this._config = animation;
    this._duration = animation.duration ?? 500;
  }

  public set currentTime (t: number) {
    this._currentTime = t;
  }

  public get frame () {
    const { frames } = this._config;
    for (let i = frames.length - 1; i >= 0; i--) {
      if (this._currentTime >= frames[i].time) {
        return frames[i].frame;
      }
    }
    throw new Error('Time is before the first frame...');
  }

  public update (delta: number) {
    this._currentTime += delta;
    if (this._currentTime >= this._duration) {
      this._currentTime = 0;
    }
  }
}