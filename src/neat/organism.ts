import { Bone } from "./bone";
import { Cell } from "./cell";

export class Organism {

  public birthDate: number;
  public deathDate: number | undefined = undefined;
  public alive: boolean = true;
  public selected: boolean = false;

  public energy: number = 1;
  public lastEnergy: number;
  public health: number = 100;
  public lastHealth: number;
  public age: number = 0;

  public children: Organism[] = [];
  public parent: Organism | null = null;

  public brainMutationRate: number = 25000;
  public brainTimer: number = 0;
  public brainFitness: number = 0;

  public neuralMutations = [];

  public cells: Cell[] = [];
  public bones: Bone[] = [];

  public ui: any;

  public constructor()
  public constructor(numCells: number, x: number, y: number)
  public constructor(numCells?: number, x?: number, y?: number) {
    this.birthDate = Engine.ticks;

    this.energy = 1;
    this.health = 100;
    this.age = 0;

    this.lastEnergy = this.energy;
    this.lastHealth = this.health;
    const angle = Math.random() * Math.PI * 2;

    if (numCells !== undefined) {
      this.cells.push(new Cell(0, this, x!, y!, angle));

      for (let i = 1; i < numCells; i++) {
        this.cells.push(new Cell(i, this, x! + i, y! + i, angle))
        let cell2 = Math.floor(Math.random() * i)
        this.bones.push(new Bone(i, cell2, 32))
      }
    }
    this.initBrain();
  }

  public clone() {
    const org = new Organism();

    let xpos = this.cells[0].x;
    let ypos = this.cells[0].y;

    const angle = Math.random() * Math.PI * 2;

    xpos += Math.cos(angle) * 300;
    ypos += Math.sin(angle) * 300;

    let dx = -(this.cells[0].x - xpos) / 50;
    let dy = -(this.cells[0].y - ypos) / 50;


    for (let i = 0; i < this.cells.length; i++) {
      org.cells.push(new Cell(i, this, xpos, ypos, this.cells[i].angle, this.cells[i].type));
      org.cells[i].dx = dx;
      org.cells[i].dy = dy;
    }

    for (let i = 0; i < this.bones.length; i++) {
      org.bones.push(new Bone(this.bones[i].cellId1, this.bones[i].cellId2, this.bones[i].d, this.bones[i].angle));
    }

    org.energy = 0;

    org.brain = this.brain.copy();

    org.parent = this;

    // mutate this biololgically.
    for (let i = 0; i < BioMutations.length; i++) {
      for (let i = 0; i < BioMutations.length; i++) {
        if (Math.random() < BioMutations[i].chance) {
          BioMutations[i].apply(org);
        }
      }
    }

  }

  initBrain() {
    let inputs = ["Always", "Hunger", "Clock"];
    let outputs = [];
    for (let i = 0; i < this.cells.length; i++) {
      if (cell_type_objects[this.cells[i].type].neuron_type == "Input") {
        this.cells[i].brain_index = inputs.length;

        let inp = [];

        for (let j = 0; j < cell_type_objects[this.cells[i].type].neurons.length; j++) {
          inp.push(`${this.cells[i].type} - ${cell_type_objects[this.cells[i].type].neurons[j]}`)
        }

        inputs.push(...inp)
      }
    }
    for (let i = 0; i < this.cells.length; i++) {
      if (cell_type_objects[this.cells[i].type].neuron_type == "Output") {
        this.cells[i].brain_index = inputs.length + outputs.length;

        let inp = [];

        for (let j = 0; j < cell_type_objects[this.cells[i].type].neurons.length; j++) {
          inp.push(`${this.cells[i].type} - ${cell_type_objects[this.cells[i].type].neurons[j]}`)
        }

        outputs.push(...inp)
      }
    }

    this.brain_inputs = inputs;
    this.brain_outputs = outputs;


    this.brain = new Genome([inputs, outputs]);

    // some minor mutation 
    for (let i = 0; i < neural_mutations.length; i++) {
      if (Math.random() < neural_mutations[i].chance + 1) {
        this.neural_mutations.push({
          data: neural_mutations[i].func(this.brain),
          time: engine.time,
          mr: 1
        });
      }
    }
  }

