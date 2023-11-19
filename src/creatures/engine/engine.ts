import { Debugger } from './debug';
import { Timer, TimeStep } from "./time";
import { Scene } from './scene';
import { Canvas } from './canvas';
import { defaultComposer, PartialDeep } from '../utils';

interface LoopParameters {
  updateTimer: number;
  updateStep: TimeStep;
  updateInterval: number;
  maxUpdatesPerFrame: number;
  renderTimer: number;
  renderInterval: number;
  step: TimeStep;
}

export interface EngineOptions {
  rendering: {
    canvasElement: string;
    width: number;
    height: number;
    updateInterval: number;
    maxUpdatesPerFrame: number;
    renderInterval: number;
  };
}

export class Engine {
  private static instance: Engine;

  private _paused: boolean = false;
  private _step: number = 0;
  private debugger: Debugger = new Debugger();
  private timer: Timer = new Timer(false);
  private loopParameters: LoopParameters;
  private options!: EngineOptions;

  private scenes: Scene[] = [];

  private activeScene?: Scene;

  private constructor(options: EngineOptions) {
    this.options = options;
    this.loopParameters = {
      updateTimer: this.timer.timeMs,
      updateInterval: this.options.rendering.updateInterval,
      renderTimer: this.timer.timeMs,
      renderInterval: this.options.rendering.renderInterval,
      maxUpdatesPerFrame: this.options.rendering.maxUpdatesPerFrame,
      updateStep: new TimeStep(this.timer.timeMs),
      step: new TimeStep(this.timer.timeMs),
    };
  }

  public static async initialize(opts?: PartialDeep<EngineOptions>) {
    if (this.instance) {
      throw new Error('Engine already initialized');
    }
    const options = this.setDefaultOptions(opts);
    console.log('options', options);
    this.instance = new Engine(options);
    return new Promise<Engine>((resolve, reject) => {
      window.addEventListener('load', () => {
        try {
          Canvas.init(options.rendering);
          resolve(this.instance!);
        }
        catch (err: unknown) {
          reject(err);
        }
      });
    });
  }

  public static get pause () {
    return this.instance._paused;
  }

  public static set pause (value: boolean) {
    this.instance._paused = value;
  }

  public static step () {
    this.instance._paused = true;
    this.instance._step = 1;
  }

  private static setDefaultOptions (opts?: PartialDeep<EngineOptions>) {
    return defaultComposer(
      {
        rendering: {
          canvasElement: 'main-canvas',
          width: Math.max(document.documentElement.clientWidth || window.innerWidth || 0),
          height: Math.max(document.documentElement.clientHeight || window.innerHeight || 0),
          renderInterval: 1000.0 / 60.0,
          updateInterval: 1000.0 / 60.0,
          maxUpdatesPerFrame: 1,
        },
      },
      opts,
    );
  }

  public addScene(scene: Scene) {
    this.scenes.push(scene);
  }

  public setActive(scene: Scene, active: boolean = true) {
    if (active) {
      this.activeScene = scene;
    }
    else {
      this.activeScene = undefined;
    }
    console.log('active scene', this.activeScene);
  }

  public static run() {
    if (!this.instance) throw new Error('Engine has not been initialized');
    this.instance.timer.start();
    this.instance.loop();
  }

  private loop() {
    // begin frame
    if (!this._paused || (this._paused && this._step > 0)) {
      this._step--;
      const now = this.timer.timeMs;
      this.beginFrame();

      this.loopParameters.step.update(now);

      this.debugger.stats.currFrame.id = this.debugger.stats.prevFrame.id + 1;
      this.debugger.stats.currFrame.delta = this.loopParameters.step.millis;
      this.debugger.stats.currFrame.fps = 1.0 / (this.loopParameters.step.millis / 1000);
      this.debugger.stats.currFrame.duration.update = 0;
      this.debugger.stats.currFrame.duration.render = 0;

      // update
      let updates = 0;
      while ((now - this.loopParameters.updateTimer > this.loopParameters.updateInterval) && (updates < this.loopParameters.maxUpdatesPerFrame)) {
        this.loopParameters.updateStep.update(now);
        this.timer.tick();
        this.preUpdate(this.loopParameters.updateStep);
        this.update(this.loopParameters.updateStep);
        this.postUpdate(this.loopParameters.updateStep);
        this.debugger.stats.currFrame.duration.update += this.timer.elapsedMs;
        this.loopParameters.updateTimer += this.loopParameters.updateInterval;
        updates++;
      }

      // render
      if (now - this.loopParameters.renderTimer > this.loopParameters.renderInterval) {
        this.timer.tick();
        this.preRender();
        this.render();
        this.postRender();
        this.debugger.stats.currFrame.duration.render = this.timer.elapsedMs;
        this.loopParameters.renderTimer += this.loopParameters.renderInterval;
      }

      // end frame
      this.endFrame();
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  private beginFrame() {
    // Canvas.height = window.innerHeight;
    // Canvas.clearRect();
  }

  private endFrame() { }

  private preUpdate(step: TimeStep) {
    this.activeScene?.preUpdate(step);
  }

  private update(step: TimeStep) {
    this.activeScene?.update(step);
  }

  private postUpdate(step: TimeStep) {
    this.activeScene?.postUpdate(step);
  }

  private preRender() {
    Canvas.clearRect();
    this.activeScene?.preRender();
  }

  private render() {
    this.activeScene?.render();
  }

  private postRender() {
    this.activeScene?.postRender();
  }
}