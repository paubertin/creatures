import { Vector2 } from "../vector2";
import { Bullet } from "./bullet";
import { Config } from "./config";
import { Creature } from "./creature";
import { DNAFactory } from "./dna/factory";
import { Egg } from "./egg";
import { Food } from "./food";
import { GameObject } from "./game-object";
import { PossessedBrain } from "./brain/possessed-brain";
import { Wall } from "./wall";
import { Color } from "./color";
import { BaseDNA } from "./dna/base";
import { BaseStorage } from "./storage/base";

export class World extends GameObject {
  private _food: Food[] = [];
  private _creatures: Creature[] = [];
  private _eggs: Egg[] = [];
  private _bullets: Bullet[] = [];
  private _walls: Wall[];

  private _iteration_number: number;
  private _random_creatures: number;
  private _resurrected_creatures: number;
  private _mated_creatures: number;
  private _uploaded_creatures: number;
  private _downloaded_creatures: number;
  private _dna_factory: DNAFactory;
  private _storage: BaseStorage;
  private _selected_creature: Creature | null;

  public context: CanvasRenderingContext2D;

  public get randomCreatures () {
    return this._random_creatures;
  }

  public get matedCreatures () {
    return this._mated_creatures;
  }

  public get resurrectedCreatures () {
    return this._resurrected_creatures;
  }

  public get creatures () {
    return this._creatures;
  }

  constructor(canvas_object: HTMLCanvasElement, dnaFactory: DNAFactory, storage: BaseStorage) {
    super();
    Config
      .set('overpopulation_limit', 40, true)
      .set('maximum_amount_of_food', 40, true)
      .set('food_generation_probability', 0.01, true)
      .set('dead_creature_nutrition', 6000, true)
      .set('default_food_nutrition', 3500, true)
      .set('minimum_population_size', 20, true)
      .set('creature_creation_probability', 0.01, true);

    this._food = [];
    this._creatures = [];
    this._eggs = [];
    this._bullets = [];
    this._walls = [
      new Wall([new Vector2({ x: 800, y: 200 }), new Vector2({ x: 800, y: 400 })]),
      new Wall([new Vector2({ x: 800, y: 600 }), new Vector2({ x: 800, y: 800 })]),
      new Wall([new Vector2({ x: 0, y: 450 }), new Vector2({ x: 600, y: 450 })]),
      new Wall([new Vector2({ x: 1000, y: 600 }), new Vector2({ x: 1400, y: 300 })]),
      new Wall([new Vector2({ x: Math.floor(Math.random() * 1500), y: Math.floor(Math.random() * 800) }), new Vector2({ x: Math.floor(Math.random() * 1500), y: Math.floor(Math.random() * 800) })])
    ];
    this._iteration_number = 0;
    this._random_creatures = 0;
    this._resurrected_creatures = 0;
    this._mated_creatures = 0;
    this._uploaded_creatures = 0;
    this._downloaded_creatures = 0;
    this._dna_factory = dnaFactory;
    this._storage = storage;
    this._selected_creature = null;

    this.context = canvas_object.getContext("2d")!;

    document.addEventListener("keypress", e => {
      if (e.keyCode == 110) {
        this._creatures = this._creatures.filter(creature => {
          return !creature.brain.possessed;
        });

        let dna = this._dna_factory.build();
        let creature = new Creature(this, dna, this.randomNonColidingPosition(), this._iteration_number);
        creature.brain = new PossessedBrain(creature.brain);
        this._creatures.push(creature);
      }
    });

    canvas_object.addEventListener("click", event => {
      console.log('event', event);
      if (event.ctrlKey) {
        this._creatures = this._creatures.filter(creature => {
          return !creature.containsPoint(new Vector2({ x: event.clientX, y: event.clientY }));
        });
      }
      else {
        this._selected_creature = this._creatures[0];
        let distance = this._selected_creature.distanceFromPoint(new Vector2({ x: event.clientX, y: event.clientY }));

        this._creatures.forEach(creature => {
          if (creature.distanceFromPoint(new Vector2({ x: event.clientX, y: event.clientY })) < distance) {
            this._selected_creature = creature;
            distance = creature.distanceFromPoint(new Vector2({ x: event.clientX, y: event.clientY }));
          }
        });

        if (this._selected_creature) {
          this._selected_creature.brain.draw();
        }
      }
    });
  }

  getWalls() {
    return this._walls;
  }

  getIterationNumber() {
    return this._iteration_number;
  }

  injectCreature<DNA extends BaseDNA>(dna: DNA, position: Vector2, parents: [ DNA, DNA ]) {
    this._mated_creatures++;
    let creature = new Creature(this, dna, position, this._iteration_number);
    this._storage.add(dna, parents[0], parents[1]);
    this._uploaded_creatures++;
    this._creatures.push(creature);
  }

  generateRandomCreatures(n: number) {
    this._random_creatures++;
    for (let i = 0; i < n; i++) {
      let dna = this._dna_factory.build();
      this._storage.add(dna);
      this.addCreature(dna);
    }
  }

