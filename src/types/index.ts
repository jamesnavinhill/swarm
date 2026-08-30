/**
 * SwarmWorld Type Definitions
 * Based on "SwarmWorld: Stigmergic Technological Evolution in Societies of Language-Model Agents"
 * (MIT LAMM, August 2026)
 */

export type RealmType = 'biofoundry' | 'ashenrealm' | 'proteinrealms';

export type ConditionType = 'full_culture' | 'no_communication' | 'no_explicit_culture' | 'independent_search';

export type BehavioralRole = 
  | 'R1_constructor' 
  | 'R2_caretaker' 
  | 'R3_coordinator' 
  | 'R4_surveyor';

export type BehavioralPhenotype = 
  | 'C1_artifact_centered' 
  | 'C2_mobile_exploration' 
  | 'C3_stationary_low_activity';

export type TerrainType = 
  | 'PLAIN' 
  | 'CORRIDOR' 
  | 'WORKSPACE' 
  | 'DEEP_WATER' 
  | 'MINERAL_SPRING' 
  | 'FUNGAL_GROVE' 
  | 'CELLULOSE_FIELD' 
  | 'CHITIN_FIELD'
  | 'LAVA_CHANNEL'
  | 'OBSIDIAN_WASTE'
  | 'SULFUR_MARSH'
  | 'IRON_MOUNTAIN'
  | 'MAGMA_SEA'
  | 'AMINO_ACID_BASIN'
  | 'CHAPERONE_FOREST'
  | 'MEMBRANE_LAGOON'
  | 'CYSTEINE_MARSH'
  | 'SOLVENT_SEA';

export type FeedstockType = 
  | 'CHITIN'
  | 'CELLULOSE'
  | 'FUNGUS'
  | 'MINERAL'
  | 'CATALYST'
  | 'KELP'
  | 'SHELL'
  | 'LIGNIN'
  | 'IRON_ORE'
  | 'COPPER_ORE'
  | 'OBSIDIAN'
  | 'BASALT'
  | 'SULFUR'
  | 'LIMESTONE_FLUX'
  | 'CARBON_FUEL'
  | 'PEPTIDE_PRECURSOR'
  | 'LIPID'
  | 'BUFFER'
  | 'CROSSLINKER';

export type FabricationOperation = 
  | 'WASH'
  | 'GRIND'
  | 'CRUSH'
  | 'ROAST'
  | 'FERMENT'
  | 'ALKALINE_TREAT'
  | 'MINERALIZE'
  | 'ALIGN'
  | 'WEAVE'
  | 'PRESS'
  | 'COAT'
  | 'DRY'
  | 'SMELT'
  | 'REFINE'
  | 'ALLOY'
  | 'CAST'
  | 'FORGE'
  | 'QUENCH'
  | 'ANNEAL'
  | 'EXPRESS'
  | 'PURIFY'
  | 'BLEND'
  | 'CROSSLINK'
  | 'CURE';

export interface MaterialRecipe {
  feedstocks: { type: FeedstockType; mass: number }[];
  operations: FabricationOperation[];
  targetArchitecture?: string;
  bioInspiration?: string;
}

export interface MaterialProperties {
  utility: number;
  quality: number;
  permeability: number;
  toughness: number;
  healing: number;
  responsiveness: number;
  stiffness?: number;
  adhesion?: number;
  thermalRegulation?: number;
  heatResistance?: number;
  proteaseResistance?: number;
  shearResistance?: number;
}

export interface VMInstruction {
  op: 'SET' | 'ADD' | 'SUB' | 'MUL' | 'MAX' | 'MIN' | 'READ_SENSOR' | 'ACTUATE' | 'CMP_GT';
  targetReg: number; // 0 to 15
  src1?: number;     // register index or constant
  src2?: number;
  sensorName?: 'moisture' | 'temperature' | 'contamination' | 'health' | 'nutrients' | 'solar';
  actuatorName?: 'collect_water' | 'remediate' | 'heal' | 'adjust_pores' | 'grow' | 'emit_signal';
  constantVal?: number;
}

export interface ControllerProgram {
  id: string;
  name: string;
  authors: string[];
  instructions: VMInstruction[];
  firstTick: number;
  parentId?: string;
  installCount: number;
  codeDiffCount?: number;
}

export interface OperationalFlux {
  waterCapture: number;
  contaminantRemoval: number;
  reserveUse: number;
  nutrientRelease: number;
  thermalRegulation: number;
  structuralSupport: number;
}

export interface Artifact {
  id: string;
  name: string;
  realm: RealmType;
  x: number;
  y: number;
  creatorId: string;
  contributors: string[];
  builtTick: number;
  health: number; // 0 to 1
  materialBatch: {
    recipe: MaterialRecipe;
    properties: MaterialProperties;
  };
  claimedFunction: string;
  architecture: string;
  bioInspiration: string;
  program?: ControllerProgram;
  registers: number[]; // 16 float registers
  operationalFlux: OperationalFlux;
  lifetimePeakPerformance: number;
  currentPerformance: number;
  serviceLevels: {
    moistureBuffering: number;
    contaminationRemediation: number;
    structuralContinuity: number;
    thermalShielding: number;
    adaptiveHealing: number;
  };
  causalParentArtifactIds: string[];
  causalEvidenceIds: string[];
  distinctParticipants: number;
}

