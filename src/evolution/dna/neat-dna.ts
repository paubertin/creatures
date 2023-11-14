import { NeatBrain } from "../brain/neat-brain";
import { Config } from "../config";
import { normal } from "../helpers";
import { BaseDNA, IBaseDNA } from "./base";
import { NeatDNAMixer } from "./neat-dna-mixer";

export interface IConnection {
  enabled: boolean;
  inNode: string;
  outNode: string;
  weight: number;
  innovation: string;
}

export interface INodesConfig {
  in: string[];
  out: string[];
  hidden: string[];
}

export interface INeatDNA extends IBaseDNA {
  connections: IConnection[];
  nodes: INodesConfig;
}

export class NeatDNA extends BaseDNA {

  protected override _dna: INeatDNA;

  public constructor(dna: INeatDNA) {
    dna.connections = NeatDNAMixer.topologicalSortConnections(dna);
    let used: Record<string, boolean> = {};
    dna.connections.forEach(c => {
      used[c.inNode] = true;
      if (used[c.outNode]) {
        dna.connections.forEach(c1 => {
          console.log(c1.inNode, c1.outNode);
        });
        throw "Found sort error";
      }
    });

    super(dna);
    this._dna = dna;
  }

  public buildBrain () {
    return new NeatBrain(this);
  }

  public mix(other: NeatDNA) {
    let this_is_primary = Math.random() < 0.5;
    let primary = (this_is_primary) ? this._dna : other._dna;
    let secondary = (!this_is_primary) ? this._dna : other._dna;

    let mixed = (new NeatDNAMixer(primary, secondary)).mix();

    return new NeatDNA({
      id: crypto.randomUUID(),
      nodes: mixed.nodes,
      connections: mixed.connections,
      eggColor: this._mixEggColor(other),
      color: this._mixColor(other),
      eyeSize: this._mixEyeSize(other),
      sightResolution: this.sightResolution,
    });
  }

  public get connections () {
    return this._dna.connections;
  }

  public get inNodes () {
    return this._dna.nodes['in'];
  }

  public get outNodes () {
    return this._dna.nodes['out'];
  }

  public get nodes () {
    return this._dna.nodes['in'].concat(this._dna.nodes['hidden']).concat(this._dna.nodes['out']);
  }

  public get nodeLevels () {
    let result: Record<string, number> = {};
    let inEdges = this.inConnectionsAsHash();
    let maxTotalDepth = 0;

    this.inNodes.forEach(n => {
      result[n] = 0;
    });

    this.connections.forEach(c => {
      if (result[c.inNode] !== undefined) { return; }
      if (!inEdges[c.inNode]) {
        return;
      }

      result[c.inNode] = 1 + inEdges[c.inNode].reduce((maxDepth, inConnection) => {
        return Math.max(maxDepth, result[inConnection.inNode]);
      }, 0);
      if (isNaN(result[c.inNode])) {
        console.log(c.inNode, result, inEdges[c.inNode]);
        throw "NaN value as level";
      }
      maxTotalDepth = Math.max(maxTotalDepth, result[c.inNode]);
    });

    this.outNodes.forEach(n => {
      result[n] = maxTotalDepth + 1;
    });

    return result;
  }

  public inConnectionsAsHash() {
    let hash: Record<string, IConnection[]> = {};
    this._dna.connections.forEach(c => {
      if (!hash[c.outNode]) { hash[c.outNode] = [] }
      hash[c.outNode].push(c);
    });
    return hash;
  }

  public pixelId(i: number) {
    return NeatDNA.pixelIdForResolution(i, this.sightResolution);
  }

  public static pixelIdForResolution(i: number, resolution: number) {
    let pixelIndex = i - Math.floor(resolution / 2);
    let pixelSide = (pixelIndex < 0) ? 'l' : ((pixelIndex > 0) ? 'r' : 'c');
    return pixelSide + Math.abs(pixelIndex);
  }


  public static generateRandomDna() {
    const sightResolution = 3;
    const connections = NeatDNA.randomInitialConnections(sightResolution);
    return NeatDNA.buildRandomDnaWithConnections(sightResolution, connections);
  }


  public static generateReducedRandomDna() {
    let sightResolution = 3;
    var connections = NeatDNA.randomReducedInitialConnections(sightResolution);
    return NeatDNA.buildRandomDnaWithConnections(sightResolution, connections);
  }

  public static buildRandomDnaWithConnections(sightResolution: number, connections: IConnection[]) {
    return new NeatDNA({
      id: crypto.randomUUID(),
      nodes: NeatDNA.initialNodes(sightResolution),
      connections: connections,
      eggColor: Math.floor(Math.random() * 360),
      color: Math.floor(Math.random() * 360),
      eyeSize: (0.17 + 0.1 * Math.random()) * Math.PI,
      sightResolution: sightResolution
    });
  }

  public static randomInitialConnections(sightResolution: number) {
    let connections: IConnection[] = [];
    let initialNodes = NeatDNA.initialNodes(sightResolution);
    initialNodes['in'].forEach(inNode => {
      initialNodes['out'].forEach(outNode => {
        connections.push({
          enabled: true,
          inNode: inNode,
          outNode: outNode,
          weight: normal({ mean: 0, dev: Config.get('deviation_of_new_connection_weight_distribution') }),
          innovation: `initial_${inNode}_${outNode}`
        });
      });
    });
    return connections;
  }

  public static randomReducedInitialConnections(sightResolution: number) {
    let connections: IConnection[] = [];

    let reducedOutputs = ['acceleration_angle', 'acceleration_radius'];
    let reducedInputs = [];
    for (let i = 0; i < sightResolution; i++) {
      let pixelId = NeatDNA.pixelIdForResolution(i, sightResolution);
      reducedInputs.push('sight_' + pixelId + 'l');
      reducedInputs.push('sight_' + pixelId + 'd');
    }

    reducedInputs.forEach(inNode => {
      reducedOutputs.forEach(outNode => {
        connections.push({
          enabled: true,
          inNode: inNode,
          outNode: outNode,
          weight: normal({ mean: 0, dev: Config.get('deviation_of_new_connection_weight_distribution') }),
          innovation: `initial_${inNode}_${outNode}`
        });
      });
    });
    return connections;
  }

  public static sightInputIds(sightResolution: number) {
    let ids = [];
    for (let i = 0; i < sightResolution; i++) {
      let pixelId = NeatDNA.pixelIdForResolution(i, sightResolution);
      ids.push('sight_' + pixelId + 'h');
      ids.push('sight_' + pixelId + 's');
      ids.push('sight_' + pixelId + 'l');
      ids.push('sight_' + pixelId + 'd');
    }
    return ids;
  }

  public static initialNodes(sightResolution: number) {
    return {
      'in': NeatDNA.inputNodeIds(sightResolution),
      'out': NeatDNA.outputNodeIds(),
      'hidden': []
    };
  }

  public static inputNodeIds(sightResolution: number) {
    return ['energy', 'fire_power', 'speed', 'dna_color'].concat(NeatDNA.sightInputIds(sightResolution));
  }

  public static outputNodeIds() {
    return ['acceleration_angle', 'acceleration_radius', 'shooting_trigger', 'sexual_desire'];
  }
}