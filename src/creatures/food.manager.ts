import { SceneNode } from "./engine/scene";
import { Food } from "./entities/food";

export class FoodManager {
  private static instance: FoodManager;
  private activeFood: Food[] = [];

  private constructor (public numberOfInitialFood: number) {}

  public static spawnFood (rootNode: SceneNode) {
    this.instance.activeFood.push(new Food(rootNode));
  }

  public static init (numberOfInitialFood: number, rootNode: SceneNode) {
    if (this.instance) return;
    this.instance = new FoodManager(numberOfInitialFood);
    for(let i = 0; i < this.instance.numberOfInitialFood; i++) {
      this.spawnFood(rootNode);
    }
  }

  public static render () {
    this.instance.activeFood.forEach((food) => food.render());
  }

  public static get activeFood () {
    return this.instance.activeFood;
  }
}