export class GameLoop {

  private _lastUpdateTime: number = 0;
  private _lastRenderTime: number = 0;
  private _accumulatedTime: number = 0;
  private _timeStep: number = 1000 / 60;

  private _updateInterval: number = 1000 / 60; // Fréquence de mise à jour en millisecondes
  private _renderInterval: number = 1000 / 60; // Fréquence de rendu en millisecondes

  private _rafId: number | null = null;
  private _isRunning: boolean = false;

  public constructor (public update: (dt: number) => void, public render: () => void, public onStart?: () => void) {}

  public _mainLoop (timeStamp: number) {
    if (!this._isRunning) return;

    const deltaTimeUpdate = timeStamp - this._lastUpdateTime;
    const deltaTimeRender = timeStamp - this._lastRenderTime;

    if (deltaTimeUpdate > this._updateInterval) {
      this._lastUpdateTime = timeStamp - (deltaTimeUpdate % this._updateInterval);

      this.update(deltaTimeUpdate);
    }

    if (deltaTimeRender > this._renderInterval) {
      this._lastRenderTime = timeStamp - (deltaTimeRender % this._renderInterval);

      this.render();
    }

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
