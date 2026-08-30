# SwarmWorld 🧬🤖

> **Interactive Multi-Agent Simulation Sandbox for Stigmergic Technological Evolution & Biomaterials Invention**
> Based on the MIT LAMM research paper: *"SwarmWorld: Stigmergic Technological Evolution in Societies of Language-Model Agents"* (Subhadeep Pal, Fiona Y. Wang, Markus J. Buehler — MIT Laboratory for Atomistic and Molecular Mechanics, August 2026).
> 📄 [Paper on ArXiv (arXiv:2608.26081)](https://arxiv.org/abs/2608.26081) | 🌐 [MIT LAMM Lab](https://lamm.mit.edu)

---

## 🌟 Overview

**SwarmWorld** is an open-ended multi-agent digital ecosystem where populations of autonomous language-model agents live, explore, harvest raw bio-feedstocks, invent novel materials, author executable bytecode controller programs, and alter their physical environment over generations.

Instead of human-curated recipes or central coordination, agents cooperate through **physical stigmergy** (modifying shared terrain and building persistent machines) and **cultural inheritance** (forking and refining straight-line bytecode controllers across generations).

### Core Highlights
- **Proposal-Consequence Separation**: Agents propose architectures, recipes, and logic, while the deterministic physical simulation engine independently evaluates mass conservation, mechanical integrity, and spatial field dynamics.
- **3 Unique Environmental Realms**:
  - 🌿 **BioFoundry**: Living polysaccharide terrain (Chitin, Cellulose, Mycelium, Kelp, Minerals).
  - 🌋 **AshenRealm**: High-temperature volcanic forges (Basalt, Obsidian, Iron Ore, Copper, Sulfur).
  - 🧬 **Protein Realms**: Biomolecular matrix looms (Peptides, Lipids, Chaperone Buffers, Crosslinkers).
- **Straight-Line Bytecode Virtual Machine**: 16-register clamped VM running agent-authored programs at every simulation tick for active water filtration, heat shielding, and chemical remediation.
- **6 Interconnected Interactive Modules**:
  1. **Ecosystem Map**: Interactive 2D viewport with multi-layer environmental field overlays (Moisture, Contamination, Temperature, Nutrients) and shock perturbation triggers.
  2. **Material Workbench**: Open-ended fabrication sandbox to mix feedstocks, apply processing sequences, test mechanical properties, write VM logic, and deploy inventions.
  3. **Knowledge Lineage**: Provenance Directed Acyclic Graph (DAG) visualizing how ideas, citations, and code are forked and propagated across generations.
  4. **Analytics & Metrics**: Real-time Recharts dashboards tracking Discovery Frontiers (AUC), Service Coverage $Q(t)$, Portfolio Resilience $P$, Phenotypic Specializations, and Held-Out Assays.
  5. **Research Missions**: Campaign missions with progressive objectives and discovery tiers.
  6. **High Scores & Sync**: World seed leaderboards with complete JSON state import/export.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+ recommended) or Bun
- npm / pnpm / yarn / bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/swarmworld.git
cd swarmworld

# Install dependencies
npm install

# Start the local development server (runs on port 3000)
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

### Production Build

```bash
# Build static assets for production deployment
npm run build

# Preview production build locally
npm run preview
```

---

## 🎮 How to Play (The 60-Second Crash Course)

1. **Watch the Agents Explore**: Hit **Play** in the top navigation bar. Agents navigate the map, harvesting feedstocks and depositing pheromone/terrain trails.
2. **Inspect Environmental Fields**: Hover over the **Field:** button on the map to switch between *Moisture*, *Contamination*, *Temperature*, and *Nutrients*.
3. **Trigger a Disturbance**: Click **Stress Pulse** on the map to release toxic plumes or temperature shocks, and watch how agent-built machines automatically filter and protect the surrounding biome.
4. **Invent Custom Materials**: Switch to the **Material Workbench** tab. Select feedstocks (e.g., Chitin + Fungus), choose sequence operations (WASH ➔ FERMENT ➔ PRESS), assemble a 16-register VM program, and click **Deploy to Ecosystem**.
5. **Trace the Lineage**: Open the **Knowledge Lineage** tab to view the evolutionary graph of how inventions evolved from agent observations to complex multi-generational tools.
6. **Track the Science**: Check the **Analytics & Metrics** tab to see if your civilization achieves the *Bounded Swarm Advantage* ($+0.086$ to $+0.130$ higher resilience than isolated search).

For an exhaustive guide, see [`docs/HOW_TO_PLAY.md`](docs/HOW_TO_PLAY.md).

---

## 📚 In-Depth Documentation

- 📖 [**How-To-Play & User Guide**](docs/HOW_TO_PLAY.md) — Comprehensive guide explaining every concept, rule, view, and strategy in plain English.
- 📐 [**Simulation Engine Math & Algorithms**](docs/SIMULATION_ENGINE_MATH.md) — Full mathematical specifications, Algorithm 1 pseudo-code, finite-difference diffusion PDEs, VM opcodes, and material evaluator physics formulas.
- 🏗️ [**System Architecture & Structure**](docs/roadmaps/ARCHITECTURE.md) — Software design, module hierarchy, and component organization.

---

## 🔬 Scientific Citation

If you use this software or simulation engine in your academic research, please cite the MIT LAMM paper:

```bibtex
@article{pal2026swarmworld,
  title={SwarmWorld: Stigmergic Technological Evolution in Societies of Language-Model Agents},
  author={Pal, Subhadeep and Wang, Fiona Y. and Buehler, Markus J.},
  journal={arXiv preprint arXiv:2608.26081},
  year={2026},
  institution={Laboratory for Atomistic and Molecular Mechanics, Massachusetts Institute of Technology}
}
```

---

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom theme variables (Dark/Light mode support)
- **Icons**: Lucide React
- **Data Visualization**: Recharts + Custom D3-based SVG Graphs
- **Audio Engine**: Web Audio API Procedural Synthesizer (Zero external audio asset dependencies)
- **State Management**: Local reactive state + localStorage multi-slot serialization

---

## 📄 License

MIT License — free for educational, scientific, and personal use.
