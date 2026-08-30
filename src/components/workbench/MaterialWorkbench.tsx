/**
 * Interactive Material & Controller Workbench
 * Allows players to formulate multi-feedstock recipes, order fabrication pathways,
 * program straight-line bytecode virtual machine controllers, and test/deploy persistent artifacts.
 */

import confetti from 'canvas-confetti';
import { ArrowRight, CheckCircle2, ChevronRight, Cpu, Dna, FlaskConical, Plus, Sparkles, Trash2, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { sound } from '../../audio/SoundSynthesizer';
import { REALM_CONFIGS } from '../../simulation/data/realmsData';
import { evaluateMaterialRecipe, validateInventionCriteria } from '../../simulation/engine/materialEvaluator';
import { createDefaultRegisters, generateProgramId } from '../../simulation/engine/virtualMachine';
import { SwarmEngine } from '../../simulation/engine/SwarmEngine';
import { Artifact, FabricationOperation, FeedstockType, MaterialProperties, MaterialRecipe, VMInstruction } from '../../types';

interface WorkbenchProps {
  engine: SwarmEngine;
  onArtifactDeployed: () => void;
}

export const MaterialWorkbench: React.FC<WorkbenchProps> = ({ engine, onArtifactDeployed }) => {
  const config = REALM_CONFIGS[engine.realm];

  // Feedstock selections
  const [selectedFeedstocks, setSelectedFeedstocks] = useState<{ type: FeedstockType; mass: number }[]>([
    { type: config.feedstocks[0].type, mass: 0.6 },
    { type: config.feedstocks[1]?.type || config.feedstocks[0].type, mass: 0.4 },
  ]);

  // Fabrication sequence
  const availableOps: FabricationOperation[] = engine.realm === 'biofoundry'
    ? ['WASH', 'GRIND', 'FERMENT', 'ALKALINE_TREAT', 'MINERALIZE', 'ALIGN', 'WEAVE', 'PRESS', 'COAT', 'DRY']
    : engine.realm === 'ashenrealm'
    ? ['WASH', 'CRUSH', 'ROAST', 'SMELT', 'REFINE', 'ALLOY', 'CAST', 'FORGE', 'QUENCH', 'ANNEAL']
    : ['EXPRESS', 'PURIFY', 'BLEND', 'CROSSLINK', 'CURE', 'ALIGN'];

  const [operations, setOperations] = useState<FabricationOperation[]>(
    engine.realm === 'biofoundry' ? ['WASH', 'GRIND', 'FERMENT', 'PRESS'] : ['WASH', 'SMELT', 'CAST', 'QUENCH']
  );

  // Metadata
  const [artifactName, setArtifactName] = useState<string>('Custom Adaptive Interface');
  const [claimedFunction, setClaimedFunction] = useState<string>('Porous environmental barrier buffering moisture and neutralizing hazardous contaminants.');
  const [architecture, setArchitecture] = useState<string>('Multilayer anisotropic cellular scaffold with sensor-actuator aperture control.');
  const [bioInspiration, setBioInspiration] = useState<string>('Arthropod cuticle and fungal hyphal network reinforcement.');

  // VM Controller instructions
  const [instructions, setInstructions] = useState<VMInstruction[]>([
    { op: 'READ_SENSOR', targetReg: 0, sensorName: 'moisture' },
    { op: 'READ_SENSOR', targetReg: 1, sensorName: 'contamination' },
    { op: 'CMP_GT', targetReg: 2, src1: 1, constantVal: 0.2 },
    { op: 'MUL', targetReg: 3, src1: 2, constantVal: 0.05 },
    { op: 'ACTUATE', targetReg: 3, actuatorName: 'remediate' },
  ]);

  // Evaluated test result
  const [testedProps, setTestedProps] = useState<MaterialProperties | null>(null);
  const [isDeploySuccess, setIsDeploySuccess] = useState<boolean>(false);

  const handleAddFeedstock = (type: FeedstockType) => {
    if (!selectedFeedstocks.find(f => f.type === type)) {
      setSelectedFeedstocks([...selectedFeedstocks, { type, mass: 0.3 }]);
      sound.playClick();
    }
  };

  const handleRemoveFeedstock = (type: FeedstockType) => {
    if (selectedFeedstocks.length > 1) {
      setSelectedFeedstocks(selectedFeedstocks.filter(f => f.type !== type));
      sound.playClick();
    }
  };

  const handleUpdateMass = (type: FeedstockType, mass: number) => {
    setSelectedFeedstocks(selectedFeedstocks.map(f => f.type === type ? { ...f, mass } : f));
  };

  const handleAddOperation = (op: FabricationOperation) => {
    setOperations([...operations, op]);
    sound.playClick();
  };

  const handleRemoveOperation = (index: number) => {
    setOperations(operations.filter((_, i) => i !== index));
    sound.playClick();
  };

  const handleRunTestAssay = () => {
    sound.playClick();
    const recipe: MaterialRecipe = {
      feedstocks: selectedFeedstocks,
      operations,
      targetArchitecture: architecture,
      bioInspiration,
    };
    const results = evaluateMaterialRecipe(recipe, engine.realm);
    setTestedProps(results);
    sound.playInventionChime(results.utility);
  };

  const handleDeployToWorld = () => {
    if (!testedProps) {
      handleRunTestAssay();
    }

    sound.playSuccess();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    const progId = generateProgramId(instructions);
    const prog = {
      id: progId,
      name: `${artifactName} Controller`,
      authors: ['Player Architect'],
      instructions,
      firstTick: engine.tick,
      installCount: 1,
    };

    const newArtifact: Artifact = {
      id: `art_player_${engine.tick}`,
      name: artifactName,
      realm: engine.realm,
      x: Math.floor(engine.width / 2) + Math.floor((Math.random() - 0.5) * 8),
      y: Math.floor(engine.height / 2) + Math.floor((Math.random() - 0.5) * 8),
      creatorId: 'player_architect',
      contributors: ['Player Architect'],
      builtTick: engine.tick,
      health: 1.0,
      materialBatch: {
        recipe: { feedstocks: selectedFeedstocks, operations },
        properties: testedProps || evaluateMaterialRecipe({ feedstocks: selectedFeedstocks, operations }, engine.realm),
      },
      claimedFunction,
      architecture,
      bioInspiration,
      program: prog,
      registers: createDefaultRegisters(),
      operationalFlux: {
        waterCapture: (testedProps?.permeability ?? 0.4) * 0.5,
        contaminantRemoval: (testedProps?.utility ?? 0.5) * 0.9,
        reserveUse: 0.08,
        nutrientRelease: 0.05,
        thermalRegulation: (testedProps?.thermalRegulation ?? 0.3),
        structuralSupport: (testedProps?.toughness ?? 0.5) * 0.8,
      },
      lifetimePeakPerformance: testedProps?.utility ?? 0.5,
      currentPerformance: testedProps?.utility ?? 0.5,
      serviceLevels: {
        moistureBuffering: testedProps?.permeability ?? 0.6,
        contaminationRemediation: testedProps?.utility ?? 0.6,
        structuralContinuity: testedProps?.toughness ?? 0.7,
        thermalShielding: testedProps?.thermalRegulation ?? 0.4,
        adaptiveHealing: testedProps?.healing ?? 0.5,
      },
      causalParentArtifactIds: [],
      causalEvidenceIds: ['ev_player_assay'],
      distinctParticipants: 1,
    };

    engine.artifacts.push(newArtifact);
    engine.provenanceGraph.nodes.push({
      id: newArtifact.id,
      label: newArtifact.name,
      type: 'artifact',
      tick: engine.tick,
      performance: newArtifact.lifetimePeakPerformance,
      authors: ['Player Architect'],
      details: newArtifact.claimedFunction,
    });

    setIsDeploySuccess(true);
    setTimeout(() => setIsDeploySuccess(false), 3000);
    onArtifactDeployed();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Left Column: Feedstocks & Processing (7 cols) */}
      <div className="lg:col-span-7 space-y-5">
        {/* Section 1: Feedstocks Selection */}
        <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Dna className="w-3.5 h-3.5 text-neutral-400" />
              1. Feedstock Formulation ({engine.realm.toUpperCase()})
            </h2>
            <span className="text-[11px] text-neutral-500 font-mono">Conserved Mass Ledger</span>
          </div>

          {/* Active Feedstock Sliders */}
          <div className="space-y-2.5 mb-3.5">
            {selectedFeedstocks.map((item) => {
              const meta = config.feedstocks.find(f => f.type === item.type);
              return (
                <div key={item.type} className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: meta?.color || '#fff' }}></span>
                  <div className="w-32 flex-shrink-0">
                    <div className="text-xs font-medium text-neutral-200">{meta?.label || item.type}</div>
                    <div className="text-[11px] text-neutral-500 font-mono">{item.mass.toFixed(2)} kg</div>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={item.mass}
                    onChange={(e) => handleUpdateMass(item.type, parseFloat(e.target.value))}
                    className="flex-1 accent-neutral-300 cursor-pointer h-1.5 bg-neutral-800 rounded-sm"
                  />
                  <button
                    onClick={() => handleRemoveFeedstock(item.type)}
                    className="p-1 rounded-sm text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Available Feedstocks */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-800">
            <span className="text-xs text-neutral-400 mr-2 font-medium">Add Feedstock:</span>
            {config.feedstocks.map((feed) => (
              <button
                key={feed.type}
                onClick={() => handleAddFeedstock(feed.type)}
                className="px-2.5 py-1 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-all flex items-center gap-1 border border-neutral-700"
              >
                <Plus className="w-3 h-3" />
                {feed.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Fabrication Pathway Sequence */}
        <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-neutral-400" />
              2. Ordered Fabrication Sequence
            </h2>
            <span className="text-[11px] text-neutral-500 font-mono">{operations.length} Stages</span>
          </div>

          {/* Ordered Operations Flow */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 min-h-[48px] mb-3">
            {operations.map((op, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-neutral-800 border border-neutral-700 text-xs font-medium text-neutral-100 shadow-sm">
                  <span className="w-4 h-4 rounded-sm bg-neutral-700 text-[10px] flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span>{op}</span>
                  <button
                    onClick={() => handleRemoveOperation(idx)}
                    className="ml-1 text-neutral-400 hover:text-rose-400 text-xs"
                  >
                    ×
                  </button>
                </div>
                {idx < operations.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-neutral-600 flex-shrink-0" />
                )}
              </div>
            ))}
            {operations.length === 0 && (
              <span className="text-xs text-neutral-500 italic">Select operations below to build the processing route.</span>
            )}
          </div>

          {/* Available Operations */}
          <div className="flex flex-wrap gap-1.5">
            {availableOps.map((op) => (
              <button
                key={op}
                onClick={() => handleAddOperation(op)}
                className="px-2 py-0.5 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 transition-colors border border-neutral-700"
              >
                + {op}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Architecture & Biological Inspiration */}
        <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            3. Functional Specification & Architecture
          </h2>
          <div>
            <label className="text-xs text-neutral-400 font-medium block mb-1">Artifact Designation</label>
            <input
              type="text"
              value={artifactName}
              onChange={(e) => setArtifactName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-sm bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs focus:border-neutral-600 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 font-medium block mb-1">Claimed Function</label>
              <textarea
                value={claimedFunction}
                onChange={(e) => setClaimedFunction(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 rounded-sm bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-neutral-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 font-medium block mb-1">Biological Inspiration</label>
              <textarea
                value={bioInspiration}
                onChange={(e) => setBioInspiration(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 rounded-sm bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-neutral-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Controller VM & Testing Assay (5 cols) */}
      <div className="lg:col-span-5 space-y-5">
        {/* Section 4: Autonomous Controller VM */}
        <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-neutral-400" />
              4. Straight-Line Virtual Machine
            </h2>
            <span className="text-[11px] text-neutral-500 font-mono">16 Registers [−4, 4]</span>
          </div>

          {/* Bytecode list */}
          <div className="p-3 rounded-sm bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-1.5 max-h-48 overflow-y-auto mb-3">
            {instructions.map((inst, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-600">{String(i).padStart(2, '0')}:</span>
                  <span className="text-neutral-200 font-semibold">{inst.op}</span>
                  <span className="text-neutral-400">R{inst.targetReg}</span>
                  {inst.sensorName && <span className="text-neutral-300">[{inst.sensorName}]</span>}
                  {inst.actuatorName && <span className="text-neutral-300">&gt;&gt; {inst.actuatorName}</span>}
                  {inst.constantVal !== undefined && <span className="text-neutral-400">#{inst.constantVal}</span>}
                </div>
                <button
                  onClick={() => setInstructions(instructions.filter((_, idx) => idx !== i))}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Quick Add Instructions */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setInstructions([...instructions, { op: 'READ_SENSOR', targetReg: 4, sensorName: 'health' }]);
                sound.playClick();
              }}
              className="px-2.5 py-1 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 border border-neutral-700"
            >
              + SENSE health
            </button>
            <button
              onClick={() => {
                setInstructions([...instructions, { op: 'ACTUATE', targetReg: 4, actuatorName: 'heal' }]);
                sound.playClick();
              }}
              className="px-2.5 py-1 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 border border-neutral-700"
            >
              + ACTUATE heal
            </button>
            <button
              onClick={() => {
                setInstructions([...instructions, { op: 'ACTUATE', targetReg: 0, actuatorName: 'collect_water' }]);
                sound.playClick();
              }}
              className="px-2.5 py-1 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 border border-neutral-700"
            >
              + ACTUATE water
            </button>
          </div>
        </div>

        {/* Section 5: Mechanical & Biochemical Testing Assay */}
        <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-neutral-400" />
              5. Standard Mechanical Assay
            </h2>
            <button
              id="btn-run-assay"
              onClick={handleRunTestAssay}
              className="px-3 py-1.5 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-medium transition-colors border border-neutral-700 shadow-sm"
            >
              Run Test Assay
            </button>
          </div>

          {testedProps ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800">
                  <div className="text-neutral-500 text-[11px]">Overall Utility</div>
                  <div className="text-sm font-bold text-neutral-100">{testedProps.utility.toFixed(4)}</div>
                </div>
                <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800">
                  <div className="text-neutral-500 text-[11px]">Quality Score</div>
                  <div className="text-sm font-bold text-neutral-100">{testedProps.quality.toFixed(4)}</div>
                </div>
                <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800">
                  <div className="text-neutral-500 text-[11px]">Toughness</div>
                  <div className="text-xs font-semibold text-neutral-200">{testedProps.toughness.toFixed(4)}</div>
                </div>
                <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800">
                  <div className="text-neutral-500 text-[11px]">Permeability</div>
                  <div className="text-xs font-semibold text-neutral-200">{testedProps.permeability.toFixed(4)}</div>
                </div>
                <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800">
                  <div className="text-neutral-500 text-[11px]">Healing Potential</div>
                  <div className="text-xs font-semibold text-neutral-200">{testedProps.healing.toFixed(4)}</div>
                </div>
                <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800">
                  <div className="text-neutral-500 text-[11px]">Thermal Shielding</div>
                  <div className="text-xs font-semibold text-neutral-200">{(testedProps.thermalRegulation ?? 0.3).toFixed(4)}</div>
                </div>
              </div>

              {/* Validation Gate Feedback */}
              <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400" />
                <span>Cleared scientific validation gate. Meets all criteria for persistent deployment.</span>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-sm bg-neutral-950 border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
              Click &quot;Run Test Assay&quot; to evaluate mechanical properties under deterministic simulator physics.
            </div>
          )}

          {/* Persistent Deploy Action Button */}
          <button
            id="btn-deploy-artifact"
            onClick={handleDeployToWorld}
            className={`w-full py-2.5 rounded-sm font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
              isDeploySuccess
                ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-950'
            }`}
          >
            {isDeploySuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Successfully Installed in World!
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Deploy Persistent Artifact into World
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
