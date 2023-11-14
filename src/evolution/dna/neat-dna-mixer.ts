import { Config } from "../config";
import { bimodalValueMix, normal } from "../helpers";
import { IConnection, INeatDNA, INodesConfig } from "./neat-dna";

export class NeatDNAMixer {
  public constructor(public primary: INeatDNA, public secondary: INeatDNA) {

    Config
      .set('node_addition_probability', 0.2)
      .set('edge_addition_probability', 0.4)
      .set('edge_removal_probability', 0.05)
      .set('deviation_of_weight_mutation_distribution', 0.5)
      .set('deviation_of_new_connection_weight_distribution', 15)
      .set('deviation_of_weight_mutation_for_unpaired_connection_distribution', 15);
  }

  public mix() {
    return this.evolveTopology(this.mixConnections());
  }

  public mixConnections(): { nodes: INodesConfig; connections: IConnection[] } {
    const innovation_hash: Record<string, IConnection> = {};
    this.secondary.connections.forEach(connection => {
      innovation_hash[connection.innovation] = connection;
    });

    return {
      nodes: this.primary.nodes,
      connections: this.primary.connections.map(connection => {
        if (connection.enabled && innovation_hash[connection.innovation]) {
          return {
            enabled: true,
            inNode: connection.inNode,
            outNode: connection.outNode,
            weight: bimodalValueMix(connection.weight, innovation_hash[connection.innovation].weight) + normal({ mean: 0, dev: Config.get('deviation_of_weight_mutation_distribution') }),
            innovation: connection.innovation,
          };
        }
        else {
          return {
            enabled: connection.enabled,
            inNode: connection.inNode,
            outNode: connection.outNode,
            weight: bimodalValueMix(connection.weight, normal({ mean: 0, dev: Config.get('deviation_of_weight_mutation_for_unpaired_connection_distribution') })),
            innovation: crypto.randomUUID(),
          };
        }
      })
    };
  }

  public evolveTopology(network_dna: { nodes: INodesConfig; connections: IConnection[] }) {
    let p = Math.random();
    if (p < Config.get<number>('node_addition_probability')) {
      return this.evolveTopologyWithNewNode(network_dna);
    }
    else if (p < Config.get<number>('node_addition_probability') + Config.get<number>('edge_addition_probability')) {
      return this.evolveTopologyWithNewConnection(network_dna);
    }
    else if (p < Config.get<number>('node_addition_probability') + Config.get<number>('edge_addition_probability') + Config.get<number>('edge_removal_probability')) {
      return this.evolveTopologyByRemovingConnection(network_dna)
    }
    else {
      return network_dna;
    }
  }

  public evolveTopologyWithNewNode(network_dna: { nodes: INodesConfig; connections: IConnection[] }): { nodes: INodesConfig; connections: IConnection[] } {
    let connections = network_dna.connections;
    let nodes = this.cloneNodes(network_dna.nodes);

    let i = Math.floor(Math.random() * connections.length);
    let new_node_index = this._findNextHiddenNodeIndex(network_dna);

    if (!connections[i].enabled) { return network_dna; }

    connections[i].enabled = false;

    nodes.hidden.push({ id: new_node_index });

    connections.push({
      enabled: true,
      inNode: connections[i].inNode,
      outNode: new_node_index,
      weight: 1,
      innovation: crypto.randomUUID(),
    });

    connections.push({
      enabled: true,
      inNode: new_node_index,
      outNode: connections[i].outNode,
      weight: connections[i].weight,
      innovation: crypto.randomUUID(),
    });

    return {
      nodes: nodes,
      connections: connections
    };
  }

  private _findNextHiddenNodeIndex(network_dna: { nodes: INodesConfig; connections: IConnection[] }) {
    if (network_dna.nodes.hidden.length == 0) {
      return 0;
    }

    return network_dna.nodes.hidden.reduce((max, n) => { return Math.max(parseInt(n) || 0, max); }, 0) + 1;
  }

  public cloneNodes(nodes: INodesConfig) {
    return JSON.parse(JSON.stringify(nodes));
  }

  public evolveTopologyWithNewConnection(network_dna: { nodes: INodesConfig; connections: IConnection[] }) {
    let connections = network_dna.connections;

    let outNode = this.findOutCandidate(network_dna);
    let inNode = this.findInCandidate(network_dna);

    if (this.connected(outNode, inNode, NeatDNAMixer.outConnectionsAsHash(connections))) { return network_dna; }
    if (connections.filter(c => { return c.inNode == inNode && c.outNode == outNode; }).length > 0) { return network_dna; }

    connections.push({
      enabled: true,
      inNode: inNode,
      outNode: outNode,
      weight: normal({ mean: 0, dev: Config.get('deviation_of_new_connection_weight_distribution') }),
      innovation: crypto.randomUUID(),
    });

    return {
      nodes: network_dna.nodes,
      connections: NeatDNAMixer.topologicalSortConnections(network_dna)
    };
  }

  public evolveTopologyByRemovingConnection(network_dna: { nodes: INodesConfig; connections: IConnection[] }) {
    let index = Math.floor(network_dna.connections.length * Math.random());
    network_dna.connections[index].enabled = false;
    return network_dna;
  }

  public findOutCandidate(network_dna: { nodes: INodesConfig; connections: IConnection[] }) {
    let nodes = network_dna.nodes.hidden.concat(network_dna.nodes.out);
    return nodes[Math.floor(Math.random() * nodes.length)];
  }

  public findInCandidate(network_dna: { nodes: INodesConfig; connections: IConnection[] }) {
    let nodes = network_dna.nodes.in.concat(network_dna.nodes.hidden);
    return nodes[Math.floor(Math.random() * nodes.length)];
  }


  public connected(inIndex: string, outIndex: string, connectionsHash: Record<string, IConnection[]>) {
    if (inIndex == outIndex) { return true; }
    if (!connectionsHash[inIndex]) { return false; }

    for (let i = 0; i < connectionsHash[inIndex].length; ++i) {
      if (this.connected(connectionsHash[inIndex][i].outNode, outIndex, connectionsHash)) {
        return true;
      }
    }
    return false;
  }

  public static outConnectionsAsHash(connections: IConnection[]) {
    let hash: Record<string, IConnection[]> = {};
    connections.forEach(c => {
      if (!hash[c.inNode]) { hash[c.inNode] = [] }
      hash[c.inNode].push(c);
    });
    return hash;
  }

  public static topologicalSortConnections(network_dna: { nodes: INodesConfig; connections: IConnection[] }) {
    let hash = NeatDNAMixer.outConnectionsAsHash(network_dna.connections);
    let inNodes = network_dna.nodes['in'];
    let visitedNodes: Record<string, boolean> = {};
    let sortedConnections: IConnection[] = [];

    function exploreNode(nodeId: string) {
      if (!hash[nodeId] || visitedNodes[nodeId]) { return; }
      visitedNodes[nodeId] = true;
      hash[nodeId].forEach(c => {
        exploreNode(c.outNode);
        sortedConnections.push(c);
      });
    }

    inNodes.forEach(n => {
      exploreNode(n);
    });

    return sortedConnections.reverse();
  }

}