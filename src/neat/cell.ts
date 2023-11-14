import { CellType, CellTypes } from "./cell-type";
import { Organism } from "./organism";

export class Cell {

  public dx: number = 0;
  public dy: number = 0;
  public da: number = 0;
  public friction: number = 0.95;
  public type: CellType;
  public neuralValues: number[];
  public brainIndex: number = 0;

  constructor(
    public id: number,
    public organism: Organism,
    public x: number,
    public y: number,
    public angle = Math.random() * (Math.PI * 2),
    type?: CellType,
  ) {
    if (type) {
      this.type = type;
    }
    else {
      const idx = Math.floor(Math.random() * Object.keys(CellTypes).length);
      const t = Object.keys(CellTypes)[idx] as keyof typeof CellType;
      this.type = CellType[t];
    }
    this.neuralValues = [...CellTypes[this.type].neuronsDefaults];
  }

  public update() {
    this.dx *= this.friction;
    this.dy *= this.friction;

    this.da *= 0.9;

    this.x += this.dx;
    this.y += this.dy;

    this.angle += this.da;
    this.angle = this.angle % (Math.PI * 2)

    this.organism.energy -= CellTypes[this.type].energyCost(this);
    CellTypes[this.type].update(this);

    this.updateUI();

  }

  public render() {
    /*
    fill(cell_type_objects[this.type].color.concat(map(this.org.energy, -1, this.org.cells.length, 100, 255)));
    if (this.org.selected == true) {
      stroke(255, 255, 0);
    } else {
      stroke(0, 0, 0, 255)
    }
    ellipse(this.x, this.y, 32, 32);

    if (cell_type_objects[this.type].neuron_type == "Input") {
      line(this.x - 3, this.y, this.x + 3, this.y);
      line(this.x, this.y - 3, this.x, this.y + 3);
    } else if (cell_type_objects[this.type].neuron_type == "Output") {
      line(this.x - 3, this.y, this.x + 3, this.y);
    }

    cell_type_objects[this.type].render(this);

    if (this.ui == undefined) { return }

    stroke(cell_type_objects[this.type].color, 255)
    line(this.x, this.y, cam.camX(this.ui.ele.offsetLeft), cam.camY(this.ui.ele.offsetTop))
    */
  }

  public applyForce(x: number, y: number) {
    this.dx += x;
    this.dy += y;
  }

  public rotate(da: number) {
    for (const bone of this.organism.bones) {
      if (bone.c1 === this.id) {
        // bone.a += a;
        this.organism.getCell(bone.c2).angle += da;
      }
      else if (bone.c2 == this.id) {
        // bone.a += a;
        this.organism.getCell(bone.c1).angle += da;
      }
    }
  }

  public move(speed: number) {
    this.dx += Math.cos(this.angle) * speed * 0.025;
    this.dy += Math.sin(this.angle) * speed * 0.025;
  }

  openUI() {
    /*
    if (this.ui != undefined) { return }
    let ui = new TabHolder("Cell", true, () => {
      this.closeUI();
    })
    ui.add(new Label("type", this.type, cell_type_objects[this.type].desc));

    ui.add(new Slider("Angle", 0, Math.PI * 2, this.a, 0.01, (val) => {
      this.a = val;
    }))

    let neural_holder = new Holder("Neural values");

    neural_holder.add(new Label("Neuron type", cell_type_objects[this.type].neuron_type, "This is the type of neuron this cell is producing/using."))
    for (let i = 0; i < cell_type_objects[this.type].neurons.length; i++) {
      neural_holder.add(new Slider(`${cell_type_objects[this.type].neurons[i]}[${i + this.brain_index}]`, NEAT_HP.VALUE.min, NEAT_HP.VALUE.max, this.neural_vals[i], 0.01, (val) => {
        this.neural_vals[i] = val;
      }))
    }

    ui.add(neural_holder)

    let x = ((innerWidth / 10) * 2);
    let y = ((innerHeight / 10) * 8.5);

    let dx = 300

    x += dx * this.id;

    ui.setPos(x, y)

    this.ui = ui;
    */
  }

  updateUI() {
    /*
    if (this.ui == undefined) { return }

    for (let i = 0; i < cell_type_objects[this.type].neurons.length; i++) {
      this.ui["Neural values"][`${cell_type_objects[this.type].neurons[i]}[${i + this.brain_index}]`].changeVal(this.neural_vals[i])
    }
    */
  }

  closeUI() {
    /*
    if (this.ui == undefined) { return }
    this.ui.close();
    this.ui = undefined;
    */
  }

  clone() {
    return new Cell(this.id, this.organism, this.x, this.y, this.angle, this.type);
  }
}

