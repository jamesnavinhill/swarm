/**
 * Interactive 2D & Isometric World Viewport
 * High-performance canvas with fluid pan/zoom, touch gesture handling,
 * real-time field heatmap overlays, and entity inspection.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Layers, Minus, Plus, RotateCcw } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';
import { REALM_CONFIGS } from '../../simulation/data/realmsData';
import { SwarmEngine } from '../../simulation/engine/SwarmEngine';
import { Agent, Artifact } from '../../types';
import { useTheme } from '../common/ThemeContext';

interface WorldViewportProps {
  engine: SwarmEngine;
  onSelectAgent: (agent: Agent | null) => void;
  onSelectArtifact: (artifact: Artifact | null) => void;
  selectedAgentId?: string;
  selectedArtifactId?: string;
}

export type FieldOverlayMode = 'natural' | 'moisture' | 'contamination' | 'temperature' | 'nutrients';

export const WorldViewport: React.FC<WorldViewportProps> = ({
  engine,
  onSelectAgent,
  onSelectArtifact,
  selectedAgentId,
  selectedArtifactId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { mode } = useTheme();

  const [overlayMode, setOverlayMode] = useState<FieldOverlayMode>('natural');
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'topdown' | 'isometric'>('topdown');

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);

  // Auto-render loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      drawCanvas();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [engine, overlayMode, showTrails, viewMode, zoom, pan, selectedAgentId, selectedArtifactId, mode]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Background fill
    ctx.fillStyle = mode === 'dark' ? '#0a0a0a' : '#f5f5f5';
    ctx.fillRect(0, 0, w, h);

    const config = REALM_CONFIGS[engine.realm];
    const gridW = engine.width;
    const gridH = engine.height;

    const cellSize = Math.min(w / gridW, h / gridH) * 1.4 * zoom;
    const originX = (w - gridW * cellSize) / 2 + pan.x;
    const originY = (h - gridH * cellSize) / 2 + pan.y;

    ctx.translate(originX, originY);

    // 1. Draw Grid Cells & Heatmap Overlays
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const idx = y * gridW + x;
        const cellX = x * cellSize;
        const cellY = y * cellSize;

        if (overlayMode === 'natural') {
          const terrainIdx = engine.terrainGrid[idx] % config.terrains.length;
          ctx.fillStyle = config.terrains[terrainIdx].color;
        } else if (overlayMode === 'moisture') {
          const m = engine.fields.moisture[idx] ?? 0;
          ctx.fillStyle = `rgba(14, 165, 233, ${Math.max(0.1, m)})`;
        } else if (overlayMode === 'contamination') {
          const c = engine.fields.contamination[idx] ?? 0;
          ctx.fillStyle = `rgba(239, 68, 68, ${Math.max(0.08, c * 1.5)})`;
        } else if (overlayMode === 'temperature') {
          const t = engine.fields.temperature[idx] ?? 0;
          ctx.fillStyle = `rgba(249, 115, 22, ${Math.max(0.1, t)})`;
        } else if (overlayMode === 'nutrients') {
          const n = engine.fields.nutrients[idx] ?? 0;
          ctx.fillStyle = `rgba(34, 197, 94, ${Math.max(0.1, n)})`;
        }

        ctx.fillRect(cellX, cellY, cellSize - 0.5, cellSize - 0.5);

        // Resource indicator dot if available
        const mass = engine.resourceMassGrid[idx];
        if (mass > 0.5 && overlayMode === 'natural') {
          const resTypeIdx = engine.resourceTypeGrid[idx] % config.feedstocks.length;
          ctx.fillStyle = config.feedstocks[resTypeIdx].color;
          ctx.beginPath();
          ctx.arc(cellX + cellSize / 2, cellY + cellSize / 2, Math.min(cellSize * 0.25, mass * 1.5), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Draw Facilities
    for (const fac of config.facilities) {
      const fx = fac.x * cellSize + cellSize / 2;
      const fy = fac.y * cellSize + cellSize / 2;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.fillStyle = config.themeColor;

      ctx.beginPath();
      ctx.rect(fx - cellSize * 1.2, fy - cellSize * 1.2, cellSize * 2.4, cellSize * 2.4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `600 ${Math.max(9, cellSize * 0.7)}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(fac.name.split(' ')[0], fx, fy + cellSize * 2.2);
    }

    // 3. Draw Persistent Artifacts (Golden Diamonds & Glowing Active Rings)
    for (const art of engine.artifacts) {
      const ax = art.x * cellSize + cellSize / 2;
      const ay = art.y * cellSize + cellSize / 2;
      const isSelected = art.id === selectedArtifactId;

      ctx.save();
      ctx.translate(ax, ay);

      // Glow ring for active controllers
      if (art.program) {
        ctx.strokeStyle = config.themeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const pulse = 1 + 0.15 * Math.sin((engine.tick + art.builtTick) * 0.2);
        ctx.arc(0, 0, cellSize * 1.2 * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Selection ring
      if (isSelected) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, cellSize * 1.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Diamond Body
      ctx.fillStyle = isSelected ? '#cbd5e1' : '#bfa15f';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const dSize = cellSize * 1.0;
      ctx.moveTo(0, -dSize);
      ctx.lineTo(dSize, 0);
      ctx.lineTo(0, dSize);
      ctx.lineTo(-dSize, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = mode === 'dark' ? '#e2e8f0' : '#334155';
      ctx.font = `600 ${Math.max(8, cellSize * 0.6)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`A${art.id.slice(-3)}`, 0, dSize + cellSize * 0.8);

      ctx.restore();
    }

    // 4. Draw Active Disturbance Ripples
    for (const dist of engine.activeDisturbances) {
      const dx = dist.x * cellSize;
      const dy = dist.y * cellSize;
      const r = dist.radius * cellSize;

      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(dx, dy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(153, 27, 27, 0.08)';
      ctx.beginPath();
      ctx.arc(dx, dy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Draw Agents
    for (const agent of engine.agents) {
      const agX = agent.x * cellSize + cellSize / 2;
      const agY = agent.y * cellSize + cellSize / 2;
      const isSelected = agent.id === selectedAgentId;

      ctx.save();
      ctx.translate(agX, agY);

      // Selected halo
      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, cellSize * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Phenotype outer ring
      if (agent.phenotype === 'C1_artifact_centered') {
        ctx.strokeStyle = '#4a7c59'; // Muted green for artifact-centered
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, cellSize * 0.9, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Agent Body circle
      ctx.fillStyle = agent.activeColor;
      ctx.beginPath();
      ctx.arc(0, 0, cellSize * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Role symbol / number
      ctx.fillStyle = '#ffffff';
      ctx.font = `600 ${Math.max(7, cellSize * 0.5)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(agent.id.slice(-2), 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }, [engine, overlayMode, showTrails, zoom, pan, selectedAgentId, selectedArtifactId, mode]);

  // Touch and pointer interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Check if it was a quick click to select an entity
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const gridW = engine.width;
    const gridH = engine.height;
    const cellSize = Math.min(rect.width / gridW, rect.height / gridH) * 1.4 * zoom;
    const originX = (rect.width - gridW * cellSize) / 2 + pan.x;
    const originY = (rect.height - gridH * cellSize) / 2 + pan.y;

    const worldCellX = Math.floor((clickX - originX) / cellSize);
    const worldCellY = Math.floor((clickY - originY) / cellSize);

    // Find agent or artifact near click
    const clickedAgent = engine.agents.find(a => Math.hypot(a.x - worldCellX, a.y - worldCellY) <= 1.2);
    if (clickedAgent) {
      sound.playClick();
      onSelectAgent(clickedAgent);
      onSelectArtifact(null);
      return;
    }

    const clickedArtifact = engine.artifacts.find(a => Math.hypot(a.x - worldCellX, a.y - worldCellY) <= 1.5);
    if (clickedArtifact) {
      sound.playClick();
      onSelectArtifact(clickedArtifact);
      onSelectAgent(null);
      return;
    }

    // Clicked empty space
    onSelectAgent(null);
    onSelectArtifact(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom(z => Math.max(0.4, Math.min(4.0, z * zoomFactor)));
  };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden rounded-md border border-neutral-800 bg-neutral-950">
      {/* Top Floating Field Overlay Hover Popover */}
      <div className="absolute top-3 left-3 z-20 group">
        {/* Trigger Pill */}
        <button
          id="btn-field-popover-trigger"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 shadow-md text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition-all cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-400 font-normal">Field:</span>
          <span className="font-semibold capitalize text-neutral-100">{overlayMode}</span>
          <ChevronDown className="w-3 h-3 text-neutral-500 transition-transform duration-200 group-hover:rotate-180" />
        </button>

        {/* Hover Popover Menu */}
        <div className="absolute top-full left-0 mt-1.5 w-44 rounded-md bg-neutral-900 border border-neutral-800 p-1.5 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 flex flex-col gap-1 z-30 pointer-events-auto">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
            Environmental Layers
          </div>
          {[
            { id: 'natural', label: 'Natural / Raw', dot: 'bg-amber-500' },
            { id: 'moisture', label: 'Moisture', dot: 'bg-blue-500' },
            { id: 'contamination', label: 'Contamination', dot: 'bg-rose-500' },
            { id: 'temperature', label: 'Temperature', dot: 'bg-orange-500' },
            { id: 'nutrients', label: 'Nutrients', dot: 'bg-emerald-500' },
          ].map(item => (
            <button
              key={item.id}
              id={`overlay-btn-${item.id}`}
              onClick={() => {
                sound.playClick();
                setOverlayMode(item.id as FieldOverlayMode);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs text-left transition-colors ${
                overlayMode === item.id
                  ? 'bg-neutral-800 text-neutral-100 font-semibold border border-neutral-700 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.dot}`}></span>
                <span>{item.label}</span>
              </div>
              {overlayMode === item.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-200"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Zoom, Reset & Disturbance Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 p-1 rounded-md bg-neutral-900 border border-neutral-800 shadow-md">
        {/* Row of 3 square icon buttons: Zoom In, Zoom Out, Reset View */}
        <div className="flex items-center gap-1">
          <button
            id="btn-zoom-in"
            onClick={() => {
              sound.playClick();
              setZoom(z => Math.min(4.0, z * 1.25));
            }}
            className="w-7 h-7 flex items-center justify-center rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-zoom-out"
            onClick={() => {
              sound.playClick();
              setZoom(z => Math.max(0.4, z * 0.8));
            }}
            className="w-7 h-7 flex items-center justify-center rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-reset-view"
            onClick={() => {
              sound.playClick();
              setZoom(1.0);
              setPan({ x: 0, y: 0 });
            }}
            className="w-7 h-7 flex items-center justify-center rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stress Pulse Button - Exact matching width to the 3 icons above */}
        <button
          id="btn-trigger-pulse"
          onClick={() => {
            sound.playDisturbanceAlert();
            engine.triggerSeededDisturbance();
          }}
          className="w-full h-7 px-2 flex items-center justify-center gap-1.5 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium transition-colors shadow-xs"
          title="Trigger Seeded Disturbance Pulse"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Stress Pulse</span>
        </button>
      </div>

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Bottom Status Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none flex items-center justify-between px-3 py-1.5 rounded-md bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#4a7c59]"></span>
            <span>C1 Artifact Centered ({engine.agents.filter(a => a.phenotype === 'C1_artifact_centered').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#5c7c99]"></span>
            <span>C2 Mobile Explorers ({engine.agents.filter(a => a.phenotype === 'C2_mobile_exploration').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rotate-45 bg-[#bfa15f] inline-block"></span>
            <span>Inventions ({engine.artifacts.length})</span>
          </div>
        </div>
        <span className="hidden sm:inline font-mono text-[11px] text-neutral-500">Drag to Pan • Wheel to Zoom • Click Entity to Inspect</span>
      </div>
    </div>
  );
};
