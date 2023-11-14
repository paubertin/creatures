import { NeatDNA } from "./neat-dna";
import { SimpleDNA } from "./simple";

export class DNAFactory {
  public constructor (private _mode: 'simple:full' | 'simple:reduced' | 'neat' | 'neat:reduced') {}

  public build () {
    switch (this._mode) {
      case 'simple:full': return SimpleDNA.generateRandomDna();
      case 'simple:reduced': return SimpleDNA.generateRandomDnaWithReducedComplexity();
      case 'neat': return NeatDNA.generateRandomDna();
      case 'neat:reduced': return NeatDNA.generateReducedRandomDna();
    }
  }
}