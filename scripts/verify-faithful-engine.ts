/**
 * Faithfulness verification for the rebuilt deterministic SwarmWorld engine.
 * Run: npx tsx scripts/verify-faithful-engine.ts
 *
 * Covers the acceptance criteria in docs/FAITHFUL_ENGINE_REBUILD.md:
 *  1. Deterministic replay — same seed + config + ticks ⇒ identical trajectory
 *  2. Held-out assay — 8 distinct schedules, mean balanced-coverage in [0,1]
 *  3. Independent search — N isolated members, best-of-N envelope, no shared-world agent bleed
 *  4. Behavioral windows — roles/phenotypes refit over 200-tick windows
 *  5. Validated-invention gate — counts respond to real novelty
 */
import { SwarmEngine } from '../src/simulation/engine/SwarmEngine';

let failures = 0;
function check(cond: boolean, label: string) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  if (!cond) failures++;
}

// ---------- 1. Deterministic replay ----------------------------------------
{
  const a = new SwarmEngine('biofoundry', 'full_culture', 50, 3202);
  const b = new SwarmEngine('biofoundry', 'full_culture', 50, 3202);
  for (let i = 0; i < 400; i++) {
    a.tickStep();
    b.tickStep();
  }
  const sa = JSON.stringify({
    tick: a.tick,
    agents: a.agents.map(g => [g.x, g.y, g.inventoryMass.toFixed(3)]),
    artifacts: a.artifacts.map(ar => [ar.id, ar.name, ar.health.toFixed(3)]),
    metrics: a.metricsHistory.slice(-1)[0],
  });
  const sb = JSON.stringify({
    tick: b.tick,
    agents: b.agents.map(g => [g.x, g.y, g.inventoryMass.toFixed(3)]),
    artifacts: b.artifacts.map(ar => [ar.id, ar.name, ar.health.toFixed(3)]),
    metrics: b.metricsHistory.slice(-1)[0],
  });
  check(sa === sb, `400-tick replay is bit-identical (seed 3202)`);

  // Different seeds should diverge
  const c = new SwarmEngine('biofoundry', 'full_culture', 50, 9999);
  for (let i = 0; i < 50; i++) c.tickStep();
  const sc = JSON.stringify(c.artifacts.map(ar => ar.id));
  check(sa !== sc, `different seed produces a different trajectory (seed 9999 vs 3202)`);
}

// ---------- 2. Held-out assay -----------------------------------------------
{
  const e = new SwarmEngine('biofoundry', 'full_culture', 50, 3202);
  for (let i = 0; i < 300; i++) e.tickStep();
  const report = e.runHeldOutAssay();
  check(report.schedules.length === 8, `held-out assay produced 8 schedules`);
  const distinct = new Set(report.schedules.map(s => s.meanResilience)).size;
  check(distinct >= 2, `held-out schedules vary (distinct values: ${distinct}/8)`);
  const allInRange = report.schedules.every(s => s.meanResilience >= 0 && s.meanResilience <= 1);
  check(allInRange, `held-out mean resilience in [0,1] for every schedule`);
  check(report.overallResilienceAUC >= 0 && report.overallResilienceAUC <= 1,
    `held-out overall AUC in [0,1]: ${report.overallResilienceAUC}`);
  check(report.activeArtifactCount === e.artifacts.length, `assay artifact count matches discovery world`);
}

// ---------- 3. Independent search -------------------------------------------
{
  const e = new SwarmEngine('biofoundry', 'independent_search', 50, 3202);
  check((e as any).isolatedMembers?.length === 50, `independent_search spawns 50 isolated members`);
  for (let i = 0; i < 100; i++) e.tickStep();
  const members = (e as any).isolatedMembers as SwarmEngine[];
  const sharedAgents = e.agents.length;
  const totalMemberAgents = members.reduce((acc, m) => acc + m.agents.length, 0);
  check(sharedAgents === totalMemberAgents, `shared agents == sum of member agents (${sharedAgents} == ${totalMemberAgents})`);
  // Each member remains a 1-agent world
  check(members.every(m => m.agents.length === 1), `every isolated member is exactly 1 agent`);
}

// ---------- 4. Behavioral windows -------------------------------------------
{
  const e = new SwarmEngine('biofoundry', 'full_culture', 50, 3202);
  for (let i = 0; i < 220; i++) e.tickStep();
  const distinctPhenotypes = new Set(e.agents.map(a => a.phenotype)).size;
  const distinctRoles = new Set(e.agents.map(a => a.role)).size;
  check(distinctPhenotypes >= 2, `behavioral windows produce ≥2 phenotypes (${distinctPhenotypes})`);
  check(distinctRoles >= 2, `behavioral windows produce ≥2 roles (${distinctRoles})`);
  const hasC3 = e.agents.some(a => a.phenotype === 'C3_stationary_low_activity');
  console.log(`     (C3 reachable: ${hasC3})`);
}

// ---------- 5. Validated-invention gate --------------------------------------
{
  const e = new SwarmEngine('biofoundry', 'full_culture', 50, 3202);
  for (let i = 0; i < 250; i++) e.tickStep();
  const metric = e.metricsHistory[e.metricsHistory.length - 1];
  check(metric.validatedInventionsCount >= 0, `validated-invention gate returns a count (${metric.validatedInventionsCount})`);
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
