# SwarmWorld → General Simulation Platform: Research & Proposal

**Date:** 2026-09-28
**Method:** live verification of ~60 repos (GitHub API: stars, license, last push) across four research tracks — LLM-agent/society simulators, RL env & post-training platforms, eval harnesses, and engine-architecture building blocks. All repo facts point-in-time Sept 2026.

---

## 1. Where SwarmWorld stands today

`swarmworld` is a client-side React 19 + Vite + TS app implementing **one** simulation: a faithful deterministic rebuild of the MIT LAMM *SwarmWorld* paper (arXiv:2608.26081). Strengths worth preserving:

- **Deterministic, seeded replay** — same seed + config + tick count ⇒ bit-identical trajectory (verified by `scripts/verify-faithful-engine.ts`, 14/14 checks).
- **Proposal–consequence separation** — agents/UI only *propose*; the deterministic engine owns consequences. This is architecturally the right idea and the whole industry converges on variants of it.
- **Honest metrics** — no fabricated paper numbers in live UI; held-out assays are actually computed (`cloneForAssay`, 288 physics ticks × 8 schedules).
- Engine ~1,700 lines (`SwarmEngine.ts`, `virtualMachine.ts`, `materialEvaluator.ts`, `realmsData.ts`) with real math docs (`SIMULATION_ENGINE_MATH.md`).

Limitations that block the general-simulator goal:

- **One sim, hardcoded.** `SwarmEngine` is the app; there is no `Simulation` interface, no sim registry, no pack/config system.
- **Engine welded to the browser.** Runs live in React state + localStorage; no headless mode, no server, no batch runs, no run persistence beyond JSON exports.
- **UI is app-shaped, not platform-shaped.** Six tabs of one game; no run management, no cross-run comparison, no replay scrubbing, no way to add a second sim type without rewriting the shell.
- **No LLM tier.** Deliberately deferred (docs/FAITHFUL_ENGINE_REBUILD.md §6); needs a server proxy anyway, which doesn't exist.

**Verdict:** the engine's *principles* are validated by the research below (determinism + replay + proposal/consequence is exactly what OSS lacks); the *codebase shape* (single-sim SPA) is not the platform shape. Extract the engine as the first sim pack; build the platform around it.

## 2. Design direction (from `assets/design/`)

The four refs agree on one language: **retro scientific instrument / mission control.**

- Dark charcoal/navy field; amber, gold, and phosphor-red accents (`design-ref-2` 1970s computer-architecture textbook; `design-ref-1` gold-on-black maritime schematics).
- Monospace uppercase micro-labels, dot-matrix numerals, thin technical rules and leader-lines (schematic annotation style).
- Layout grammar (ui.png): top status bar (system time / active agents / model status), **central world viewport** ringed by telemetry panels (model output, agent network, system log, scenario sim, diagnostics), bottom nav: Dashboard / Agents / Scenarios / Data Feeds / System / Settings.
- `design-ref-3` adds the editorial/data-storytelling layer: dot-matrix hero numerals, two-column annotation blocks.

This maps 1:1 onto the platform UI: viewport = live sim render; panels = metrics, event log, agent inspector, diagnostics; nav = Runs / Worlds / Scenarios / Data / System.

## 3. Landscape (verified Sept 2026)

### 3.1 LLM-agent & agent-based simulation frameworks

| Project | Repo | License | Status | Key idea |
|---|---|---|---|---|
| Mesa 3 (+ mesa-llm) | github.com/mesa/mesa | Apache-2.0 | very active (v3.5.1, Mesa 4 in dev) | cleanest engine→data→batch→viz separation in the field; AgentSets, per-agent seeded RNG, DataCollector, `mesa batch`, SolaraViz |
| AgentSociety 2 | github.com/tsinghua-fib-lab/AgentSociety | Apache-2.0 (excl. commercial/) | fastest-moving LLM sim platform (weekly releases) | stateless agents on Ray, reasoning routers, JSONL+DuckDB experiment replay, tracing |
| OASIS | github.com/camel-ai/oasis | Apache-2.0 | active (v0.2.5) | environment-as-platform (social DB as world state), `ManualAction`/`LLMAction` duality for cost-tiered agent populations |
| Concordia | github.com/google-deepmind/concordia | Apache-2.0 | active (v2.4) | Game-Master-mediated natural-language physics; Entity/Component agent assembly; most conceptually general |
| krABMaga | github.com/krABMaga/krABMaga | MIT | active, small | Rust DES re-engineered from MASON; built-in sweeps/Bayesian opt; WASM browser viz |
| Dead/toy | Generative Agents (frozen 2024), AI Town (starter kit), AgentVerse, ChatArena, TinyTroupe (persona toolkit), Project Sid (closed) | | | cite, don't build on them |

