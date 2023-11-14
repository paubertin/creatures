import { Matrix } from "../matrix";
import { INeatDNA, NeatDNA } from "./neat-dna";
import { ISimpleDNA, SimpleDNA } from "./simple";

export class DNASerializer {

  serialize(dna: SimpleDNA | NeatDNA, mother: SimpleDNA | NeatDNA, father: SimpleDNA | NeatDNA) {
      let serialized = JSON.parse(JSON.stringify(dna));

      if (dna instanceof SimpleDNA) {
          serialized.type = 'simple';
      }
      else if (dna instanceof NeatDNA) {
          serialized.type = 'neat';
      }
      else {
          throw 'unknown dna type';
      }

      if (mother) {
          serialized.mother = mother.id;
      }
      if (father) {
          serialized.father = father.id;
      }

      return serialized;
  }

  deserialize(dna: SimpleDNA | NeatDNA) {
      let clone = JSON.parse(JSON.stringify(dna));
      let type = clone.type;

      delete clone.type;
      delete clone.mother;
      delete clone.father;

      if (type == 'neat') {
          return this._neatDna(clone);
      }

      return this._simpleDna(clone);
  }

  _simpleDna(dna: ISimpleDNA) {
      (dna.firstLayer as any).__proto__ = Matrix.prototype;
      (dna.secondLayer as any).__proto__ = Matrix.prototype;
      return new SimpleDNA(dna);
  }

  _neatDna(dna: INeatDNA) {
    let newNodeId =  this._newNodeIdMap(dna.sightResolution);
    dna.nodes['in'] = dna.nodes['in'].map(n => {
        if(newNodeId[n]) { n = newNodeId[n]; }
        return n;
    });
    dna.nodes['out'] = dna.nodes['out'].map(n => {
        if(newNodeId[n]) { n = newNodeId[n]; }
        return n;
    });
    dna.connections = dna.connections.map(c => {
        if(newNodeId[c.inNode]) { c.inNode = newNodeId[c.inNode]; }
        if(newNodeId[c.outNode]) { c.outNode = newNodeId[c.outNode]; }
        let innovationId = this._newInnovationId(c.innovation, dna.sightResolution);
        if(innovationId) { c.innovation = innovationId; }
        return c;
    });

    return new NeatDNA(dna);
}

_newNodeIdMap(sightResolution: number) {
    let map: Record<string, string> = {};
    NeatDNA.inputNodeIds(sightResolution).forEach((id, index) => {
        map[`in_${index}`] = id;
    });
    NeatDNA.outputNodeIds().forEach((id, index) => {
        map[`out_${index}`] = id;
    });
    return map;
}

_newInnovationId(oldId: string, sightResolution: number) {
    let regExp = /initial_(\d+)_(\d+)/;
    let match = regExp.exec(oldId);
    if(match) {
        return `initial_${NeatDNA.inputNodeIds(sightResolution)[parseInt(match[1])]}_${NeatDNA.outputNodeIds()[parseInt(match[2])]}`
    }
    else {
        return null;
    }
}

}