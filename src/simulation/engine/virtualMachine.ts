/**
 * Persistent Artifact Virtual Machine (Straight-line Register VM)
 * Implements Section S2.4 of the SwarmWorld paper:
 * 16 floating point registers clipped to [-4, 4], sensor reads, clamped actuators.
 */

import { ControllerProgram, OperationalFlux, VMInstruction } from '../../types';

export interface VMSensors {
  moisture: number;
  temperature: number;
  contamination: number;
  health: number;
  nutrients: number;
  solar: number;
}

export function createDefaultRegisters(): number[] {
  return new Array(16).fill(0);
}

export function executeControllerStep(
  program: ControllerProgram | undefined,
  registers: number[],
  sensors: VMSensors,
  currentFlux: OperationalFlux
): { newRegisters: number[]; newFlux: OperationalFlux } {
  const regs = [...registers];
  const flux: OperationalFlux = { ...currentFlux };

  if (!program || !program.instructions || program.instructions.length === 0) {
    // Passive baseline execution
    flux.waterCapture = Math.max(0, flux.waterCapture * 0.95);
    flux.contaminantRemoval = Math.max(0, flux.contaminantRemoval * 0.95);
    return { newRegisters: regs, newFlux: flux };
  }

  const instructions = program.instructions.slice(0, 64);

  for (const inst of instructions) {
    const t = inst.targetReg % 16;
    const s1 = (inst.src1 !== undefined ? regs[inst.src1 % 16] : (inst.constantVal ?? 0));
    const s2 = (inst.src2 !== undefined ? regs[inst.src2 % 16] : 0);

    switch (inst.op) {
      case 'SET':
        regs[t] = s1;
        break;
      case 'ADD':
        regs[t] = s1 + s2;
        break;
      case 'SUB':
        regs[t] = s1 - s2;
        break;
      case 'MUL':
        regs[t] = s1 * s2;
        break;
      case 'MAX':
        regs[t] = Math.max(s1, s2);
        break;
      case 'MIN':
        regs[t] = Math.min(s1, s2);
        break;
      case 'CMP_GT':
        regs[t] = s1 > s2 ? 1.0 : 0.0;
        break;
      case 'READ_SENSOR':
        if (inst.sensorName) {
          regs[t] = sensors[inst.sensorName] ?? 0;
        }
        break;
      case 'ACTUATE':
        if (inst.actuatorName) {
          const effort = Math.max(0, Math.min(0.05, regs[t])); // capped at 0.05 per tick
          switch (inst.actuatorName) {
            case 'collect_water':
              flux.waterCapture = Math.min(1.0, flux.waterCapture + effort);
              break;
            case 'remediate':
              flux.contaminantRemoval = Math.min(1.0, flux.contaminantRemoval + effort * 1.5);
              break;
            case 'heal':
              flux.reserveUse = Math.min(1.0, flux.reserveUse + effort * 0.5);
              break;
            case 'adjust_pores':
              flux.thermalRegulation = Math.min(1.0, flux.thermalRegulation + effort);
              break;
            case 'grow':
              flux.structuralSupport = Math.min(1.0, flux.structuralSupport + effort * 0.8);
              break;
            case 'emit_signal':
              flux.nutrientRelease = Math.min(1.0, flux.nutrientRelease + effort);
              break;
          }
        }
        break;
    }

    // Clip register to [-4, 4]
    regs[t] = Math.max(-4.0, Math.min(4.0, isNaN(regs[t]) ? 0 : regs[t]));
  }

  return { newRegisters: regs, newFlux: flux };
}

export function generateProgramId(instructions: VMInstruction[]): string {
  const str = JSON.stringify(instructions);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `prog_${Math.abs(hash).toString(16).padStart(8, '0')}`;
}
