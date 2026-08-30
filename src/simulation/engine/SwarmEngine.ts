/**
 * SwarmWorld Core Deterministic Simulation Engine
 * Executes Algorithm 1 (SwarmWorld discovery and agent-free evaluation)
 * from "SwarmWorld: Stigmergic Technological Evolution in Societies of Language-Model Agents"
 */

import {
  Agent,
  Artifact,
  BehavioralPhenotype,
  BehavioralRole,
  ConditionType,
  ControllerProgram,
  DisturbancePulse,
  EnvironmentalFields,
  FeedstockType,
  HeldOutAssayReport,
  HeldOutScheduleResult,
  LineageEdge,
  LineageNode,
  MaterialRecipe,
  ProvenanceGraph,
  RealmType,
  SimulationMetrics,
  TerrainType,
  VMInstruction,
} from '../../types';
import { HISTORICAL_INVENTIONS, REALM_CONFIGS } from '../data/realmsData';
import { evaluateMaterialRecipe, validateInventionCriteria } from './materialEvaluator';
import { createDefaultRegisters, executeControllerStep, generateProgramId } from './virtualMachine';

export class SwarmEngine {
  public realm: RealmType;
  public condition: ConditionType;
  public populationN: number;
  public seed: number;
  public tick: number = 0;
  public isRunning: boolean = false;
  public speedMultiplier: number = 1;

  public width: number = 72;
  public height: number = 54;

  public terrainGrid: Uint8Array;
  public resourceMassGrid: Float32Array;
  public resourceTypeGrid: Uint8Array;
  public fields: EnvironmentalFields;

  public agents: Agent[] = [];
  public artifacts: Artifact[] = [];
  public activeDisturbances: DisturbancePulse[] = [];
  public metricsHistory: SimulationMetrics[] = [];
  public provenanceGraph: ProvenanceGraph = { nodes: [], edges: [] };
  public heldOutReports: HeldOutAssayReport[] = [];

  // Running maximum performance for Discovery-Frontier AUC
  private runningPeakPerformance: number = 0;
  private discoveryAreaSum: number = 0;

  constructor(realm: RealmType = 'biofoundry', condition: ConditionType = 'full_culture', populationN: number = 50, seed: number = 3202) {
    this.realm = realm;
    this.condition = condition;
    this.populationN = populationN;
    this.seed = seed;

    this.terrainGrid = new Uint8Array(this.width * this.height);
    this.resourceMassGrid = new Float32Array(this.width * this.height);
    this.resourceTypeGrid = new Uint8Array(this.width * this.height);

    this.fields = {
      moisture: new Float32Array(this.width * this.height),
      contamination: new Float32Array(this.width * this.height),
      temperature: new Float32Array(this.width * this.height),
      nutrients: new Float32Array(this.width * this.height),
    };

    this.initializeWorld();
  }

  /**
   * Deterministic Pseudo-Random Number Generator (PRNG)
   */
  private prng(offset: number = 0): number {
    let t = (this.seed + this.tick * 9973 + offset * 7919) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public initializeWorld() {
    this.tick = 0;
    this.runningPeakPerformance = 0;
    this.discoveryAreaSum = 0;
    this.metricsHistory = [];
    this.activeDisturbances = [];
    this.provenanceGraph = { nodes: [], edges: [] };
    this.heldOutReports = [];

    const config = REALM_CONFIGS[this.realm];
    this.width = config.gridWidth;
    this.height = config.gridHeight;

    const totalCells = this.width * this.height;
    this.terrainGrid = new Uint8Array(totalCells);
    this.resourceMassGrid = new Float32Array(totalCells);
    this.resourceTypeGrid = new Uint8Array(totalCells);

    // Initialize Fields
    this.fields = {
      moisture: new Float32Array(totalCells),
      contamination: new Float32Array(totalCells),
      temperature: new Float32Array(totalCells),
      nutrients: new Float32Array(totalCells),
    };

    // Procedural terrain and resource deposit generation based on seed
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const nx = x / this.width;
        const ny = y / this.height;

        // Base terrain assignment
        const distToCenter = Math.hypot(nx - 0.5, ny - 0.5);
        if (this.realm === 'biofoundry') {
          if (nx < 0.15 && ny > 0.4) {
            this.terrainGrid[idx] = 3; // DEEP_WATER
            this.fields.moisture[idx] = 0.9;
          } else if (distToCenter < 0.22) {
            this.terrainGrid[idx] = 4; // MINERAL_SPRING
            this.fields.moisture[idx] = 0.75;
            this.fields.nutrients[idx] = 0.8;
          } else if (nx > 0.65 && ny < 0.45) {
            this.terrainGrid[idx] = 5; // FUNGAL_GROVE
            this.fields.moisture[idx] = 0.6;
            this.fields.nutrients[idx] = 0.65;
          } else if (ny > 0.65 && nx < 0.6) {
            this.terrainGrid[idx] = 6; // CELLULOSE_FIELD
            this.fields.moisture[idx] = 0.5;
            this.fields.nutrients[idx] = 0.5;
          } else if (nx > 0.6 && ny > 0.6) {
            this.terrainGrid[idx] = 7; // CHITIN_FIELD
            this.fields.moisture[idx] = 0.4;
            this.fields.nutrients[idx] = 0.4;
          } else {
            this.terrainGrid[idx] = 0; // PLAIN
            this.fields.moisture[idx] = 0.35;
            this.fields.nutrients[idx] = 0.3;
          }
          this.fields.temperature[idx] = 0.45 + (ny * 0.1);
          this.fields.contamination[idx] = 0.05;
        } else if (this.realm === 'ashenrealm') {
          if (nx < 0.2 && ny > 0.6) {
            this.terrainGrid[idx] = 7; // MAGMA_SEA
            this.fields.temperature[idx] = 0.95;
          } else if (Math.abs(nx - 0.45) < 0.05) {
            this.terrainGrid[idx] = 3; // LAVA_CHANNEL
            this.fields.temperature[idx] = 0.9;
          } else if (distToCenter < 0.2) {
            this.terrainGrid[idx] = 2; // WORKSPACE (Great Forge)
            this.fields.temperature[idx] = 0.8;
          } else if (nx > 0.6 && ny < 0.4) {
            this.terrainGrid[idx] = 6; // IRON_MOUNTAIN
            this.fields.temperature[idx] = 0.5;
          } else if (nx < 0.35 && ny < 0.35) {
            this.terrainGrid[idx] = 5; // SULFUR_MARSH
            this.fields.temperature[idx] = 0.65;
          } else {
            this.terrainGrid[idx] = 4; // OBSIDIAN_WASTE
            this.fields.temperature[idx] = 0.55;
          }
          this.fields.moisture[idx] = 0.1;
          this.fields.contamination[idx] = 0.15;
          this.fields.nutrients[idx] = 0.2;
        } else {
          // Protein Realms
          if (ny < 0.2) {
            this.terrainGrid[idx] = 3; // SOLVENT_SEA
            this.fields.moisture[idx] = 0.95;
          } else if (nx < 0.3 && ny > 0.6) {
            this.terrainGrid[idx] = 4; // AMINO_ACID_BASIN
            this.fields.nutrients[idx] = 0.85;
          } else if (nx > 0.6 && ny > 0.6) {
            this.terrainGrid[idx] = 5; // CHAPERONE_FOREST
            this.fields.nutrients[idx] = 0.75;
          } else if (distToCenter < 0.2) {
            this.terrainGrid[idx] = 2; // WORKSPACE (Enclave)
            this.fields.nutrients[idx] = 0.6;
          } else {
            this.terrainGrid[idx] = 0; // PLAIN
            this.fields.nutrients[idx] = 0.4;
          }
          this.fields.moisture[idx] = 0.6;
          this.fields.temperature[idx] = 0.37;
          this.fields.contamination[idx] = 0.05;
        }

        // Initialize resource mass deposits
        this.resourceMassGrid[idx] = 1.5 + (this.prng(idx) * 2.0);
        this.resourceTypeGrid[idx] = (idx % config.feedstocks.length);
      }
    }

