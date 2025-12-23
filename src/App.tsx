import React, { useState, useEffect, useRef } from 'react';
import { Graph } from './utils/graph';
import { AlgorithmStep } from './types/graph';
import {
  bfs,
  dfs,
  dijkstra,
  checkBipartite,
  primMST,
  kruskalMST,
  fordFulkerson,
  hierholzer,
  fleury
} from './utils/algorithms';
import { GraphCanvas } from './components/GraphCanvas';
import { Controls } from './components/Controls';
import { GraphRepresentations } from './components/GraphRepresentations';

export default function App() {
  const [graph] = useState(() => new Graph(false));
  const [isDirected, setIsDirected] = useState(false);
  const [nodes, setNodes] = useState(graph.getNodes());
  const [edges, setEdges] = useState(graph.getEdges());
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  
  // Algorithm state
  const [algorithm, setAlgorithm] = useState('bfs');
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [algorithmSteps, setAlgorithmSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [message, setMessage] = useState('');
  
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update graph when directed changes
  const handleDirectedChange = (directed: boolean) => {
    setIsDirected(directed);
    graph.setDirected(directed);
    updateGraph();
  };

  // Update graph display
  const updateGraph = () => {
    setNodes([...graph.getNodes()]);
    setEdges([...graph.getEdges()]);
  };

  // Node operations
  const handleAddNode = (id: string) => {
    const existingNodes = graph.getNodes();
    const x = 100 + (existingNodes.length % 5) * 150;
    const y = 100 + Math.floor(existingNodes.length / 5) * 120;
    
    const node = graph.addNode(id, x, y);
    if (node) {
      updateGraph();
      setMessage(`Đã thêm đỉnh ${node.id}`);
    } else {
      setMessage(`Đỉnh ${id.toUpperCase()} đã tồn tại`);
    }
  };

  const handleDeleteNode = (id: string) => {
    graph.deleteNode(id);
    updateGraph();
    setMessage(`Đã xóa đỉnh ${id.toUpperCase()} và các cạnh liên quan`);
  };

  const handleNodeDrag = (nodeId: string, x: number, y: number) => {
    graph.updateNodePosition(nodeId, x, y);
    updateGraph();
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(n => n !== nodeId)
        : [...prev, nodeId]
    );
  };

  // Edge operations
  const handleAddEdge = (from: string, to: string, weight: number) => {
    graph.addEdge(from, to, weight);
    updateGraph();
    setMessage(`Đã thêm cạnh từ đỉnh ${from.toUpperCase()} → ${to.toUpperCase()} (trọng số: ${weight})`);
  };

  const handleDeleteEdge = (from: string, to: string) => {
    graph.deleteEdge(from, to);
    updateGraph();
    setMessage(`Đã xóa cạnh từ đỉnh ${from.toUpperCase()} → ${to.toUpperCase()}`);
  };

  // Canvas click (for future node placement)
  const handleCanvasClick = (x: number, y: number) => {
    // Could be used for click-to-place nodes
  };

  // Algorithm execution
  const runAlgorithm = () => {
    // Stop any playing animation
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }

    // Reset steps
    setAlgorithmSteps([]);
    setCurrentStepIndex(-1);

    // Validate inputs
    if (graph.getNodeCount() === 0) {
      setMessage('Hãy thêm đỉnh vào đồ thị trước khi chạy thuật toán');
      return;
    }

    let generator: Generator<AlgorithmStep> | null = null;

    try {
      switch (algorithm) {
        case 'bfs':
          if (!startNode) {
            setMessage('Hãy nhập đỉnh bắt đầu');
            return;
          }
          if (!graph.getNode(startNode)) {
            setMessage(`Đỉnh ${startNode.toUpperCase()} không tồn tại`);
            return;
          }
          generator = bfs(graph, startNode);
          break;

        case 'dfs':
          if (!startNode) {
            setMessage('Hãy nhập đỉnh bắt đầu');
            return;
          }
          if (!graph.getNode(startNode)) {
            setMessage(`Đỉnh ${startNode.toUpperCase()} không tồn tại`);
            return;
          }
          generator = dfs(graph, startNode);
          break;

        case 'shortest-path':
          if (!startNode || !endNode) {
            setMessage('Hãy nhập cả đỉnh bắt đầu và đỉnh kết thúc');
            return;
          }
          if (!graph.getNode(startNode) || !graph.getNode(endNode)) {
            setMessage('Đỉnh bắt đầu hoặc đỉnh kết thúc không tồn tại');
            return;
          }
          generator = dijkstra(graph, startNode, endNode);
          break;

        case 'bipartite':
          generator = checkBipartite(graph);
          break;

        case 'prim':
          generator = primMST(graph);
          break;

        case 'kruskal':
          generator = kruskalMST(graph);
          break;

        case 'ford-fulkerson':
          if (!startNode || !endNode) {
            setMessage('Hãy nhập cả đỉnh nguồn và đỉnh đích');
            return;
          }
          if (!graph.getNode(startNode) || !graph.getNode(endNode)) {
            setMessage('Đỉnh nguồn hoặc đỉnh đích không tồn tại');
            return;
          }
          generator = fordFulkerson(graph, startNode, endNode);
          break;

        case 'hierholzer':
          generator = hierholzer(graph);
          break;

        case 'fleury':
          generator = fleury(graph);
          break;

        default:
          setMessage('Thuật toán không hợp lệ');
          return;
      }

      // Collect all steps
      const steps: AlgorithmStep[] = [];
      for (const step of generator) {
        steps.push(step);
      }

      setAlgorithmSteps(steps);
      if (steps.length > 0) {
        setCurrentStepIndex(0);
        setMessage(steps[0].message || '');
      } else {
        setMessage('Thuật toán hoàn thành mà không có bước nào');
      }
    } catch (error) {
      setMessage(`Lỗi: ${error}`);
    }
  };

  // Playback controls
  const handlePlay = () => {
    if (algorithmSteps.length === 0) {
      runAlgorithm();
      return;
    }

    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (algorithmSteps.length === 0) {
      runAlgorithm();
      return;
    }

    if (currentStepIndex < algorithmSteps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      setMessage(algorithmSteps[newIndex].message || '');
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      setMessage(algorithmSteps[newIndex].message || '');
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setAlgorithmSteps([]);
    setMessage('');
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  };

  // Auto-play effect
  useEffect(() => {
    if (isPlaying && algorithmSteps.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= algorithmSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const newIndex = prev + 1;
          setMessage(algorithmSteps[newIndex].message || '');
          return newIndex;
        });
      }, 1000 / speed);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, algorithmSteps, speed]);

  // Get current algorithm step
  const currentStep = currentStepIndex >= 0 ? algorithmSteps[currentStepIndex] : null;

  // Get graph representations
  const representations = graph.getRepresentations();
  const nodeOrder = graph.getNodes().map(n => n.id).sort();

  // Initialize with sample graph
  useEffect(() => {
    // Add sample nodes
    graph.addNode('A', 200, 150);
    graph.addNode('B', 400, 100);
    graph.addNode('C', 400, 250);
    graph.addNode('D', 600, 150);
    
    // Add sample edges
    graph.addEdge('A', 'B', 1);
    graph.addEdge('A', 'C', 2);
    graph.addEdge('B', 'D', 3);
    graph.addEdge('C', 'D', 1);
    
    updateGraph();
    setMessage('Đã khởi tạo đồ thị, bạn có thể bắt đầu thêm hoặc chỉnh sửa các đỉnh và cạnh');
  }, []);

  return (
    <div className="min-h-screen bg-[#F5DEB3] p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-[#8B4513] mb-2">TRỰC QUAN HOÁ THUẬT TOÁN ĐỒ THỊ</h1>
          <p className="text-[#A0522D]">
            Khám phá và hiểu các thuật toán đồ thị thông qua trực quan hoá tương tác
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas - Takes up 2 columns */}
          <div className="lg:col-span-2 h-[600px]">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              directed={isDirected}
              onNodeDrag={handleNodeDrag}
              onNodeClick={handleNodeClick}
              selectedNodes={selectedNodes}
              algorithmStep={currentStep}
              onCanvasClick={handleCanvasClick}
            />
          </div>

          {/* Controls - 1 column */}
          <div className="h-[600px] overflow-y-auto">
            <Controls
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onReset={handleReset}
              speed={speed}
              onSpeedChange={setSpeed}
              algorithm={algorithm}
              onAlgorithmChange={setAlgorithm}
              onAddNode={handleAddNode}
              onAddEdge={handleAddEdge}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
              isDirected={isDirected}
              onDirectedChange={handleDirectedChange}
              startNode={startNode}
              endNode={endNode}
              onStartNodeChange={setStartNode}
              onEndNodeChange={setEndNode}
              message={message}
            />
          </div>
        </div>

        {/* Graph Representations */}
        <div>
          <GraphRepresentations
            representations={representations}
            nodeOrder={nodeOrder}
          />
        </div>

        {/* Algorithm Info */}
        <div className="bg-white border-2 border-[#8B4513] rounded-lg p-6">
          <h2 className="text-[#8B4513] mb-4">Thông tin thuật toán</h2>
          <div className="space-y-2 text-[#8B4513]">
            {algorithm === 'bfs' && (
              <div>
                <strong>Breadth-First Search (BFS)</strong>
                <p>Thuật toán khám phá đồ thị theo từng cấp độ, thăm tất cả các đỉnh kề trước khi đi sâu hơn. Thời gian: O(V + E)</p>
              </div>
            )}
            {algorithm === 'dfs' && (
              <div>
                <strong>Depth-First Search (DFS)</strong>
                <p>Khám phá đồ thị theo chiều sâu, đi hết một nhánh trước khi quay lại. Thời gian: O(V + E)</p>
              </div>
            )}
            {algorithm === 'shortest-path' && (
              <div>
                <strong>Dijkstra's Algorithm</strong>
                <p>Tìm đường đi ngắn nhất giữa hai đỉnh trong đồ thị có trọng số. Thời gian: O(V²) hoặc O(E + V log V) với heap</p>
              </div>
            )}
            {algorithm === 'bipartite' && (
              <div>
                <strong>Bipartite Check</strong>
                <p>Xác định xem đồ thị có thể được tô màu với hai màu sao cho không có hai đỉnh kề nhau cùng màu hay không. Thời gian: O(V + E)</p>
              </div>
            )}
            {algorithm === 'prim' && (
              <div>
                <strong>Prim's Algorithm</strong>
                <p>Tìm cây khung nhỏ nhất bằng cách thêm lần lượt các cạnh có trọng số nhỏ nhất kết nối MST với một đỉnh mới. Thời gian: O(E log V)</p>
              </div>
            )}
            {algorithm === 'kruskal' && (
              <div>
                <strong>Kruskal's Algorithm</strong>
                <p>Tìm cây khung nhỏ nhất bằng cách sắp xếp các cạnh và thêm chúng nếu chúng không tạo thành chu trình. Thời gian: O(E log E)</p>
              </div>
            )}
            {algorithm === 'ford-fulkerson' && (
              <div>
                <strong>Ford-Fulkerson Algorithm</strong>
                <p>Tính dòng chảy tối đa từ đỉnh nguồn đến đỉnh đích bằng cách tìm các đường tăng luồng. Thời gian: O(E × max_flow)</p>
              </div>
            )}
            {algorithm === 'hierholzer' && (
              <div>
                <strong>Hierholzer's Algorithm</strong>
                <p>Tìm đường đi Euler hoặc chu trình Euler (thăm mỗi cạnh đúng một lần). Thời gian: O(E)</p>
              </div>
            )}
            {algorithm === 'fleury' && (
              <div>
                <strong>Fleury's Algorithm</strong>
                <p>Thuật toán thay thế để tìm đường đi Euler bằng cách tránh các cầu khi có thể. Thời gian: O(E²)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
