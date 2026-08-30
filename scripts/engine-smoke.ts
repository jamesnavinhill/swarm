/**
 * Headless engine smoke test — verifies fork naming, realm-reactive controllers,
 * condition gates, and honestly computed metrics. Run with: npx tsx scripts/engine-smoke.ts
 */
import { SwarmEngine } from '../src/simulation/engine/SwarmEngine';
import type { ConditionType, RealmType } from '../src/types';

function check(cond: boolean, label: string) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  if (!cond) process.exitCode = 1;
}

// ---- 1. Full-culture run: fork naming + honest metrics -------------------
const e = new SwarmEngine('biofoundry', 'full_culture', 50, 3202);
for (let i = 0; i < 800; i++) e.tickStep();

const programs = new Map<string, { name: string; installCount: number }>();
for (const a of e.artifacts) if (a.program) programs.set(a.program.id, a.program);
const names = [...programs.values()].map(p => p.name);
const runaway = names.filter(n => (n.match(/\sv\d+/g) || []).length > 1);

check(e.artifacts.length > 0, `artifacts constructed (${e.artifacts.length})`);
check(programs.size > 0, `programs installed (${programs.size})`);
check(runaway.length === 0, `no runaway "v2 v2 v2" fork names (${runaway.length} found)`);
console.log('   sample names:', names.slice(0, 5));

const forkEdges = e.provenanceGraph.edges.filter(x => x.type === 'forked');
check(forkEdges.length > 0, `fork edges recorded (${forkEdges.length})`);

const last = e.metricsHistory[e.metricsHistory.length - 1];
check(last.currentServiceCoverage !== Number((last.portfolioResilience * 0.85).toFixed(4)),
  `currentServiceCoverage computed independently (Q=${last.currentServiceCoverage}, P=${last.portfolioResilience})`);
check(last.maxForkDepth >= 1, `maxForkDepth measured from DAG (${last.maxForkDepth})`);
check(last.crossAgentForkFraction >= 0 && last.crossAgentForkFraction <= 1,
  `crossAgentForkFraction in range (${last.crossAgentForkFraction})`);

// ---- 2. Realm-reactive controllers ----------------------------------------
const realms: RealmType[] = ['biofoundry', 'ashenrealm', 'proteinrealms'];
const seenPrograms = new Set<string>();
for (const r of realms) {
  const eng = new SwarmEngine(r, 'full_culture', 50, 3202);
  for (let i = 0; i < 220; i++) eng.tickStep();
  const built = eng.artifacts.filter(a => a.creatorId !== 'agent_000018' && a.program);
  const namesHere = [...new Set(built.map(a => a.program!.name))];
  namesHere.forEach(n => seenPrograms.add(n));
  console.log(`   ${r}: programs seen ->`, namesHere.slice(0, 3));
}
check(seenPrograms.size >= 3, `realm-specific controller names (${seenPrograms.size} distinct)`);

// ---- 3. Condition gates -----------------------------------------------------
const noCulture = new SwarmEngine('biofoundry', 'no_explicit_culture' as ConditionType, 50, 3202);
for (let i = 0; i < 800; i++) noCulture.tickStep();
const noCultureForks = noCulture.provenanceGraph.edges.filter(x => x.type === 'forked').length;
check(noCultureForks === 0, `no_explicit_culture disables program forking (${noCultureForks} forks)`);

const noComm = new SwarmEngine('biofoundry', 'no_communication', 50, 3202);
for (let i = 0; i < 800; i++) noComm.tickStep();
const noCommForks = noComm.provenanceGraph.edges.filter(x => x.type === 'forked').length;
const noCommTeach = noComm.agents.reduce((acc, a) => acc + a.memory.filter(m => m.type === 'TEACHING').length, 0);
check(noCommForks > 0, `no_communication keeps program forking (${noCommForks} forks)`);
check(noCommTeach === 0, `no_communication disables explicit teaching (${noCommTeach} TEACHING records)`);

console.log(process.exitCode ? '\nSMOKE FAILURES PRESENT' : '\nALL SMOKE CHECKS PASSED');
