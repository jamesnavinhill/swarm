/**
 * Realm Definitions, Historical Inventions, and Baseline Datasets
 * Extracted directly from SwarmWorld research data (MIT LAMM, 2026).
 */

import { Artifact, CampaignMission, FeedstockType, LeaderboardEntry, RealmType, TerrainType, WorldFacility } from '../../types';

/** Per-field physics per paper S2.2.3: F(t+1) = (1-λ)·[F(t) + D·Δ4F(t)] + s(terrain). */
export interface FieldPhysics {
  diffusion: number; // D
  decay: number;     // λ (fraction of the diffused value lost per tick)
}

export interface RealmConfig {
  id: RealmType;
  name: string;
  subtitle: string;
  themeColor: string;
  accentBg: string;
  accentBorder: string;
  gridWidth: number;
  gridHeight: number;
  description: string;
  terrains: { type: TerrainType; label: string; color: string; walkable: boolean }[];
  feedstocks: { type: FeedstockType; label: string; color: string; description: string }[];
  facilities: WorldFacility[];
  disturbanceTypes: { name: string; deltas: Record<string, number>; radius: number }[];
  /** Environmental field physics for the four named fields (D, λ per S2.2.3). */
  fieldPhysics: Record<'moisture' | 'contamination' | 'temperature' | 'nutrients', FieldPhysics>;
  /** Disturbance scheduling interval in ticks (paper example uses 64). */
  disturbanceInterval: number;
}

