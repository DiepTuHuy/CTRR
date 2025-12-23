import { Graph } from './graph';
import { AlgorithmStep } from '../types/graph';

// BFS - Breadth First Search
export function* bfs(graph: Graph, startId: string): Generator<AlgorithmStep> {
  const start = startId.toUpperCase();
  const visited = new Set<string>();
  const queue: string[] = [start];
  const order: string[] = [];

  visited.add(start);

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    yield {
      type: 'node-current',
      nodeId: current,
      highlightNodes: Array.from(visited),
      message: `Visiting node ${current}`
    };

    const neighbors = graph.getNeighbors(current);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node);
        queue.push(neighbor.node);

        yield {
          type: 'edge-visit',
          edgeFrom: current,
          edgeTo: neighbor.node,
          highlightNodes: Array.from(visited),
          message: `Discovered ${neighbor.node} from ${current}`
        };
      }
    }

    yield {
      type: 'node-complete',
      nodeId: current,
      highlightNodes: Array.from(visited),
      message: `Completed ${current}. Order: ${order.join(' → ')}`
    };
  }
}

// DFS - Depth First Search
export function* dfs(graph: Graph, startId: string): Generator<AlgorithmStep> {
  const start = startId.toUpperCase();
  const visited = new Set<string>();
  const order: string[] = [];

  function* dfsVisit(nodeId: string): Generator<AlgorithmStep> {
    visited.add(nodeId);
    order.push(nodeId);

    yield {
      type: 'node-current',
      nodeId,
      highlightNodes: Array.from(visited),
      message: `Visiting node ${nodeId}`
    };

    const neighbors = graph.getNeighbors(nodeId);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.node)) {
        yield {
          type: 'edge-visit',
          edgeFrom: nodeId,
          edgeTo: neighbor.node,
          message: `Exploring edge ${nodeId} → ${neighbor.node}`
        };

        yield* dfsVisit(neighbor.node);
      }
    }

    yield {
      type: 'node-complete',
      nodeId,
      highlightNodes: Array.from(visited),
      message: `Completed ${nodeId}. Order: ${order.join(' → ')}`
    };
  }

  yield* dfsVisit(start);
}

// Dijkstra's Algorithm - Shortest Path
export function* dijkstra(graph: Graph, startId: string, endId: string): Generator<AlgorithmStep> {
  const start = startId.toUpperCase();
  const end = endId.toUpperCase();

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const nodes = graph.getNodes();

  // Initialize distances
  nodes.forEach(node => {
    distances.set(node.id, node.id === start ? 0 : Infinity);
    previous.set(node.id, null);
  });

  while (visited.size < nodes.length) {
    // Find unvisited node with minimum distance
    let current: string | null = null;
    let minDistance = Infinity;

    nodes.forEach(node => {
      if (!visited.has(node.id) && distances.get(node.id)! < minDistance) {
        minDistance = distances.get(node.id)!;
        current = node.id;
      }
    });

    if (current === null || minDistance === Infinity) break;

    visited.add(current);

    yield {
      type: 'node-current',
      nodeId: current,
      highlightNodes: Array.from(visited),
      message: `Processing ${current} (distance: ${minDistance})`
    };

    // Update neighbors
    const neighbors = graph.getNeighbors(current);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.node)) {
        const newDistance = distances.get(current)! + neighbor.weight;
        
        if (newDistance < distances.get(neighbor.node)!) {
          distances.set(neighbor.node, newDistance);
          previous.set(neighbor.node, current);

          yield {
            type: 'edge-visit',
            edgeFrom: current,
            edgeTo: neighbor.node,
            value: newDistance,
            message: `Updated distance to ${neighbor.node}: ${newDistance}`
          };
        }
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = end;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) || null;
  }

  if (path[0] === start) {
    yield {
      type: 'path-found',
      path,
      totalWeight: distances.get(end),
      highlightNodes: path,
      message: `Shortest path: ${path.join(' → ')} (Total weight: ${distances.get(end)})`
    };
  } else {
    yield {
      type: 'path-found',
      message: `No path exists from ${start} to ${end}`
    };
  }
}

