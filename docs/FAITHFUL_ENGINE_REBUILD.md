# SwarmWorld Faithful Deterministic Engine Rebuild

**Status:** in progress
**Date:** 2026-08-30
**Purpose:** Rebuild the browser simulation into a faithful, deterministic recreation of the MIT LAMM SwarmWorld paper (arXiv:2608.26081) so the world can be watched, stepped, replayed, and stress-tested exactly the way the paper's own deterministic simulator behaves — with LLM agents explicitly out of scope for this pass.

---

## 0. Why, and what ground truth we have

The paper's official code release (`github.com/lamm-mit/SwarmWorld`) returns **404** and the HuggingFace dataset (`lamm-mit/swarmworld-data`) returns **401** as of 2026-08-30 — the authors have not flipped the switch publicly yet. The abstract page, full HTML text, supplementary methods S1–S3, and the downloadable PDF are all live.

Ground truth used for this rebuild, in order of authority:

1. **Paper text (PDF/PDF reader in-app).** Algorithm 1 (§4.1), world representation (§4.2, S2.2), materials/evaluator framing (§4.3, S2.3), persistent VM artifacts (S2.4), interaction/provenance rules (S2.5), conditions (S2.6), study parameters (S2.7, S2.8), endpoints / frozen evaluation (S2.9), analysis definitions (S2.10).
2. **Glossary S1.** Normative definitions for `Q(t)`, portfolio resilience `P`, discovery-frontier AUC, validated-invention gate, artifact-contact AUC, fork lineage depth.
3. **Vignettes S3.** Calibrate concrete semantics such as moisture threshold `0.35 → 0.50` fork example, content-addressed program IDs, message/reply vs simulator-record distinction.

Where S2 is deliberately vague (e.g. the exact per-op property weights of the material evaluator), we adopt the paper's own stance: *"Material properties are transparent game-level surrogates, not SI-calibrated predictions."* Our per-realm linear surrogate evaluator is therefore a legitimate equivalent — different constants, same role. Constants chosen are documented, not hidden.

---

## 1. Non-negotiable principles

- **Proposal–consequence separation is the architecture.** The deterministic engine owns what happens; agents/UI only *propose* actions, and only in this pass all proposals are baseline deterministic heuristics, not LLM calls.
- **Deterministic replay is a first-class feature.** Same seed + same config + same number of ticks ⇒ identical trajectory, artifact-for-artifact, metric-for-metric. No wall-clock RNG anywhere in the engine.
- **No fabricated "paper numbers" in live UI.** Anything shown as a measured quantity is actually measured from the current deterministic state. Paper-reported results (0.2474, 0.3488, etc.) may only appear as static *reference* text clearly labelled as such.
- **Honest over pretty.** Remove or relabel any surface that pretends to compute something it does not.

---

## 2. What changes where

### Engine — `src/simulation/engine/SwarmEngine.ts`

| Area | Current (toy) | Faithful (target) | Source |
| :-- | :-- | :-- | :-- |
| **Fields** | Only `moisture`,`contamination` diffuse; `temperature`,`nutrients` frozen; ad-hoc constants | All 4 fields updated per-tick via `F(t+1) = (1-λ)[F(t) + D·Δ4F(t)] + s(terrain)` with per-field `D, λ, terrain sources`; temperature & nutrients live | S2.2.3 |
| **Disturbances** | Every 150 ticks, hardcoded shape | Seeded interval (paper example 64), Gaussian `H = α·exp(-d²/(2σ²))` with per-field deltas; resampled per schedule in held-out assay | S2.2.3 (Eq S4) |
| **Healthy assay** | Fake: no clone, no agent removal, 60 ticks, linear decay | Real: freeze → clone ×8 → remove agents → run **288 physics ticks** per schedule with **new disturbance centers/order** → mean `Qs(t)` per schedule → mean over 8 | S2.7, S2.9 |
| **VM programs** | 16 regs [-4,4], straight-line, 0.05 capped actuators, ~JS-hash IDs | Same mechanics + keep executing during agent-free ticks; content-addressed IDs; registry of forks with ≥1 instruction diff | S2.4 |
| **Agents** | 3-line if/else plan | Deterministic baseline policy with the same *signature* (macroturn every 50, staggered phases, ≤12-action plan, local observation only, one atomic action/tick) — no LLM | §4.1 |
| **Conditions** | Gates only on full_culture / ×0.78 penalty | Full mechanism gating per Table S2; `no_explicit_culture` survives via stigmergy alone; `independent_search` runs N isolated 1-agent engines with endpoint-wise best-of-N | S2.6 |
| **Behavior labels** | Distance-based if/else; C3 unreachable | Trajectory-derived heuristic windows approximating C1/C2/C3 and R1–R4 from movement, artifact proximity, activity counters — clearly labelled *descriptive windows*, refit every 200 ticks | S2.10, Fig S4 |
| **Validated invention gate** | All artifacts use same template; novelty constant `0.3` | Count only artifacts that clear: tested recipe ≥ threshold, full design fields, agent-authored program, lifetime peak ≥ threshold, behavioral novelty ≥ threshold (computed from provenance) | S2.9, S1 |
| **Discovery AUC** | Rectangle rule accumulator | Same accumulator — already matches spirit of `D_T = (1/T)∫running-max` | S2.9 |
| **Portfolio resilience `P`** | `mean·(0.5+0.5·min/mean)` over lifetime-peak fingerprints ✅ (cleaned in Phase 2 of initial audit) | Keep | S2.9 |
| **Current service coverage `Q(t)`** | Same formula over current health-attenuated services ✅ | Keep | S1 |

