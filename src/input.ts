export enum ARROW {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP',
  DOWN = 'DOWN',
}

export class Input {

  private static _instance: Input;

  private _heldDirections: ARROW[] = [];

  public static get initialized () {
    return this._instance !== undefined;
  }

  public static init () {
    if (!this._instance) {
      this._instance = new Input();
    }
  }

  private static _ckeckInitialized () {
    if (!this.initialized) {
      throw new Error('Input not initialized');
    }
  }

  private constructor () {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        this._onArrowPressed(ARROW.UP);
      }
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this._onArrowPressed(ARROW.DOWN);
      }
      else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this._onArrowPressed(ARROW.LEFT);
      }
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this._onArrowPressed(ARROW.RIGHT);
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        this._onArrowReleased(ARROW.UP);
      }
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this._onArrowReleased(ARROW.DOWN);
      }
      else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this._onArrowReleased(ARROW.LEFT);
      }
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this._onArrowReleased(ARROW.RIGHT);
      }
    });
  }

  public static get direction () {
    this._ckeckInitialized();
    return this._instance._heldDirections[0];
  }

  private _onArrowPressed (direction: ARROW) {
    if (this._heldDirections.indexOf(direction) === -1) {
      this._heldDirections.unshift(direction);
    }
  }

  private _onArrowReleased (direction: ARROW) {
    const index = this._heldDirections.indexOf(direction);
    if (index === -1) {
      return;
    }
    this._heldDirections.splice(index, 1);
  }
}