// Bipartite Check (BFS-based coloring)
export function* checkBipartite(graph: Graph): Generator<AlgorithmStep> {
  const nodes = graph.getNodes();
  const color = new Map<string, number>();
  
  for (const startNode of nodes) {
    if (color.has(startNode.id)) continue;

    const queue: string[] = [startNode.id];
    color.set(startNode.id, 0);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentColor = color.get(current)!;

      yield {
        type: 'node-current',
        nodeId: current,
        partition: new Map(color),
        message: `Coloring ${current} with color ${currentColor}`
      };

      const neighbors = graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!color.has(neighbor.node)) {
          color.set(neighbor.node, 1 - currentColor);
          queue.push(neighbor.node);

          yield {
            type: 'edge-visit',
            edgeFrom: current,
            edgeTo: neighbor.node,
            partition: new Map(color),
            message: `Coloring ${neighbor.node} with color ${1 - currentColor}`
          };
        } else if (color.get(neighbor.node) === currentColor) {
          yield {
            type: 'partition',
            partition: new Map(color),
            message: `Graph is NOT bipartite! Found edge ${current}-${neighbor.node} with same color`
          };
          return;
        }
      }
    }
  }

  yield {
    type: 'partition',
    partition: new Map(color),
    message: `Graph is BIPARTITE! Partitions: [${Array.from(color.entries()).filter(([_, c]) => c === 0).map(([n]) => n).join(', ')}] and [${Array.from(color.entries()).filter(([_, c]) => c === 1).map(([n]) => n).join(', ')}]`
  };
}

// Prim's Algorithm - Minimum Spanning Tree
export function* primMST(graph: Graph): Generator<AlgorithmStep> {
  const nodes = graph.getNodes();
  if (nodes.length === 0) return;

  const inMST = new Set<string>();
  const mstEdges: Array<{ from: string; to: string }> = [];
  let totalWeight = 0;

  // Start with first node
  inMST.add(nodes[0].id);

  yield {
    type: 'node-visit',
    nodeId: nodes[0].id,
    highlightNodes: [nodes[0].id],
    message: `Starting with node ${nodes[0].id}`
  };

  while (inMST.size < nodes.length) {
    let minEdge: { from: string; to: string; weight: number } | null = null;

    // Find minimum weight edge connecting MST to non-MST node
    for (const nodeId of inMST) {
      const neighbors = graph.getNeighbors(nodeId);
      for (const neighbor of neighbors) {
        if (!inMST.has(neighbor.node)) {
          if (minEdge === null || neighbor.weight < minEdge.weight) {
            minEdge = {
              from: nodeId,
              to: neighbor.node,
              weight: neighbor.weight
            };
          }
        }
      }
    }

    if (minEdge === null) break; // Graph is disconnected

    inMST.add(minEdge.to);
    mstEdges.push({ from: minEdge.from, to: minEdge.to });
    totalWeight += minEdge.weight;

    yield {
      type: 'mst-edge',
      edgeFrom: minEdge.from,
      edgeTo: minEdge.to,
      value: minEdge.weight,
      highlightNodes: Array.from(inMST),
      highlightEdges: [...mstEdges],
      message: `Added edge ${minEdge.from}-${minEdge.to} (weight: ${minEdge.weight}). Total: ${totalWeight}`
    };
  }

  yield {
    type: 'node-complete',
    highlightNodes: Array.from(inMST),
    highlightEdges: mstEdges,
    totalWeight,
    message: `MST complete! Total weight: ${totalWeight}`
  };
}