export const REALM_CONFIGS: Record<RealmType, RealmConfig> = {
  biofoundry: {
    id: 'biofoundry',
    name: 'BioFoundry',
    subtitle: 'Bioinspired Materials & Stigmergic Habitats',
    themeColor: '#3d7a5a', // Muted sage / forest moss
    accentBg: 'bg-stone-900/40',
    accentBorder: 'border-stone-700/40',
    gridWidth: 72,
    gridHeight: 54,
    description: 'A 72x54 wetland habitat where agents harvest chitin, cellulose, and fungal mycelium to fabricate responsive porous lattices and self-healing interfaces under drought, contamination, and storm pulses.',
    terrains: [
      { type: 'PLAIN', label: 'Moss Plain', color: '#16231a', walkable: true },
      { type: 'CORRIDOR', label: 'Transit Corridor', color: '#202d24', walkable: true },
      { type: 'WORKSPACE', label: 'Foundry Yard', color: '#2b3a30', walkable: true },
      { type: 'DEEP_WATER', label: 'Deep Water', color: '#111a1f', walkable: false },
      { type: 'MINERAL_SPRING', label: 'Mineral Spring', color: '#182f32', walkable: true },
      { type: 'FUNGAL_GROVE', label: 'Fungal Grove', color: '#231d2a', walkable: true },
      { type: 'CELLULOSE_FIELD', label: 'Cellulose Field', color: '#1a2e20', walkable: true },
      { type: 'CHITIN_FIELD', label: 'Chitin Field', color: '#322718', walkable: true },
    ],
    feedstocks: [
      { type: 'CHITIN', label: 'Chitin', color: '#9a7b38', description: 'Extracted from shell matrix; provides toughness and moisture regulation.' },
      { type: 'CELLULOSE', label: 'Cellulose', color: '#4d7c5f', description: 'Fibrillar carbohydrate network; supports capillary fluid transport and tensile strength.' },
      { type: 'FUNGUS', label: 'Mycelial Fungus', color: '#735c87', description: 'Branching hyphal network capable of autonomous self-repair and porous bonding.' },
      { type: 'MINERAL', label: 'Spring Minerals', color: '#567a82', description: 'Inorganic carbonates & silicates for structural stiffness and compressive strength.' },
      { type: 'CATALYST', label: 'Enzymatic Catalyst', color: '#b36d3c', description: 'Active bio-catalytic centers that speed contaminant remediation.' },
      { type: 'KELP', label: 'Marine Kelp', color: '#3d6c56', description: 'Flexible alginate matrix providing salt tolerance and high elasticity.' },
      { type: 'SHELL', label: 'Nacre Shell', color: '#bfa15f', description: 'Brick-and-mortar layered calcium carbonate composite.' },
      { type: 'LIGNIN', label: 'Lignin Resin', color: '#6e533c', description: 'Crosslinked phenolic polymer providing hydrophobic barrier properties.' },
    ],
    facilities: [
      { id: 'FAC_FOUNDRY', name: 'Central BioFoundry', type: 'FOUNDRY', x: 36, y: 27, description: 'Primary material synthesis and composite fabrication facility.' },
      { id: 'FAC_FERMENT', name: 'Bioreactor Fermenter', type: 'FERMENTER', x: 20, y: 18, description: 'Anaerobic enzymatic conditioning and alignment chamber.' },
      { id: 'FAC_LOOM', name: 'Cellulose Matrix Loom', type: 'LOOM', x: 52, y: 16, description: 'Directional fiber alignment and multilayer weaving.' },
      { id: 'FAC_TEST', name: 'Mechanical Proving Station', type: 'PROVING_GROUND', x: 38, y: 42, description: 'Mechanical tension, permeability, and healing assay apparatus.' },
    ],
    disturbanceTypes: [
      { name: 'Toxic Contamination Plume', deltas: { contamination: 0.38, water_availability: -0.15 }, radius: 12 },
      { name: 'Desiccating Drought Pulse', deltas: { water_availability: -0.45, temperature: 0.3 }, radius: 16 },
      { name: 'Acid Rain Storm', deltas: { contamination: 0.25, nutrients: -0.2 }, radius: 14 },
    ],
    fieldPhysics: {
      moisture: { diffusion: 0.04, decay: 0.0005 },
      contamination: { diffusion: 0.03, decay: 0.0008 },
      temperature: { diffusion: 0.02, decay: 0.0006 },
      nutrients: { diffusion: 0.025, decay: 0.0004 },
    },
    disturbanceInterval: 150,
  },
  ashenrealm: {
    id: 'ashenrealm',
    name: 'AshenRealm',
    subtitle: 'Volcanic Metallurgy & High-Temperature Shields',
    themeColor: '#b0523b', // Terracotta / smelt iron
    accentBg: 'bg-stone-900/40',
    accentBorder: 'border-stone-700/40',
    gridWidth: 72,
    gridHeight: 54,
    description: 'A harsh 72x54 volcanic landscape with lava channels and obsidian wastes. Agents gather iron ore, obsidian, and sulfur to forge interlocking thermal baffles and shock-absorbing loadshields.',
    terrains: [
      { type: 'PLAIN', label: 'Ash Plain', color: '#1f1f1f', walkable: true },
      { type: 'CORRIDOR', label: 'Basalt Ridge', color: '#2b2b2b', walkable: true },
      { type: 'WORKSPACE', label: 'The Great Forge', color: '#42221b', walkable: true },
      { type: 'LAVA_CHANNEL', label: 'Lava Channel', color: '#7a2e1d', walkable: false },
      { type: 'OBSIDIAN_WASTE', label: 'Obsidian Waste', color: '#141414', walkable: true },
      { type: 'SULFUR_MARSH', label: 'Sulfur Marsh', color: '#4a411e', walkable: true },
      { type: 'IRON_MOUNTAIN', label: 'Iron Mountain', color: '#38383a', walkable: true },
      { type: 'MAGMA_SEA', label: 'Magma Sea', color: '#592015', walkable: false },
    ],
    feedstocks: [
      { type: 'OBSIDIAN', label: 'Raw Obsidian', color: '#424247', description: 'Vitreous silicate glass with exceptional thermal resistance and high hardness.' },
      { type: 'IRON_ORE', label: 'Iron Ore', color: '#783535', description: 'Dense metallic feedstock for heavy structural loadshields and baffles.' },
      { type: 'COPPER_ORE', label: 'Copper Ore', color: '#99633e', description: 'High thermal conductivity additive for directional heat dissipation.' },
      { type: 'BASALT', label: 'Basalt Fiber', color: '#333336', description: 'Volcanic rock fiber with high tensile strength and thermal damping.' },
      { type: 'SULFUR', label: 'Elemental Sulfur', color: '#9e8c33', description: 'Low melting flux and chemical crosslinker.' },
      { type: 'LIMESTONE_FLUX', label: 'Limestone Flux', color: '#78787c', description: 'Slag conditioner for purifying smelted ores.' },
      { type: 'CARBON_FUEL', label: 'Carbon Fuel', color: '#1c1c1f', description: 'High energy reducing agent for high-temperature smelting.' },
    ],
    facilities: [
      { id: 'FAC_GREAT_FORGE', name: 'The Great Forge', type: 'FOUNDRY', x: 36, y: 28, description: 'High-temperature smelting furnace and casting crucible.' },
      { id: 'FAC_ANNEAL', name: 'Obsidian Annealing Kiln', type: 'SYNTHESIZER', x: 22, y: 15, description: 'Precision thermal tempering for stress relief in vitreous glass.' },
      { id: 'FAC_ASHEN_TEST', name: 'Thermal Load Proving Ground', type: 'PROVING_GROUND', x: 48, y: 38, description: 'Simulated pyroclastic surge and seismic stress tester.' },
    ],
    disturbanceTypes: [
      { name: 'Pyroclastic Surge', deltas: { temperature: 0.6, contamination: 0.4 }, radius: 15 },
      { name: 'Seismic Rift Shaking', deltas: { nutrients: -0.3, water_availability: -0.2 }, radius: 18 },
      { name: 'Volcanic Ash Fallout', deltas: { contamination: 0.45 }, radius: 20 },
    ],
    fieldPhysics: {
      moisture: { diffusion: 0.04, decay: 0.001 },
      contamination: { diffusion: 0.03, decay: 0.0009 },
      temperature: { diffusion: 0.03, decay: 0.0004 },
      nutrients: { diffusion: 0.02, decay: 0.0006 },
    },
    disturbanceInterval: 150,
  },
  proteinrealms: {
    id: 'proteinrealms',
    name: 'Protein Realms',
    subtitle: 'Biomolecular Sequence & Matrix Engineering',
    themeColor: '#4a7291', // Steel slate blue
    accentBg: 'bg-slate-900/40',
    accentBorder: 'border-slate-700/40',
    gridWidth: 72,
    gridHeight: 54,
    description: 'A 72x54 molecular landscape where agents express catalog protein sequences (collagen CLP, silk-elastin SELP, resilin, mussel foot) and weave them into cellulose/lipid matrices for multi-hazard resilience.',
    terrains: [
      { type: 'PLAIN', label: 'Solvent Basin', color: '#111822', walkable: true },
      { type: 'CORRIDOR', label: 'Membrane Pathway', color: '#192330', walkable: true },
      { type: 'WORKSPACE', label: 'Molecular Enclave', color: '#1d3447', walkable: true },
      { type: 'SOLVENT_SEA', label: 'Solvent Sea', color: '#172d3f', walkable: false },
      { type: 'AMINO_ACID_BASIN', label: 'Amino Acid Basin', color: '#1f384f', walkable: true },
      { type: 'CHAPERONE_FOREST', label: 'Chaperone Forest', color: '#1b322a', walkable: true },
      { type: 'MEMBRANE_LAGOON', label: 'Membrane Lagoon', color: '#1b3542', walkable: true },
      { type: 'CYSTEINE_MARSH', label: 'Cysteine Marsh', color: '#2a1f38', walkable: true },
    ],
    feedstocks: [
      { type: 'PEPTIDE_PRECURSOR', label: 'Peptide Precursor', color: '#4f7596', description: 'Recombinant amino acid chains for sequence-defined bio-polymers.' },
      { type: 'CELLULOSE', label: 'Cellulose Matrix', color: '#446e55', description: 'Structural polysaccharide carrier supporting hydrogel formation.' },
      { type: 'LIPID', label: 'Lipid Bilayer Precursor', color: '#8c5970', description: 'Amphiphilic lipids for flexible protective envelope encapsulation.' },
      { type: 'BUFFER', label: 'pH Buffer Salt', color: '#685980', description: 'Stabilizes folding kinetics and physiological salinity.' },
      { type: 'CROSSLINKER', label: 'Enzymatic Crosslinker', color: '#967443', description: 'Promotes covalent bond formation across beta-sheets and triple helices.' },
      { type: 'MINERAL', label: 'Biomineral Seeds', color: '#477478', description: 'Inorganic nucleation centers for hard protein-mineral composites.' },
    ],
    facilities: [
      { id: 'FAC_RIBOSOME', name: 'Ribosome Expression Array', type: 'SYNTHESIZER', x: 30, y: 20, description: 'Translates catalog genetic sequences into pure peptide batches.' },
      { id: 'FAC_FOLDING', name: 'Chaperone Folding Chamber', type: 'FERMENTER', x: 44, y: 18, description: 'Directs controlled tertiary folding and beta-sheet crystallization.' },
      { id: 'FAC_MATRIX_LOOM', name: 'Protein-Matrix Loom', type: 'LOOM', x: 50, y: 35, description: 'Interweaves peptide hydrogels into aligned cellulose matrices.' },
      { id: 'FAC_STRESS_ASSAY', name: 'Protease & Shear Stress Assay', type: 'PROVING_GROUND', x: 26, y: 40, description: 'Enzymatic degradation, heat denaturing, and shear strength analyzer.' },
    ],
    disturbanceTypes: [
      { name: 'Protease Enzyme Surge', deltas: { contamination: 0.5 }, radius: 14 },
      { name: 'Thermal Denaturation Wave', deltas: { temperature: 0.55 }, radius: 16 },
      { name: 'Hydrodynamic Shear Surge', deltas: { water_availability: 0.4 }, radius: 12 },
    ],
    fieldPhysics: {
      moisture: { diffusion: 0.045, decay: 0.0004 },
      contamination: { diffusion: 0.035, decay: 0.0009 },
      temperature: { diffusion: 0.02, decay: 0.0005 },
      nutrients: { diffusion: 0.03, decay: 0.0003 },
    },
    disturbanceInterval: 150,
  },
};

