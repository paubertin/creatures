export class Bone {

  public da: number = 0;

  public constructor(
    public cellId1: number,
    public cellId2: number,
    public d = 32,
    public angle = Math.random() * Math.PI * 2,
  ) { }

  public update() {
    this.angle += this.da;
    this.da *= 0.9;
  }
}