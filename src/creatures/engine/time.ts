export class TimeStep {
  private _timeStep: number = 0.0;
  private _lastTime: number;

  constructor(initialTime: number) {
    this._lastTime = initialTime;
  }

  public update(currentTime: number): void {
    this._timeStep = currentTime - this._lastTime;
    this._lastTime = currentTime;
  }

  public get millis(): number {
    return this._timeStep;
  }

  public get seconds(): number {
    return this._timeStep * 0.001;
  }
}

export class Timer {
  private _start: number = 0.0;
  private _tick: number = 0.0;
  private _end: number = 0.0;
  private _diff: number = 0.0;
  private _running: boolean = false;

  constructor(autoRun: boolean = true) {
    if (autoRun) {
      this.start();
    }
  }

  public start(): void {
    this._start = performance.now();
    this._running = true;
  }

  public stop(): void {
    this._end = performance.now();
    this._diff = this._end - this._start;
    this._running = false;
  }

  public reset(): void {
    this._diff = 0.0;
    this._tick = 0.0;
    if (this._running) {
      this._start = performance.now();
    }
  }

  public tick(): void {
    this._tick = performance.now();
  }

  public get elapsed(): number {
    return 0.001 * this.elapsedMs;
  }

  public get elapsedMs(): number {
    return performance.now() - this._tick;
  }

  public get time(): number {
    return 0.001 * this.timeMs;
  }

  public get timeMs(): number {
    if (this._running) {
      return performance.now() - this._start;
    }
    else {
      return this._diff;
    }
  }
}