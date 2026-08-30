# SwarmWorld Architecture Documentation

## Scientific Foundation
This interactive system is modeled on the research paper **"SwarmWorld: Stigmergic Technological Evolution in Societies of Language-Model Agents"** (MIT LAMM, August 2026).

### Key Concepts Implemented:
1. **Proposal-Consequence Separation**:
   - Cognitive layer (agents/player proposals, recipes, controller logic) is strictly separated from the deterministic simulation physics layer (material evaluations, conservation of mass, spatial fluxes, and autonomous straight-line virtual machine execution).
2. **Four Mechanism-Resolved Regimes**:
   - **Full Culture**: Shared physical world + explicit messages & teaching + cross-agent program forking + artifact stigmergy.
   - **No Communication**: Shared physical world + cross-agent program inheritance, but without direct chat/teaching.
   - **No Explicit Culture**: Pure physical stigmergy only (agents coordinate purely through persistent artifacts and spatial modifications).
   - **Independent Search**: $N$ isolated 1-agent worlds; reports best-of-$N$ envelope across endpoints.
3. **Three Distinct Environmental Realms**:
   - **BioFoundry**: $72 \times 54$ grid with Chitin fields, Cellulose groves, Mineral springs, Fungal colonies, Catalyst deposits, and Kelp/Shell shores.
   - **AshenRealm**: Volcanic realm with Lava channels, Obsidian wastes, Sulfur marshes, and Iron mountain forges.
   - **Protein Realms**: Biomolecular matrix terrain with Amino-acid basins, Chaperone forests, Ribosome enclaves, and Matrix looms.
4. **Behavioral Phenotypes**:
   - Constructor/Operator ($R_1$)
   - Artifact-Local Caretaker ($R_2$)
   - Cultural Coordinator ($R_3$)
   - Mobile Surveyor ($R_4$)
5. **Rigorous Scientific Metrics**:
   - Discovery-Frontier AUC ($D_T = T^{-1} \int_0^T \max_{\tau \le t} p(\tau) dt$)
   - Current Service Coverage $Q(t) = \bar{c}(t)[1 + \min_k c_k(t)/\bar{c}(t)]/2$
   - Portfolio Resilience $P = \bar{c}^{\text{peak}}[1 + \min_k c_k^{\text{peak}}/\bar{c}^{\text{peak}}]/2$
   - Held-Out Resilience Assay: 8 paired unseen disturbance schedules evaluated agent-free.
   - Validated Invention Criteria: Test-passing recipe + complete spec + agent-authored bytecode controller + threshold performance + behavioral novelty.

## Software Architecture & Modular Layout
- `/src/types/`: Centralized domain models for materials, artifacts, agents, environments, simulation states, controllers, and leaderboards.
- `/src/simulation/`: Pure TypeScript deterministic simulation engine including grid physics, mass conservation, agent decision cycle, program interpreter VM, and disturbance generator.
- `/src/audio/`: Web Audio API procedural soundscape synthesizer generating soothing adaptive ambient pads, resonance chimes, and tactile audio feedback.
- `/src/components/`:
  - `world/`: High-performance 2D Canvas & Isometric interactive world viewport with pan, zoom, touch gestures, and heatmaps.
  - `workbench/`: Material formulation & controller programming sandbox.
  - `lineage/`: Interactive bipartite knowledge provenance graph.
  - `metrics/`: Real-time Recharts visualizations for Discovery Frontiers, Phenotypes, and Held-Out Assays.
  - `campaign/`: Curated scientific challenges with progressive discovery tiers.
  - `leaderboard/`: Global and local seed challenge rankings with export/import sync.
  - `common/`: Navigation, modals, theme toggles, and audio controls.
- `/src/storage/`: Multi-slot save state manager, cloud-sync export/import, and local persistence.