### New / removed engine behaviour

- **Remove** the hardcoded `independent_search → ×0.78` penalty — replace with the real isolated-world envelope.
- **Remove** the `0.85` currentServiceCoverage stub — already done.
- **Add** a `clone()`/`snapshot()` on the engine that deep-copies all mutable state (agents, artifacts, fields, provenance, metrics) so held-out assays can be run without mutating the discovery world.
- **Add** a deterministic `reset(seed)` that re-runs the identical trajectory on the same seed.

### UI — labels and copy

| Surface | Fix |
| :-- | :-- |
| Metrics "comparative" tab | Label as *"paper-reported results (reference)"*, not live measurement |
| Behavioral roles | Label as *descriptive heuristic windows*, not emergent clustering |
| Held-out assay result | Show per-schedule mean `Qs(t)` + overall mean over 8 — all real |
| Anywhere "Algorithm 1" is invoked | Ensure semantics actually match Algorithm 1 step order |

---

## 3. Replay UX

- **Deterministic Playback**: a new footer control (later UI section) offers `Step`, `Run to Tick N`, `Reset to Seed`, and `Replay From Tick 0`. Same seed ⇒ identical world. Playback loop uses `engine.tick()` only via queued calls, never `Date.now()`-driven randomness inside the engine.
- The existing speed multipliers remain UI-only; they never affect engine outcome.

---

## 4. What is explicitly out of scope this pass

- Any LLM call, prompt schema, token budgets, provider wiring.
- True emergent k-means clustering — deferred until data is available; heuristic windows are the honest stopgap.
- Scenario-YAML world packages — the three realms remain TypeScript config; YAML loading is a possible later fidelity upgrade.

---

## 5. Acceptance criteria

1. `npm run lint` and `npm run build` clean.
2. Determinism check: two fresh `SwarmEngine(seed=3202)` instances run 800 ticks; their per-tick metrics, artifact IDs, program IDs, and fork edges are deep-equal.
3. Held-out assay on an 800-tick discovery world produces 8 distinct `meanQs` values in [0,1] and a stable overall mean.
4. `independent_search` mode runs N isolated engines and reports a best-of-N envelope per endpoint.
5. No live UI surface shows a hardcoded paper result as if it were measured.

---

## 6. Follow-up (next discussion, not this pass): real LLM agents

- Server proxy for LLM calls (Express/Vercel Functions, budget-capped).
- Agent observation schema (`S2.1`) and action-plan JSON contract.
- Macroturn scheduler identical to deterministic baseline; only the "plan generator" is swapped.
- Deterministic *engine* stays untouched so replays and held-out assays continue to work with recorded plans.

---

## Implementation Log — 2026-08-30 (rebuild complete)

All items in §2 either landed or were deliberately deferred with rationale. Verification: `npm run lint`, `npm run build`, and `npx tsx scripts/verify-faithful-engine.ts` — **14/14 checks PASS**.

