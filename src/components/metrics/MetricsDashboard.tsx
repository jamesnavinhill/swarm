/**
 * Scientific Metrics & Held-Out Assay Dashboard
 * Plots Discovery-Frontier AUC, Portfolio Resilience, Behavioral Phenotypes,
 * and runs the Agent-Free 8-Schedule Held-Out Resilience Assay.
 */

import { Activity, BarChart3, CheckCircle2, Play, ShieldAlert, Sparkles, TrendingUp, Users } from 'lucide-react';
import React, { useState } from 'react';
import { sound } from '../../audio/SoundSynthesizer';
import { SwarmEngine } from '../../simulation/engine/SwarmEngine';
import { HeldOutAssayReport } from '../../types';

interface MetricsDashboardProps {
  engine: SwarmEngine;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ engine }) => {
  const [activeTab, setActiveTab] = useState<'realtime' | 'heldout' | 'comparative'>('realtime');
  const [isRunningAssay, setIsRunningAssay] = useState<boolean>(false);
  const [lastAssay, setLastAssay] = useState<HeldOutAssayReport | null>(
    engine.heldOutReports.length > 0 ? engine.heldOutReports[engine.heldOutReports.length - 1] : null
  );

  const history = engine.metricsHistory;
  const currentMetric = history.length > 0 ? history[history.length - 1] : null;

  const handleRunAssay = () => {
    setIsRunningAssay(true);
    sound.playDisturbanceAlert();

    setTimeout(() => {
      const report = engine.runHeldOutAssay();
      setLastAssay(report);
      setIsRunningAssay(false);
      sound.playSuccess();
    }, 400);
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-1">
            <span className="uppercase text-[11px] tracking-wider">Discovery AUC</span>
            <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-xl font-bold text-neutral-100">
            {currentMetric?.discoveryFrontierAUC.toFixed(4) ?? '0.0000'}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Time-integrated peak frontier</div>
        </div>

        <div className="p-3.5 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-1">
            <span className="uppercase text-[11px] tracking-wider">Portfolio Resilience</span>
            <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-xl font-bold text-neutral-200">
            {currentMetric?.portfolioResilience.toFixed(4) ?? '0.0000'}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Balanced multi-service coverage</div>
        </div>

        <div className="p-3.5 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-1">
            <span className="uppercase text-[11px] tracking-wider">Validated Inventions</span>
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-xl font-bold text-neutral-200">
            {currentMetric?.validatedInventionsCount ?? 0}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Cleared 5-point validation gate</div>
        </div>

        <div className="p-3.5 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-1">
            <span className="uppercase text-[11px] tracking-wider">Artifact C1 Ratio</span>
            <Users className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-xl font-bold text-neutral-200">
            {currentMetric ? ((currentMetric.phenotypeCounts.C1_artifact_centered / Math.max(1, engine.populationN)) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Artifact-centered phenotype</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-neutral-800 pb-2">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('realtime');
          }}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
            activeTab === 'realtime' ? 'bg-neutral-800 text-neutral-100 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Real-Time Frontier & Phenotypes
        </button>
        <button
          id="tab-heldout"
          onClick={() => {
            sound.playClick();
            setActiveTab('heldout');
          }}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'heldout' ? 'bg-neutral-800 text-neutral-100 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Agent-Free Held-Out Assay
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('comparative');
          }}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
            activeTab === 'comparative' ? 'bg-neutral-800 text-neutral-100 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Swarm vs Isolated Envelope (Paper Results)
        </button>
      </div>

      {/* Tab 1: Realtime Frontier & Phenotypes */}
      {activeTab === 'realtime' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Frontier & Resilience Curves */}
          <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
              Running Discovery-Frontier & Portfolio Trajectory
            </h3>
            <div className="h-56 flex items-end gap-1 pt-6 px-2 border-b border-l border-neutral-800">
              {history.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-neutral-950 text-neutral-200 text-[10px] p-1.5 rounded-sm border border-neutral-800 pointer-events-none whitespace-nowrap z-20 font-mono">
                    Tick {m.tick}: Peak {m.bestArtifactPerformance.toFixed(3)} | Portfolio {m.portfolioResilience.toFixed(3)}
                  </div>
                  {/* Bar for Peak */}
                  <div
                    className="w-full bg-neutral-400/80 rounded-t-none"
                    style={{ height: `${Math.min(100, m.bestArtifactPerformance * 100)}%` }}
                  />
                  {/* Bar for Portfolio */}
                  <div
                    className="w-full bg-neutral-600/60 rounded-t-none -mt-full"
                    style={{ height: `${Math.min(100, m.portfolioResilience * 200)}%` }}
                  />
                </div>
              ))}
              {history.length === 0 && (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                  Run simulation ticks to populate discovery curves.
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 font-mono">
              <span>Tick 0</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-neutral-400 inline-block rounded-sm"></span> Best Artifact</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-neutral-600 inline-block rounded-sm"></span> Portfolio Resilience</span>
              </div>
              <span>Tick {engine.tick}</span>
            </div>
          </div>

          {/* Behavioral Roles & Succession */}
          <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-neutral-400" />
              Dynamic Behavioral State Allocation (N = {engine.populationN})
            </h3>
            {currentMetric && (
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-200 font-medium">R1 Constructor / Operator</span>
                    <span className="font-mono text-neutral-400">{currentMetric.roleCounts.R1_constructor} agents</span>
                  </div>
                  <div className="w-full h-1.5 rounded-none bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-neutral-300" style={{ width: `${(currentMetric.roleCounts.R1_constructor / engine.populationN) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-200 font-medium">R2 Artifact-Local Caretaker</span>
                    <span className="font-mono text-neutral-400">{currentMetric.roleCounts.R2_caretaker} agents</span>
                  </div>
                  <div className="w-full h-1.5 rounded-none bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-neutral-400" style={{ width: `${(currentMetric.roleCounts.R2_caretaker / engine.populationN) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-200 font-medium">R3 Cultural Coordinator</span>
                    <span className="font-mono text-neutral-400">{currentMetric.roleCounts.R3_coordinator} agents</span>
                  </div>
                  <div className="w-full h-1.5 rounded-none bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-neutral-500" style={{ width: `${(currentMetric.roleCounts.R3_coordinator / engine.populationN) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-200 font-medium">R4 Mobile Surveyor</span>
                    <span className="font-mono text-neutral-400">{currentMetric.roleCounts.R4_surveyor} agents</span>
                  </div>
                  <div className="w-full h-1.5 rounded-none bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-neutral-600" style={{ width: `${(currentMetric.roleCounts.R4_surveyor / engine.populationN) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-sm bg-neutral-950 border border-neutral-800 text-xs text-neutral-400">
              <span className="font-semibold text-neutral-200 block mb-0.5">Self-Organized Differentiation:</span>
              Initially identical agents divide organically into a smaller group that stays near technology (C1) and a larger group that continues exploring (C2).
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Agent-Free Held-Out Assay */}
      {activeTab === 'heldout' && (
        <div className="space-y-5">
          <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
                Deterministic Agent-Free Held-Out Resilience Assay
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Clones the world state, removes all agents, and applies 8 paired unseen disturbance schedules with new epicenters, timings, and hazard orders. Tests whether technologies protect the habitat without human/LLM intervention.
              </p>
            </div>
            <button
              id="btn-execute-heldout"
              onClick={handleRunAssay}
              disabled={isRunningAssay}
              className="px-4 py-2 rounded-sm bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-950 font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors flex-shrink-0"
            >
              {isRunningAssay ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                  Simulating 8 Schedules...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  Execute Held-Out Stress Assay
                </>
              )}
            </button>
          </div>

          {lastAssay ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {lastAssay.schedules.map((sched) => (
                <div key={sched.scheduleId} className="p-3.5 rounded-sm bg-neutral-900 border border-neutral-800 text-xs">
                  <div className="flex items-center justify-between font-medium text-neutral-200 mb-1.5">
                    <span>Schedule #{sched.scheduleId}</span>
                    <span className="text-neutral-300 font-mono text-[11px]">Q̄ = {sched.meanResilience.toFixed(4)}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mb-2.5">{sched.name}</div>
                  {/* Mini curve */}
                  <div className="h-14 flex items-end gap-0.5 border-b border-neutral-800 pb-1">
                    {sched.serviceCoverageCurve.map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-neutral-400 rounded-none"
                        style={{ height: `${Math.min(100, val * 120)}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-md bg-neutral-900 border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
              Click &quot;Execute Held-Out Stress Assay&quot; to test your active technological collection across all 8 unseen disturbance schedules.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Swarm vs Isolated Envelope (Paper Comparison) */}
      {activeTab === 'comparative' && (
        <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-neutral-400" />
            Bounded Swarm Advantage: Shared Societies vs Isolated Best-of-N Envelope
          </h3>
          <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">
            As demonstrated in Figure 4 and Figure 14 of the MIT paper: shared worlds consistently outperform the isolated-search envelope in <strong>Portfolio Resilience (+0.086 to +0.130)</strong>, <strong>Held-Out Resilience (+0.010 to +0.015)</strong>, and <strong>Validated Inventions (+2.0 to +6.0)</strong>. However, isolated parallel search can still retain the single highest individual peak artifact.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            <div className="p-3.5 rounded-sm bg-neutral-950 border border-neutral-700">
              <div className="text-xs font-semibold text-neutral-200 uppercase">Full Culture Society</div>
              <div className="text-xl font-bold text-neutral-100 mt-1.5">0.2474</div>
              <div className="text-[11px] text-neutral-500">Portfolio Resilience (Tick 3,200)</div>
              <div className="mt-2 text-xs text-neutral-300 font-medium">+38% over Isolated Search</div>
            </div>

            <div className="p-3.5 rounded-sm bg-neutral-950 border border-neutral-800">
              <div className="text-xs font-semibold text-neutral-300 uppercase">No Explicit Culture</div>
              <div className="text-xl font-bold text-neutral-100 mt-1.5">0.2365</div>
              <div className="text-[11px] text-neutral-500">Portfolio Resilience (Tick 3,200)</div>
              <div className="mt-2 text-xs text-neutral-400 font-medium">+32% over Isolated Search</div>
            </div>

            <div className="p-3.5 rounded-sm bg-neutral-950 border border-neutral-800">
              <div className="text-xs font-semibold text-neutral-400 uppercase">Independent Best-of-N</div>
              <div className="text-xl font-bold text-neutral-100 mt-1.5">0.1794</div>
              <div className="text-[11px] text-neutral-500">Portfolio Resilience (Tick 3,200)</div>
              <div className="mt-2 text-xs text-neutral-500">Baseline Isolated Control</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