**Gaps nobody covers:** heterogeneous time models; deterministic replay with LLM-response caching; real-time 10k-agent visualization; production run-management web UI; native eval/RL integration; cost/latency budgeting across an agent population.

### 3.2 RL environments & post-training platforms

| Project | Repo | License | Status | Key idea |
|---|---|---|---|---|
| Gymnasium (+ PettingZoo) | github.com/Farama-Foundation/Gymnasium | MIT | very active | the universal `reset(seed)/step(action)` contract + typed spaces + registry + vectorization; shape our headless API on it |
| OpenEnv | github.com/huggingface/OpenEnv | BSD-3 | very active (2025-26 newcomer) | **env-as-a-service**: Dockerized FastAPI/WebSocket env servers, typed Action/Observation models, `openenv` CLI, HF Spaces distribution, built-in WebSocket human-interaction web UI — closest existing thing to "sim packs with a web UI" |
| verifiers + Environments Hub | github.com/PrimeIntellect-ai/verifiers | MIT | very active (v1 rewrite) | cleanest plugin spec: one `vf.Taskset` export, `@vf.reward`/`@vf.metric` over typed traces, `vf.Runtime` abstraction (Docker/Modal/host), registry push/pull |
| Harbor | github.com/harbor-framework/harbor | Apache-2.0 | hottest 2026 infra (v0.23, 500-concurrent CI) | task = directory (task.toml + Dockerfile + verifier writes reward.txt); ATIF trajectory format; sandbox-provider abstraction; adopted by SkyRL/rllm/NeMo Gym |
| verl | github.com/verl-project/verl | Apache-2.0 | extremely active (v0.9.1) | single-controller + worker-group placement; async agent-loop rollouts; the control-plane shape for batch |
| NeMo Gym | github.com/NVIDIA-NeMo/Gym | Apache-2.0 | very active | environment = dataset + harness + verifier + state as separate services; OTel tracing; re-verify stored rollouts without re-inference |
| Traps | Isaac Sim (proprietary; Isaac Lab BSD-3 unusable without it), Unity ML-Agents (alive but ~1 release/yr), NLE (archived), Crafter (dormant), Melting Pot (maintenance mode), Brax (superseded by MJX) | | | |

### 3.3 Eval harnesses & run infrastructure

| Project | Repo | License | Status | Key idea |
|---|---|---|---|---|
| Inspect AI | github.com/UKGovernmentBEIS/inspect_ai | MIT | de-facto consensus core (vivaria is sunsetting into it) | versioned **`.eval` log** (incremental writes during run, zstd, remote stores); Task/Solver/Scorer contract; **control channel** (live interim scoring, cancel/drain); human reviewer/approvals; `inspect view` tailing app |
| Harbor | (above) | | | task packages + trajectory interchange + Hub registry/leaderboards; regrade without re-run |
| METR Task Standard | github.com/METR/task-standard | MIT | frozen v0.5, best spec | TaskFamily: install/start/**intermediate_score**/score/aggregate + permission levels + resource manifest |
| τ²/τ³-bench | github.com/sierra-research/tau2-bench | MIT | active | dual-control episodes (LLM user simulator ↔ agent); multi-signal scoring (DB checks + action match + judge); versioned regrading hygiene |
| EvalScope | github.com/modelscope/evalscope | Apache-2.0 | very active | under-appreciated; agent-trace React dashboard + external agent bridge |
| Observability sidecars | Langfuse (now ClickHouse-owned, core MIT), Opik (Apache-2.0), Phoenix (⚠ Elastic v2) | | | OTel GenAI is the emerging interchange; Opik is the safe embed |

**Gaps:** human-observation-in-the-loop live console is unoccupied territory; no server-backed run registry with websocket push in OSS; mid-episode scoring rare (METR + Inspect only); nobody has bit-exact agent-episode replay (model-response caching is the approximation).