  getCell(id) { for (let i = 0; i < this.cells.length; i++) { if (this.cells[i].id == id) { return this.cells[i] } } }

  die() {
    this.alive = false;
    this.death = engine.ticks
    if (engine.selected != undefined) {
      if (engine.selected.birthdate == this.birthdate) {
        engine.selected.closeUI()
        engine.selected = undefined;
      }
    }
    for (let i = 0; i < engine.organisms.length; i++) {
      if (engine.organisms[i].birthdate == this.birthdate) {
        engine.organisms.splice(i, 1)
      }
    }

    engine.updateTree();
  }

  lay() {
    if (this.children < MAX_KIDS) {
      this.children += 1;
      engine.addOrganism(new Organism("Copy", this))
    }
  }

  mutate_brain() {
    /*
        The brain will mutate more if the energy change is negative
    */

    let energy_change = (this.energy - this.brain_energy_last) + (this.health - this.brain_health_last);
    this.brain_energy_last = this.energy;
    this.brain_health_last = this.health;

    let n = energy_change * -1

    for (let i = 0; i < neural_mutations.length; i++) {
      if (Math.random() < neural_mutations[i].chance + n) {
        this.neural_mutations.push({
          data: neural_mutations[i].func(this.brain),
          time: engine.time,
          mr: n
        });
      }
    }
  }