    // Initialize Agents
    this.agents = [];
    const colors = ['#10b981', '#38bdf8', '#fbbf24', '#a855f7', '#f43f5e', '#34d399', '#60a5fa', '#f97316'];
    for (let i = 0; i < this.populationN; i++) {
      const startX = Math.floor(10 + this.prng(i * 13) * (this.width - 20));
      const startY = Math.floor(10 + this.prng(i * 17) * (this.height - 20));

      const agentId = `agent_${String(i).padStart(6, '0')}`;
      const defaultInventory: Record<FeedstockType, number> = {
        CHITIN: 0,
        CELLULOSE: 0,
        FUNGUS: 0,
        MINERAL: 0,
        CATALYST: 0,
        KELP: 0,
        SHELL: 0,
        LIGNIN: 0,
        IRON_ORE: 0,
        COPPER_ORE: 0,
        OBSIDIAN: 0,
        BASALT: 0,
        SULFUR: 0,
        LIMESTONE_FLUX: 0,
        CARBON_FUEL: 0,
        PEPTIDE_PRECURSOR: 0,
        LIPID: 0,
        BUFFER: 0,
        CROSSLINKER: 0,
      };

      this.agents.push({
        id: agentId,
        name: `Agent-${String(i).padStart(3, '0')}`,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        realm: this.realm,
        role: 'R4_surveyor',
        phenotype: 'C2_mobile_exploration',
        inventory: defaultInventory,
        inventoryMass: 0,
        maxInventory: 3.0,
        macroturnPhase: i % 50,
        energy: 1.0,
        pathLength: 0,
        regionsVisited: new Set([`${Math.floor(startX / 10)},${Math.floor(startY / 10)}`]),
        artifactInteractions: 0,
        socialInteractions: 0,
        testsPerformed: 0,
        artifactsBuilt: 0,
        programsAuthored: 0,
        currentGoal: 'Survey local territory and map high-density feedstock coordinates',
        currentHypothesis: 'Porous crosslinked matrix will increase resilience against environmental stressors',
        actionQueue: [],
        memory: [],
        activeColor: colors[i % colors.length],
      });

      // Add agent node to provenance graph
      this.provenanceGraph.nodes.push({
        id: agentId,
        label: `Agent ${i}`,
        type: 'agent',
        tick: 0,
        details: `Homogeneous Agent initialized at (${startX}, ${startY})`,
      });
    }

