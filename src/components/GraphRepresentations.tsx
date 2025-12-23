import React from 'react';
import { GraphRepresentation } from '../types/graph';

interface GraphRepresentationsProps {
  representations: GraphRepresentation;
  nodeOrder: string[];
}

export function GraphRepresentations({ representations, nodeOrder }: GraphRepresentationsProps) {
  const [activeTab, setActiveTab] = React.useState<'matrix' | 'list' | 'edges'>('matrix');

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border-2 border-[#8B4513] rounded-lg">
      <div className="flex gap-2 border-b-2 border-[#D2B48C] pb-2">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded transition-colors ${
            activeTab === 'matrix'
              ? 'bg-[#8B4513] text-white'
              : 'bg-[#F5DEB3] text-[#8B4513] hover:bg-[#D2B48C]'
          }`}
        >
          Ma Trận Kề
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded transition-colors ${
            activeTab === 'list'
              ? 'bg-[#8B4513] text-white'
              : 'bg-[#F5DEB3] text-[#8B4513] hover:bg-[#D2B48C]'
          }`}
        >
          Danh Sách Kề
        </button>
        <button
          onClick={() => setActiveTab('edges')}
          className={`px-4 py-2 rounded transition-colors ${
            activeTab === 'edges'
              ? 'bg-[#8B4513] text-white'
              : 'bg-[#F5DEB3] text-[#8B4513] hover:bg-[#D2B48C]'
          }`}
        >
          Danh Sách Cạnh
        </button>
      </div>

      <div className="overflow-auto max-h-96">
        {/* Adjacency Matrix */}
        {activeTab === 'matrix' && (
          <div className="overflow-x-auto">
            {nodeOrder.length === 0 ? (
              <p className="text-[#8B4513] italic">Không Tồn Tại Đỉnh Trong Đồ Thị</p>
            ) : (
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="border-2 border-[#8B4513] bg-[#F5DEB3] p-2 text-[#8B4513]"></th>
                    {nodeOrder.map(node => (
                      <th
                        key={node}
                        className="border-2 border-[#8B4513] bg-[#F5DEB3] p-2 text-[#8B4513] min-w-[40px]"
                      >
                        {node}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {representations.adjacencyMatrix.map((row, i) => (
                    <tr key={i}>
                      <th className="border-2 border-[#8B4513] bg-[#F5DEB3] p-2 text-[#8B4513]">
                        {nodeOrder[i]}
                      </th>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`border-2 border-[#8B4513] p-2 text-center ${
                            cell > 0 ? 'bg-[#D2B48C] text-[#8B4513]' : 'bg-white text-gray-400'
                          }`}
                        >
                          {cell || '0'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Adjacency List */}
        {activeTab === 'list' && (
          <div className="space-y-2">
            {nodeOrder.length === 0 ? (
              <p className="text-[#8B4513] italic">Không Tồn Tại Đỉnh Trong Đồ Thị</p>
            ) : (
              nodeOrder.map(node => {
                const neighbors = representations.adjacencyList.get(node) || [];
                return (
                  <div key={node} className="flex gap-2 items-start">
                    <span className="font-semibold text-[#8B4513] min-w-[40px]">{node}:</span>
                    <span className="text-[#8B4513]">
                      {neighbors.length === 0
                        ? '[]'
                        : `[${neighbors.map(n => `${n.node}(${n.weight})`).join(', ')}]`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Edge List */}
        {activeTab === 'edges' && (
          <div className="space-y-2">
            {representations.edgeList.length === 0 ? (
              <p className="text-[#8B4513] italic">Không Tồn Tại Cạnh Trong Đồ Thị</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-2 border-[#8B4513] bg-[#F5DEB3] p-2 text-[#8B4513] text-left">
                      Từ
                    </th>
                    <th className="border-2 border-[#8B4513] bg-[#F5DEB3] p-2 text-[#8B4513] text-left">
                      Đến
                    </th>
                    <th className="border-2 border-[#8B4513] bg-[#F5DEB3] p-2 text-[#8B4513] text-left">
                      Trọng Số
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {representations.edgeList.map((edge, i) => (
                    <tr key={i}>
                      <td className="border-2 border-[#8B4513] p-2 text-[#8B4513]">
                        {edge.from}
                      </td>
                      <td className="border-2 border-[#8B4513] p-2 text-[#8B4513]">
                        {edge.to}
                      </td>
                      <td className="border-2 border-[#8B4513] p-2 text-[#8B4513]">
                        {edge.weight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
