import { GameLoop } from "../gameLoop";
import { Canvas } from "./engine/canvas";
import { CreatureManager } from "./creature.manager";
import { Engine } from "./engine/engine";
import { FoodManager } from "./food.manager";
import { Scene } from "./engine/scene";
import { World } from "./entities/world";
import { Path } from "./geometry/path";

const a: (string | number)[] = [];

a.filter((v): v is string => typeof v === 'string').map((v) => {});

async function main () {
  const engine = await Engine.initialize({
    rendering: {
      renderInterval: 1000 / 30,
      updateInterval: 1000 / 30,
    },
  });

  const scene = new Scene(engine);

  const world = new World(scene);

  FoodManager.init(0, world);

  CreatureManager.init(2, world);

  /*
  const gameLoop = new GameLoop(
    () => {
      CreatureManager.update();
    },
    () => {
      CreatureManager.render();
      FoodManager.render();
    }
  );
  */


  const listener = (evt: MouseEvent) => {
    CreatureManager.selectedCreature!.position.x = evt.clientX;
    CreatureManager.selectedCreature!.position.y = evt.clientY;
  }

  window.addEventListener('mousedown', (evt) => {
    let found = false;
    for (const c of CreatureManager.creatures) {
      if (c.isPointInside(new DOMPoint(evt.clientX, evt.clientY))) {
        if (CreatureManager.selectedCreature?.id === c.id) {
          CreatureManager.selectedCreature = null;
        }
        else {
          CreatureManager.selectedCreature = c;
        }
        found = true;
        break;
      }
    }
    if (!found) {
      CreatureManager.selectedCreature = null;
    }
    if (CreatureManager.selectedCreature) {
      window.addEventListener('mousemove', listener);
    }
    else if (listener) {
      window.removeEventListener('mousemove', listener);
    }
  });


  /*
  window.addEventListener('click', (evt) => {
    let found = false;
    console.log('click', evt.clientX, evt.clientY);
    for (const c of CreatureManager.creatures) {
      if (c.isPointInside(new DOMPoint(evt.clientX, evt.clientY))) {
        if (CreatureManager.selectedCreature?.id === c.id) {
          CreatureManager.selectedCreature = null;
        }
        else {
          CreatureManager.selectedCreature = c;
        }
        found = true;
        break;
      }
    }
    if (!found) {
      CreatureManager.selectedCreature = null;
    }
  });
  */

  window.addEventListener('keydown', (evt) => {
    if (evt.key === 'd') {
      Canvas.debug = !Canvas.debug;
    }
    if (evt.key === ' ') {
      Engine.pause = !Engine.pause;
    }
    if (evt.key === 's') {
      Engine.step();
    }
  });

  // gameLoop.start();

  console.log('Path', Path);

  scene.setActive();

  Engine.run();

}

void main();
