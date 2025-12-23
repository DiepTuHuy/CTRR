import React, { useRef, useState, useEffect } from 'react';
import { Node, Edge, AlgorithmStep } from '../types/graph';
import { motion } from 'motion/react';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  directed: boolean;
  onNodeDrag: (nodeId: string, x: number, y: number) => void;
  onNodeClick: (nodeId: string) => void;
  selectedNodes: string[];
  algorithmStep: AlgorithmStep | null;
  onCanvasClick: (x: number, y: number) => void;
}

export function GraphCanvas({
  nodes,
  edges,
  directed,
  onNodeDrag,
  onNodeClick,
  selectedNodes,
  algorithmStep,
  onCanvasClick
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const nodeRadius = 30;

  // Get node color based on algorithm state
  const getNodeColor = (nodeId: string): string => {
    if (!algorithmStep) {
      return selectedNodes.includes(nodeId) ? '#8B4513' : '#A0522D';
    }

    if (algorithmStep.nodeId === nodeId && algorithmStep.type === 'node-current') {
      return '#FF6B35'; // Orange for current
    }

    if (algorithmStep.highlightNodes?.includes(nodeId)) {
      return '#8B4513'; // Brown for visited
    }

    if (algorithmStep.partition?.has(nodeId)) {
      const color = algorithmStep.partition.get(nodeId);
      return color === 0 ? '#8B4513' : '#D2691E'; // Two shades of brown
    }

    if (algorithmStep.path?.includes(nodeId)) {
      return '#A0522D'; // Medium brown for path
    }

    return '#F5DEB3'; // Wheat for unvisited
  };

  // Get edge color based on algorithm state
  const getEdgeColor = (from: string, to: string): string => {
    if (!algorithmStep) return '#8B4513';

    if (algorithmStep.edgeFrom === from && algorithmStep.edgeTo === to) {
      return '#FF6B35'; // Orange for current edge
    }

    if (algorithmStep.highlightEdges?.some(e => e.from === from && e.to === to)) {
      return '#8B4513'; // Brown for highlighted edges
    }

    return '#D2B48C'; // Tan for default
  };

  const getEdgeWidth = (from: string, to: string): number => {
    if (!algorithmStep) return 2;

    if (algorithmStep.edgeFrom === from && algorithmStep.edgeTo === to) {
      return 4;
    }

    if (algorithmStep.highlightEdges?.some(e => e.from === from && e.to === to)) {
      return 3;
    }

    return 2;
  };

  // Handle mouse down on node
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      onNodeClick(nodeId);
    } else {
      setDraggingNode(nodeId);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * viewBox.width + viewBox.x;
      const y = ((e.clientY - rect.top) / rect.height) * viewBox.height + viewBox.y;
      onNodeDrag(draggingNode, x, y);
    } else if (isPanning) {
      const dx = (e.clientX - panStart.x) * (viewBox.width / (svgRef.current?.clientWidth || 1));
      const dy = (e.clientY - panStart.y) * (viewBox.height / (svgRef.current?.clientHeight || 1));
      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * viewBox.width + viewBox.x;
      const y = ((e.clientY - rect.top) / rect.height) * viewBox.height + viewBox.y;
      onCanvasClick(x, y);
    }
  };

  // Handle pan start
  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggingNode) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox(prev => ({
      x: prev.x,
      y: prev.y,
      width: prev.width * zoomFactor,
      height: prev.height * zoomFactor
    }));
  };

  // Calculate arrow position for directed edges
  const getArrowPoints = (fromNode: Node, toNode: Node) => {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x1: fromNode.x, y1: fromNode.y, x2: toNode.x, y2: toNode.y, midX: fromNode.x, midY: fromNode.y };
    
    const unitX = dx / length;
    const unitY = dy / length;
    
    // Shorten line to stop at node border
    const x1 = fromNode.x + unitX * nodeRadius;
    const y1 = fromNode.y + unitY * nodeRadius;
    const x2 = toNode.x - unitX * (nodeRadius + 10);
    const y2 = toNode.y - unitY * (nodeRadius + 10);
    
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    
    return { x1, y1, x2, y2, midX, midY };
  };

  return (
    <div className="relative w-full h-full bg-white border-2 border-[#8B4513] rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-move"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={handlePanStart}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      >
        {/* Define arrowhead marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#8B4513" />
          </marker>
          <marker
            id="arrowhead-highlight"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#FF6B35" />
          </marker>
        </defs>

        {/* Render edges */}
        {edges.map((edge, idx) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          
          if (!fromNode || !toNode) return null;
          
          const { x1, y1, x2, y2, midX, midY } = getArrowPoints(fromNode, toNode);
          const color = getEdgeColor(edge.from, edge.to);
          const width = getEdgeWidth(edge.from, edge.to);
          const isHighlighted = color === '#FF6B35';

          return (
            <g key={`edge-${idx}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={width}
                markerEnd={directed ? (isHighlighted ? "url(#arrowhead-highlight)" : "url(#arrowhead)") : undefined}
              />
              {/* Edge weight */}
              <text
                x={midX}
                y={midY - 8}
                textAnchor="middle"
                className="pointer-events-none select-none"
                fill="#8B4513"
                fontSize="14"
                fontWeight="600"
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Render nodes */}
        {nodes.map(node => (
          <g
            key={node.id}
            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
            className="cursor-pointer"
            style={{ cursor: draggingNode === node.id ? 'grabbing' : 'grab' }}
          >
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              fill={getNodeColor(node.id)}
              stroke="#8B4513"
              strokeWidth="3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none select-none"
              fill="white"
              fontSize="18"
              fontWeight="bold"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-white/90 border-2 border-[#8B4513] rounded p-3 text-xs text-[#8B4513]">
        <div><strong>Di Chuyển:</strong> Di Chuyển Đỉnh</div>
        <div><strong>Shift+Con Lăn:</strong> Zoom</div>
      </div>
    </div>
  );
}