export interface AgentMemoryRecord {
  id: string;
  tick: number;
  type: 'OBSERVATION' | 'TEST' | 'INSIGHT' | 'TEACHING' | 'TRADE' | 'FORK';
  content: string;
  evidenceId?: string;
  location?: [number, number];
}

export interface Agent {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  realm: RealmType;
  role: BehavioralRole;
  phenotype: BehavioralPhenotype;
  inventory: Record<FeedstockType, number>;
  inventoryMass: number;
  maxInventory: number;
  macroturnPhase: number;
  energy: number;
  pathLength: number;
  regionsVisited: Set<string>;
  artifactInteractions: number;
  socialInteractions: number;
  testsPerformed: number;
  artifactsBuilt: number;
  programsAuthored: number;
  currentGoal: string;
  currentHypothesis: string;
  actionQueue: string[];
  memory: AgentMemoryRecord[];
  activeColor: string;
  /** Ticks spent within 4 cells of an active artifact (behavioral window input). */
  ticksNearArtifact?: number;
  /** Ticks spent moving in the last evaluated window. */
  ticksMobile?: number;
  /** Net displacement over the last evaluated behavioral window (cells). */
  lastWindowNetDisplacement?: number;
  /** X/Y position at the start of the current behavioral window. */
  windowStartX?: number;
  windowStartY?: number;
  /** Snapshot of cumulative counters at the start of the current window (for window deltas). */
  windowBaseArtifactsBuilt?: number;
  windowBaseProgramsAuthored?: number;
  windowBaseArtifactInteractions?: number;
  windowBaseSocialInteractions?: number;
}

export interface EnvironmentalFields {
  moisture: Float32Array;
  contamination: Float32Array;
  temperature: Float32Array;
  nutrients: Float32Array;
}

export interface WorldFacility {
  id: string;
  name: string;
  type: 'FOUNDRY' | 'FERMENTER' | 'LOOM' | 'PROVING_GROUND' | 'ARCHIVE' | 'SYNTHESIZER';
  x: number;
  y: number;
  description: string;
}

export interface DisturbancePulse {
  id: string;
  name: string;
  tick: number;
  x: number;
  y: number;
  radius: number;
  deltas: {
    temperature?: number;
    contamination?: number;
    moisture?: number;
    nutrients?: number;
  };
}

export interface SimulationMetrics {
  tick: number;
  bestArtifactPerformance: number;
  discoveryFrontierAUC: number;
  portfolioResilience: number;
  currentServiceCoverage: number;
  validatedInventionsCount: number;
  multiAgentArtifactFraction: number;
  crossAgentForkFraction: number;
  artifactContactAUC: number;
  spatialEntropy: number;
  maxForkDepth: number;
  activeArtifactsCount: number;
  phenotypeCounts: {
    C1_artifact_centered: number;
    C2_mobile_exploration: number;
    C3_stationary_low_activity: number;
  };
  roleCounts: {
    R1_constructor: number;
    R2_caretaker: number;
    R3_coordinator: number;
    R4_surveyor: number;
  };
}

export interface HeldOutScheduleResult {
  scheduleId: number;
  name: string;
  serviceCoverageCurve: number[];
  meanResilience: number;
}

export interface HeldOutAssayReport {
  timestamp: number;
  checkpointTick: number;
  overallResilienceAUC: number;
  schedules: HeldOutScheduleResult[];
  activeArtifactCount: number;
}

export interface LineageNode {
  id: string;
  label: string;
  type: 'agent' | 'evidence' | 'insight' | 'program' | 'artifact';
  tick: number;
  authors?: string[];
  performance?: number;
  details: string;
  centrality?: number;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'causal' | 'built' | 'installed' | 'forked' | 'observed' | 'taught';
  tick: number;
  edits?: number;
}

export interface ProvenanceGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

export interface CampaignMission {
  id: string;
  title: string;
  realm: RealmType;
  recommendedCondition: ConditionType;
  briefing: string;
  scientificHypothesis: string;
  targetMetrics: {
    minInventions?: number;
    minPortfolioResilience?: number;
    minDiscoveryAUC?: number;
    minHeldOutResilience?: number;
    requiredArtifactType?: string;
  };
  rewards: {
    badge: string;
    unlockedFeedstock?: FeedstockType;
    unlockedOp?: FabricationOperation;
    xp: number;
  };
  completed: boolean;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  realm: RealmType;
  condition: ConditionType;
  seed: number;
  populationN: number;
  ticksElapsed: number;
  discoveryFrontierAUC: number;
  portfolioResilience: number;
  heldOutResilienceAUC: number;
  validatedInventions: number;
  submittedAt: string;
  isUserSubmission?: boolean;
}

export interface SaveStateSlot {
  slotId: number;
  name: string;
  updatedAt: string;
  realm: RealmType;
  condition: ConditionType;
  seed: number;
  populationN: number;
  tick: number;
  metrics: SimulationMetrics;
  artifactsCount: number;
  campaignProgress: number; // completed count
}
