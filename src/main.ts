import { Camera } from './camera';
import { Canvas } from './canvas';
import { Events } from './events';
import { GameLoop } from './gameLoop';
import { GameObject } from './gameObject';
import { gridCells } from './helpers/grid';
import { Input } from './input';
import { Hero } from './objects/hero/hero';
import { Rod } from './objects/rod/rod';
import { Resources } from './resource';
import { Sprite } from './sprite';
import './style.css'
import { Vector2 } from './vector2';

function main () {
  Canvas.init('#game-canvas');
  Resources.init();
  Input.init();
  Events.init();

  const mainScene = new GameObject();

  const skySprite = new Sprite({
    resource: Resources.get('sky'),
    frameSize: new Vector2(320, 180),
  });

  // mainScene.addChild(skySprite);

  const groundSprite = new Sprite({
    resource: Resources.get('ground'),
    frameSize: new Vector2(320, 180),
  });

  mainScene.addChild(groundSprite);

  const hero = new Hero(gridCells(6), gridCells(5));
  mainScene.addChild(hero);

  const camera = new Camera();
  mainScene.addChild(camera);

  const rod = new Rod(gridCells(11), gridCells(6));
  mainScene.addChild(rod);

  const update = (delta: number) => {
    mainScene.update(delta, mainScene);
  };

  const render = () => {
    Canvas.context.clearRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);

    skySprite.render(Canvas.context);

    Canvas.context.save();
    Canvas.context.translate(camera.position.x, camera.position.y);

    mainScene.render(Canvas.context);

    Canvas.context.restore();
  };

  const gameLoop = new GameLoop(
    update,
    render,
    () => mainScene.onStart(),
  );

  gameLoop.start();

}

main();