  update() {
    this.energy = clamp(this.energy, -1, this.cells.length)
    this.health = clamp(this.health, 0, 100)
    this.age += 1;

    if (this.energy <= -1) {
      this.health -= 0.01

      if (this.health <= 0) {
        this.die();
      }
    }
    if (this.energy > 0.1 && this.age < MAX_AGE) {
      this.health += 0.01;
    }
    if (this.energy > this.cells.length / 2 && this.children < MAX_KIDS && this.age > (MATURITY_AGE * (this.children + 1))) {
      this.lay();
    }

    this.brain_timer += 1;

    if (this.brain_timer > this.brain_mutation_rate) {
      this.brain_timer = 0;
      this.mutate_brain();
    }

    // load inputs
    // constant, hunger, clock
    // let energy_change = (this.energy - this.brain_energy_last) + (this.health - this.brain_health_last);
    let hunger = 1 - (this.energy / this.cells.length);

    let inputs = [1, hunger, ((engine.ticks % 100) / 50) - 1];
    for (let i = 0; i < this.cells.length; i++) {

      if (cell_type_objects[this.cells[i].type].neuron_type == "Input") {
        // this cell inputs data to the brain

        inputs.push(...this.cells[i].neural_vals)
      }

    }

    let out = this.brain.process(inputs)
    let oi = 0;

    for (let i = 0; i < this.cells.length; i++) {

      if (cell_type_objects[this.cells[i].type].neuron_type == "Output") {
        // this cell inputs data to the brain
        let tiny_input = [];
        for (let c = 0; c < cell_type_objects[this.cells[i].type].neurons.length; c++) {
          tiny_input.push(out[oi + c])
        }
        this.cells[i].neural_vals = tiny_input;

        oi += tiny_input.length;
      }

    }

    for (let i = 0; i < this.bones.length; i++) {
      this.bones[i].update()

      let c1 = this.getCell(this.bones[i].c1);
      let c2 = this.getCell(this.bones[i].c2);

      let a = this.bones[i].a;

      let midx = (c1.x + c2.x) / 2
      let midy = (c1.y + c2.y) / 2

      let wantedc1x = midx + (Math.cos(a) * (16));
      let wantedc1y = midy + (Math.sin(a) * (16));

      c1.dx += (c1.x - wantedc1x) * -0.01
      c1.dy += (c1.y - wantedc1y) * -0.01

      let wantedc1x2 = midx + (Math.cos(a + Math.PI) * (16));
      let wantedc1y2 = midy + (Math.sin(a + Math.PI) * (16));

      c2.dx += (c2.x - wantedc1x2) * -0.01
      c2.dy += (c2.y - wantedc1y2) * -0.01
    }

    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].update()
    }

    if (engine.pure_speed == false) {
      this.updateUI();
      this.brain.updateUI()
    }

    let food = engine.foodGrid.getAll(this.cells[0].x, this.cells[0].y);
    for (let c = 0; c < food.length; c++) {
      for (let f = 0; f < food[c].length; f++) {
        if (pt(this.cells[0].x, this.cells[0].y, food[c][f].x, food[c][f].y) < 50) {
          food[c].splice(f, 1);
          engine.foodGrid.length -= 1;
          this.energy += engine.food_val;
          return
        }
      }
    }
  }

  render() {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].render();
    }
    if (engine.selected != undefined && engine.selected.id == this.id) {
      cam.goto(this.cells[0].x, this.cells[0].y)
    }
  }

  timeAlive() {
    return `${(this.death || engine.ticks - this.birthdate).toFixed(2) / 1000}k` // how thousand TPS this org was alive
  }

  openUI() {
    if (this.ui != undefined) { return }
    let ui = new TabHolder("Organism #" + this.id, true, () => {
      this.closeUI();
      this.selected = false;
      engine.selected = undefined;
    });
    if (this.alive == true) {
      ui.add(new Label("Help", "Click on a cell that is highlighted \nto open that cell's UI.\nClose this tab to unselect\nthe organism."));
    }
    ui.add(new Label("Cells", this.cells.length));
    ui.add(new Label("Birthdate", this.birthdate));
    ui.add(new Label("Time of death", this.death));
    ui.add(new Label("Ticks alive", `${this.timeAlive()} Ticks`));
    let stats = new Holder("Stats");

    let general = new Holder("General")

    general.add(new Slider("Age", 0, MAX_AGE, this.age, 1));
    general.add(new Slider("Children", 0, MAX_KIDS, this.children, 1));
    general.add(new Slider("Hunger", -1, 1, 0, 0.01));
    if (this.alive == true) {
      general.add(new Slider("Health", 0, 100, this.health, 0.01));
      general.collapse();
      stats.add(general);

      let brain = new Holder("Brain stats");
      brain.add(new Slider("Brain timer", 0, this.brain_mutation_rate, this.brain_timer, 1));
      brain.add(new Label("Energy last", this.brain_energy_last));
      brain.add(new Slider("Effiency Diff", -1, 1, (this.energy - this.brain_energy_last) + (this.health - this.brain_health_last), 0.01));
      brain.collapse();
      stats.add(brain)

      let energy = new Holder("Energy stats");
      energy.add(new Slider("Energy", -1, this.cells.length, this.energy, 0.000000001));
      energy.add(new Slider("Energy change per tick x10", -0.001, 0.001, 0, 0.000000001));
      energy["Energy change per tick x10"].fix = 7;
      for (let i = 0; i < this.cells.length; i++) {
        let sl = new Slider(`${this.cells[i].type} #${i} x10`, -0.001, 0.001, 0, 0.000000001)
        sl.fix = 7;
        energy.add(sl);
      }
      energy.collapse();
      stats.add(energy)

    }
    stats.collapse();
    if (this.alive == true) {
      ui.add(stats);
    }

    ui.add(new Canvas("Anatomy", (p, org = this) => {
      p.setup = function () {
        p.createCanvas(350, 150);

        p.translate(p.width / 2, p.height / 2)

        let cells = structuredClone(org.cells);
        let bones = structuredClone(org.bones);

        for (let i = 0; i < cells.length; i++) {
          cells[i].x = rng(-10, 10);
          cells[i].y = rng(-10, 10);
        }

        function getCell(id) {
          for (let i = 0; i < cells.length; i++) {
            if (cells[i].id == id) {
              return cells[i];
            }
          }
        }


        for (let t = 0; t < cells.length; t++) {
          for (let i = 0; i < bones.length; i++) {
            let bone = bones[i];

            bone.a += bone.da;
            bone.a = bone.a % (Math.PI * 2)

            bone.da *= 0.9;

            let c1 = getCell(bone.c1);
            let c2 = getCell(bone.c2);

            let d = bone.d;
            let a = bone.a;

            let midx = (c1.x + c2.x) / 2
            let midy = (c1.y + c2.y) / 2

            let wantedc1x = midx + (Math.cos(a) * (d / 2));
            let wantedc1y = midy + (Math.sin(a) * (d / 2));

            c1.x = wantedc1x
            c1.y = wantedc1y

            let wantedc1x2 = midx + (Math.cos(a + Math.PI) * (d / 2));
            let wantedc1y2 = midy + (Math.sin(a + Math.PI) * (d / 2));

            c2.x = wantedc1x2
            c2.y = wantedc1y2
          }
        }

        for (let i = 0; i < cells.length; i++) {
          p.fill(cell_type_objects[cells[i].type].color);
          p.ellipse(cells[i].x, cells[i].y, 32, 32);

          if (cell_type_objects[cells[i].type].neuron_type == "Input") {
            p.line(cells[i].x - 3, cells[i].y, cells[i].x + 3, cells[i].y);
            p.line(cells[i].x, cells[i].y - 3, cells[i].x, cells[i].y + 3);
          } else if (cell_type_objects[cells[i].type].neuron_type == "Output") {
            p.line(cells[i].x - 3, cells[i].y, cells[i].x + 3, cells[i].y);
          }
        }

      }
    }))

    ui.add(new Button("Open Brain", () => {
      this.brain.openUI()
    }))
    ui.add(new Button("Open Neural mutations", () => {
      let ui = new TabHolder("Organism #" + this.id + " Neural Mutations");
      ui.add(new Table("Mutations", ["Index", "Desc", "Time", "Mutation rate"]))
      for (let i = 0; i < this.neural_mutations.length; i++) {
        ui.Mutations.addRow([i, this.neural_mutations[i].data, this.neural_mutations[i].time, this.neural_mutations[i].mr])
      }
    }))
    if (this.alive == true) {
      ui.add(new Button("Feed", () => {
        this.energy += 0.75;
      }))
      ui.add(new Button("Lay", () => {
        this.lay();
      }))
    }


    ui.setPos(((innerWidth / 10) * 3.5), 300)

    this.ui = ui;
  }

  updateUI() {
    if (this.ui == undefined) { return }

    this.ui.Stats.Cells = this.cells.length;
    this.ui["Time of death"].changeVal(this.death);
    this.ui["Ticks alive"].changeVal(`${this.timeAlive()} Ticks`)
    this.ui.Stats["General"].Health.changeVal(this.health);
    this.ui.Stats["General"].Age.changeVal(this.age);
    this.ui.Stats["General"].Children.changeVal(this.children);
    this.ui.Stats["General"].Hunger.changeVal(1 - (this.energy / this.cells.length));
    this.ui.Stats["Brain stats"]["Brain timer"].changeVal(this.brain_timer);
    this.ui.Stats["Brain stats"]["Energy last"].changeVal(this.brain_energy_last);
    this.ui.Stats["Brain stats"]["Effiency Diff"].changeVal((this.energy - this.brain_energy_last) + (this.health - this.brain_health_last));

    this.ui.Stats["Energy stats"].Energy.changeVal(this.energy);
    let sum = 0;
    for (let i = 0; i < this.cells.length; i++) {
      sum += -cell_type_objects[this.cells[i].type].energy_cost(this.cells[i])
      this.ui.Stats["Energy stats"][`${this.cells[i].type} #${i} x10`].changeVal(-cell_type_objects[this.cells[i].type].energy_cost(this.cells[i]) * 10)
    }
    this.ui.Stats["Energy stats"]["Energy change per tick x10"].changeVal(sum);
  }

  closeUI() {
    if (this.ui == undefined) { return }
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].closeUI();
    }
    this.brain.closeUI();
    this.ui.close();
    this.ui = undefined;
  }

  get x() {
    return this.cells[0].x
  }
  get y() {
    return this.cells[0].y
  }
}