### 3.4 Engine architecture building blocks

- **Kernel language.** JS doubles are IEEE-754 but `Math.sin/exp/pow` differ across JS engines ⇒ a TS kernel is deterministic **per engine** (pin Node/V8 as canonical replay host); Rust→WASM is deterministic across engines. Rust (hecs "a library, not a framework"; arrow-rs native Parquet) is the TigerBeetle/Turso-proven shape but doubles implementation surface. **Pragmatic call: TS-first kernel with a hard `Simulation` interface, so a Rust core can replace the executor later without touching packs.**
- **State layout.** ECS is right for the agent layer, wrong for grid/field sims (dense typed arrays are already SoA). Hybrid: fields/grids as first-class typed-array resources; agents as entities; **stable iteration order is non-negotiable for determinism** (Mesa's ordered AgentSet exists for exactly this reason). bitECS (MPL-2.0, built-in serialization) or koota if ECS is wanted in TS; plain structured state is fine to start.
- **Determinism playbook (DST lineage: TigerBeetle, Antithesis, madsim, Turso/Limbo).** One root seed → derived streams (splitmix64/PCG); ban `Math.random`, wall-clock time, unordered `Map` iteration, unordered parallel reduce; tick counter is the clock; **replay = seed + input log + snapshot chain + code SHA + schema version** (seekable: binary-search snapshots, replay tail); DST in CI (N short seeded runs per push, nightly soak; seed+log IS the bug report).
- **Data & telemetry.** Apache Arrow/Parquet (zstd) per run, partitioned `run_id/part-*.parquet`; **DuckDB-Wasm** (MIT) queries Parquet over HTTP range requests — the experiment dashboard needs no backend; IndexedDB as client ring buffer for replay scrubbing.
- **Streaming to UI.** WebSocket binary frames with versioned schema (tick, dirty flags, SoA payload) or Arrow IPC record batches; SharedArrayBuffer (COOP/COEP) when available, transferable double-buffered `postMessage` fallback.
- **Rendering.** **PixiJS v8** (MIT, WebGPU+WebGL, `ParticleContainer` eats 100k sprites, runs on OffscreenCanvas in a Worker) for 2D grid+heatmap+agents — the pick. three.js only for 3D worlds; regl (frozen) and deck.gl (unless geo) rejected.
- **Batch experiments.** Sweeps of deterministic sims are embarrassingly parallel: a process pool over (config, seed) pairs + artifact store + run manifest (SQLite/Postgres) is the whole runner; Ray/Hydra/Optuna/SLURM are optional backend adapters, never in the kernel's semantics.

**The verified opportunity:** no OSS project integrates (a) structural determinism, (b) plugin sim types, (c) mission-control web UI, (d) Parquet-native queryable experiments, (e) headless+interactive from one kernel. Each piece exists and is permissively licensed; the integration is the product.

## 4. Recommendation

**New platform core ("greenfield skeleton"), reusing the existing engine as the first sim pack — not a refactor of the SPA, and not a dependency on any single framework above.**

Why not refactor-in-place: the current app's shape (React state machine = the world, localStorage = the persistence, one hardcoded engine) is the thing being replaced; every layer around `SwarmEngine.ts` gets rewritten either way. Why not adopt Mesa/OpenEnv/Concordia as the base: all are Python-or-coupled to their own runtimes (see §3), none stream live state to a rich web UI, and the platform's differentiators (deterministic replay, mission-control UI, multi-sim packs) are exactly the parts we'd have to bolt on anyway. Steal their contracts instead: Gymnasium's reset/step shape, Harbor's task packaging, Inspect's log format, Mesa's DataCollector, DST determinism discipline.

### Architecture

```
┌───────────────────────────  monorepo (pnpm)  ───────────────────────────┐
│                                                                          │
│  packages/kernel        @swarm/kernel        (TS, zero deps)             │
│    Simulation interface: create(config, seed) / step(tick) /            │
│    apply(action) / observe(query) / snapshot() / restore(snap)          │
│    SimContext: seeded RNG streams, virtual clock, event bus,            │
│    metrics collectors, input-log recorder                               │
│    Determinism rules enforced here (lint rule + CI: no Math.random,     │
│    no Date.now, no unsorted Map iteration inside packs)                 │
│                                                                          │
│  packs/swarmworld       faithful port of SwarmEngine.ts + VM +          │
│                         materialEvaluator + realmsData (bit-identical,  │
│                         verified against existing verify script)        │
│  packs/<next>           new sim types — each pack ships: definition,    │
│                         config schema (zod), render adapter, panels     │
│                                                                          │
│  apps/server            Node (Fastify) + WS gateway                     │
│    run registry (SQLite→Postgres), headless runners (worker_threads),   │
│    Parquet/Arrow artifact store, LLM proxy (budget-capped, records      │
│    responses into the run trace ⇒ replay without re-calling), REST+WS   │
│                                                                          │
│  apps/web               React 19 + PixiJS v8 (design refs §2)           │
│    mission-control shell: status bar / central viewport (PixiJS in a   │
│    worker via OffscreenCanvas) / telemetry panels / bottom nav          │
│    runs browser + replay scrubber (snapshot-chain seek)                 │
│    DuckDB-wasm over Parquet for cross-run analytics (Data tab)          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

Key decisions and their grounding:

1. **Sim pack = the plugin unit** (definition + config schema + renderer + panels), inspired by OpenEnv/verifiers packaging but TS-native and in-browser-capable. A pack must run headless in `apps/server` and interactive in `apps/web` from the same code.
2. **Determinism as a kernel-enforced contract**, not a convention — the TigerBeetle/DST discipline from §3.4. Replay = seed + recorded inputs (incl. recorded LLM plans, per FAITHFUL_ENGINE_REBUILD §6) + snapshots + code SHA.
3. **Parquet-first experiment store + DuckDB-wasm** — collapse the "results dashboard" problem; UI queries run artifacts directly over HTTP.
4. **LLM tier lives in the server**: observation schema → action-plan contract → recorded plans → engine stays deterministic. This is the exact extension path already designed in `FAITHFUL_ENGINE_REBUILD.md` §6.
5. **Eval integration later, but shaped now**: pack-level scorer hooks (`@reward`/`@metric` style from verifiers; `intermediate_score` from METR) so a sim type can double as an eval environment; adopt an Inspect-style versioned run-log format.

### Sim-type roadmap (proves "not hardcoded to one type")

1. **SwarmWorld** (faithful port) — stigmergic materials sim; proves field-based worlds + provenance DAG + held-out assays.
2. **Ecology ABM** (predator–prey / epidemic on grids) — cheap second pack that proves generic agents, schedulers, and sweeps; classic Mesa territory.
3. **LLM-agent society** — small social world with OASIS-style ManualAction/LLMAction duality; proves the server LLM proxy + cost tiers + plan-recording replay.
4. **Task/eval world** — agents in controlled task environments with verifier scoring (Harbor/METR-shaped); proves the eval integration.

### Phased plan

- **P0 — Scaffold.** pnpm monorepo, kernel + pack interfaces, determinism lint/CI, engine smoke port.
- **P1 — Kernel + SwarmWorld pack.** Bit-identical port (verify against `scripts/verify-faithful-engine.ts`), headless runner, replay from seed+input log, Parquet artifacts.
- **P2 — Mission-control UI.** Design-ref shell, live PixiJS viewport, inspector, event log, metrics panels, replay scrubber; drive the in-browser kernel.
- **P3 — Server platform.** Run registry, WS gateway, batch sweeps, DuckDB analytics tab, LLM proxy (budget-capped) + plan recording.
- **P4 — Second + third packs** (ecology; then LLM society), exercising the pack API for real; extract anything pack-specific that leaked into the kernel.
- **P5 — Eval + scale.** Scorer hooks, run-log export (Inspect-compatible), optional Ray/SLURM backend adapter.

## 5. What survives from the current repo

- `src/simulation/engine/*` + `src/types/index.ts` + `realmsData.ts` → `packs/swarmworld` (P1 port).
- `docs/SIMULATION_ENGINE_MATH.md`, `FAITHFUL_ENGINE_REBUILD.md` → keep as the pack's spec; the §6 LLM plan becomes P3.
- `scripts/verify-faithful-engine.ts` → the port's acceptance test.
- WorldViewport render ideas, metrics panels, lineage DAG → reference for the new UI (rebuilt on PixiJS, per-pack panels).
- Retired: the tab-app shell, localStorage save manager, Vercel analytics coupling.