  addCreature <DNA extends BaseDNA> (dna: DNA) {
    let creature = new Creature(this, dna, this.randomNonColidingPosition(), this._iteration_number);
    this._uploaded_creatures++;
    this._creatures.push(creature);
  }

  randomNonColidingPosition() {
    let position = new Vector2();
    do {
      position = new Vector2({ x: Math.random() * 1600, y: Math.random() * 900 });
    } while (this._collidesWithWall(position));
    return position;
  }

  _collidesWithWall(point: Vector2) {
    let collides = false;
    this._walls.forEach(w => {
      collides = collides || w.pointCollides(point, 20);
    });
    return collides
  }

  iteration() {
    ++this._iteration_number;
    this.calculateCreatureVision();
    this.iterateCreatures();
    this.removeTheDead();
    this.feedCreatures();
    this.detectBulletHits();
    this.reproduce();

    if (Math.random() < Config.get<number>('creature_creation_probability') && this._creatures.length < Config.get<number>('minimum_population_size')) {
      if (Math.random() < 0.1) {
        this.generateRandomCreatures(1);
      } else {
        let dna = this._storage.getOne();
        if (!dna) {
          this.generateRandomCreatures(1);
        } else {
          this._downloaded_creatures++;
          this.addCreature(dna);
          this._resurrected_creatures++;
        }
      }
    }

    if (this._creatures.length < Config.get<number>('overpopulation_limit') && this._food.length < Config.get<number>('maximum_amount_of_food') && Math.random() < Config.get<number>('food_generation_probability')) {
      this._food.push(new Food(this.randomNonColidingPosition(), Config.get<number>('default_food_nutrition'), 5));
    }

    setTimeout(() => { this.iteration() }, 0);
  }

  calculateCreatureVision() {
    const things: GameObject[] = [
      ...this._creatures,
      ...this._food,
      ...this._eggs,
      ...this._bullets,
      ...this._walls,
    ];
    this._creatures.forEach(creature => {
      creature.see(things);
    });
  }

  iterateCreatures() {
    this._creatures.forEach(creature => {
      creature.iterate();
      if (!creature.alive) {
        this._food.push(new Food(creature.position, Config.get<number>('dead_creature_nutrition'), 7));
      }
    });
  }

  removeTheDead() {
    this._creatures = this._creatures.filter(creature => {
      return creature.alive;
    });
    if (this._selected_creature != null && !this._selected_creature.alive) {
      this._selected_creature = null;
    }
  }

  detectBulletHits() {
    this._bullets.forEach(bullet => {
      bullet.iterate();
    });
    this._creatures.forEach(creature => {
      this._bullets.forEach(b => {
        if (creature.distance(b) < 20) {
          creature.takeHit();
          b.remove();
        }
      });
    });
    this._bullets = this._bullets.filter(bullet => {
      return bullet.exists;
    });
  }

  feedCreatures() {
    this._creatures.forEach(creature => {
      this._food.forEach(f => {
        if (creature.distance(f) < 25) {
          creature.feed(f);
          f.remove();
        }
      });
    });
    this._food = this._food.filter(f => {
      return f.exists();
    });
  }

  reproduce() {
    this._creatures.forEach(creature => {
      this._eggs.forEach(e => {
        if (creature.distance(e) < 20 && creature.canTakeEgg(e)) {
          creature.takeEgg(e);
          e.remove();
        }
      });
    });
    this._eggs = this._eggs.filter(e => {
      return e.exists;
    });
  }

  drawWorld() {
    this.context.lineWidth = 2;
    this.context.clearRect(0, 0, 1600, 900);
    this._walls.forEach(w => {
      w.drawTo(this.context);
    });
    this._eggs.forEach(e => {
      e.drawTo(this.context);
    });
    this._food.forEach(f => {
      f.drawTo(this.context);
    });
    this._bullets.forEach(b => {
      b.drawTo(this.context);
    });
    this._creatures.forEach(creature => {
      creature.drawTo(this.context, this._iteration_number);
    });

    if (this._creatures[0]) {
      this.context.beginPath();
      this.context.strokeStyle = '#ff0055';
      let oldest_creature = this._creatures[0].position;
      this.context.rect(oldest_creature.x - 30, oldest_creature.y - 30, 60, 60);
      this.context.stroke();
    }

    if (this._selected_creature) {
      this.context.beginPath();
      this.context.strokeStyle = '#55ff00';
      let creature_position = this._selected_creature.position;
      this.context.rect(creature_position.x - 28, creature_position.y - 28, 56, 56);
      this.context.stroke();
    }
  }

  addEgg(position: Vector2, color: Color, dna: BaseDNA) {
    this._eggs.push(new Egg(position, color, dna))
  }

  addBullet(position: Vector2, direction: number) {
    this._bullets.push(new Bullet(position, direction, this))
  }
  
  public override visibilityColor(position: Vector2, direction: number): Color {
    throw new Error("Method not implemented.");
  }
}