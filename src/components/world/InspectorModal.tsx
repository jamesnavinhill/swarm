/**
 * Deep Entity Inspector (Agents & Persistent Artifacts)
 * Shows exact empirical records, bytecode disassembly, operational fluxes, and research states.
 */

import { Activity, Award, Cpu, Dna, Eye, Layers, Shield, Sparkles, User, X, Zap } from 'lucide-react';
import React from 'react';
import { sound } from '../../audio/SoundSynthesizer';
import { REALM_CONFIGS } from '../../simulation/data/realmsData';
import { Agent, Artifact } from '../../types';

interface InspectorProps {
  agent: Agent | null;
  artifact: Artifact | null;
  onClose: () => void;
}

export const InspectorModal: React.FC<InspectorProps> = ({ agent, artifact, onClose }) => {
  if (!agent && !artifact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-md bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-sm bg-neutral-800 border border-neutral-700">
              {agent ? <User className="w-4 h-4 text-neutral-300" /> : <Shield className="w-4 h-4 text-neutral-300" />}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {agent ? agent.name : artifact?.name}
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {agent ? `ID: ${agent.id} • Phenotype: ${agent.phenotype}` : `Artifact ID: ${artifact?.id} • Built Tick: ${artifact?.builtTick}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-sm hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {agent && (
            <>
              {/* Behavioral Role & Phenotype */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-neutral-950 border border-neutral-800">
                  <span className="text-xs text-neutral-400 uppercase font-medium">Behavioral State</span>
                  <div className="text-sm font-semibold text-neutral-200 mt-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-neutral-400" />
                    {agent.role.replace('_', ': ')}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-neutral-950 border border-neutral-800">
                  <span className="text-xs text-neutral-400 uppercase font-medium">Phenotypic Cluster</span>
                  <div className="text-sm font-semibold text-neutral-200 mt-1 flex items-center gap-1.5">
                    <Dna className="w-3.5 h-3.5 text-neutral-400" />
                    {agent.phenotype.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Research Goal & Hypothesis */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 uppercase">
                    <Sparkles className="w-3 h-3 text-neutral-400" />
                    Active Cognitive Goal
                  </div>
                  <p className="mt-1 text-sm text-neutral-200">{agent.currentGoal}</p>
                </div>
                <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 uppercase">
                    <Layers className="w-3 h-3 text-neutral-400" />
                    Current Material Hypothesis
                  </div>
                  <p className="mt-1 text-sm text-neutral-300 font-mono text-xs">{agent.currentHypothesis}</p>
                </div>
              </div>

              {/* Trajectory & Empirical Activity Stats */}
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Empirical Trajectory Metrics</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 text-center">
                    <div className="text-sm font-bold text-neutral-100">{agent.pathLength.toFixed(1)}</div>
                    <div className="text-[11px] text-neutral-500">Path Length (cells)</div>
                  </div>
                  <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 text-center">
                    <div className="text-sm font-bold text-neutral-100">{agent.regionsVisited.size}</div>
                    <div className="text-[11px] text-neutral-500">Regions Explored</div>
                  </div>
                  <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 text-center">
                    <div className="text-sm font-bold text-neutral-100">{agent.artifactsBuilt}</div>
                    <div className="text-[11px] text-neutral-500">Artifacts Built</div>
                  </div>
                </div>
              </div>

              {/* Personal Inventory Ledger */}
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Conserved Material Inventory ({agent.inventoryMass.toFixed(2)} / {agent.maxInventory.toFixed(1)} mass)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(agent.inventory)
                    .filter(([_, mass]) => (Number(mass) || 0) > 0.01)
                    .map(([type, mass]) => (
                      <div key={type} className="p-2 rounded-sm bg-neutral-950 border border-neutral-800 text-xs">
                        <div className="text-neutral-400 font-mono text-[11px]">{type}</div>
                        <div className="text-xs font-semibold text-neutral-200 mt-0.5">{(Number(mass) || 0).toFixed(2)} kg</div>
                      </div>
                    ))}
                  {agent.inventoryMass <= 0.01 && (
                    <div className="col-span-full text-xs text-neutral-500 italic p-2.5 text-center bg-neutral-950 rounded-sm">
                      Inventory currently empty. Agent is surveying for high-yield deposits.
                    </div>
                  )}
                </div>
              </div>

              {/* Memory Log */}
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Epistemic Memory & Notebook Trace</h3>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {agent.memory.slice(-5).reverse().map((rec) => (
                    <div key={rec.id} className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 text-xs">
                      <div className="flex items-center justify-between text-neutral-500 mb-0.5">
                        <span className="font-medium text-neutral-300 font-mono text-[11px]">{rec.type}</span>
                        <span className="font-mono text-[11px]">Tick {rec.tick}</span>
                      </div>
                      <p className="text-neutral-300">{rec.content}</p>
                    </div>
                  ))}
                  {agent.memory.length === 0 && (
                    <div className="text-xs text-neutral-500 italic">No recent log events recorded.</div>
                  )}
                </div>
              </div>
            </>
          )}

          {artifact && (
            <>
              {/* Artifact Core Performance */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-md bg-neutral-950 border border-neutral-800 text-center">
                  <span className="text-xs text-neutral-400 uppercase font-medium">Lifetime Peak</span>
                  <div className="text-base font-bold text-neutral-100 mt-0.5 flex items-center justify-center gap-1">
                    <Award className="w-3.5 h-3.5 text-neutral-400" />
                    {artifact.lifetimePeakPerformance.toFixed(4)}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-neutral-950 border border-neutral-800 text-center">
                  <span className="text-xs text-neutral-400 uppercase font-medium">Current Health</span>
                  <div className="text-base font-bold text-neutral-100 mt-0.5">
                    {(artifact.health * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="p-3 rounded-md bg-neutral-950 border border-neutral-800 text-center">
                  <span className="text-xs text-neutral-400 uppercase font-medium">Contributors</span>
                  <div className="text-base font-bold text-neutral-100 mt-0.5 flex items-center justify-center gap-1">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    {artifact.distinctParticipants} Agents
                  </div>
                </div>
              </div>

              {/* Functional Spec & Inspiration */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800">
                  <div className="text-xs font-medium text-neutral-400 uppercase mb-1">Author-Claimed Function</div>
                  <p className="text-neutral-200">{artifact.claimedFunction}</p>
                </div>
                <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800">
                  <div className="text-xs font-medium text-neutral-400 uppercase mb-1">Architecture & Bio-Inspiration</div>
                  <p className="text-neutral-300 font-mono text-xs mb-1">{artifact.architecture}</p>
                  <p className="text-neutral-400 text-xs italic">Inspiration: {artifact.bioInspiration}</p>
                </div>
              </div>

              {/* Operational Matter Fluxes */}
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Realized Operational Matter Flow (Per 100 Ticks)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 text-xs">
                    <div className="text-neutral-500 text-[11px]">Water Capture</div>
                    <div className="text-xs font-semibold text-neutral-200 mt-0.5">{artifact.operationalFlux.waterCapture.toFixed(2)} kg</div>
                  </div>
                  <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 text-xs">
                    <div className="text-neutral-500 text-[11px]">Contaminant Removal</div>
                    <div className="text-xs font-semibold text-neutral-200 mt-0.5">{artifact.operationalFlux.contaminantRemoval.toFixed(2)} kg</div>
                  </div>
                  <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 text-xs">
                    <div className="text-neutral-500 text-[11px]">Thermal Regulation</div>
                    <div className="text-xs font-semibold text-neutral-200 mt-0.5">{artifact.operationalFlux.thermalRegulation.toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 text-xs">
                    <div className="text-neutral-500 text-[11px]">Structural Continuity</div>
                    <div className="text-xs font-semibold text-neutral-200 mt-0.5">{artifact.operationalFlux.structuralSupport.toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 text-xs">
                    <div className="text-neutral-500 text-[11px]">Reserve Use</div>
                    <div className="text-xs font-semibold text-neutral-200 mt-0.5">{artifact.operationalFlux.reserveUse.toFixed(2)} kg</div>
                  </div>
                </div>
              </div>

              {/* Autonomous Bytecode Virtual Machine */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                    Autonomous Virtual Machine Controller ({artifact.program?.name ?? 'Passive Controller'})
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-500">16 Clamped Registers</span>
                </div>
                
                {artifact.program?.instructions && artifact.program.instructions.length > 0 ? (
                  <div className="p-3 rounded-sm bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-1 max-h-40 overflow-y-auto">
                    {artifact.program.instructions.map((inst, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-neutral-600 select-none w-6">{String(i).padStart(2, '0')}:</span>
                        <span className="text-neutral-200 font-semibold">{inst.op}</span>
                        <span className="text-neutral-400">R{inst.targetReg}</span>
                        {inst.sensorName && <span className="text-neutral-300">sensor[{inst.sensorName}]</span>}
                        {inst.actuatorName && <span className="text-neutral-300">actuate[{inst.actuatorName}]</span>}
                        {inst.constantVal !== undefined && <span className="text-neutral-400">#{inst.constantVal}</span>}
                        {inst.src1 !== undefined && !inst.sensorName && !inst.actuatorName && (
                          <span className="text-neutral-500">R{inst.src1}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 text-xs text-neutral-500 italic">
                    Passive straight-line controller. Executes baseline structural dissipation.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors border border-neutral-700"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