// Kruskal's Algorithm - Minimum Spanning Tree
export function* kruskalMST(graph: Graph): Generator<AlgorithmStep> {
  const edges = graph.getEdges()
    .map(e => ({ from: e.from, to: e.to, weight: e.weight }))
    .sort((a, b) => a.weight - b.weight);

  const nodes = graph.getNodes();
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();

  // Initialize Union-Find
  nodes.forEach(node => {
    parent.set(node.id, node.id);
    rank.set(node.id, 0);
  });

  function find(x: string): string {
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)!));
    }
    return parent.get(x)!;
  }

  function union(x: string, y: string): boolean {
    const rootX = find(x);
    const rootY = find(y);

    if (rootX === rootY) return false;

    if (rank.get(rootX)! < rank.get(rootY)!) {
      parent.set(rootX, rootY);
    } else if (rank.get(rootX)! > rank.get(rootY)!) {
      parent.set(rootY, rootX);
    } else {
      parent.set(rootY, rootX);
      rank.set(rootX, rank.get(rootX)! + 1);
    }
    return true;
  }

  const mstEdges: Array<{ from: string; to: string }> = [];
  let totalWeight = 0;

  for (const edge of edges) {
    yield {
      type: 'edge-visit',
      edgeFrom: edge.from,
      edgeTo: edge.to,
      value: edge.weight,
      highlightEdges: [...mstEdges],
      message: `Considering edge ${edge.from}-${edge.to} (weight: ${edge.weight})`
    };

    if (union(edge.from, edge.to)) {
      mstEdges.push({ from: edge.from, to: edge.to });
      totalWeight += edge.weight;

      yield {
        type: 'mst-edge',
        edgeFrom: edge.from,
        edgeTo: edge.to,
        value: edge.weight,
        highlightEdges: [...mstEdges],
        message: `Added edge ${edge.from}-${edge.to}. Total: ${totalWeight}`
      };
    } else {
      yield {
        type: 'node-complete',
        highlightEdges: [...mstEdges],
        message: `Rejected edge ${edge.from}-${edge.to} (would create cycle)`
      };
    }
  }

  yield {
    type: 'node-complete',
    highlightEdges: mstEdges,
    totalWeight,
    message: `MST complete! Total weight: ${totalWeight}`
  };
}

// Ford-Fulkerson Algorithm - Maximum Flow
export function* fordFulkerson(graph: Graph, sourceId: string, sinkId: string): Generator<AlgorithmStep> {
  const source = sourceId.toUpperCase();
  const sink = sinkId.toUpperCase();

  // Build residual graph
  const capacity = new Map<string, Map<string, number>>();
  const nodes = graph.getNodes();

  nodes.forEach(node => {
    capacity.set(node.id, new Map());
  });

  graph.getEdges().forEach(edge => {
    const fromMap = capacity.get(edge.from)!;
    fromMap.set(edge.to, edge.weight);
  });

  let maxFlow = 0;

  // BFS to find augmenting path
  function* findPath(): Generator<AlgorithmStep, string[] | null> {
    const visited = new Set<string>();
    const queue: Array<{ node: string; path: string[] }> = [{ node: source, path: [source] }];
    visited.add(source);

    while (queue.length > 0) {
      const { node: current, path } = queue.shift()!;

      yield {
        type: 'node-current',
        nodeId: current,
        highlightNodes: Array.from(visited),
        message: `Searching for augmenting path: ${path.join(' → ')}`
      };

      if (current === sink) {
        return path;
      }

      const neighbors = capacity.get(current)!;
      for (const [neighbor, cap] of neighbors.entries()) {
        if (!visited.has(neighbor) && cap > 0) {
          visited.add(neighbor);
          queue.push({ node: neighbor, path: [...path, neighbor] });

          yield {
            type: 'edge-visit',
            edgeFrom: current,
            edgeTo: neighbor,
            value: cap,
            message: `Found edge ${current} → ${neighbor} (capacity: ${cap})`
          };
        }
      }
    }

    return null;
  }

  while (true) {
    const pathGen = findPath();
    let path: string[] | null = null;
    
    for (const step of pathGen) {
      if (step.type === 'node-current' || step.type === 'edge-visit') {
        yield step;
      }
    }

    // Get the final path
    let result = pathGen.next();
    while (!result.done) {
      result = pathGen.next();
    }
    path = result.value;

    if (path === null) break;

    // Find minimum capacity along path
    let minCap = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      const cap = capacity.get(path[i])!.get(path[i + 1])!;
      minCap = Math.min(minCap, cap);
    }

    // Update residual capacities
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      
      const forwardMap = capacity.get(u)!;
      forwardMap.set(v, forwardMap.get(v)! - minCap);

      if (!capacity.get(v)!.has(u)) {
        capacity.get(v)!.set(u, 0);
      }
      capacity.get(v)!.set(u, capacity.get(v)!.get(u)! + minCap);
    }

    maxFlow += minCap;

    yield {
      type: 'flow-update',
      path,
      value: minCap,
      totalWeight: maxFlow,
      message: `Augmented flow by ${minCap} along path ${path.join(' → ')}. Total flow: ${maxFlow}`
    };
  }

  yield {
    type: 'node-complete',
    totalWeight: maxFlow,
    message: `Maximum flow from ${source} to ${sink}: ${maxFlow}`
  };
}

