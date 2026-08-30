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
  const [activePaperSection, setActivePaperSection] = useState<'overview' | 'findings' | 'inventions' | 'methods'>('overview');
  const [activeInfoSection, setActiveInfoSection] = useState<'rules' | 'views' | 'roles' | 'workbench' | 'math'>('rules');

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
    <aside
      aria-label="Scientific Research Compendium & Simulation Guide"
      className="fixed top-0 right-0 h-full w-full sm:w-[500px] md:w-[560px] lg:w-[620px] z-50 flex flex-col bg-neutral-900/98 backdrop-blur-md border-l border-neutral-800 shadow-2xl shadow-black/80 animate-in slide-in-from-right duration-200 text-neutral-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-neutral-800 bg-neutral-900 shrink-0">
        {/* Title & Metadata */}
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="p-1.5 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-300 shrink-0">
            {activeMode === 'paper' ? <BookOpen className="w-4 h-4" /> : <Info className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <a
                href="https://arxiv.org/abs/2608.26081"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-bold tracking-tight text-neutral-100 hover:text-amber-400 hover:underline flex items-center gap-1 transition-colors truncate"
                title="Read ArXiv Paper (arXiv:2608.26081)"
              >
                <span className="truncate">
                  {activeMode === 'paper' ? 'MIT LAMM Research Paper' : 'Simulation Guide & Rules'}
                </span>
                <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
              </a>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono truncate">
              Pal, Wang, Buehler (MIT LAMM, Aug 2026)
            </p>
          </div>
        </div>

        {/* Center-Right Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Segmented Icon Toggle: [paper | info] */}
          <div className="flex items-center p-0.5 rounded-sm bg-neutral-950 border border-neutral-800">
            <button
              onClick={() => {
                sound.playClick();
                setActiveMode('paper');
              }}
              className={`p-1 rounded-sm text-xs flex items-center gap-1 transition-all ${
                activeMode === 'paper'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Scientific Research Paper Compendium"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Paper</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveMode('info');
              }}
              className={`p-1 rounded-sm text-xs flex items-center gap-1 transition-all ${
                activeMode === 'info'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Game Rules & Mechanics Guide"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Guide</span>
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
            <Globe className="w-3.5 h-3.5" />
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
            <Download className="w-3.5 h-3.5" />
          </a>

          {/* Close Button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-sm hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors border border-transparent hover:border-neutral-700 ml-0.5"
            title="Close Sidesheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 px-4 sm:px-5 pt-2 border-b border-neutral-800 text-xs font-semibold overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink-0 bg-neutral-900/50">
        {activeMode === 'paper' ? (
          <>
            {[
              { id: 'overview', label: '1. Executive Abstract' },
              { id: 'findings', label: '2. Bounded Advantage' },
              { id: 'inventions', label: '3. Inventions (5 of 16)' },
              { id: 'methods', label: '4. Protocols' },
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
              { id: 'rules', label: '1. Quickstart' },
              { id: 'views', label: '2. Six Views' },
              { id: 'roles', label: '3. Social Roles' },
              { id: 'workbench', label: '4. Fabrication & VM' },
              { id: 'math', label: '5. Engine Math' },
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

      {/* Scrollable Body Content with Hidden Scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs leading-relaxed text-neutral-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                    5 canonical agent-invented technologies represented here (of the 16 showcased in the published paper Figures 7, 22 and 24), spanning BioFoundry, AshenRealm, and Protein Realms:
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
                      SwarmWorld in 60 Seconds: Plain-English Quickstart
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      You are observing a living colony of autonomous AI agents dropped into a hostile biome. Without human recipes or top-down managers, they gather bio-feedstocks, invent physical machines, and program them with straight-line code. Over generations, these machines protect the colony from toxic floods, droughts, and heatwaves.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <h4 className="font-semibold text-neutral-200 text-xs">1. What is a "Tick"?</h4>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        A tick is one instant of physical simulation time. The engine diffuses chemical fields (moisture, toxins, heat), updates agent movement and energy metabolism, and runs every machine's internal 16-register program.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <h4 className="font-semibold text-neutral-200 text-xs">2. What is "Stigmergy"?</h4>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        Indirect coordination through the environment. Just like ants deposit pheromone trails to build nests, SwarmWorld agents build permanent physical machines and deposit terrain modifications that future generations encounter and build upon.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <h4 className="font-semibold text-neutral-200 text-xs">3. What is a "Machine / Artifact"?</h4>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        A permanent structure placed on the map. It has physical properties (toughness, permeability, self-healing) and runs a tiny 16-register computer program every tick to pump water, neutralize toxins, or emit heat barriers.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <h4 className="font-semibold text-neutral-200 text-xs">4. How Do I Run Experiments?</h4>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        Hit <strong>Play (▶)</strong> to start the clock. Switch the <strong>Field:</strong> heatmap on the map to see moisture or toxic plumes. Click <strong>Stress Pulse</strong> to shock the ecosystem and watch how the machines react!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeInfoSection === 'views' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-neutral-400" />
                      Tour of the 6 Navigation Views
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      SwarmWorld is structured into 6 focused screens accessible via the bottom navigation bar:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <h4 className="font-semibold text-neutral-200">1. 🌍 Ecosystem Map</h4>
                      <p className="text-neutral-400 leading-relaxed">
                        Interactive 2D spatial canvas. Watch agents move, harvest feedstocks, and inspect machines. Switch heatmaps between Moisture, Toxins, Heat, and Nutrients, or trigger environmental Stress Pulses.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <h4 className="font-semibold text-neutral-200">2. ⚙️ Material Workbench</h4>
                      <p className="text-neutral-400 leading-relaxed">
                        Open-ended biomaterials synthesis sandbox. Mix raw feedstocks, apply processing sequences (WASH, FERMENT, PRESS), program 16-register VM bytecode, and deploy new machines into the world.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <h4 className="font-semibold text-neutral-200">3. 🌳 Knowledge Lineage</h4>
                      <p className="text-neutral-400 leading-relaxed">
                        Bipartite Provenance DAG. Visualizes how observations lead to theories, and how ancestor machines are copied and forked into new generations of code.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <h4 className="font-semibold text-neutral-200">4. 📊 Analytics & Metrics</h4>
                      <p className="text-neutral-400 leading-relaxed">
                        Scientific research dashboards tracking Discovery Frontier AUC ($D_T$), Multi-Service Coverage ($Q(t)$), Portfolio Resilience ($P$), and Held-Out Disturbance Assays.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <h4 className="font-semibold text-neutral-200">5. 🎯 Research Missions</h4>
                      <p className="text-neutral-400 leading-relaxed">
                        Curated campaign challenges. Solve ecological crises, survive intense stress pulses, and unlock advanced biomaterial fabrication tiers.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <h4 className="font-semibold text-neutral-200">6. 🏆 High Scores & Sync</h4>
                      <p className="text-neutral-400 leading-relaxed">
                        Civilization longevity records, seed rankings, and one-click JSON state export/import to share your worlds with others.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeInfoSection === 'roles' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                      Emergent Agent Phenotypes & Social Roles
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
                      Material Workbench & Straight-Line Bytecode Guide
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Every machine is composed of physical materials (Hardware) and a 16-register VM program (Software):
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="font-semibold text-neutral-200 block">1. Feedstock Mass Balance</span>
                      <p className="text-neutral-400 leading-relaxed">
                        Mix feedstocks (e.g. Chitin, Fungus, Kelp, Minerals). Total mass normalizes to 1.0. High fungus yields self-healing; high chitin yields toughness.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="font-semibold text-neutral-200 block">2. Processing Sequence</span>
                      <p className="text-neutral-400 leading-relaxed">
                        Chain operations like WASH ➔ FERMENT ➔ PRESS. Certain sequences trigger synergy bonuses that boost structural quality up to +35%!
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="font-semibold text-neutral-200 block">3. 16-Register Program</span>
                      <p className="text-neutral-400 leading-relaxed">
                        Assemble instructions (e.g. `READ_SENSOR moisture`, `CMP_GT`, `ACTUATE remediate`). Registers R0–R15 are clipped to [-4, 4] every tick.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeInfoSection === 'math' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-neutral-400" />
                      Simulation Engine Mathematical Formulations
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Exact mathematical equations governing the physical simulation and societal metrics:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5 font-mono text-[11px]">
                      <span className="font-semibold text-neutral-200 block font-sans text-xs">Field Diffusion Equation</span>
                      <div className="p-2 rounded-sm bg-neutral-900 text-neutral-300">
                        ∂φ/∂t = D ∇²φ - λ(φ - φ_base) + S_flux
                      </div>
                      <p className="text-neutral-400 font-sans text-[11px] leading-relaxed">
                        Evaluated via 5-point discrete Laplacian stencil across all grid coordinates every world tick.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5 font-mono text-[11px]">
                      <span className="font-semibold text-neutral-200 block font-sans text-xs">Multi-Service Coverage Q(t)</span>
                      <div className="p-2 rounded-sm bg-neutral-900 text-neutral-300">
                        Q(t) = c̄(t) · [1 + min_k c_k(t) / c̄(t)] / 2
                      </div>
                      <p className="text-neutral-400 font-sans text-[11px] leading-relaxed">
                        Penalizes monocultures; rewards balanced societal protection across all 4 environmental hazards.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5 font-mono text-[11px]">
                      <span className="font-semibold text-neutral-200 block font-sans text-xs">Discovery Frontier AUC (D_T)</span>
                      <div className="p-2 rounded-sm bg-neutral-900 text-neutral-300">
                        D_T = (1/T) ∫₀ᵀ max_&#123;τ≤t&#125; p(τ) dτ
                      </div>
                      <p className="text-neutral-400 font-sans text-[11px] leading-relaxed">
                        Integrates the cumulative envelope of peak technological performance over civilization lifespan.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 space-y-1.5 font-mono text-[11px]">
                      <span className="font-semibold text-neutral-200 block font-sans text-xs">Register VM Constraint</span>
                      <div className="p-2 rounded-sm bg-neutral-900 text-neutral-300">
                        R_t = clamp(op(R_s1, R_s2), -4.0, 4.0)
                      </div>
                      <p className="text-neutral-400 font-sans text-[11px] leading-relaxed">
                        16 floating point registers clipped to [-4, 4] with max actuator effort of 0.05/tick.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    );
  };
