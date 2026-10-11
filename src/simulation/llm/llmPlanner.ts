/**
 * LLM agent planning for SwarmWorld (SwarmWorld paper §4.1: the proposal–
 * consequence split). The deterministic consequence engine is untouched —
 * the LLM only PROPOSES action plans and communication phrasing at
 * macroturn boundaries; every consequence stays in SwarmEngine.
 *
 * Plans are injected into the engine's pending map and consumed exactly once
 * at the agent's next replan. When LLM mode is off (or a request fails), the
 * engine falls through to the original heuristic plan builder — determinism
 * and the bit-identical replay guarantees are unaffected.
 */

import type { SwarmEngine } from '../engine/SwarmEngine';
import type { Agent } from '../../types';
import { gatewayChat } from './gatewayClient';

/**
 * The exact action vocabulary SwarmEngine.executeAtomicAction understands.
 * MOVE_TOWARDS_x_y carries coordinates; everything else is a fixed token.
 */
const ATOMIC_ACTIONS = [
  'EXPLORE_STEP',
  'HARVEST_RESOURCE',
  'FABRICATE_BATCH',
  'TEST_BATCH',
  'CONSTRUCT_ARTIFACT',
  'FORK_PROGRAM',
  'INSTALL_PROGRAM',
  'INSPECT_ARTIFACT',
  'REPAIR_ARTIFACT',
  'COMMUNICATE_EVIDENCE',
  'WAIT',
] as const;

const MAX_PLAN_LENGTH = 12;

export interface AgentLlmPlan {
  plan: string[];
  message?: string;
}

interface PlanResponse {
  plan?: string[];
  message?: string;
}

const actionsAllowedUnderCondition = (condition: string, action: string): boolean => {
  if (action === 'COMMUNICATE_EVIDENCE') return condition === 'full_culture';
  if (action === 'FORK_PROGRAM' || action === 'INSTALL_PROGRAM') {
    return condition === 'full_culture' || condition === 'no_communication';
  }
  return true;
};

/** Validates an LLM response into a safe plan; returns null when unusable. */
export const parseLlmPlan = (
  raw: string,
  condition: string
): AgentLlmPlan | null => {
  let parsed: PlanResponse;
  try {
    parsed = JSON.parse(raw) as PlanResponse;
  } catch {
    return null;
  }

  if (!Array.isArray(parsed.plan)) return null;

  const plan: string[] = [];
  for (const entry of parsed.plan) {
    if (typeof entry !== 'string') continue;
    const action = entry.trim();
    if (action.length === 0) continue;
    const isMove = /^MOVE_TOWARDS_\d+_\d+$/.test(action);
    const isKnown = (ATOMIC_ACTIONS as readonly string[]).includes(action);
    if (!isMove && !isKnown) continue;
    if (!actionsAllowedUnderCondition(condition, action)) continue;
    plan.push(action);
    if (plan.length >= MAX_PLAN_LENGTH) break;
  }

  if (plan.length === 0) return null;

  const message =
    typeof parsed.message === 'string' && parsed.message.trim()
      ? parsed.message.trim().slice(0, 160)
      : undefined;

  return { plan, message };
};

/** Compact, token-frugal world snapshot for one agent's proposal. */
export const buildProposalPrompt = (engine: SwarmEngine, agent: Agent): string => {
  const nearArtifacts = engine.artifacts
    .map((a) => ({ a, d: Math.hypot(agent.x - a.x, agent.y - a.y) }))
    .filter(({ d }) => d < 16)
    .sort((x, y) => x.d - y.d)
    .slice(0, 3)
    .map(({ a, d }) => `${a.name} health=${a.health.toFixed(2)} dist=${d.toFixed(0)}`);

  const inventory = Object.entries(agent.inventory)
    .filter(([, mass]) => (mass as number) > 0)
    .map(([type, mass]) => `${type}:${(mass as number).toFixed(1)}`)
    .join(', ');

  const recentMemories = agent.memory
    .slice(-3)
    .map((m) => `${m.type}: ${m.content}`)
    .join(' | ');

  return [
    `Agent ${agent.name} (role ${agent.role}) at (${agent.x},${agent.y}).`,
    `Inventory: ${inventory || 'empty'}. InventoryMass: ${agent.inventoryMass.toFixed(2)}.`,
    nearArtifacts.length ? `Nearby artifacts: ${nearArtifacts.join('; ')}.` : 'No artifacts within 16.',
    recentMemories ? `Recent memory: ${recentMemories}` : '',
    `Propose the next macroturn plan (≤8 actions) and one short first-person message this agent could share with peers.`,
  ]
    .filter(Boolean)
    .join('\n');
};

const SYSTEM_PROMPT = `You are the planning module of an autonomous material-forging agent in SwarmWorld, a stigmergic simulation. Choose actions that advance the agent's role: survey and harvest resources, fabricate and test material batches, construct or repair artifacts, and (when allowed) fork programs or share evidence with peers.

Reply with STRICT JSON only:
{"plan": ["ACTION", ...], "message": "short first-person insight"}
Allowed actions: EXPLORE_STEP, HARVEST_RESOURCE, FABRICATE_BATCH, TEST_BATCH, CONSTRUCT_ARTIFACT, FORK_PROGRAM, INSTALL_PROGRAM, INSPECT_ARTIFACT, REPAIR_ARTIFACT, COMMUNICATE_EVIDENCE, WAIT, MOVE_TOWARDS_x_y (integer coords within the 72x54 world).
Plans are at most 8 actions. COMMUNICATE_EVIDENCE and FORK/INSTALL are condition-gated; use them only when the prompt says they are allowed.`;

/**
 * Requests a plan for one agent. Returns null on any failure (the engine
 * falls back to the deterministic heuristic) — never throws to the tick loop.
 */
export const proposePlan = async (
  engine: SwarmEngine,
  agent: Agent
): Promise<AgentLlmPlan | null> => {
  try {
    const user = buildProposalPrompt(engine, agent);
    const allowance =
      engine.condition === 'full_culture'
        ? 'COMMUNICATE_EVIDENCE, FORK_PROGRAM and INSTALL_PROGRAM are allowed.'
        : engine.condition === 'no_communication'
          ? 'FORK_PROGRAM and INSTALL_PROGRAM are allowed; COMMUNICATE_EVIDENCE is not.'
          : 'COMMUNICATE_EVIDENCE, FORK_PROGRAM and INSTALL_PROGRAM are NOT allowed.';
    const raw = await gatewayChat({
      system: SYSTEM_PROMPT,
      user: `${user}\n${allowance}`,
      maxTokens: 300,
    });
    return parseLlmPlan(raw, engine.condition);
  } catch {
    return null;
  }
};
