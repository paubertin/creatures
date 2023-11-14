import { Canvas } from "./canvas";
import { Food } from "./food";

export class FoodManager {
  private static instance: FoodManager;
  private activeFood: Food[] = [];

  private constructor (public numberOfInitialFood: number) {}

  public static spawnFood () {
    this.instance.activeFood.push(new Food());
  }

  public static init (numberOfInitialFood: number) {
    if (this.instance) return;
    this.instance = new FoodManager(numberOfInitialFood);
    for(let i = 0; i < this.instance.numberOfInitialFood; i++) {
      this.spawnFood();
    }
  }

  public static render () {
    Canvas.clearRect('food');
    this.instance.activeFood.forEach((food) => food.render());
  }

  public static get activeFood () {
    return this.instance.activeFood;
  }
}