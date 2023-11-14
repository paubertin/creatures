import { BaseDNA } from "../dna/base";

export abstract class BaseStorage {
  public abstract add (dna: BaseDNA, mother?: BaseDNA, father?: BaseDNA): void;
  public abstract getOne (): BaseDNA | null;
}