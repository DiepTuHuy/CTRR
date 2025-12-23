// Graph types and interfaces

export interface Node {
  id: string; // Always uppercase
  x: number;
  y: number;
  label: string; // Display label (uppercase)
}

export interface Edge {
  from: string; // Node ID (uppercase)
  to: string; // Node ID (uppercase)
  weight: number;
  directed: boolean;
}

export interface GraphData {
  nodes: Map<string, Node>;
  edges: Edge[];
}

export interface AlgorithmStep {
  type: 'node-visit' | 'node-current' | 'edge-visit' | 'node-complete' | 'path-found' | 'partition' | 'mst-edge' | 'flow-update' | 'euler-path';
  nodeId?: string;
  edgeFrom?: string;
  edgeTo?: string;
  value?: number;
  message?: string;
  highlightNodes?: string[];
  highlightEdges?: Array<{ from: string; to: string }>;
  partition?: Map<string, number>; // For bipartite coloring
  path?: string[]; // For path visualization
  totalWeight?: number;
}

export type AlgorithmType = 
  | 'bfs' 
  | 'dfs' 
  | 'shortest-path' 
  | 'bipartite'
  | 'prim'
  | 'kruskal'
  | 'ford-fulkerson'
  | 'fleury'
  | 'hierholzer';

export interface GraphRepresentation {
  adjacencyMatrix: number[][];
  adjacencyList: Map<string, Array<{ node: string; weight: number }>>;
  edgeList: Array<{ from: string; to: string; weight: number }>;
}
