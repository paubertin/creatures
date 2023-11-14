import { BaseDNA } from "../dna/base";
import { BaseStorage } from "./base";

export class OnlineStorage extends BaseStorage {

  private _cache: any[] = []; 

  add(dna: BaseDNA, mother?: BaseDNA, father?: BaseDNA) {
    throw new Error('Not implemented');
  }

  getOne (): BaseDNA | null {
    throw new Error('Not implemented');
  }

}