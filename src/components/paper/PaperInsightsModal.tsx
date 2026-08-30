/**
 * Scientific Research Paper Insights & Interactive Simulation Guide
 * Translates the MIT LAMM SwarmWorld paper and simulation rules into clear, structured knowledge.
 */

import {
  Activity,
  BookOpen,
  Cpu,
  Download,
  ExternalLink,
  GitBranch,
  Globe,
  HelpCircle,
  Info,
  Layers,
  Network,
  Shield,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { sound } from '../../audio/SoundSynthesizer';
import { HISTORICAL_INVENTIONS } from '../../simulation/data/realmsData';

interface PaperModalProps {
  onClose: () => void;
}

export const PaperInsightsModal: React.FC<PaperModalProps> = ({ onClose }) => {
  const [activeMode, setActiveMode] = useState<'paper' | 'info'>('paper');
  const [activePaperSection, setActivePaperSection] = useState<'overview' | 'inventions' | 'findings' | 'methods'>('overview');
  const [activeInfoSection, setActiveInfoSection] = useState<'rules' | 'roles' | 'workbench' | 'metrics'>('rules');

  const handleDownloadPaperSummary = () => {
    sound.playSuccess();
    const researchDoc = {
      title: "SwarmWorld: Stigmergic Technological Evolution in Societies of Language-Model Agents",
      authors: ["Subhadeep Pal", "Fiona Y. Wang", "Markus J. Buehler"],
      institution: "Laboratory for Atomistic and Molecular Mechanics (LAMM), MIT",
      date: "August 2026",
      keyFindings: {
        boundedSwarmAdvantage: "Interaction chiefly supports accumulating diverse, persistent technological ecology rather than universally superior individual artifacts.",
        portfolioResilience: "Shared societies achieve +0.086 to +0.130 gains in multi-service coverage over isolated envelopes.",
        heldOutResilience: "Maintains durable protective functionality across 8 unseen disturbance schedules after agent removal.",
      },
      canonicalInventions: HISTORICAL_INVENTIONS,
    };

    const blob = new Blob([JSON.stringify(researchDoc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SwarmWorld-MIT-LAMM-Research-Compendium.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[90vh] flex flex-col rounded-md bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-900 shrink-0">
          {/* Title & Metadata */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-300">
              {activeMode === 'paper' ? <BookOpen className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <a
                  href="https://arxiv.org/abs/2608.26081"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold tracking-tight text-neutral-100 hover:text-amber-400 hover:underline flex items-center gap-1.5 transition-colors"
                  title="Read ArXiv Paper (arXiv:2608.26081)"
                >
                  {activeMode === 'paper' ? 'SwarmWorld: MIT LAMM Scientific Compendium' : 'SwarmWorld: Simulation Guide & Rules'}
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </a>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Subhadeep Pal, Fiona Y. Wang, Markus J. Buehler (MIT LAMM, August 2026)
              </p>
            </div>
          </div>

          {/* Center-Right Action Controls: [paper | info] icon toggle + MIT Lab Link + PDF Download + Close */}
          <div className="flex items-center gap-2">
            {/* Segmented Icon Toggle: [paper | info] */}
            <div className="flex items-center p-0.5 rounded-sm bg-neutral-950 border border-neutral-800">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveMode('paper');
                }}
                className={`p-1.5 rounded-sm transition-colors ${
                  activeMode === 'paper'
                    ? 'bg-neutral-800 text-neutral-100 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title="Scientific Research Paper Compendium"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveMode('info');
                }}
                className={`p-1.5 rounded-sm transition-colors ${
                  activeMode === 'info'
                    ? 'bg-neutral-800 text-neutral-100 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title="Game Rules & Mechanics Guide"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* External MIT LAMM Lab Link */}
            <a
              href="https://lamm.mit.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-sm bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Visit MIT LAMM Lab Website (lamm.mit.edu)"
            >
              <Globe className="w-4 h-4" />
            </a>

            {/* Direct ArXiv PDF Download */}
            <a
              href="https://arxiv.org/pdf/2608.26081"
              target="_blank"
              rel="noopener noreferrer"
              download
              onClick={() => sound.playSuccess()}
              className="p-1.5 rounded-sm bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors flex items-center justify-center"
              title="Download Full Paper PDF (arXiv:2608.26081)"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-sm hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors border border-transparent hover:border-neutral-700 ml-1"
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs (Dynamically switches based on paper vs info mode) */}
        <div className="flex items-center gap-1.5 px-5 pt-2 border-b border-neutral-800 text-xs font-semibold overflow-x-auto shrink-0 bg-neutral-900/50">
          {activeMode === 'paper' ? (
            <>
              {[
                { id: 'overview', label: '1. Executive Abstract & Lineages' },
                { id: 'findings', label: '2. Bounded Swarm Advantage' },
                { id: 'inventions', label: '3. Canonical Inventions Portfolio' },
                { id: 'methods', label: '4. Simulation Architecture & Protocol' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActivePaperSection(tab.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-t-sm transition-colors border-b-2 whitespace-nowrap text-xs ${
                    activePaperSection === tab.id
                      ? 'text-neutral-100 border-neutral-400 bg-neutral-800/40'
                      : 'text-neutral-400 border-transparent hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          ) : (
            <>
              {[
                { id: 'rules', label: '1. Simulation Rules & Mechanics' },
                { id: 'roles', label: '2. Agent Roles & Phenotypes' },
                { id: 'workbench', label: '3. Material Workbench Guide' },
                { id: 'metrics', label: '4. Held-Out Benchmarks & Metrics' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveInfoSection(tab.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-t-sm transition-colors border-b-2 whitespace-nowrap text-xs ${
                    activeInfoSection === tab.id
                      ? 'text-neutral-100 border-neutral-400 bg-neutral-800/40'
                      : 'text-neutral-400 border-transparent hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-neutral-300">
          {/* PAPER MODE VIEWS */}
          {activeMode === 'paper' && (
            <>
              {activePaperSection === 'overview' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Abstract Summary</span>
                    <p className="text-neutral-300 text-xs leading-relaxed">
                      Collective intelligence can emerge when individuals coordinate through a shared environment, allowing local actions to accumulate into durable social organization. Initially homogeneous language-model agents in SwarmWorld self-organize without assigned roles or recipes into evolving technological societies. SwarmWorld splits cognition from consequence: agents propose architectures and executable controllers, while the simulated world alone determines physical function.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-200">
                        <Layers className="w-3.5 h-3.5 text-neutral-400" />
                        Physical Stigmergy
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Indirect coordination where agents alter physical terrain, deposit resources, and construct persistent artifacts. Later agents encounter these modifications, turning the environment into an external transmission substrate.
                      </p>
                    </div>

                    <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-200">
                        <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
                        Executable Code Inheritance
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Agents author straight-line bytecode controllers executed deterministically every world tick. Descendants fork, edit, and propagate these controllers across generations, accumulating code lineages up to 12 fork generations deep.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePaperSection === 'findings' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Key Empirical Finding</span>
                    <h3 className="text-sm font-bold text-neutral-100 mb-1.5">The Bounded Swarm Advantage</h3>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      The primary contribution of SwarmWorld is demonstrating that interaction chiefly supports the accumulation of a diverse, persistent technological ecology, not universally superior individual inventions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-400 font-bold uppercase text-[11px] tracking-wider">Portfolio Resilience</span>
                      <div className="text-sm font-bold text-neutral-100 mt-1">Shared Worlds Win</div>
                      <p className="text-neutral-400 mt-1.5 text-[11px] leading-relaxed">
                        Societies achieve +0.086 to +0.130 gains in multi-service coverage over the best-of-N isolated search envelope.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-400 font-bold uppercase text-[11px] tracking-wider">Held-Out Resilience</span>
                      <div className="text-sm font-bold text-neutral-100 mt-1">Superior Durability</div>
                      <p className="text-neutral-400 mt-1.5 text-[11px] leading-relaxed">
                        Persistent technologies maintain protection under 8 unseen disturbance schedules after all agents are removed.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-400 font-bold uppercase text-[11px] tracking-wider">Single-Peak Optimization</span>
                      <div className="text-sm font-bold text-neutral-100 mt-1">Isolated Envelope Competes</div>
                      <p className="text-neutral-400 mt-1.5 text-[11px] leading-relaxed">
                        Independent search remains competitive for discovering the single highest individual peak artifact.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePaperSection === 'inventions' && (
                <div className="space-y-3.5">
                  <p className="text-xs text-neutral-400">
                    16 canonical agent-invented technologies extracted from the experimental runs across BioFoundry, AshenRealm, and Protein Realms:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {HISTORICAL_INVENTIONS.map((art) => (
                      <div key={art.id} className="p-3 rounded-sm bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-neutral-200">{art.name}</h4>
                          <span className="text-neutral-300 font-mono font-bold text-[11px]">{art.lifetimePeakPerformance?.toFixed(3)}</span>
                        </div>
                        <p className="text-neutral-400 text-[11px] line-clamp-2 leading-relaxed">{art.claimedFunction}</p>
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-1">
                          <span className="capitalize">{art.realm}</span>
                          <span>{art.distinctParticipants} Contributors</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePaperSection === 'methods' && (
                <div className="space-y-3.5 text-xs">
                  <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <h4 className="font-semibold text-neutral-200 text-xs">Algorithm 1: Proposal-Consequence Separation</h4>
                    <p className="text-neutral-400 leading-relaxed text-xs">
                      Agents receive local spatial observations and private retrieved memory at staggered macroturns (interval m=50). They emit schema-constrained JSON plans. A transactional resolver checks preconditions, and a deterministic world tick advances movement, fields, and virtual machine controllers without requiring an LLM call on every tick.
                    </p>
                  </div>

                  <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <h4 className="font-semibold text-neutral-200 text-xs">Validation Gate Criteria</h4>
                    <ul className="list-disc list-inside space-y-1 text-neutral-400 text-xs">
                      <li>Tested recipe passing mechanical/biological utility and quality thresholds.</li>
                      <li>Complete structural specification (name, claimed function, architecture, bio-inspiration).</li>
                      <li>Agent-authored straight-line bytecode controller installed on the artifact.</li>
                      <li>Measured lifetime peak simulator performance above threshold.</li>
                      <li>Demonstrated behavioral and material novelty.</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {/* INFO & GAME GUIDE MODE VIEWS */}
          {activeMode === 'info' && (
            <>
              {activeInfoSection === 'rules' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-neutral-400" />
                      How SwarmWorld Operates
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      SwarmWorld is a multi-agent simulation sandbox modeling the cultural transmission and open-ended technological evolution of language model agents in hostile environments.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <h4 className="font-semibold text-neutral-200 text-xs">1. Macroturn Cycle (m=50 Ticks)</h4>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        Agents observe local environmental gradients (moisture, temperature, toxins) and scan for nearby artifacts. They formulate actions: gathering feedstocks, depositing terrain, building machines, or forking code.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <h4 className="font-semibold text-neutral-200 text-xs">2. Deterministic World Ticks</h4>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        The world simulator runs physical diffusion, field decay, agent energy metabolism, and executes artifact straight-line bytecode controllers deterministically at each tick.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <h4 className="font-semibold text-neutral-200 text-xs">3. The 4 Experimental Conditions</h4>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        Switch between <strong>Full Culture</strong> (terrain stigmergy + code forking), <strong>No Communication</strong> (code inheritance only), <strong>No Explicit Culture</strong> (physical terrain modifications only), and <strong>Independent Search</strong> (isolated runs).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <h4 className="font-semibold text-neutral-200 text-xs">4. Stress Disturbance Pulses</h4>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        Hit the "Stress Pulse" button to simulate hostile shocks (toxin floods, heatwaves, structural shear). Observe how agent artifacts shield the ecosystem and maintain portfolio resilience.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeInfoSection === 'roles' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                      Emergent Agent Phenotypes & Sub-Roles
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Without predefined specialized prompts, agents spontaneously specialize into distinct behavioral phenotypes based on their local surroundings:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#4a7c59]"></span>
                        <h4 className="font-semibold text-neutral-200 text-xs">C1: Artifact-Centered Maintainers</h4>
                      </div>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        Cluster around constructed artifacts, depositing feedstocks, refining straight-line bytecode routines, and repairing structural degradation.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#5c7c99]"></span>
                        <h4 className="font-semibold text-neutral-200 text-xs">C2: Mobile Explorers & Foragers</h4>
                      </div>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        Navigate frontier terrain, mapping resource hot spots, harvesting exotic feedstocks, and transmitting spatial coordinates via terrain stigmergy.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#bfa15f]"></span>
                        <h4 className="font-semibold text-neutral-200 text-xs">Bio-Architects & Synthesizers</h4>
                      </div>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        Formulate new material recipes in the workbench, test against mechanical stress limits, and deploy permanent functional machines into the world.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-neutral-500"></span>
                        <h4 className="font-semibold text-neutral-200 text-xs">Code Forkers & Refiners</h4>
                      </div>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        Inspect ancestor controller programs in the Knowledge Lineage tree, introducing algorithmic mutations and optimization loops.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeInfoSection === 'workbench' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                      Material Workbench & Fabrication System
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Use the Material Workbench view to formulate novel synthetic artifacts alongside your swarm of autonomous agents:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="font-semibold text-neutral-200 block">1. Feedstock Selection</span>
                      <p className="text-neutral-400 leading-relaxed">
                        Select 2 to 4 raw materials (e.g. Mycelium Matrix, Chitin Polyfiber, Silk Protein) matching the target realm physics.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="font-semibold text-neutral-200 block">2. Bytecode Controller</span>
                      <p className="text-neutral-400 leading-relaxed">
                        Author or fork straight-line VM instructions (e.g. `PULSE_DIFFUSE`, `SAMPLE_GRADIENT`, `FILTER_TOXIN`) to run on each world tick.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="font-semibold text-neutral-200 block">3. Validation Gate</span>
                      <p className="text-neutral-400 leading-relaxed">
                        Run simulated stress tests. Passing recipes deploy directly onto the active ecosystem grid to protect your agents!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeInfoSection === 'metrics' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-neutral-400" />
                      Understanding Simulation Metrics
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Key quantitative metrics tracked across generations in SwarmWorld:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="font-semibold text-neutral-200 block">Portfolio Resilience (0.0 to 1.0)</span>
                      <p className="text-neutral-400 leading-relaxed">
                        Measures the multi-service protective coverage of all co-existing artifacts across diverse environmental hazard dimensions.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="font-semibold text-neutral-200 block">Held-Out Resilience</span>
                      <p className="text-neutral-400 leading-relaxed">
                        Tests whether technologies survive and maintain protection across 8 unseen disturbance schedules after removing all agents.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="font-semibold text-neutral-200 block">Discovery Frontier AUC</span>
                      <p className="text-neutral-400 leading-relaxed">
                        Area Under the Curve of cumulative validated inventions over simulation ticks, reflecting innovation velocity.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="font-semibold text-neutral-200 block">Lineage Depth & Fork Diversity</span>
                      <p className="text-neutral-400 leading-relaxed">
                        Tracks the accumulation of modified code controllers and branching phylogenetic trees up to 12 generations deep.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