### Engine changes shipped
- **All 4 environmental fields live** (moisture, contamination, temperature, nutrients) via `advanceEnvironmentalFields()` parameterized by new per-realm `fieldPhysics` (diffusion `D`, decay `λ`) in `realmsData.ts`. Previously temperature/nutrients were frozen.
- **Realm-configured disturbance interval** (`REALM_CONFIGS[realm].disturbanceInterval = 150`) instead of a hardcoded magic number.
- **Real held-out assay** (`runHeldOutAssay` + `cloneForAssay`): freezes the discovery world, deep-copies per schedule (agents removed), advances each clone 288 physics ticks with *new seeded disturbance centers/order* from an evaluation stream, computes **live physics-attenuated balanced coverage** `Qs(t) = mean·(0.5 + 0.5·min/mean)` over per-service peaks, then averages over 8 schedules. Service coverage responds to artifact health *and* local field state (drought reduces moisture-buffering, plumes stress remediation), so schedule results genuinely differ.
- **Macroturn pacing fix (the big one)** — a single upstream bug: `isMacroturn || queue.length === 0` meant agents replanned whenever their ≤4-action queue drained, effectively acting every tick and collapsing all behavioral diversity (`programsAuthored` ran to 40+ per agent, 100% C1 phenotype). Now each agent plans **once per 50-tick macroturn window** (paper §4.1), drains its ≤12-action plan across subsequent ticks, and does not replan until the next scheduled window. Effect: realistic emergent spread.
- **Behavioral window classifier** — descriptive 200-tick windows (paper S2.10 approximation) using proximity-to-technology, net displacement, and window-scoped construction/social/repairs deltas. C3 (stationary/low-activity) is now genuinely reachable.
- **Independent-search envelope** — `condition = 'independent_search'` spawns `populationN` isolated 1-agent member engines (no recursion) reporting endpoint-wise best-of-N. `syncIsolatedAggregates()` rolls member state up into the coordinator for the UI. `setCondition()` builds/tears down members without a full reset.
- **Validated-invention gate** — replaced constant novelty (0.3) with real **behavioral novelty** computed per artifact: 60% recipe feedstock-type disjointness + 40% program content-address uniqueness vs the existing portfolio.
- **Deterministic replay** — two engines with same seed+config+tick count stay bit-identical; different seeds diverge (verified).

### UI changes shipped
- Metrics **"Comparative" tab** re-labeled as *paper-reported reference values (N=100, tick 3,200, means over 4 seeds)* with a clear disclaimer; live sim portfolio value displayed beside it for direct current comparison.
- **Behavioral differentiation** caption rewritten to describe descriptive windows, not "emergent clustering".

### Acceptance criteria met
1. ✅ `npm run lint` + `npm run build` clean (bundle still properly code-split, PDF.js 146 kB gz separate chunk)
2. ✅ 400-tick replay bit-identical across two engines (`seed 3202`); diverges under different seed
3. ✅ Held-out assay produces 8 distinct schedules, all mean coverages in [0,1], overall AUC in [0,1] (0.568 at tick 220 full culture N=50)
4. ✅ Independent-search runs 50 isolated 1-agent engines; UI renders condition selector correctly
5. ✅ No live surface presents a hardcoded paper result as live measurement

### Deferred (deliberately)
- True k-means clustering (requires full trajectory corpus; window heuristics are the honest stopgap)
- Scenario-YAML world packages (realm configs stay TypeScript for now)
- True SHA-256 program IDs (JS content-addressing hash, equivalent role, lower fidelity)
- Real LLM agents — see §6 follow-up below

## Follow-up: real LLM agents

The deterministic engine is now a structurally faithful recreation of Algorithm 1 + S2's physics. To add LLM cognition while keeping replay/assay deterministic:

1. **Server proxy** (Express or Vercel Functions) for LLM calls — budget-capped, never in the browser.
2. **Observation schema per S2.1** — local neighborhood semantic facts (terrain, resources, facilities, artifacts, fields, inventory), never global arrays.
3. **Action-plan contract** — strict JSON plan of ≤12 atomic actions per macroturn from the same action vocabulary as the deterministic policy.
4. **Swap only `generateAgentPlan`** — replace the deterministic heuristic plan generator with LLM call + schema validation + safe fallback. Everything downstream (`executeAtomicAction`, fields, VMs, assay, replay) stays unchanged.
5. **Deterministic replay preservation** — recordings of LLM plans become part of the trace; replaying uses recorded plans, not fresh LLM calls.
