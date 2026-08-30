/**
 * Deterministic Material Evaluator
 * Evaluates recipes into normalized physical and biological properties.
 * Adheres strictly to paper section S2.3 (Open-ended materials invention).
 */

import { FabricationOperation, FeedstockType, MaterialProperties, MaterialRecipe, RealmType } from '../../types';

export function evaluateMaterialRecipe(recipe: MaterialRecipe, realm: RealmType = 'biofoundry'): MaterialProperties {
  const totalMass = recipe.feedstocks.reduce((acc, f) => acc + f.mass, 0) || 1.0;
  
  // Normalized feedstock fractions
  const frac: Record<string, number> = {};
  for (const f of recipe.feedstocks) {
    frac[f.type] = (f.mass / totalMass);
  }

  const ops = new Set(recipe.operations);
  const opCount = recipe.operations.length;

  let utility = 0.3;
  let quality = 0.5;
  let permeability = 0.4;
  let toughness = 0.4;
  let healing = 0.3;
  let responsiveness = 0.3;
  let stiffness = 0.4;
  let adhesion = 0.3;
  let thermalRegulation = 0.2;
  let proteaseResistance = 0.3;
  let shearResistance = 0.4;

  if (realm === 'biofoundry') {
    const chitin = frac['CHITIN'] || 0;
    const cellulose = frac['CELLULOSE'] || 0;
    const fungus = frac['FUNGUS'] || 0;
    const mineral = frac['MINERAL'] || 0;
    const catalyst = frac['CATALYST'] || 0;
    const kelp = frac['KELP'] || 0;
    const shell = frac['SHELL'] || 0;
    const lignin = frac['LIGNIN'] || 0;

    // Toughness from Chitin and Shell + pressing/crosslinking
    toughness = 0.2 + chitin * 0.45 + shell * 0.35 + (ops.has('PRESS') ? 0.1 : 0) + (ops.has('ALIGN') ? 0.08 : 0);
    
    // Permeability from Cellulose & Porous Fungus vs density
    permeability = 0.2 + cellulose * 0.35 + fungus * 0.25 - (ops.has('PRESS') ? 0.12 : 0) + (ops.has('WEAVE') ? 0.15 : 0);

    // Healing from Mycelial Fungus + Fermentation
    healing = 0.15 + fungus * 0.55 + (ops.has('FERMENT') ? 0.18 : 0) + (ops.has('ALKALINE_TREAT') ? 0.08 : 0);

    // Responsiveness from Catalyst and Kelp
    responsiveness = 0.2 + catalyst * 0.45 + kelp * 0.3 + (ops.has('MINERALIZE') ? 0.1 : 0);

    // Stiffness from Minerals & Lignin
    stiffness = 0.2 + mineral * 0.5 + lignin * 0.35 + shell * 0.25;

    // Processing synergy bonus
    let synergy = 0;
    if (ops.has('WASH') && ops.has('GRIND')) synergy += 0.06;
    if (ops.has('FERMENT') && ops.has('ALIGN')) synergy += 0.08;
    if (ops.has('MINERALIZE') && ops.has('PRESS')) synergy += 0.07;
    if (ops.has('DRY')) synergy += 0.04;

    quality = Math.min(1.0, 0.45 + synergy + (opCount >= 3 ? 0.12 : 0) + (opCount >= 5 ? 0.08 : 0));
    utility = (toughness * 0.28 + permeability * 0.2 + healing * 0.24 + responsiveness * 0.28) * quality;

  } else if (realm === 'ashenrealm') {
    const obsidian = frac['OBSIDIAN'] || 0;
    const iron = frac['IRON_ORE'] || 0;
    const copper = frac['COPPER_ORE'] || 0;
    const basalt = frac['BASALT'] || 0;
    const sulfur = frac['SULFUR'] || 0;
    const flux = frac['LIMESTONE_FLUX'] || 0;

    // Thermal Regulation & Heat Shielding from Obsidian and Refinement
    thermalRegulation = 0.2 + obsidian * 0.6 + copper * 0.2 + (ops.has('CAST') ? 0.12 : 0) + (ops.has('QUENCH') ? 0.1 : 0);

    // Toughness and Structural Load capacity from Iron and Basalt + Forging
    toughness = 0.2 + iron * 0.55 + basalt * 0.3 + (ops.has('FORGE') ? 0.18 : 0) + (ops.has('ANNEAL') ? 0.12 : 0);

    stiffness = 0.3 + iron * 0.45 + obsidian * 0.35 + (ops.has('SMELT') ? 0.15 : 0);
    permeability = Math.max(0.02, 0.2 - obsidian * 0.18 - iron * 0.12 + (ops.has('CRUSH') ? 0.08 : 0));
    healing = 0.05 + sulfur * 0.3 + (ops.has('ANNEAL') ? 0.15 : 0);
    responsiveness = 0.2 + copper * 0.4 + flux * 0.25;

    let synergy = 0;
    if (ops.has('WASH') && (ops.has('SMELT') || ops.has('CRUSH'))) synergy += 0.07;
    if (ops.has('REFINE') && ops.has('CAST')) synergy += 0.09;
    if (ops.has('QUENCH') || ops.has('ANNEAL')) synergy += 0.08;

    quality = Math.min(1.0, 0.4 + synergy + (opCount >= 4 ? 0.15 : 0));
    utility = (thermalRegulation * 0.45 + toughness * 0.35 + responsiveness * 0.2) * quality * 0.9;

  } else if (realm === 'proteinrealms') {
    const peptide = frac['PEPTIDE_PRECURSOR'] || 0;
    const cellulose = frac['CELLULOSE'] || 0;
    const lipid = frac['LIPID'] || 0;
    const buffer = frac['BUFFER'] || 0;
    const crosslinker = frac['CROSSLINKER'] || 0;
    const mineral = frac['MINERAL'] || 0;

    // Biological resistance & matrix elasticity
    proteaseResistance = 0.3 + peptide * 0.35 + crosslinker * 0.3 + (ops.has('CURE') ? 0.15 : 0);
    shearResistance = 0.3 + cellulose * 0.4 + peptide * 0.25 + (ops.has('ALIGN') ? 0.15 : 0);
    toughness = 0.25 + cellulose * 0.35 + mineral * 0.25 + crosslinker * 0.2;
    permeability = 0.2 + cellulose * 0.3 + lipid * 0.2 - (ops.has('CROSSLINK') ? 0.1 : 0);
    healing = 0.3 + peptide * 0.4 + lipid * 0.25 + (ops.has('BLEND') ? 0.1 : 0);
    adhesion = 0.25 + peptide * 0.45 + buffer * 0.15;
    responsiveness = 0.3 + lipid * 0.3 + buffer * 0.25 + (ops.has('EXPRESS') ? 0.1 : 0);

    let synergy = 0;
    if (ops.has('EXPRESS') && ops.has('PURIFY')) synergy += 0.08;
    if (ops.has('BLEND') && ops.has('CROSSLINK')) synergy += 0.10;
    if (ops.has('ALIGN') && ops.has('CURE')) synergy += 0.08;

    quality = Math.min(1.0, 0.45 + synergy + (opCount >= 4 ? 0.14 : 0));
    utility = (proteaseResistance * 0.35 + shearResistance * 0.35 + toughness * 0.3) * quality;
  }

  return {
    utility: Number(Math.max(0.05, Math.min(0.98, utility)).toFixed(4)),
    quality: Number(Math.max(0.1, Math.min(1.0, quality)).toFixed(4)),
    permeability: Number(Math.max(0.02, Math.min(0.95, permeability)).toFixed(4)),
    toughness: Number(Math.max(0.05, Math.min(0.98, toughness)).toFixed(4)),
    healing: Number(Math.max(0.02, Math.min(0.95, healing)).toFixed(4)),
    responsiveness: Number(Math.max(0.05, Math.min(0.95, responsiveness)).toFixed(4)),
    stiffness: Number(Math.max(0.05, Math.min(0.98, stiffness)).toFixed(4)),
    adhesion: Number(Math.max(0.05, Math.min(0.95, adhesion)).toFixed(4)),
    thermalRegulation: Number(Math.max(0.05, Math.min(0.98, thermalRegulation)).toFixed(4)),
    heatResistance: Number(Math.max(0.05, Math.min(0.98, thermalRegulation)).toFixed(4)),
    proteaseResistance: Number(Math.max(0.05, Math.min(0.98, proteaseResistance)).toFixed(4)),
    shearResistance: Number(Math.max(0.05, Math.min(0.98, shearResistance)).toFixed(4)),
  };
}

export function validateInventionCriteria(
  materialProps: MaterialProperties,
  claimedFunction: string,
  architecture: string,
  bioInspiration: string,
  hasProgram: boolean,
  lifetimePeakScore: number,
  noveltyScore: number
): boolean {
  const testedRecipeValid = materialProps.utility >= 0.25 && materialProps.quality >= 0.4;
  const specFieldsPresent = claimedFunction.trim().length > 5 && architecture.trim().length > 5 && bioInspiration.trim().length > 5;
  const performanceAboveThreshold = lifetimePeakScore >= 0.20;
  const noveltyAboveThreshold = noveltyScore >= 0.15;

  return testedRecipeValid && specFieldsPresent && hasProgram && performanceAboveThreshold && noveltyAboveThreshold;
}
