/**
 * Interactive Knowledge Lineage and Provenance Graph
 * Visualizes the bipartite directed graph linking Agents -> Evidence -> Insights -> Programs -> Artifacts -> Forks.
 * Modeled directly on Figure 11 and Figure 15 from the MIT SwarmWorld paper.
 */

import { Circle, Code, Cpu, Dna, GitBranch, Layers, Network, Search, Shield, User } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { sound } from '../../audio/SoundSynthesizer';
import { SwarmEngine } from '../../simulation/engine/SwarmEngine';
import { LineageEdge, LineageNode } from '../../types';
import { useTheme } from '../common/ThemeContext';

interface LineageProps {
  engine: SwarmEngine;
}

export const KnowledgeLineageView: React.FC<LineageProps> = ({ engine }) => {
  const { mode } = useTheme();
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const graph = engine.provenanceGraph;

  // Filtered nodes (under 'all', focus on contributing/connected agents and all artifacts/programs/evidence)
  const filteredNodes = useMemo(() => {
    // Find all agent IDs that participate in any graph edges
    const connectedAgentIds = new Set<string>();
    graph.edges.forEach(e => {
      if (e.source.startsWith('agent_') || e.source.startsWith('Agent')) connectedAgentIds.add(e.source);
      if (e.target.startsWith('agent_') || e.target.startsWith('Agent')) connectedAgentIds.add(e.target);
    });

    return graph.nodes.filter(n => {
      // If filter is 'all', show all non-agents + connected contributing agents (plus first 6 agents if none connected)
      if (filterType === 'all') {
        if (n.type === 'agent') {
          const isConnected = connectedAgentIds.has(n.id);
          const isRecent = parseInt(n.id.replace(/\D/g, '') || '99') < 8;
          if (!isConnected && !isRecent) return false;
        }
      } else if (filterType !== 'all') {
        if (n.type !== filterType) return false;
      }

      const matchSearch = searchTerm === '' ||
        n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.details.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [graph.nodes, graph.edges, filterType, searchTerm]);

  // Layout coordinates calculation for nodes
  const layoutNodes = useMemo(() => {
    const typeX: Record<string, number> = {
      agent: 90,
      evidence: 270,
      insight: 450,
      program: 630,
      artifact: 810,
    };

    const grouped: Record<string, LineageNode[]> = {
      agent: [],
      evidence: [],
      insight: [],
      program: [],
      artifact: [],
    };

    for (const node of filteredNodes) {
      if (grouped[node.type]) {
        grouped[node.type].push(node);
      }
    }

    const positioned: (LineageNode & { x: number; y: number })[] = [];

    Object.entries(grouped).forEach(([type, nodes]) => {
      const x = typeX[type] || 450;
      const total = nodes.length;
      const startY = 80;
      const availableH = 380;
      
      nodes.forEach((n, idx) => {
        const y = total === 1 ? startY + availableH / 2 : startY + (idx / Math.max(1, total - 1)) * availableH;
        positioned.push({ ...n, x, y });
      });
    });

    return positioned;
  }, [filteredNodes]);

  const positionedMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    layoutNodes.forEach(n => map.set(n.id, { x: n.x, y: n.y }));
    return map;
  }, [layoutNodes]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'agent': return '#5a809e'; // Steel blue
      case 'evidence': return '#bfa15f'; // Subdued amber/gold
      case 'insight': return '#a65959'; // Muted brick red
      case 'program': return '#7c6d91'; // Slate purple
      case 'artifact': return '#4a7c59'; // Muted green
      default: return '#737373';
    }
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-3 p-1 sm:p-2 overflow-hidden">
      {/* Main Graph Visualization Area */}
      <div className="flex-1 min-h-0 h-full flex flex-col rounded-md bg-neutral-900 border border-neutral-800 shadow-sm overflow-hidden">
        {/* Graph Header / Filters */}
        <div className="p-3 border-b border-neutral-800 bg-neutral-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-neutral-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Knowledge Lineage & Code Provenance Graph
            </h2>
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 text-xs">
            {['all', 'agent', 'program', 'artifact'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  sound.playClick();
                  setFilterType(type);
                }}
                className={`px-2.5 py-1 rounded-sm capitalize font-medium transition-colors ${
                  filterType === type ? 'bg-neutral-800 text-neutral-100 font-semibold border border-neutral-700' : 'text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Graph Viewport */}
        <div className="flex-1 min-h-0 relative overflow-hidden bg-neutral-950 p-2 flex items-center justify-center">
          <svg
            viewBox="0 0 900 500"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full max-h-full select-none"
          >
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={mode === 'dark' ? '#737373' : '#94a3b8'} />
              </marker>
            </defs>

            {/* Stage Columns Background */}
            <g className="text-[10px] font-mono fill-neutral-500 font-semibold">
              <text x="90" y="30" textAnchor="middle">1. AGENTS (OBSERVERS)</text>
              <text x="270" y="30" textAnchor="middle">2. EVIDENCE & CITATIONS</text>
              <text x="450" y="30" textAnchor="middle">3. INSIGHTS & THEORIES</text>
              <text x="630" y="30" textAnchor="middle">4. EXECUTABLE FORKS</text>
              <text x="810" y="30" textAnchor="middle">5. PERSISTENT ARTIFACTS</text>
            </g>

            {/* Vertical column subtle divider lines */}
            <g stroke={mode === 'dark' ? '#262626' : '#e2e8f0'} strokeWidth="1" strokeDasharray="3 3">
              <line x1="180" y1="45" x2="180" y2="480" />
              <line x1="360" y1="45" x2="360" y2="480" />
              <line x1="540" y1="45" x2="540" y2="480" />
              <line x1="720" y1="45" x2="720" y2="480" />
            </g>

            {/* Edges */}
            {graph.edges.map((edge) => {
              const srcPos = positionedMap.get(edge.source);
              const tgtPos = positionedMap.get(edge.target);
              if (!srcPos || !tgtPos) return null;

              const isFork = edge.type === 'forked';
              const isSelected = selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

              const strokeColor = isSelected
                ? (mode === 'dark' ? '#f5f5f5' : '#0f172a')
                : isFork
                ? '#b45309'
                : (mode === 'dark' ? '#525252' : '#cbd5e1');

              return (
                <path
                  key={edge.id}
                  d={`M ${srcPos.x} ${srcPos.y} C ${(srcPos.x + tgtPos.x) / 2} ${srcPos.y}, ${(srcPos.x + tgtPos.x) / 2} ${tgtPos.y}, ${tgtPos.x} ${tgtPos.y}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 2 : isFork ? 1.5 : 1}
                  strokeDasharray={isFork ? '4 3' : undefined}
                  markerEnd="url(#arrow)"
                  className="transition-all opacity-85 hover:opacity-100"
                />
              );
            })}

            {/* Nodes */}
            {layoutNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const col = getNodeColor(node.type);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => {
                    sound.playClick();
                    setSelectedNode(node);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Highlight ring */}
                  {isSelected && (
                    <circle r="16" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                  )}

                  {/* Node Shape */}
                  {node.type === 'artifact' ? (
                    <polygon points="0,-11 11,0 0,11 -11,0" fill={col} stroke="#ffffff" strokeWidth="1" />
                  ) : node.type === 'program' ? (
                    <polygon points="-7,-9 7,-9 11,0 7,9 -7,9 -11,0" fill={col} stroke="#ffffff" strokeWidth="1" />
                  ) : (
                    <circle r="9" fill={col} stroke="#ffffff" strokeWidth="1" />
                  )}

                  {/* Label */}
                  <text
                    y="20"
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-neutral-300 group-hover:fill-neutral-100 font-medium select-none"
                  >
                    {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Side Details Panel */}
      <div className="w-full lg:w-80 h-full rounded-md bg-neutral-900 border border-neutral-800 p-4 flex flex-col justify-between shadow-sm shrink-0 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
            Lineage Node Inspector
          </h3>

          {selectedNode ? (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase font-mono">{selectedNode.type} NODE</span>
                <h4 className="text-sm font-bold text-neutral-100 mt-0.5">{selectedNode.label}</h4>
                <div className="text-neutral-400 font-mono text-[11px] mt-0.5">ID: {selectedNode.id}</div>
              </div>

              <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase font-mono">Recorded History</span>
                <p className="text-neutral-300 mt-0.5 leading-relaxed">{selectedNode.details}</p>
              </div>

              {selectedNode.performance !== undefined && (
                <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Simulator Performance</span>
                  <div className="text-base font-bold text-neutral-100 mt-0.5 font-mono">
                    {selectedNode.performance.toFixed(4)}
                  </div>
                </div>
              )}

              {selectedNode.authors && selectedNode.authors.length > 0 && (
                <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Contributing Authors</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.authors.map(a => (
                      <span key={a} className="px-1.5 py-0.5 rounded-sm bg-neutral-800 text-neutral-200 font-mono text-[11px] border border-neutral-700">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-sm bg-neutral-950 border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
              Click any node in the provenance graph to inspect its recorded ancestor links, code fork diffs, and authorship lineage.
            </div>
          )}
        </div>

        {/* Paper Insight Box */}
        <div className="mt-4 p-3 rounded-sm bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 shrink-0">
          <span className="font-bold block mb-1 text-neutral-200">Empirical Finding (Fig 6 & 11):</span>
          Under full culture, up to 76% of persistent artifacts receive multi-agent contributions and executable code descent reaches up to 12 fork generations.
        </div>
      </div>
    </div>
  );
};
