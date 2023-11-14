import { BaseDNA } from "../dna/base";
import { BaseStorage } from "./base";

interface StorageItem {
  dna: BaseDNA;
  children: any[];
  parents: any[];
  grand_child_count: number;
  lives: number;
}

export class OfflineStorage extends BaseStorage {

  public dnas: Record<string, StorageItem> = {};
  public maxPopulation: number = 50;

  public constructor() {
    super();
  }

  add(dna: BaseDNA, mother?: BaseDNA, father?: BaseDNA) {
      this.dnas[dna.id] = { dna:dna, children: [], parents:[], grand_child_count: 0, lives: 1 };
      if (father) { this._addChild(father, dna); }
      if (mother) { this._addChild(mother, dna); }
  }

  getOne() {
      if (this._size() < 20) {
          return null;
      }
      let item = this._randomItem();
      item.lives += 1;
      return item.dna;
  }

  _addChild(parent: BaseDNA, child: BaseDNA) {
      if(this.dnas[child.id]) {
          this.dnas[child.id].parents.push(parent.id);
      }
      if(this.dnas[parent.id]) {
          this.dnas[parent.id].children.push(child.id);
          this.dnas[parent.id].parents.forEach(parent => {
              if (this.dnas[parent]) {
                  this.dnas[parent].grand_child_count += 1;
              }
          });
      }
  }

  _size() {
      return Object.keys(this.dnas).length;
  }

  _randomItem() {
      let keys = Object.keys(this.dnas);
      return this.dnas[keys[Math.floor(Math.random() * keys.length)]];
  }

  _fitness(item: StorageItem) {
      return (item.grand_child_count + item.children.length) / item.lives;
  }

  reduce() {

      if(Object.keys(this.dnas).length > this.maxPopulation) {
          let dnas_list = Object.values(this.dnas).sort((lhs, rhs) => {
              return this._fitness(lhs) - this._fitness(rhs);
          });
          dnas_list.slice(0, Math.floor(this.maxPopulation/2)).forEach(item => {
              delete this.dnas[item.dna.id];
          });
          dnas_list.slice(Math.floor(this.maxPopulation/2)).forEach(item => {
          });
      }
  }
}