/**
 * 16 Canonical Inventions from SwarmWorld paper (Figure 7, Figure 22, Figure 24)
 */
export const HISTORICAL_INVENTIONS: Partial<Artifact>[] = [
  {
    id: 'art_01',
    name: 'Three Layer Connected Chitin Exchange Lattice',
    realm: 'biofoundry',
    x: 36,
    y: 26,
    creatorId: 'agent_000018',
    contributors: ['agent_000018', 'agent_000042', 'agent_000007'],
    builtTick: 312,
    health: 0.96,
    materialBatch: {
      recipe: {
        feedstocks: [{ type: 'CHITIN', mass: 0.72 }, { type: 'MINERAL', mass: 0.1 }, { type: 'CELLULOSE', mass: 0.08 }],
        operations: ['WASH', 'GRIND', 'ALKALINE_TREAT', 'DRY'],
      },
      properties: {
        utility: 0.790,
        quality: 0.85,
        permeability: 0.68,
        toughness: 0.74,
        healing: 0.62,
        responsiveness: 0.71,
      },
    },
    claimedFunction: 'Provide a durable porous habitat interface that buffers moisture, supports structural continuity, and responds to contamination and damage.',
    architecture: 'Three-tier interconnected microporous lattice with cross-ply chitin fibrils.',
    bioInspiration: 'Arthropod cuticle exoskeleton & fungal hyphal intergrowth.',
    lifetimePeakPerformance: 0.790,
    currentPerformance: 0.764,
    serviceLevels: {
      moistureBuffering: 0.82,
      contaminationRemediation: 0.79,
      structuralContinuity: 0.88,
      thermalShielding: 0.45,
      adaptiveHealing: 0.71,
    },
    operationalFlux: {
      waterCapture: 0.32,
      contaminantRemoval: 1.00,
      reserveUse: 0.16,
      nutrientRelease: 0.08,
      thermalRegulation: 0.20,
      structuralSupport: 0.85,
    },
    distinctParticipants: 7,
    registers: [0.72, 0.35, 0.88, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    causalParentArtifactIds: [],
    causalEvidenceIds: ['ev_001', 'ev_004'],
  },
  {
    id: 'art_02',
    name: 'Mycelial Mineral Spring Veil',
    realm: 'biofoundry',
    x: 24,
    y: 20,
    creatorId: 'agent_000005',
    contributors: ['agent_000005', 'agent_000011'],
    builtTick: 418,
    health: 0.92,
    materialBatch: {
      recipe: {
        feedstocks: [{ type: 'FUNGUS', mass: 0.45 }, { type: 'MINERAL', mass: 0.35 }, { type: 'CHITIN', mass: 0.16 }],
        operations: ['WASH', 'GRIND', 'FERMENT', 'MINERALIZE', 'ALIGN', 'PRESS'],
      },
      properties: {
        utility: 0.638,
        quality: 0.78,
        permeability: 0.55,
        toughness: 0.64,
        healing: 0.81,
        responsiveness: 0.65,
      },
    },
    claimedFunction: 'Provide a porous local scaffold that supports structural continuity while adaptively attempting healing and contamination reduction.',
    architecture: 'Calcified fungal mycelium network with embedded mineral micro-channels.',
    bioInspiration: 'Coral-fungus biomineralization and cave velamen formations.',
    lifetimePeakPerformance: 0.638,
    currentPerformance: 0.612,
    serviceLevels: {
      moistureBuffering: 0.64,
      contaminationRemediation: 0.68,
      structuralContinuity: 0.60,
      thermalShielding: 0.35,
      adaptiveHealing: 0.84,
    },
    operationalFlux: {
      waterCapture: 0.22,
      contaminantRemoval: 0.65,
      reserveUse: 0.06,
      nutrientRelease: 0.05,
      thermalRegulation: 0.12,
      structuralSupport: 0.62,
    },
    distinctParticipants: 4,
    registers: [0.55, 0.4, 0.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    causalParentArtifactIds: ['art_01'],
    causalEvidenceIds: ['ev_002'],
  },
  {
    id: 'art_03',
    name: 'Fermented Tidal Chitin Panel',
    realm: 'biofoundry',
    x: 48,
    y: 32,
    creatorId: 'agent_000027',
    contributors: ['agent_000027', 'agent_000033', 'agent_000012'],
    builtTick: 520,
    health: 0.94,
    materialBatch: {
      recipe: {
        feedstocks: [{ type: 'CHITIN', mass: 0.72 }, { type: 'KELP', mass: 0.18 }, { type: 'MINERAL', mass: 0.10 }],
        operations: ['WASH', 'GRIND', 'FERMENT', 'ALIGN', 'PRESS'],
      },
      properties: {
        utility: 0.626,
        quality: 0.80,
        permeability: 0.62,
        toughness: 0.69,
        healing: 0.58,
        responsiveness: 0.74,
      },
    },
    claimedFunction: 'Provide a tougher, moderately permeable habitat panel whose persistence and healing can adapt to tidal moisture cycles.',
    architecture: 'Hydraulically laminated chitin-alginate composite with anisotropic pore orientation.',
    bioInspiration: 'Mantis shrimp dactyl club and intertidal mollusk shell hinges.',
    lifetimePeakPerformance: 0.626,
    currentPerformance: 0.605,
    serviceLevels: {
      moistureBuffering: 0.78,
      contaminationRemediation: 0.54,
      structuralContinuity: 0.72,
      thermalShielding: 0.30,
      adaptiveHealing: 0.60,
    },
    operationalFlux: {
      waterCapture: 0.29,
      contaminantRemoval: 0.46,
      reserveUse: 0.09,
      nutrientRelease: 0.03,
      thermalRegulation: 0.15,
      structuralSupport: 0.70,
    },
    distinctParticipants: 5,
    registers: [0.72, 0.29, 0.46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    causalParentArtifactIds: ['art_01'],
    causalEvidenceIds: ['ev_005'],
  },
  {
    id: 'art_04',
    name: 'Cinderveil Thermal Segment',
    realm: 'ashenrealm',
    x: 34,
    y: 28,
    creatorId: 'agent_000064',
    contributors: ['agent_000064', 'agent_000072'],
    builtTick: 758,
    health: 0.95,
    materialBatch: {
      recipe: {
        feedstocks: [{ type: 'OBSIDIAN', mass: 0.95 }, { type: 'LIMESTONE_FLUX', mass: 0.02 }, { type: 'CARBON_FUEL', mass: 0.03 }],
        operations: ['WASH', 'SMELT', 'REFINE', 'CAST', 'QUENCH'],
      },
      properties: {
        utility: 0.248,
        quality: 0.88,
        permeability: 0.05,
        toughness: 0.82,
        healing: 0.15,
        responsiveness: 0.85,
        thermalRegulation: 0.94,
      },
    },
    claimedFunction: 'Provide adaptive heat shielding and thermal regulation in the ash-loaded Great Forge while avoiding unsupported claims of primary structural support.',
    architecture: 'Segmented low-profile vitrified obsidian heat shield panel with thermal expansion joints.',
    bioInspiration: 'Hydrothermal vent snail iron-sulfide scales and volcanic basalt columns.',
    lifetimePeakPerformance: 0.248,
    currentPerformance: 0.245,
    serviceLevels: {
      moistureBuffering: 0.10,
      contaminationRemediation: 0.45,
      structuralContinuity: 0.65,
      thermalShielding: 0.95,
      adaptiveHealing: 0.20,
    },
    operationalFlux: {
      waterCapture: 0.00,
      contaminantRemoval: 0.34,
      reserveUse: 0.02,
      nutrientRelease: 0.00,
      thermalRegulation: 0.88,
      structuralSupport: 0.60,
    },
    distinctParticipants: 3,
    registers: [0.95, 0.85, 0.94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    causalParentArtifactIds: [],
    causalEvidenceIds: ['ev_ash_01'],
  },
  {
    id: 'art_05',
    name: 'CLP_PPG10 Collagen Cellulose Composite',
    realm: 'proteinrealms',
    x: 32,
    y: 22,
    creatorId: 'agent_000088',
    contributors: ['agent_000088'],
    builtTick: 741,
    health: 0.91,
    materialBatch: {
      recipe: {
        feedstocks: [{ type: 'PEPTIDE_PRECURSOR', mass: 0.35 }, { type: 'CELLULOSE', mass: 0.65 }],
        operations: ['EXPRESS', 'PURIFY', 'BLEND', 'CROSSLINK', 'CURE', 'ALIGN'],
      },
      properties: {
        utility: 0.720,
        quality: 0.91,
        permeability: 0.42,
        toughness: 0.78,
        healing: 0.70,
        responsiveness: 0.62,
        heatResistance: 0.70,
        proteaseResistance: 0.71,
        shearResistance: 0.62,
      },
    },
    claimedFunction: 'Provide a biocompatible collagen triple-helix reinforced cellulose matrix with high protease resistance and elastomeric strain recovery.',
    architecture: 'Aligned collagen fibril arrays crosslinked within a dense porous cellulose hydrogel.',
    bioInspiration: 'Mammalian tendon hierarchy and marine sponge fibrous frameworks.',
    lifetimePeakPerformance: 0.720,
    currentPerformance: 0.705,
    serviceLevels: {
      moistureBuffering: 0.85,
      contaminationRemediation: 0.60,
      structuralContinuity: 0.80,
      thermalShielding: 0.50,
      adaptiveHealing: 0.75,
    },
    operationalFlux: {
      waterCapture: 0.35,
      contaminantRemoval: 0.40,
      reserveUse: 0.05,
      nutrientRelease: 0.04,
      thermalRegulation: 0.30,
      structuralSupport: 0.78,
    },
    distinctParticipants: 2,
    registers: [0.35, 0.72, 0.91, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    causalParentArtifactIds: [],
    causalEvidenceIds: ['ev_prot_01'],
  },
];

/**
 * Curated Research Campaigns
 */
export const CAMPAIGN_MISSIONS: CampaignMission[] = [
  {
    id: 'mission_1',
    title: 'Mission I: Stigmergic Foundations',
    realm: 'biofoundry',
    recommendedCondition: 'no_explicit_culture',
    briefing: 'Deploy an initially homogeneous swarm of 50 agents in BioFoundry with physical stigmergy alone (no messaging, no chat). Prove that agents can coordinate purely through environmental modifications and build their first persistent chitin exchange artifact.',
    scientificHypothesis: 'Decentralized agents coordinate through traces left in the shared world rather than requiring explicit conversation.',
    targetMetrics: {
      minInventions: 1,
      minPortfolioResilience: 0.12,
    },
    rewards: {
      badge: 'Stigmergic Pioneer',
      unlockedFeedstock: 'CATALYST',
      xp: 100,
    },
    completed: false,
  },
  {
    id: 'mission_2',
    title: 'Mission II: Executable Code Inheritance',
    realm: 'biofoundry',
    recommendedCondition: 'full_culture',
    briefing: 'Enable the full cultural channel. Allow agents to author straight-line bytecode controllers and fork existing programs. Achieve a program lineage fork depth of at least 3 to demonstrate cross-agent technological descent.',
    scientificHypothesis: 'Cross-agent program forking allows functional environmental controllers to evolve across generations.',
    targetMetrics: {
      minInventions: 3,
      minPortfolioResilience: 0.18,
      minDiscoveryAUC: 0.28,
    },
    rewards: {
      badge: 'Genealogy Architect',
      unlockedOp: 'MINERALIZE',
      xp: 250,
    },
    completed: false,
  },
  {
    id: 'mission_3',
    title: 'Mission III: The Held-Out Disturbance Crucible',
    realm: 'biofoundry',
    recommendedCondition: 'full_culture',
    briefing: 'Freeze the society at tick 400, remove all agents, and subject the persistent artifact collection to 8 unseen disturbance schedules (drought, acid contamination, toxic plumes). Attain held-out resilience AUC >= 0.035.',
    scientificHypothesis: 'Persistent technologies continue executing autonomous sensor-actuator programs to protect the habitat after inventors are removed.',
    targetMetrics: {
      minHeldOutResilience: 0.035,
      minPortfolioResilience: 0.20,
    },
    rewards: {
      badge: 'Resilience Master',
      unlockedFeedstock: 'KELP',
      xp: 400,
    },
    completed: false,
  },
  {
    id: 'mission_4',
    title: 'Mission IV: Ashen Metallurgy Forge',
    realm: 'ashenrealm',
    recommendedCondition: 'full_culture',
    briefing: 'Transfer the collective architecture to AshenRealm. Direct the swarm to harvest raw obsidian and smelt iron ore to construct thermal baffles withstanding temperatures > 0.85.',
    scientificHypothesis: 'The same spatial stigmergic substrate transfers seamlessly across completely distinct material ecologies and physical hazard regimes.',
    targetMetrics: {
      minInventions: 2,
      minPortfolioResilience: 0.15,
    },
    rewards: {
      badge: 'Vulcan Forge Master',
      unlockedFeedstock: 'OBSIDIAN',
      xp: 500,
    },
    completed: false,
  },
  {
    id: 'mission_5',
    title: 'Mission V: Recombinant Sequence Synthesis',
    realm: 'proteinrealms',
    recommendedCondition: 'no_communication',
    briefing: 'Express collagen-like CLP_PPG10 and silk-elastin SELP_47K peptides in Protein Realms. Interweave with cellulose hydrogels to establish biomaterials scoring > 0.70 in protease and shear resistance.',
    scientificHypothesis: 'Declarative sequence-matrix constraints evaluate biochemical feasibility without requiring external LLM hallucination.',
    targetMetrics: {
      minInventions: 2,
      minHeldOutResilience: 0.035,
    },
    rewards: {
      badge: 'Biomolecular Weaver',
      unlockedFeedstock: 'PEPTIDE_PRECURSOR',
      xp: 650,
    },
    completed: false,
  },
  {
    id: 'mission_6',
    title: 'Mission VI: The 3,200-Tick Long Horizon',
    realm: 'biofoundry',
    recommendedCondition: 'full_culture',
    briefing: 'Run a deep 3,200-tick evolutionary trajectory at N=100. Observe behavioral differentiation into constructors and caretakers, and establish a portfolio resilience score exceeding the isolated search baseline (> 0.24).',
    scientificHypothesis: 'Long horizons reveal that societies win through collective portfolio breadth and modular redundancy rather than single-object record setting.',
    targetMetrics: {
      minInventions: 6,
      minPortfolioResilience: 0.24,
      minDiscoveryAUC: 0.35,
    },
    rewards: {
      badge: 'Evolutionary Grandmaster',
      xp: 1000,
    },
    completed: false,
  },
];

/**
 * Standard Research Leaderboard Seeds (From Paper Datasets)
 */
export const LEADERBOARD_BENCHMARKS: LeaderboardEntry[] = [
  {
    id: 'bench_01',
    playerName: 'MIT LAMM (Full Culture)',
    realm: 'biofoundry',
    condition: 'full_culture',
    seed: 3202,
    populationN: 200,
    ticksElapsed: 800,
    discoveryFrontierAUC: 0.388,
    portfolioResilience: 0.242,
    heldOutResilienceAUC: 0.046,
    validatedInventions: 7,
    submittedAt: '2026-08-26T14:30:00Z',
  },
  {
    id: 'bench_02',
    playerName: 'MIT LAMM (No Explicit Culture)',
    realm: 'biofoundry',
    condition: 'no_explicit_culture',
    seed: 3202,
    populationN: 200,
    ticksElapsed: 800,
    discoveryFrontierAUC: 0.412,
    portfolioResilience: 0.238,
    heldOutResilienceAUC: 0.048,
    validatedInventions: 8,
    submittedAt: '2026-08-26T14:35:00Z',
  },
  {
    id: 'bench_03',
    playerName: 'MIT LAMM (Independent Envelope)',
    realm: 'biofoundry',
    condition: 'independent_search',
    seed: 3202,
    populationN: 200,
    ticksElapsed: 800,
    discoveryFrontierAUC: 0.342,
    portfolioResilience: 0.174,
    heldOutResilienceAUC: 0.034,
    validatedInventions: 3,
    submittedAt: '2026-08-26T14:40:00Z',
  },
  {
    id: 'bench_04',
    playerName: 'MIT LAMM (Full Culture 3200T)',
    realm: 'biofoundry',
    condition: 'full_culture',
    seed: 3301,
    populationN: 100,
    ticksElapsed: 3200,
    discoveryFrontierAUC: 0.445,
    portfolioResilience: 0.248,
    heldOutResilienceAUC: 0.044,
    validatedInventions: 6,
    submittedAt: '2026-08-26T15:00:00Z',
  },
  {
    id: 'bench_05',
    playerName: 'MIT LAMM (AshenRealm)',
    realm: 'ashenrealm',
    condition: 'full_culture',
    seed: 1703,
    populationN: 50,
    ticksElapsed: 800,
    discoveryFrontierAUC: 0.248,
    portfolioResilience: 0.148,
    heldOutResilienceAUC: 0.028,
    validatedInventions: 4,
    submittedAt: '2026-08-26T15:30:00Z',
  },
  {
    id: 'bench_06',
    playerName: 'MIT LAMM (Protein Realms Pilot)',
    realm: 'proteinrealms',
    condition: 'no_communication',
    seed: 3801,
    populationN: 50,
    ticksElapsed: 800,
    discoveryFrontierAUC: 0.363,
    portfolioResilience: 0.215,
    heldOutResilienceAUC: 0.035,
    validatedInventions: 3,
    submittedAt: '2026-08-26T16:00:00Z',
  },
];