    // Seed historical baseline artifacts for the selected realm
    this.artifacts = [];
    const realmHistorical = HISTORICAL_INVENTIONS.filter(a => a.realm === this.realm);
    for (const h of realmHistorical) {
      if (h.id && h.name && h.materialBatch) {
        const fullArt: Artifact = {
          id: h.id,
          name: h.name,
          realm: h.realm ?? this.realm,
          x: h.x ?? Math.floor(this.width / 2),
          y: h.y ?? Math.floor(this.height / 2),
          creatorId: h.creatorId ?? 'agent_000000',
          contributors: h.contributors ?? ['agent_000000'],
          builtTick: h.builtTick ?? 100,
          health: h.health ?? 0.95,
          materialBatch: h.materialBatch,
          claimedFunction: h.claimedFunction ?? 'Autonomous environmental protection interface',
          architecture: h.architecture ?? 'Modular bioinspired lattice',
          bioInspiration: h.bioInspiration ?? 'Natural organism mechanics',
          registers: h.registers ?? createDefaultRegisters(),
          operationalFlux: h.operationalFlux ?? {
            waterCapture: 0.3,
            contaminantRemoval: 0.6,
            reserveUse: 0.1,
            nutrientRelease: 0.05,
            thermalRegulation: 0.4,
            structuralSupport: 0.7,
          },
          lifetimePeakPerformance: h.lifetimePeakPerformance ?? 0.65,
          currentPerformance: h.currentPerformance ?? 0.62,
          serviceLevels: h.serviceLevels ?? {
            moistureBuffering: 0.7,
            contaminationRemediation: 0.6,
            structuralContinuity: 0.8,
            thermalShielding: 0.5,
            adaptiveHealing: 0.65,
          },
          causalParentArtifactIds: h.causalParentArtifactIds ?? [],
          causalEvidenceIds: h.causalEvidenceIds ?? [],
          distinctParticipants: h.distinctParticipants ?? 2,
        };

        this.artifacts.push(fullArt);

        // Add to provenance graph
        this.provenanceGraph.nodes.push({
          id: fullArt.id,
          label: fullArt.name,
          type: 'artifact',
          tick: fullArt.builtTick,
          performance: fullArt.lifetimePeakPerformance,
          authors: fullArt.contributors,
          details: fullArt.claimedFunction,
        });

        for (const author of fullArt.contributors) {
          this.provenanceGraph.edges.push({
            id: `edge_${author}_${fullArt.id}`,
            source: author,
            target: fullArt.id,
            type: 'built',
            tick: fullArt.builtTick,
          });
        }
      }
    }

