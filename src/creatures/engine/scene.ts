import { Engine } from './engine';
import { TimeStep } from './time';

export class SceneNode {
  protected _name: string = 'default';
  protected _id: number;
  protected _scene: Scene;
  protected _parent?: SceneNode;
  protected _children: SceneNode[] = [];

  public constructor (parent: SceneNode, name?: string);
  public constructor (scene: Scene, name?: string, parent?: SceneNode);
  public constructor (scene: Scene | SceneNode, name: string = 'defaultNode', parent?: SceneNode) {
    this._scene = scene instanceof Scene ? scene : scene.scene;
    this._name = name;
    this._id = this.scene.generateUniqueId();
    const p = scene instanceof Scene ? parent : scene;
    if (p) {
      p.addChild(this);
    }
    this.scene.add(this);
  }

  public addChild (node: SceneNode) {
    node._parent = this;
    this._children.push(node);
    return this;
  }

  public get id () {
    return this._id;
  }

  public get scene (): Scene {
    return this._scene;
  }

  public get name(): string {
      return this._name;
  }

  public get parent(): SceneNode | undefined {
      return this._parent;
  }

  public get children(): SceneNode[] {
      return this._children;
  }

  protected onPreUpdate (step: TimeStep) {}

  protected onUpdate (step: TimeStep) {}

  protected onPostUpdate (step: TimeStep) {}

  protected onPreRender () {}

  protected onRender () {}

  protected onPostRender () {}

  public preUpdate (step: TimeStep) {
    this.onPreUpdate(step);
    this._children.forEach((child) => child.preUpdate(step));
  }

  public update (step: TimeStep) {
    this.onUpdate(step);
    this._children.forEach((child) => child.update(step));
  }

  public postUpdate (step: TimeStep) {
    this.onPostUpdate(step);
    this._children.forEach((child) => child.postUpdate(step));
  }

  public render () {
    this.onPreRender();
    this.onRender();
    this._children.forEach((child) => child.render());
    this.onPostRender();
  }

}

export class Scene {
  private uniqueIdCounter: number = 0;
  private _engine: Engine;
  private rootNode: SceneNode = new SceneNode(this, 'root');

  public constructor (engine: Engine) {
    this._engine = engine;
    this._engine.addScene(this);
  }

  public setActive (active: boolean = true) {
    this.engine.setActive(this, active);
  }

  public generateUniqueId(): number {
    const result = this.uniqueIdCounter;
    this.uniqueIdCounter++;
    return result;
  }

  public add (node: SceneNode) {
    if (node.parent === undefined && node.name !== 'root') {
      this.rootNode.addChild(node);
    }
  }

  public get engine () {
    return this._engine;
  }

  public get nodes () {
    return this.rootNode.children;
  }

  public get root () {
    return this.rootNode;
  }

  public getNodes (cb: (node: SceneNode) => boolean, pool: SceneNode[] = this.rootNode.children) {
    const nodes: SceneNode[] = [];
    for (const node of pool) {
      const subNodes = this.getNodes(cb, node.children);
      if (cb(node)) {
        nodes.push(node);
      }
      nodes.push(...subNodes);
    }
    return nodes;
  }

  public preUpdate (step: TimeStep) {
    this.rootNode.preUpdate(step);
  }

  public update (step: TimeStep) {
    this.rootNode.update(step);
  }

  public postUpdate (step: TimeStep) {
    this.rootNode.postUpdate(step);
  }

  public preRender () {}

  public render () {
    this.rootNode.render();
  }

  public postRender () {}

}