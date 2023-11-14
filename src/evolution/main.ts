import { DNAFactory } from "./dna/factory";
import { StorageFactory } from "./storage/factory";
import { World } from "./world";

let world = new World(
    document.getElementById("main-canvas") as HTMLCanvasElement,
    new DNAFactory('neat:reduced'),
    (new StorageFactory('offline')).build()
);
world.iteration();

setInterval(() => {
    world.drawWorld();
}, 50);

let lastIterationCount = 0;
setInterval(() => {
    let fps = world.getIterationNumber() - lastIterationCount;
    document.getElementById('stats')!.innerHTML =
        `Reached ${world.getIterationNumber()} at ${fps} fps<br/>` +
        `Random creatures: ${world.randomCreatures}, Mated creatures: ${world.matedCreatures}, Resurrected creatures: ${world.resurrectedCreatures}, Currently alive: ${world.creatures.length}`;
    lastIterationCount = world.getIterationNumber();
}, 1000);
