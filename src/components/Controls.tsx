import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Plus, Trash2 } from 'lucide-react';

interface ControlsProps {
  // Playback controls
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  
  // Algorithm selection
  algorithm: string;
  onAlgorithmChange: (algorithm: string) => void;
  
  // Node/Edge operations
  onAddNode: (id: string) => void;
  onAddEdge: (from: string, to: string, weight: number) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (from: string, to: string) => void;
  
  // Graph settings
  isDirected: boolean;
  onDirectedChange: (directed: boolean) => void;
  
  // Algorithm parameters
  startNode: string;
  endNode: string;
  onStartNodeChange: (node: string) => void;
  onEndNodeChange: (node: string) => void;
  
  // Status
  message: string;
}

export function Controls({
  isPlaying,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  speed,
  onSpeedChange,
  algorithm,
  onAlgorithmChange,
  onAddNode,
  onAddEdge,
  onDeleteNode,
  onDeleteEdge,
  isDirected,
  onDirectedChange,
  startNode,
  endNode,
  onStartNodeChange,
  onEndNodeChange,
  message
}: ControlsProps) {
  const [nodeInput, setNodeInput] = React.useState('');
  const [edgeFrom, setEdgeFrom] = React.useState('');
  const [edgeTo, setEdgeTo] = React.useState('');
  const [edgeWeight, setEdgeWeight] = React.useState('1');
  const [deleteNodeInput, setDeleteNodeInput] = React.useState('');
  const [deleteEdgeFrom, setDeleteEdgeFrom] = React.useState('');
  const [deleteEdgeTo, setDeleteEdgeTo] = React.useState('');

  const handleAddNode = () => {
    if (nodeInput.trim()) {
      onAddNode(nodeInput.trim());
      setNodeInput('');
    }
  };

  const handleAddEdge = () => {
    if (edgeFrom.trim() && edgeTo.trim()) {
      onAddEdge(edgeFrom.trim(), edgeTo.trim(), parseFloat(edgeWeight) || 1);
      setEdgeFrom('');
      setEdgeTo('');
      setEdgeWeight('1');
    }
  };

  const handleDeleteNode = () => {
    if (deleteNodeInput.trim()) {
      onDeleteNode(deleteNodeInput.trim());
      setDeleteNodeInput('');
    }
  };

  const handleDeleteEdge = () => {
    if (deleteEdgeFrom.trim() && deleteEdgeTo.trim()) {
      onDeleteEdge(deleteEdgeFrom.trim(), deleteEdgeTo.trim());
      setDeleteEdgeFrom('');
      setDeleteEdgeTo('');
    }
  };

  const needsStartNode = ['bfs', 'dfs', 'shortest-path'].includes(algorithm);
  const needsEndNode = ['shortest-path', 'ford-fulkerson'].includes(algorithm);

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border-2 border-[#8B4513] rounded-lg">
      {/* Graph Type */}
      <div className="flex items-center gap-4 pb-4 border-b-2 border-[#D2B48C]">
        <label className="flex items-center gap-2 text-[#8B4513]">
          <input
            type="checkbox"
            checked={isDirected}
            onChange={(e) => onDirectedChange(e.target.checked)}
            className="w-4 h-4 accent-[#8B4513]"
          />
          <span>Đồ Thị Có Hướng</span>
        </label>
      </div>

      {/* Add Node */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-[#8B4513] font-semibold">Thêm Đỉnh</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nodeInput}
            onChange={(e) => setNodeInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddNode()}
            placeholder="Node name (e.g., A, B, C)"
            className="flex-1 px-3 py-2 border-2 border-[#8B4513] rounded focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
          />
          <button
            onClick={handleAddNode}
            className="px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#A0522D] transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add Edge */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-[#8B4513] font-semibold">Thêm Cạnh</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={edgeFrom}
            onChange={(e) => setEdgeFrom(e.target.value)}
            placeholder="Từ"
            className="flex-1 min-w-0 px-3 py-2 border-2 border-[#8B4513] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
          />
          <input
            type="text"
            value={edgeTo}
            onChange={(e) => setEdgeTo(e.target.value)}
            placeholder="Đến"
            className="flex-1 min-w-0 px-3 py-2 border-2 border-[#8B4513] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
          />
          <input
            type="number"
            value={edgeWeight}
            onChange={(e) => setEdgeWeight(e.target.value)}
            placeholder="Trọng số"
            className="w-20 px-3 py-2 border-2 border-[#8B4513] rounded focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
          />
          <button
            onClick={handleAddEdge}
            className="px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#A0522D] transition-colors flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Delete Operations */}
      <div className="flex flex-col gap-2 pb-4 border-b-2 border-[#D2B48C]">
        <label className="text-sm text-[#8B4513] font-semibold">Delete</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={deleteNodeInput}
            onChange={(e) => setDeleteNodeInput(e.target.value)}
            placeholder="Đỉnh Cần Xoá"
            className="flex-1 px-3 py-2 border-2 border-[#8B4513] rounded focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
          />
          <button
            onClick={handleDeleteNode}
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={deleteEdgeFrom}
            onChange={(e) => setDeleteEdgeFrom(e.target.value)}
            placeholder="Từ Đỉnh"
            className="flex-1 px-3 py-2 border-2 border-[#8B4513] rounded focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
          />
          <input
            type="text"
            value={deleteEdgeTo}
            onChange={(e) => setDeleteEdgeTo(e.target.value)}
            placeholder="Đến Đỉnh"
            className="flex-1 px-3 py-2 border-2 border-[#8B4513] rounded focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
          />
          <button
            onClick={handleDeleteEdge}
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-[#8B4513] font-semibold">Thuật Toán</label>
        <select
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value)}
          className="px-3 py-2 border-2 border-[#8B4513] rounded focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
        >
          <optgroup label="Duyệt Đồ Thị">
            <option value="bfs">Breadth-First Search (BFS)</option>
            <option value="dfs">Depth-First Search (DFS)</option>
          </optgroup>
          <optgroup label="Đường Đi Ngắn Nhất">
            <option value="shortest-path">Dijkstra's Algorithm</option>
          </optgroup>
          <optgroup label="Đặc Điểm Đồ Thị">
            <option value="bipartite">Bipartite Check</option>
          </optgroup>
          <optgroup label="Cây Khung Nhỏ Nhất">
            <option value="prim">Prim's Algorithm</option>
            <option value="kruskal">Kruskal's Algorithm</option>
          </optgroup>
          <optgroup label="Luồng Cực Đại">
            <option value="ford-fulkerson">Ford-Fulkerson Algorithm</option>
          </optgroup>
          <optgroup label="Chu Trình Euler">
            <option value="hierholzer">Hierholzer's Algorithm</option>
            <option value="fleury">Fleury's Algorithm</option>
          </optgroup>
        </select>
      </div>

      {/* Algorithm Parameters */}
      {needsStartNode && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[#8B4513] font-semibold">Đỉnh Bắt Đầu</label>
          <input
            type="text"
            value={startNode}
            onChange={(e) => onStartNodeChange(e.target.value)}
            placeholder="Nhập Vào Đỉnh Bắt Đầu"
            className="px-3 py-2 border-2 border-[#8B4513] rounded focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
          />
        </div>
      )}

      {needsEndNode && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[#8B4513] font-semibold">
            {algorithm === 'ford-fulkerson' ? 'Sink Node' : 'End Node'}
          </label>
          <input
            type="text"
            value={endNode}
            onChange={(e) => onEndNodeChange(e.target.value)}
            placeholder={`Enter ${algorithm === 'ford-fulkerson' ? 'sink' : 'end'} node`}
            className="px-3 py-2 border-2 border-[#8B4513] rounded focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
          />
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex flex-col gap-2 pt-4 border-t-2 border-[#D2B48C]">
        <label className="text-sm text-[#8B4513] font-semibold">Trực Quan Hoá</label>
        <div className="flex gap-2">
          <button
            onClick={onStepBackward}
            className="flex-1 px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#A0522D] transition-colors"
          >
            <SkipBack className="w-5 h-5 mx-auto" />
          </button>
          {isPlaying ? (
            <button
              onClick={onPause}
              className="flex-1 px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#A0522D] transition-colors"
            >
              <Pause className="w-5 h-5 mx-auto" />
            </button>
          ) : (
            <button
              onClick={onPlay}
              className="flex-1 px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#A0522D] transition-colors"
            >
              <Play className="w-5 h-5 mx-auto" />
            </button>
          )}
          <button
            onClick={onStepForward}
            className="flex-1 px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#A0522D] transition-colors"
          >
            <SkipForward className="w-5 h-5 mx-auto" />
          </button>
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#A0522D] transition-colors"
          >
            <RotateCcw className="w-5 h-5 mx-auto" />
          </button>
        </div>
      </div>

      {/* Speed Control */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-[#8B4513] font-semibold">
          Tốc Độ: {speed.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full accent-[#8B4513]"
        />
      </div>

      {/* Status Message */}
      {message && (
        <div className="p-3 bg-[#F5DEB3] border-2 border-[#8B4513] rounded text-sm text-[#8B4513]">
          {message}
        </div>
      )}
    </div>
  );
}
