/**
 * Async LLM proposal scheduler. Runs OUTSIDE the synchronous tick loop: it
 * polls for agents approaching their next macroturn, requests proposals from
 * the gateway (strictly rate-limited to stay inside free-model limits), and
 * injects validated plans into engine.llmPlans for consume-on-replan.
 *
 * When LLM mode is off this scheduler is never started — the engine runs the
 * original deterministic heuristic planner with zero behavioral change.
 */

import type { SwarmEngine } from '../engine/SwarmEngine';
import type { Agent } from '../../types';
import { isLlmAgentsEnabled } from './gatewayClient';
import { proposePlan } from './llmPlanner';

const MACROTURN_INTERVAL = 50;
const LOOKAHEAD_TICKS = 60;
const MIN_REQUEST_INTERVAL_MS = 3000;
const MAX_AGENTS_PER_SWEEP = 2;

const nextReplanTick = (engine: SwarmEngine, agent: Agent): number => {
  const offset = (engine.tick - agent.macroturnPhase) % MACROTURN_INTERVAL;
  const cycle = Math.floor((engine.tick - agent.macroturnPhase) / MACROTURN_INTERVAL);
  const lastPlannedCycle = (agent as unknown as { plannedCycle?: number }).plannedCycle ?? -1;
  // Agents that already planned this cycle are not due again until the next window.
  if (offset === 0 && cycle !== lastPlannedCycle) return engine.tick;
  return engine.tick + (MACROTURN_INTERVAL - offset);
};

class LlmScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastRequestAt = 0;
  private cursor = 0;

  start(engine: SwarmEngine) {
    if (this.timer) return;
    this.timer = setInterval(() => this.sweep(engine), 2000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async sweep(engine: SwarmEngine) {
    if (!isLlmAgentsEnabled() || !engine.isRunning) return;
    if (Date.now() - this.lastRequestAt < MIN_REQUEST_INTERVAL_MS) return;

    const due = engine.agents
      .map((agent) => ({ agent, due: nextReplanTick(engine, agent) }))
      .filter(({ due }) => due - engine.tick <= LOOKAHEAD_TICKS)
      .filter(({ agent }) => !engine.llmPlans.has(agent.id));

    if (due.length === 0) return;

    // Round-robin so every agent class gets proposals over time.
    due.sort((a, b) => a.due - b.due);
    const picks = due
      .slice(this.cursor % due.length)
      .concat(due.slice(0, this.cursor % due.length))
      .slice(0, MAX_AGENTS_PER_SWEEP);
    this.cursor += picks.length;

    for (const { agent, due: dueTick } of picks) {
      this.lastRequestAt = Date.now();
      const proposal = await proposePlan(engine, agent);
      if (!proposal) continue;
      const cycle = Math.floor((dueTick - agent.macroturnPhase) / MACROTURN_INTERVAL);
      engine.llmPlans.set(agent.id, { cycle, plan: proposal.plan, message: proposal.message });
    }
  }
}

export const llmScheduler = new LlmScheduler();