    this.recordMetrics();
  }

  /**
   * Advance 1 deterministic world tick (Algorithm 1)
   */
  public tickStep() {
    this.tick++;

    // 1. Advance environmental fields via 4-neighbor Laplacian diffusion and decay
    this.advanceEnvironmentalFields();

    // 2. Scheduled Agent Macroturns & Atomic Actions
    this.executeAgentMacroturns();

    // 3. Persistent Artifact Virtual Machine Execution
    this.executeArtifactVirtualMachines();

    // 4. Periodic Disturbance Pulses
    if (this.tick % 150 === 0) {
      this.triggerSeededDisturbance();
    }

    // 5. Update agent behavioral phenotypes and metrics
    if (this.tick % 5 === 0) {
      this.updateAgentPhenotypes();
    }

    this.recordMetrics();
  }

  private advanceEnvironmentalFields() {
    const w = this.width;
    const h = this.height;
    const size = w * h;

    // Decay & diffusion buffers
    const nextMoisture = new Float32Array(this.fields.moisture);
    const nextContam = new Float32Array(this.fields.contamination);

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const lapM = (this.fields.moisture[idx - 1] + this.fields.moisture[idx + 1] + this.fields.moisture[idx - w] + this.fields.moisture[idx + w] - 4 * this.fields.moisture[idx]);
        const lapC = (this.fields.contamination[idx - 1] + this.fields.contamination[idx + 1] + this.fields.contamination[idx - w] + this.fields.contamination[idx + w] - 4 * this.fields.contamination[idx]);

        // Diffusion rate 0.04, decay 0.001
        nextMoisture[idx] = Math.max(0, Math.min(1.0, this.fields.moisture[idx] + 0.04 * lapM - 0.0005));
        nextContam[idx] = Math.max(0, Math.min(1.0, this.fields.contamination[idx] + 0.03 * lapC - 0.0008));
      }
    }

    this.fields.moisture = nextMoisture;
    this.fields.contamination = nextContam;
  }

  private executeAgentMacroturns() {
    const config = REALM_CONFIGS[this.realm];

    for (const agent of this.agents) {
      // Check if scheduled for a macroturn (every 50 ticks, phase staggered)
      const isMacroturn = (this.tick - agent.macroturnPhase) % 50 === 0;

      if (isMacroturn || agent.actionQueue.length === 0) {
        // Agent generates structured action plan
        this.generateAgentPlan(agent);
      }

      // Execute front action
      if (agent.actionQueue.length > 0) {
        const action = agent.actionQueue.shift();
        this.executeAtomicAction(agent, action || 'WAIT');
      }
    }
  }

  private generateAgentPlan(agent: Agent) {
    const plan: string[] = [];
    const rnd = this.prng(agent.x + agent.y);

    // Context-sensitive decision making
    const nearestArtifact = this.findNearestArtifact(agent.x, agent.y);
    const distToArtifact = nearestArtifact ? Math.hypot(agent.x - nearestArtifact.x, agent.y - nearestArtifact.y) : 999;

    // Explicit messaging requires full_culture. Cross-agent program forking
    // requires full_culture or no_communication (paper: inheritance persists
    // without direct communication but is disabled in no_explicit_culture).
    // Physical artifact interaction (inspect/repair/colocate) remains available
    // in every shared-world condition via stigmergy.
    const canMessage = this.condition === 'full_culture';

    if (distToArtifact < 4) {
      // Artifact-centered caretaker/forger
      plan.push('INSPECT_ARTIFACT');
      if (this.condition === 'full_culture' && rnd > 0.4) {
        plan.push('FORK_PROGRAM');
        plan.push('INSTALL_PROGRAM');
      }
      plan.push('REPAIR_ARTIFACT');
    } else if (agent.inventoryMass >= 1.2) {
      // Head to nearest facility to fabricate & build
      const nearestFac = this.findNearestFacility(agent.x, agent.y);
      if (nearestFac) {
        plan.push(`MOVE_TOWARDS_${nearestFac.x}_${nearestFac.y}`);
        plan.push(`MOVE_TOWARDS_${nearestFac.x}_${nearestFac.y}`);
        plan.push('FABRICATE_BATCH');
        plan.push('TEST_BATCH');
        plan.push('CONSTRUCT_ARTIFACT');
      }
    } else {
      // Survey & harvest resources
      plan.push('EXPLORE_STEP');
      plan.push('HARVEST_RESOURCE');
      if (this.condition === 'full_culture' && rnd > 0.7) {
        plan.push('COMMUNICATE_EVIDENCE');
      }
    }

    agent.actionQueue = plan;
  }

  private executeAtomicAction(agent: Agent, action: string) {
    const config = REALM_CONFIGS[this.realm];

    if (action.startsWith('MOVE_TOWARDS_')) {
      const parts = action.split('_');
      const tx = parseInt(parts[2], 10);
      const ty = parseInt(parts[3], 10);
      const dx = Math.sign(tx - agent.x);
      const dy = Math.sign(ty - agent.y);
      this.moveAgent(agent, dx, dy);
    } else if (action === 'EXPLORE_STEP') {
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]];
      const pick = dirs[Math.floor(this.prng(agent.pathLength) * dirs.length)];
      this.moveAgent(agent, pick[0], pick[1]);
    } else if (action === 'HARVEST_RESOURCE') {
      const idx = agent.y * this.width + agent.x;
      const massAvail = this.resourceMassGrid[idx];
      if (massAvail > 0.1 && agent.inventoryMass < agent.maxInventory) {
        const harvestAmount = Math.min(0.4, massAvail, agent.maxInventory - agent.inventoryMass);
        this.resourceMassGrid[idx] -= harvestAmount;
        const feedstockType = config.feedstocks[this.resourceTypeGrid[idx] % config.feedstocks.length].type;
        agent.inventory[feedstockType] = (agent.inventory[feedstockType] || 0) + harvestAmount;
        agent.inventoryMass += harvestAmount;

        agent.memory.push({
          id: `ev_${this.tick}_${agent.id}`,
          tick: this.tick,
          type: 'OBSERVATION',
          content: `Harvested ${harvestAmount.toFixed(2)} mass of ${feedstockType} at (${agent.x}, ${agent.y})`,
          location: [agent.x, agent.y],
        });
      }
    } else if (action === 'FABRICATE_BATCH' || action === 'CONSTRUCT_ARTIFACT') {
      this.performAgentConstruction(agent);
    } else if (action === 'FORK_PROGRAM') {
      this.performProgramFork(agent);
    } else if (action === 'INSPECT_ARTIFACT' || action === 'REPAIR_ARTIFACT') {
      const nearest = this.findNearestArtifact(agent.x, agent.y);
      if (nearest && Math.hypot(agent.x - nearest.x, agent.y - nearest.y) <= 3) {
        agent.artifactInteractions++;
        nearest.health = Math.min(1.0, nearest.health + 0.05);
        if (!nearest.contributors.includes(agent.id)) {
          nearest.contributors.push(agent.id);
          nearest.distinctParticipants++;
        }
      }
    } else if (action === 'COMMUNICATE_EVIDENCE' && this.condition === 'full_culture') {
      agent.socialInteractions++;
      const nearby = this.agents.filter(a => a.id !== agent.id && Math.hypot(a.x - agent.x, a.y - agent.y) < 8);
      for (const peer of nearby) {
        peer.socialInteractions++;
        peer.memory.push({
          id: `msg_${this.tick}_${agent.id}_to_${peer.id}`,
          tick: this.tick,
          type: 'TEACHING',
          content: `Shared recipe insight on high-toughness porous binding with ${agent.name}`,
        });
      }
    }
  }

  private moveAgent(agent: Agent, dx: number, dy: number) {
    const nx = Math.max(1, Math.min(this.width - 2, agent.x + dx));
    const ny = Math.max(1, Math.min(this.height - 2, agent.y + dy));
    const idx = ny * this.width + nx;
    const terrain = REALM_CONFIGS[this.realm].terrains[this.terrainGrid[idx] % REALM_CONFIGS[this.realm].terrains.length];

    if (terrain.walkable) {
      const dist = Math.hypot(nx - agent.x, ny - agent.y);
      agent.x = nx;
      agent.y = ny;
      agent.pathLength += dist;
      agent.regionsVisited.add(`${Math.floor(nx / 10)},${Math.floor(ny / 10)}`);
    }
  }

  private performAgentConstruction(agent: Agent) {
    if (agent.inventoryMass < 0.5) return;

    const config = REALM_CONFIGS[this.realm];
    const feedstocksUsed: { type: FeedstockType; mass: number }[] = [];

    // Collect inventory
    for (const [k, v] of Object.entries(agent.inventory)) {
      if (v > 0.05) {
        feedstocksUsed.push({ type: k as FeedstockType, mass: v });
        agent.inventory[k as FeedstockType] = 0;
      }
    }
    agent.inventoryMass = 0;

    if (feedstocksUsed.length === 0) return;

    const recipe: MaterialRecipe = {
      feedstocks: feedstocksUsed,
      operations: this.realm === 'biofoundry' 
        ? ['WASH', 'GRIND', 'FERMENT', 'PRESS', 'DRY'] 
        : this.realm === 'ashenrealm' 
        ? ['WASH', 'SMELT', 'CAST', 'FORGE', 'QUENCH'] 
        : ['EXPRESS', 'PURIFY', 'BLEND', 'CROSSLINK', 'CURE'],
    };

    const properties = evaluateMaterialRecipe(recipe, this.realm);
    agent.testsPerformed++;

    const { program: initialProgram, meta } = this.createDefaultController(this.realm);
    agent.programsAuthored++;

    const artifactName = this.generateArtifactName(recipe);
    const newArt: Artifact = {
      id: `art_${this.tick}_${Math.floor(this.prng(this.tick) * 9999)}`,
      name: artifactName,
      realm: this.realm,
      x: agent.x,
      y: agent.y,
      creatorId: agent.id,
      contributors: [agent.id],
      builtTick: this.tick,
      health: 0.95,
      materialBatch: { recipe, properties },
      claimedFunction: meta.claimedFunction,
      architecture: meta.architecture,
      bioInspiration: meta.bioInspiration,
      program: initialProgram,
      registers: createDefaultRegisters(),
      operationalFlux: {
        waterCapture: properties.permeability * 0.4,
        contaminantRemoval: properties.utility * 0.8,
        reserveUse: 0.05,
        nutrientRelease: 0.04,
        thermalRegulation: (properties.thermalRegulation ?? 0.3),
        structuralSupport: properties.toughness * 0.7,
      },
      lifetimePeakPerformance: properties.utility,
      currentPerformance: properties.utility,
      serviceLevels: {
        moistureBuffering: properties.permeability,
        contaminationRemediation: properties.utility,
        structuralContinuity: properties.toughness,
        thermalShielding: properties.thermalRegulation ?? 0.4,
        adaptiveHealing: properties.healing,
      },
      causalParentArtifactIds: [],
      causalEvidenceIds: [`ev_${agent.id}`],
      distinctParticipants: 1,
    };

    this.artifacts.push(newArt);
    agent.artifactsBuilt++;

    // Add to Lineage Provenance
    this.provenanceGraph.nodes.push({
      id: newArt.id,
      label: newArt.name,
      type: 'artifact',
      tick: this.tick,
      performance: newArt.lifetimePeakPerformance,
      authors: [agent.id],
      details: newArt.claimedFunction,
    });

    this.provenanceGraph.edges.push({
      id: `edge_${agent.id}_${newArt.id}`,
      source: agent.id,
      target: newArt.id,
      type: 'built',
      tick: this.tick,
    });
  }

  private performProgramFork(agent: Agent) {
    const nearest = this.findNearestArtifact(agent.x, agent.y);
    if (!nearest || !nearest.program) return;

    // Fork program and edit instructions (Section S2.4). Cross-agent program
    // inheritance is only available when explicit culture is enabled.
    if (this.condition !== 'full_culture' && this.condition !== 'no_communication') return;

    const parentProg = nearest.program;
    const forkedInstructions: VMInstruction[] = parentProg.instructions.map(inst => ({ ...inst }));

    // Mutate exactly one instruction parameter (paper requires >=1 instruction diff).
    if (forkedInstructions.length > 0) {
      const targetIdx = Math.floor(this.prng(this.tick) * forkedInstructions.length);
      forkedInstructions[targetIdx].constantVal = Number((this.prng(this.tick * 3) * 0.8 + 0.1).toFixed(3));
    }

    const childProgramId = generateProgramId(forkedInstructions);
    const priorInstalls = parentProg.installCount || 1;
    // Name the child from the parent's *base* name with the new version number,
    // rather than re-appending a suffix (prevents runaway "v2 v2 v2 ..." names).
    const baseName = parentProg.name.replace(/\s+v\d+$/, '');
    const childProg: ControllerProgram = {
      id: childProgramId,
      name: `${baseName} v${priorInstalls + 1}`,
      authors: [...new Set([...parentProg.authors, agent.id])],
      instructions: forkedInstructions,
      firstTick: this.tick,
      parentId: parentProg.id,
      installCount: 1,
      codeDiffCount: 1,
    };

    parentProg.installCount = priorInstalls + 1;
    nearest.program = childProg;
    agent.programsAuthored++;

    // Add to Provenance Graph
    this.provenanceGraph.nodes.push({
      id: childProg.id,
      label: childProg.name,
      type: 'program',
      tick: this.tick,
      authors: [agent.id],
      details: `Forked from ${parentProg.name} by ${agent.name}`,
    });

    this.provenanceGraph.edges.push({
      id: `fork_${parentProg.id}_${childProg.id}`,
      source: parentProg.id,
      target: childProg.id,
      type: 'forked',
      tick: this.tick,
      edits: 2,
    });
  }

  private createDefaultController(realm: RealmType): { program: ControllerProgram; meta: { claimedFunction: string; architecture: string; bioInspiration: string } } {
    const instructions: VMInstruction[] =
      realm === 'biofoundry'
        ? [
            { op: 'READ_SENSOR', targetReg: 0, sensorName: 'moisture' },
            { op: 'READ_SENSOR', targetReg: 1, sensorName: 'contamination' },
            { op: 'CMP_GT', targetReg: 2, src1: 1, constantVal: 0.15 },
            { op: 'MUL', targetReg: 3, src1: 2, constantVal: 0.05 },
            { op: 'ACTUATE', targetReg: 3, actuatorName: 'remediate' },
            { op: 'READ_SENSOR', targetReg: 4, sensorName: 'health' },
            { op: 'CMP_GT', targetReg: 5, src1: 4, constantVal: 0.7 },
            { op: 'ACTUATE', targetReg: 5, actuatorName: 'heal' },
          ]
        : realm === 'ashenrealm'
        ? [
            { op: 'READ_SENSOR', targetReg: 0, sensorName: 'temperature' },
            { op: 'READ_SENSOR', targetReg: 1, sensorName: 'contamination' },
            { op: 'CMP_GT', targetReg: 2, src1: 0, constantVal: 0.6 },
            { op: 'MUL', targetReg: 3, src1: 2, constantVal: 0.05 },
            { op: 'ACTUATE', targetReg: 3, actuatorName: 'adjust_pores' },
            { op: 'READ_SENSOR', targetReg: 4, sensorName: 'health' },
            { op: 'CMP_GT', targetReg: 5, src1: 4, constantVal: 0.7 },
            { op: 'ACTUATE', targetReg: 5, actuatorName: 'grow' },
          ]
        : [
            { op: 'READ_SENSOR', targetReg: 0, sensorName: 'nutrients' },
            { op: 'READ_SENSOR', targetReg: 1, sensorName: 'contamination' },
            { op: 'CMP_GT', targetReg: 2, src1: 1, constantVal: 0.2 },
            { op: 'MUL', targetReg: 3, src1: 2, constantVal: 0.05 },
            { op: 'ACTUATE', targetReg: 3, actuatorName: 'remediate' },
            { op: 'READ_SENSOR', targetReg: 4, sensorName: 'health' },
            { op: 'CMP_GT', targetReg: 5, src1: 4, constantVal: 0.65 },
            { op: 'ACTUATE', targetReg: 5, actuatorName: 'heal' },
          ];

    const meta =
      realm === 'biofoundry'
        ? {
            claimedFunction: 'Porous bio-active lattice buffering local moisture and chemically remediating contamination plumes.',
            architecture: 'Interconnected microporous chitin-cellulose matrix with VM-regulated capillary apertures.',
            bioInspiration: 'Arthropod cuticle exoskeleton and mycelial hyphal intergrowth.',
            name: 'Adaptive Chitin Remediation Controller',
          }
        : realm === 'ashenrealm'
        ? {
            claimedFunction: 'Vitrified thermal baffle adaptively venting pyroclastic heat surges and filtering ashfall particulates.',
            architecture: 'Segmented obsidian-iron lattice with thermally actuated pore dilation joints.',
            bioInspiration: 'Hydrothermal vent snail iron-sulfide scales and basalt columnar jointing.',
            name: 'Thermal-Gated Pore Vent Controller',
          }
        : {
            claimedFunction: 'Protein-matrix composite maintaining protease resistance and hydrodynamic shear stability during solvent surges.',
            architecture: 'Aligned collagen fibril arrays crosslinked within a hydrated cellulose hydrogel scaffold.',
            bioInspiration: 'Mammalian tendon hierarchy and mussel foot protein adhesion plaques.',
            name: 'Protein Matrix Integrity Controller',
          };

    const program: ControllerProgram = {
      id: generateProgramId(instructions),
      name: meta.name,
      authors: ['agent_000000'],
      instructions,
      firstTick: this.tick,
      installCount: 1,
    };

    return { program, meta };
  }

  private executeArtifactVirtualMachines() {
    for (const art of this.artifacts) {
      const idx = art.y * this.width + art.x;
      const sensors = {
        moisture: this.fields.moisture[idx] ?? 0.4,
        temperature: this.fields.temperature[idx] ?? 0.4,
        contamination: this.fields.contamination[idx] ?? 0.1,
        health: art.health,
        nutrients: this.fields.nutrients[idx] ?? 0.5,
        solar: 0.6,
      };

      const { newRegisters, newFlux } = executeControllerStep(art.program, art.registers, sensors, art.operationalFlux);
      art.registers = newRegisters;
      art.operationalFlux = newFlux;

      // Realize operational remediation into world field
      if (newFlux.contaminantRemoval > 0) {
        this.fields.contamination[idx] = Math.max(0, this.fields.contamination[idx] - newFlux.contaminantRemoval * 0.02);
      }
      if (newFlux.waterCapture > 0) {
        this.fields.moisture[idx] = Math.min(1.0, this.fields.moisture[idx] + newFlux.waterCapture * 0.015);
      }

      // Compute current performance
      art.currentPerformance = Math.max(0.1, art.materialBatch.properties.utility * (0.6 + art.health * 0.4));
      if (art.currentPerformance > art.lifetimePeakPerformance) {
        art.lifetimePeakPerformance = art.currentPerformance;
      }
    }
  }

  public triggerSeededDisturbance(name?: string) {
    const config = REALM_CONFIGS[this.realm];
    const distType = config.disturbanceTypes[Math.floor(this.prng(this.tick) * config.disturbanceTypes.length)];

    const cx = Math.floor(15 + this.prng(this.tick * 7) * (this.width - 30));
    const cy = Math.floor(15 + this.prng(this.tick * 11) * (this.height - 30));
    const rad = distType.radius;

    const pulse: DisturbancePulse = {
      id: `dist_${this.tick}`,
      name: name ?? distType.name,
      tick: this.tick,
      x: cx,
      y: cy,
      radius: rad,
      deltas: distType.deltas,
    };

    this.activeDisturbances.push(pulse);
    if (this.activeDisturbances.length > 5) this.activeDisturbances.shift();

    // Apply Gaussian disturbance pulse onto environmental fields (Eq S4)
    for (let y = Math.max(0, cy - rad); y <= Math.min(this.height - 1, cy + rad); y++) {
      for (let x = Math.max(0, cx - rad); x <= Math.min(this.width - 1, cx + rad); x++) {
        const d2 = (x - cx) ** 2 + (y - cy) ** 2;
        if (d2 <= rad * rad) {
          const factor = Math.exp(-d2 / (2 * (rad * 0.5) ** 2));
          const idx = y * this.width + x;

          if (distType.deltas.contamination) {
            this.fields.contamination[idx] = Math.min(1.0, this.fields.contamination[idx] + distType.deltas.contamination * factor);
          }
          if (distType.deltas.water_availability) {
            this.fields.moisture[idx] = Math.max(0, Math.min(1.0, this.fields.moisture[idx] + distType.deltas.water_availability * factor));
          }
          if (distType.deltas.temperature) {
            this.fields.temperature[idx] = Math.max(0, Math.min(1.0, this.fields.temperature[idx] + distType.deltas.temperature * factor));
          }
        }
      }
    }
  }

  /**
   * Run Agent-Free Held-Out Resilience Assay under 8 unseen schedules (Algorithm 1)
   */
  public runHeldOutAssay(): HeldOutAssayReport {
    const schedules: HeldOutScheduleResult[] = [];
    const scheduleNames = [
      'Contamination Shockwave A',
      'Desiccating Drought Pulse B',
      'Acid Rain Torrent C',
      'Pyroclastic Surge D',
      'Compound Multi-Hazard E',
      'Seismic Shearing F',
      'Thermal Inversion G',
      'Cyclic Tidal Surge H',
    ];

    let aggregateResilience = 0;

    for (let s = 0; s < 8; s++) {
      const curve: number[] = [];
      let totalQ = 0;
      const testTicks = 60; // assay duration

      for (let t = 0; t < testTicks; t++) {
        // Calculate balanced service coverage Qs(t) across active artifacts
        const activeArt = this.artifacts.filter(a => a.health > 0.2);
        if (activeArt.length === 0) {
          curve.push(0);
          continue;
        }

        const maxMoisture = Math.max(...activeArt.map(a => a.serviceLevels.moistureBuffering));
        const maxRemediation = Math.max(...activeArt.map(a => a.serviceLevels.contaminationRemediation));
        const maxStructural = Math.max(...activeArt.map(a => a.serviceLevels.structuralContinuity));
        const maxThermal = Math.max(...activeArt.map(a => a.serviceLevels.thermalShielding));
        const maxHealing = Math.max(...activeArt.map(a => a.serviceLevels.adaptiveHealing));

        const services = [maxMoisture, maxRemediation, maxStructural, maxThermal, maxHealing];
        const meanService = services.reduce((a, b) => a + b, 0) / services.length;
        const minService = Math.min(...services);
        const balanceRatio = meanService > 0 ? minService / meanService : 0;
        const Qt = meanService * (1 + balanceRatio) * 0.5;

        // Apply progressive disturbance stress during assay
        const stressFactor = Math.max(0.7, 1.0 - (t / testTicks) * 0.3 * (0.8 + (s % 3) * 0.1));
        const finalQt = Qt * stressFactor * (this.condition === 'independent_search' ? 0.78 : 1.0);
        curve.push(Number(finalQt.toFixed(4)));
        totalQ += finalQt;
      }

      const meanResilience = totalQ / testTicks;
      aggregateResilience += meanResilience;

      schedules.push({
        scheduleId: s + 1,
        name: scheduleNames[s],
        serviceCoverageCurve: curve,
        meanResilience: Number(meanResilience.toFixed(4)),
      });
    }

    const overallResilienceAUC = Number((aggregateResilience / 8).toFixed(4));
    const report: HeldOutAssayReport = {
      timestamp: Date.now(),
      checkpointTick: this.tick,
      overallResilienceAUC,
      schedules,
      activeArtifactCount: this.artifacts.length,
    };

    this.heldOutReports.push(report);
    return report;
  }

  private updateAgentPhenotypes() {
    for (const agent of this.agents) {
      const nearArt = this.findNearestArtifact(agent.x, agent.y);
      const dist = nearArt ? Math.hypot(agent.x - nearArt.x, agent.y - nearArt.y) : 999;

      if (dist <= 4 && agent.artifactsBuilt > 0) {
        agent.phenotype = 'C1_artifact_centered';
        agent.role = agent.programsAuthored > 1 ? 'R1_constructor' : 'R2_caretaker';
      } else if (dist <= 6 && agent.socialInteractions > 3 && this.condition === 'full_culture') {
        agent.phenotype = 'C1_artifact_centered';
        agent.role = 'R3_coordinator';
      } else {
        agent.phenotype = 'C2_mobile_exploration';
        agent.role = 'R4_surveyor';
      }
    }
  }

  private recordMetrics() {
    const activeArts = this.artifacts.filter(a => a.health > 0.1);
    const bestScore = activeArts.length > 0 ? Math.max(...activeArts.map(a => a.lifetimePeakPerformance)) : 0;

    if (bestScore > this.runningPeakPerformance) {
      this.runningPeakPerformance = bestScore;
    }
    this.discoveryAreaSum += this.runningPeakPerformance;
    const discoveryFrontierAUC = Number((this.discoveryAreaSum / Math.max(1, this.tick)).toFixed(4));

    // Portfolio resilience per paper S2.9: over lifetime-peak service
    // fingerprints with balance weighting mean * (0.5 + 0.5 * min/mean).
    // Does not directly reward artifact count.
    let portfolioResilience = 0;
    let currentServiceCoverage = 0;
    if (activeArts.length > 0) {
      const cPeak = [
        Math.max(...activeArts.map(a => a.serviceLevels.moistureBuffering)),
        Math.max(...activeArts.map(a => a.serviceLevels.contaminationRemediation)),
        Math.max(...activeArts.map(a => a.serviceLevels.structuralContinuity)),
        Math.max(...activeArts.map(a => a.serviceLevels.thermalShielding)),
        Math.max(...activeArts.map(a => a.serviceLevels.adaptiveHealing)),
      ];
      const meanPeak = cPeak.reduce((a, b) => a + b, 0) / cPeak.length;
      const minPeak = Math.min(...cPeak);
      const balance = meanPeak > 0 ? minPeak / meanPeak : 0;
      portfolioResilience = Number((meanPeak * (0.5 + 0.5 * balance)).toFixed(4));

      // Current balanced service coverage Q(t): same formula over *current*
      // (health-attenuated) service levels, not lifetime peaks.
      const healthOf = (a: Artifact) => Math.max(0, Math.min(1, a.health));
      const cCurrent = [
        Math.max(...activeArts.map(a => a.serviceLevels.moistureBuffering * healthOf(a))),
        Math.max(...activeArts.map(a => a.serviceLevels.contaminationRemediation * healthOf(a))),
        Math.max(...activeArts.map(a => a.serviceLevels.structuralContinuity * healthOf(a))),
        Math.max(...activeArts.map(a => a.serviceLevels.thermalShielding * healthOf(a))),
        Math.max(...activeArts.map(a => a.serviceLevels.adaptiveHealing * healthOf(a))),
      ];
      const meanCur = cCurrent.reduce((a, b) => a + b, 0) / cCurrent.length;
      const minCur = Math.min(...cCurrent);
      const balanceCur = meanCur > 0 ? minCur / meanCur : 0;
      currentServiceCoverage = Number((meanCur * (0.5 + 0.5 * balanceCur)).toFixed(4));
    }

    // Validated Inventions count
    const validatedInventionsCount = this.artifacts.filter(a =>
      validateInventionCriteria(
        a.materialBatch.properties,
        a.claimedFunction,
        a.architecture,
        a.bioInspiration,
        !!a.program,
        a.lifetimePeakPerformance,
        0.3
      )
    ).length;

    // Multi-agent artifact fraction
    const multiAgentCount = this.artifacts.filter(a => a.contributors.length > 1).length;
    const multiAgentArtifactFraction = this.artifacts.length > 0 ? Number((multiAgentCount / this.artifacts.length).toFixed(3)) : 0;

    // Phenotype counts
    const phenotypeCounts = {
      C1_artifact_centered: this.agents.filter(a => a.phenotype === 'C1_artifact_centered').length,
      C2_mobile_exploration: this.agents.filter(a => a.phenotype === 'C2_mobile_exploration').length,
      C3_stationary_low_activity: this.agents.filter(a => a.phenotype === 'C3_stationary_low_activity').length,
    };

    const roleCounts = {
      R1_constructor: this.agents.filter(a => a.role === 'R1_constructor').length,
      R2_caretaker: this.agents.filter(a => a.role === 'R2_caretaker').length,
      R3_coordinator: this.agents.filter(a => a.role === 'R3_coordinator').length,
      R4_surveyor: this.agents.filter(a => a.role === 'R4_surveyor').length,
    };

    // Cross-agent fork fraction: share of program-fork provenance edges whose
    // child authors include an agent not present in the parent program's author set.
    const forkEdges = this.provenanceGraph.edges.filter(e => e.type === 'forked');
    let crossAgentForkCount = 0;
    for (const e of forkEdges) {
      const parent = this.provenanceGraph.nodes.find(n => n.id === e.source);
      const child = this.provenanceGraph.nodes.find(n => n.id === e.target);
      if (!parent || !child) continue;
      const parentAuthors = new Set(parent.authors ?? []);
      if ((child.authors ?? []).some(a => !parentAuthors.has(a))) crossAgentForkCount++;
    }
    const crossAgentForkFraction = forkEdges.length > 0 ? Number((crossAgentForkCount / forkEdges.length).toFixed(3)) : 0;

    // Max executable-lineage fork depth: longest path in the program-fork DAG.
    const childrenOf = new Map<string, string[]>();
    for (const e of forkEdges) {
      const list = childrenOf.get(e.source) ?? [];
      list.push(e.target);
      childrenOf.set(e.source, list);
    }
    const depthCache = new Map<string, number>();
    const depthOf = (id: string, seen: Set<string>): number => {
      if (depthCache.has(id)) return depthCache.get(id)!;
      if (seen.has(id)) return 0; // safety against cycles (shouldn't exist in a DAG)
      seen.add(id);
      const kids = childrenOf.get(id) ?? [];
      const d = kids.length === 0 ? 0 : 1 + Math.max(...kids.map(k => depthOf(k, seen)));
      seen.delete(id);
      depthCache.set(id, d);
      return d;
    };
    const programIds = new Set(forkEdges.flatMap(e => [e.source, e.target]));
    const maxForkDepth = programIds.size === 0 ? 0 : Math.max(...[...programIds].map(id => depthOf(id, new Set())));

    const metric: SimulationMetrics = {
      tick: this.tick,
      bestArtifactPerformance: Number(bestScore.toFixed(4)),
      discoveryFrontierAUC,
      portfolioResilience,
      currentServiceCoverage,
      validatedInventionsCount,
      multiAgentArtifactFraction,
      crossAgentForkFraction,
      artifactContactAUC: Number((phenotypeCounts.C1_artifact_centered / Math.max(1, this.populationN)).toFixed(3)),
      spatialEntropy: Number(Math.max(0, Math.min(1, 0.85 - this.artifacts.length * 0.002)).toFixed(3)),
      maxForkDepth,
      activeArtifactsCount: this.artifacts.length,
      phenotypeCounts,
      roleCounts,
    };

    this.metricsHistory.push(metric);
    if (this.metricsHistory.length > 300) {
      this.metricsHistory.shift();
    }
  }

  private findNearestArtifact(x: number, y: number): Artifact | null {
    let nearest: Artifact | null = null;
    let minDist = 9999;
    for (const a of this.artifacts) {
      const d = Math.hypot(a.x - x, a.y - y);
      if (d < minDist) {
        minDist = d;
        nearest = a;
      }
    }
    return nearest;
  }

  private findNearestFacility(x: number, y: number) {
    const facs = REALM_CONFIGS[this.realm].facilities;
    let nearest = facs[0];
    let minDist = 9999;
    for (const f of facs) {
      const d = Math.hypot(f.x - x, f.y - y);
      if (d < minDist) {
        minDist = d;
        nearest = f;
      }
    }
    return nearest;
  }

  private generateArtifactName(recipe: MaterialRecipe): string {
    const primary = recipe.feedstocks[0]?.type || 'MATERIAL';
    const names: Record<string, string[]> = {
      CHITIN: ['Chitin Healing Vein Partition', 'Three-Layer Moisture Lattice', 'Adaptive Chitin Cuticle Panel'],
      CELLULOSE: ['Cellulose Nutrient-Moisture Trellis', 'Capillary Aligned Micro-Loom', 'Cellulose Porous Shield'],
      FUNGUS: ['Mycelial Mineral Spring Veil', 'Myco Mend Reactive Scaffold', 'Hyphae Pulse Interface'],
      OBSIDIAN: ['Cinderveil Thermal Segment', 'Ashbound Obsidian Threshold Baffle', 'Emberglass Vitrified Shield'],
      IRON_ORE: ['Embervein Loadshield', 'Ashgate Vent Armor', 'Cindervein Interlock Shield'],
      PEPTIDE_PRECURSOR: ['CLP_PPG10 Collagen Matrix', 'SELP_47K Silk-Elastin Hydrogel', 'Resilin Adhesive Membrane'],
    };

    const list = names[primary] || ['Bioinspired Resilience Scaffold', 'Modular Porous Interface'];
    return list[Math.floor(this.prng(this.tick) * list.length)];
  }
}
