import { BBox } from "../utils";

export class QuadTree<T extends { globalBbox: BBox }> extends DOMRect {

  public entities: T[] = [];
  public nodes: QuadTree<T>[] = [];

  public constructor(x: number, y: number, w: number, h: number, public maxObjects: number = 10, public maxLevels: number = 4, public level: number = 0) {
    super(x, y, w, h);
  }

  /**
  * Split the node into 4 subnodes
  */
  public split() {

    var nextLevel = this.level + 1,
      subWidth = this.width / 2,
      subHeight = this.height / 2,
      x = this.x,
      y = this.y;

    //top right node
    this.nodes[0] = new QuadTree(
      x + subWidth,
      y,
      subWidth,
      subHeight
      , this.maxObjects, this.maxLevels, nextLevel);

    //top left node
    this.nodes[1] = new QuadTree(
      x,
      y,
      subWidth,
      subHeight
      , this.maxObjects, this.maxLevels, nextLevel);

    //bottom left node
    this.nodes[2] = new QuadTree(
      x,
      y + subHeight,
      subWidth,
      subHeight
      , this.maxObjects, this.maxLevels, nextLevel);

    //bottom right node
    this.nodes[3] = new QuadTree(
      x + subWidth,
      y + subHeight,
      subWidth,
      subHeight
      , this.maxObjects, this.maxLevels, nextLevel);

  }

  /**
   * Determine which node the object belongs to
   * @param {Rect} rect      bounds of the area to be checked ({ x, y, width, height })
   * @return {number[]}       an array of indexes of the intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right / ne, nw, sw, se)
   */
  public getIndex(item: T): number[] {

    var indexes = [],
      verticalMidpoint = this.x + (this.width / 2),
      horizontalMidpoint = this.y + (this.height / 2);

    var startIsNorth = item.globalBbox.y < horizontalMidpoint,
      startIsWest = item.globalBbox.x < verticalMidpoint,
      endIsEast = item.globalBbox.x + item.globalBbox.width > verticalMidpoint,
      endIsSouth = item.globalBbox.y + item.globalBbox.height > horizontalMidpoint;

    //top-right quad
    if (startIsNorth && endIsEast) {
      indexes.push(0);
    }

    //top-left quad
    if (startIsWest && startIsNorth) {
      indexes.push(1);
    }

    //bottom-left quad
    if (startIsWest && endIsSouth) {
      indexes.push(2);
    }

    //bottom-right quad
    if (endIsEast && endIsSouth) {
      indexes.push(3);
    }

    return indexes;

  }
  /**
   * Insert the object into the node. If the node
   * exceeds the capacity, it will split and add all
   * objects to their corresponding subnodes.
   * @param {Rect} rect      bounds of the object to be added ({ x, y, width, height })
   */
  public insert(item: T) {
    var i = 0,
      indexes;

    //if we have subnodes, call insert on matching subnodes
    if (this.nodes.length) {
      indexes = this.getIndex(item);

      for (i = 0; i < indexes.length; i++) {
        this.nodes[indexes[i]].insert(item);
      }
      return;
    }

    //otherwise, store object here
    this.entities.push(item);

    //max_objects reached
    if (this.entities.length > this.maxObjects && this.level < this.maxLevels) {

      //split if we don't already have subnodes
      if (!this.nodes.length) {
        this.split();
      }

      //add all objects to their corresponding subnode
      for (i = 0; i < this.entities.length; i++) {
        indexes = this.getIndex(this.entities[i]);
        for (var k = 0; k < indexes.length; k++) {
          this.nodes[indexes[k]].insert(this.entities[i]);
        }
      }

      //clean up this node
      this.entities = [];
    }

  }

  /**
   * Return all objects that could collide with the given object
   * @param {Rect} pRect      bounds of the object to be checked ({ x, y, width, height })
   * @return {Rect[]}         array with all detected objects
   */
  public retrieve(item: T) {

    var indexes = this.getIndex(item),
      returnObjects = this.entities;

    //if we have subnodes, retrieve their objects
    if (this.nodes.length) {
      for (var i = 0; i < indexes.length; i++) {
        returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(item));
      }
    }

    //remove duplicates
    if (this.level === 0) {
      return Array.from(new Set(returnObjects));
    }

    return returnObjects;

  }

  public clear() {

    this.entities = [];

    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes.length) {
        this.nodes[i].clear();
      }
    }

    this.nodes = [];

  }
}