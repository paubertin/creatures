import { GameLoop } from "../gameLoop";
import { Canvas } from "./canvas";
import { CreatureManager } from "./creature.manager";
import { FoodManager } from "./food.manager";

function main () {
  Canvas.init();

  Canvas.drawFillRect('world', 0, 0, Canvas.width, Canvas.height, '#DDDDDD');

  FoodManager.init(20);
  CreatureManager.init(20);

  const gameLoop = new GameLoop(
    () => {
      CreatureManager.update();
    },
    () => {
      CreatureManager.render();
      FoodManager.render();
    }
  );

  window.addEventListener('click', (evt) => {
    let found = false;
    for (const c of CreatureManager.creatures) {
      if (c.isPointInside(new DOMPoint(evt.clientX, evt.clientY))) {
        console.log('inside');
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

  gameLoop.start();

}

main();