// Hierholzer's Algorithm - Euler Path/Circuit
export function* hierholzer(graph: Graph): Generator<AlgorithmStep> {
  const edges = graph.getEdges().map(e => ({ from: e.from, to: e.to, used: false }));
  const nodes = graph.getNodes();

  // Check degree
  const degree = new Map<string, number>();
  nodes.forEach(node => degree.set(node.id, 0));

  edges.forEach(edge => {
    degree.set(edge.from, degree.get(edge.from)! + 1);
    if (!graph.isDirected()) {
      degree.set(edge.to, degree.get(edge.to)! + 1);
    }
  });

  // Find start node (odd degree or any node for Eulerian circuit)
  let startNode = nodes[0]?.id;
  for (const [node, deg] of degree.entries()) {
    if (deg % 2 === 1) {
      startNode = node;
      break;
    }
  }

  const stack: string[] = [startNode];
  const path: string[] = [];

  function getUnusedEdge(from: string): { to: string; index: number } | null {
    for (let i = 0; i < edges.length; i++) {
      if (!edges[i].used && edges[i].from === from) {
        return { to: edges[i].to, index: i };
      }
      if (!graph.isDirected() && !edges[i].used && edges[i].to === from) {
        return { to: edges[i].from, index: i };
      }
    }
    return null;
  }

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    yield {
      type: 'node-current',
      nodeId: current,
      path: [...path],
      message: `Current node: ${current}, Stack: [${stack.join(', ')}]`
    };

    const edge = getUnusedEdge(current);

    if (edge !== null) {
      edges[edge.index].used = true;
      stack.push(edge.to);

      yield {
        type: 'edge-visit',
        edgeFrom: current,
        edgeTo: edge.to,
        path: [...path],
        message: `Traversing edge ${current} → ${edge.to}`
      };
    } else {
      stack.pop();
      path.push(current);

      yield {
        type: 'euler-path',
        nodeId: current,
        path: [...path],
        message: `Added ${current} to path. Path: ${path.slice().reverse().join(' → ')}`
      };
    }
  }

  path.reverse();

  yield {
    type: 'node-complete',
    path,
    message: `Euler path: ${path.join(' → ')}`
  };
}

// Fleury's Algorithm - Euler Path/Circuit (Alternative)
export function* fleury(graph: Graph): Generator<AlgorithmStep> {
  // Fleury's algorithm is more complex and checks bridges before traversing
  // For simplicity, we'll use a similar approach to Hierholzer
  // In a full implementation, we would check if removing an edge disconnects the graph
  
  yield* hierholzer(graph);
}
