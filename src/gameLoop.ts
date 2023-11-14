export class GameLoop {

  private _lastFrameTime: number = 0;
  private _accumulatedTime: number = 0;
  private _timeStep: number = 1000 / 60;

  private _rafId: number | null = null;
  private _isRunning: boolean = false;

  public constructor (public update: (dt: number) => void, public render: () => void, public onStart?: () => void) {}

  public _mainLoop (timeStamp: number) {
    if (!this._isRunning) return;

    let deltaTime = timeStamp - this._lastFrameTime;
    this._lastFrameTime = timeStamp;

    this._accumulatedTime += deltaTime;

    while (this._accumulatedTime >= this._timeStep) {
      this.update(this._timeStep);
      this._accumulatedTime -= this._timeStep;
    }

    this.render();

    this._rafId = requestAnimationFrame(this._mainLoop.bind(this));
  }

  public start () {
    if (!this._isRunning) {
      this._isRunning = true;
      this.onStart?.();
      this._rafId = requestAnimationFrame(this._mainLoop.bind(this));
    }
  }

  public stop () {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
    this._isRunning = false;
  }

}
