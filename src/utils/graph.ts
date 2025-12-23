import { Node, Edge, GraphData, GraphRepresentation } from '../types/graph';

export class Graph {
  private nodes: Map<string, Node>;
  private edges: Edge[];
  private directed: boolean;

  constructor(directed: boolean = false) {
    this.nodes = new Map();
    this.edges = [];
    this.directed = directed;
  }

  // Normalize node ID to uppercase
  private normalizeId(id: string): string {
    return id.trim().toUpperCase();
  }

  // Add node
  addNode(id: string, x: number = 0, y: number = 0): Node | null {
    const normalizedId = this.normalizeId(id);
    
    if (this.nodes.has(normalizedId)) {
      return null; // Node already exists
    }

    const node: Node = {
      id: normalizedId,
      x,
      y,
      label: normalizedId
    };

    this.nodes.set(normalizedId, node);
    return node;
  }

  // Update node position
  updateNodePosition(id: string, x: number, y: number): void {
    const normalizedId = this.normalizeId(id);
    const node = this.nodes.get(normalizedId);
    if (node) {
      node.x = x;
      node.y = y;
    }
  }

  // Delete node
  deleteNode(id: string): void {
    const normalizedId = this.normalizeId(id);
    this.nodes.delete(normalizedId);
    // Remove all edges connected to this node
    this.edges = this.edges.filter(
      edge => edge.from !== normalizedId && edge.to !== normalizedId
    );
  }

  // Rename node
  renameNode(oldId: string, newId: string): boolean {
    const oldNormalized = this.normalizeId(oldId);
    const newNormalized = this.normalizeId(newId);

    if (oldNormalized === newNormalized) return true;
    if (this.nodes.has(newNormalized)) return false; // New ID already exists

    const node = this.nodes.get(oldNormalized);
    if (!node) return false;

    // Update node
    node.id = newNormalized;
    node.label = newNormalized;
    this.nodes.delete(oldNormalized);
    this.nodes.set(newNormalized, node);

    // Update edges
    this.edges.forEach(edge => {
      if (edge.from === oldNormalized) edge.from = newNormalized;
      if (edge.to === oldNormalized) edge.to = newNormalized;
    });

    return true;
  }

  // Add edge
  addEdge(from: string, to: string, weight: number = 1): void {
    const fromNormalized = this.normalizeId(from);
    const toNormalized = this.normalizeId(to);

    // Auto-create nodes if they don't exist
    if (!this.nodes.has(fromNormalized)) {
      this.addNode(fromNormalized, Math.random() * 600 + 100, Math.random() * 400 + 100);
    }
    if (!this.nodes.has(toNormalized)) {
      this.addNode(toNormalized, Math.random() * 600 + 100, Math.random() * 400 + 100);
    }

    // Check if edge already exists
    const existingEdgeIndex = this.edges.findIndex(
      e => e.from === fromNormalized && e.to === toNormalized
    );

    if (existingEdgeIndex >= 0) {
      // Update existing edge
      this.edges[existingEdgeIndex].weight = weight;
    } else {
      // Add new edge
      this.edges.push({
        from: fromNormalized,
        to: toNormalized,
        weight,
        directed: this.directed
      });
    }
  }

  // Delete edge
  deleteEdge(from: string, to: string): void {
    const fromNormalized = this.normalizeId(from);
    const toNormalized = this.normalizeId(to);

    this.edges = this.edges.filter(
      edge => !(edge.from === fromNormalized && edge.to === toNormalized)
    );
  }

  // Update edge weight
  updateEdgeWeight(from: string, to: string, weight: number): void {
    const fromNormalized = this.normalizeId(from);
    const toNormalized = this.normalizeId(to);

    const edge = this.edges.find(
      e => e.from === fromNormalized && e.to === toNormalized
    );

    if (edge) {
      edge.weight = weight;
    }
  }

  // Get node
  getNode(id: string): Node | undefined {
    return this.nodes.get(this.normalizeId(id));
  }

  // Get all nodes
  getNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  // Get all edges
  getEdges(): Edge[] {
    return this.edges;
  }

  // Get neighbors
  getNeighbors(id: string): Array<{ node: string; weight: number }> {
    const normalizedId = this.normalizeId(id);
    const neighbors: Array<{ node: string; weight: number }> = [];

    this.edges.forEach(edge => {
      if (edge.from === normalizedId) {
        neighbors.push({ node: edge.to, weight: edge.weight });
      }
      if (!this.directed && edge.to === normalizedId) {
        neighbors.push({ node: edge.from, weight: edge.weight });
      }
    });

    return neighbors;
  }

  // Set directed/undirected
  setDirected(directed: boolean): void {
    this.directed = directed;
    this.edges.forEach(edge => {
      edge.directed = directed;
    });
  }

  isDirected(): boolean {
    return this.directed;
  }

  // Get graph data
  getData(): GraphData {
    return {
      nodes: new Map(this.nodes),
      edges: [...this.edges]
    };
  }

  // Get graph representations
  getRepresentations(): GraphRepresentation {
    const nodeArray = Array.from(this.nodes.keys()).sort();
    const n = nodeArray.length;

    // Adjacency Matrix
    const adjacencyMatrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    
    this.edges.forEach(edge => {
      const fromIndex = nodeArray.indexOf(edge.from);
      const toIndex = nodeArray.indexOf(edge.to);
      
      if (fromIndex >= 0 && toIndex >= 0) {
        adjacencyMatrix[fromIndex][toIndex] = edge.weight;
        if (!this.directed) {
          adjacencyMatrix[toIndex][fromIndex] = edge.weight;
        }
      }
    });

    // Adjacency List
    const adjacencyList = new Map<string, Array<{ node: string; weight: number }>>();
    nodeArray.forEach(node => {
      adjacencyList.set(node, this.getNeighbors(node));
    });

    // Edge List
    const edgeList = this.edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      weight: edge.weight
    }));

    return {
      adjacencyMatrix,
      adjacencyList,
      edgeList
    };
  }

  // Clear graph
  clear(): void {
    this.nodes.clear();
    this.edges = [];
  }

  // Get node count
  getNodeCount(): number {
    return this.nodes.size;
  }

  // Get edge count
  getEdgeCount(): number {
    return this.edges.length;
  }
}
