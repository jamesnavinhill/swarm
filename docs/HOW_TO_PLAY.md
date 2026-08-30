# SwarmWorld: The Comprehensive How-to-Play & Simulation Guide 📖

> *"I don't know what any of this stuff means!"* — Don't worry! This guide breaks down every concept, button, metric, and mechanic in plain English so you can master the simulation, understand the science, and run your own experiments.

---

## Table of Contents
1. [What is SwarmWorld? (The Core Idea)](#1-what-is-swarmworld-the-core-idea)
2. [Key Concepts Explained in Plain English](#2-key-concepts-explained-in-plain-english)
3. [The Main Top Controls (Header Bar)](#3-the-main-top-controls-header-bar)
4. [Tour of the 6 Main Views](#4-tour-of-the-6-main-views)
   - [View 1: Ecosystem Map](#view-1-ecosystem-map)
   - [View 2: Material Workbench](#view-2-material-workbench)
   - [View 3: Knowledge Lineage](#view-3-knowledge-lineage)
   - [View 4: Analytics & Metrics](#view-4-analytics--metrics)
   - [View 5: Research Missions](#view-5-research-missions)
   - [View 6: High Scores & Sync](#view-6-high-scores--sync)
5. [How Machines & Inventions Work](#5-how-machines--inventions-work)
6. [Understanding the 4 Experimental Conditions](#6-understanding-the-4-experimental-conditions)
7. [Pro Tips & Secret Strategies](#7-pro-tips--secret-strategies)

---

## 1. What is SwarmWorld? (The Core Idea)

Imagine dropping 50 small autonomous AI agents into an alien, hostile landscape (with toxic contamination, dry droughts, or lava heat). 

- **Nobody gave them a manual or assigned them jobs.**
- **Nobody gave them pre-written blueprints.**
- **How do they survive and thrive?**

They explore the world, harvest raw materials (like chitin shells, porous fungal mycelium, volcanic obsidian, or amino acids), and **build physical machines**. 

When an agent builds a water filter or a thermal shield, that machine stays in the world forever (**Stigmergy**). Future agents can walk up to it, read the machine's code (**Bytecode**), copy it, improve it (**Forking**), and build an even better machine.

Over hundreds of simulation ticks, you watch an entire technological civilization evolve from scratch!

---

## 2. Key Concepts Explained in Plain English

| Term | What it Actually Means | Why it Matters |
| :--- | :--- | :--- |
| **Tick** | A single step of time in the physical world (like 1 second of clock time). | Environmental fields diffuse, machines pump water or filter toxins, and agents move 1 step. |
| **Macroturn ($m=50$)** | Every 50 ticks, agents "wake up" to think, formulate plans, write code, or craft new recipes. | Separates fast physical simulation (every tick) from high-level agent cognition (every macroturn). |
| **Stigmergy** | Leaving physical traces in the environment to communicate indirectly with others. | Termites build massive cathedral mounds by depositing pheromone-scented mud balls. In SwarmWorld, agents leave trails, deposit materials, and build permanent machines. |
| **Artifact / Machine** | A permanent physical structure deployed on the map with a recipe, material properties, and an executable program. | Cleans contamination, harvests moisture, regulates temperature, and creates safe zones for the colony. |
| **Register Bytecode VM** | A tiny virtual computer inside every machine with 16 storage slots (registers `R0`–`R15`). | The machine reads sensors (e.g., `READ_SENSOR moisture`), computes logic (`CMP_GT`), and drives actuators (`ACTUATE remediate`). |
| **Lineage / Forking** | Tracing who built what. When an agent creates Machine B by modifying Machine A's code, that creates a branch in the evolutionary tree. | Shows how collective cultural knowledge accumulates over generations. |
| **Disturbance / Stress Pulse** | An environmental shock (toxic flood, heatwave, or drought) hit on the ecosystem. | Tests whether the agents' technological portfolio is resilient enough to protect the biome. |
| **Proposal-Consequence Separation** | The fundamental rule of the simulation: Agents can *propose* whatever crazy ideas they want, but the *laws of physics* determine whether it actually works! | Prevents "AI hallucinations" from magically breaking physical conservation laws. |

---

## 3. The Main Top Controls (Header Bar)

At the top of the screen, you have your primary simulation flight deck:

```
[ SWARMWORLD ]  [ Bio | Ashen | Protein ]    [ ▶ | ⏭ | 1x 2x 5x 10x | Tick: 142 | Inv: 6 | ↺ ]    [ Full Culture ▾ ] [ N= 50 100 200 ]  [ 📖 🔊 ☀️ ]
```

1. **Realm Selector (`Bio`, `Ashen`, `Protein`)**:
   - `BioFoundry`: Living forest of polysaccharides, fungi, chitin, and minerals.
   - `AshenRealm`: Harsh volcanic caldera with iron, basalt, obsidian, and sulfur.
   - `ProteinRealms`: Biomolecular nanoscale matrix of peptides, lipids, and ribosomes.
2. **Play / Pause (`▶` / `⏸`)**: Starts or pauses the real-time simulation clock.
3. **Step (`⏭`)**: Advances the simulation by exactly 1 tick (great for watching frame-by-frame physics).
4. **Speed Multipliers (`1x`, `2x`, `5x`, `10x`)**: Speeds up the engine up to 10x for long-term evolutionary runs.
5. **Tick & Inventions Counters (`Tick: 142 | Inv: 6`)**:
   - `Tick`: Current age of the civilization.
   - `Inv`: Number of validated, functioning machines invented and deployed in the world.
6. **Reset (`↺`)**: Re-seeds the world with fresh terrain and a new generation of agents.
7. **Protocol Condition Dropdown**: Switch between the 4 experimental study modes (e.g., `Full Culture`, `Independent Search`).
8. **Population Size (`N= 50 / 100 / 200`)**: Sets how many autonomous agents inhabit the world.
9. **Action Icons**:
   - 📖 **Book Icon**: Opens the Scientific Compendium & Simulation Guide (with ArXiv paper links and PDF downloads).
   - 🔊 **Speaker Icon**: Toggles the procedural ambient soundscape on/off.
   - ☀️/🌙 **Sun/Moon Icon**: Toggles between high-contrast Light mode and sleek Dark mode.

---

## 4. Tour of the 6 Main Views

Use the bottom navigation bar to switch between the 6 core simulation modules:

```
[ 🌍 Ecosystem Map ] [ ⚙️ Material Workbench ] [ 🌳 Knowledge Lineage ] [ 📊 Analytics & Metrics ] [ 🎯 Research Missions ] [ 🏆 High Scores & Sync ]
```

---

### View 1: Ecosystem Map

This is your living 2D window into the world.

- **Agents (Colored Dots with Vectors)**:
  - 🟢 **Green (Caretakers/Maintainers)**: Stay near machines, maintaining them and clearing debris.
  - 🔵 **Blue (Explorers/Foragers)**: Roam far into the wilderness seeking rare feedstocks.
  - 🟡 **Gold (Bio-Architects)**: Gather materials to formulate new recipes and deploy inventions.
  - ⚪ **Gray (Code Forkers)**: Study existing machines to write algorithmic updates.
- **Machines (Diamond Icons with Energy Auras)**: Permanent structures working in the world. Click any machine to inspect its live registers, operational fluxes, and recipe!
- **Hover Over "Field:" (Top-Left Popover)**:
  - `Natural / Raw`: Displays biome terrain, trees, hydrothermal vents, and agent movement trails.
  - `Moisture`: Blue heatmap showing water gradients and drought regions.
  - `Contamination`: Crimson/red heatmap showing toxic plumes.
  - `Temperature`: Orange/yellow heatmap showing thermal stress and volcanic heat.
  - `Nutrients`: Emerald green heatmap showing bio-feedstock concentrations.
- **Top-Right Controls**:
  - `+` / `-`: Zoom in and out.
  - `↺`: Reset view camera to center.
  - `Stress Pulse`: Injects an instant environmental shock to test the colony's defenses!

---

### View 2: Material Workbench

Here, you can act as a Bio-Architect and invent custom technologies alongside the agents:

1. **Step 1: Select Raw Feedstocks**: Pick materials (e.g., `CHITIN: 45%`, `FUNGUS: 35%`, `MINERAL: 20%`).
2. **Step 2: Choose Fabrication Operations**: Chain operations like `WASH` ➔ `FERMENT` ➔ `ALIGN` ➔ `PRESS`.
   - *Synergy Tip*: Washing before Grinding, or Fermenting before Pressing, creates microscopic crystalline alignments that boost quality!
3. **Step 3: Inspect Physical Properties**:
   - *Toughness*: Resistance to physical impacts and structural wear.
   - *Permeability*: Flow rate for water filtration and gas exchange.
   - *Self-Healing*: Speed of biological mycelial regrowth after damage.
   - *Thermal Regulation*: Resistance to scorching heat and freezing cold.
4. **Step 4: Program the 16-Register VM Controller**:
   - Write assembly-like instructions (e.g., `READ_SENSOR moisture`, `CMP_GT`, `ACTUATE remediate`) to tell the machine when and how hard to pump.
   - Or click **Generate AI Routine** to let the system generate an optimized bytecode program!
5. **Step 5: Deploy to Ecosystem**: Drops your newly invented machine directly into the living world at target coordinates!

---

### View 3: Knowledge Lineage

Ever wonder how technology evolves over generations? The Lineage view shows the **Bipartite Provenance Graph (DAG)**:

- **Column 1: Agents (Observers)**: The specific agents who made field observations.
- **Column 2: Evidence & Citations**: Data logged about environmental crises or resource discoveries.
- **Column 3: Insights & Theories**: Hypotheses about how to solve a problem (e.g., *"Fermented chitin resists acidic sulfur"*).
- **Column 4: Inventions & Technologies**: The resulting physical machines.
- **Solid Lines**: Direct creation relationships.
- **Dashed Gold Lines**: Code forks (where an agent copied and modified another agent's earlier program).

---

### View 4: Analytics & Metrics

For the data enthusiasts and scientists, this view plots real-time research charts:

1. **Discovery Frontier AUC ($D_T$)**: Measures the cumulative envelope of the best technology discovered over time.
2. **Service Coverage ($Q(t)$)**: A multi-objective score ($0.0$ to $1.0$) tracking how well all 4 environmental threats (toxins, drought, heat, starvation) are simultaneously controlled.
3. **Portfolio Resilience ($P$)**: The paper's key finding! Shows how a diverse team of specialized machines outperforms any single "super-tool".
4. **Phenotype Distribution**: Real-time breakdown of agent roles ($R_1$ through $R_4$).
5. **Held-Out Resilience Assay**: The ultimate test! Removes all agents and runs 8 unseen disaster schedules to verify whether the machines can survive and protect the ecosystem on their own.

---

### View 5: Research Missions

A progressive campaign mode featuring scientific challenges:
- **Tier 1: Basic Survival**: Deploy water harvesters and survive 100 ticks.
- **Tier 2: The Toxic Flood**: Remediate a massive contamination spill using multi-layered bio-filters.
- **Tier 3: The Great Molten Surge**: Build high-toughness thermal barriers in the AshenRealm.
- **Tier 4: Deep Code Lineage**: Evolve a 5th-generation bytecode controller through continuous forking.

Complete objectives to earn discovery stars and unlock advanced fabrication blueprints!

---

### View 6: High Scores & Sync

- View local records, civilization lifespans, and peak resilience scores.
- Export your simulation run as a `.json` file to share with colleagues or load into another machine.
- Switch between multiple save slots.

---

## 5. How Machines & Inventions Work

Every machine in SwarmWorld is a combination of two things:

$$\text{Machine} = \text{Material Physics (Hardware)} + \text{Bytecode Program (Software)}$$

### The Hardware (Material Physics)
The recipe determines the machine's durability, passive filtration rate, and maximum operating capacity. If you use brittle materials without enough binder, the machine will degrade rapidly during stress pulses.

### The Software (Straight-Line Bytecode)
Every tick, the machine's 16 floating-point registers (`R0`–`R15`) are updated:
1. `READ_SENSOR contamination` ➔ puts current local toxin level into register `R0`.
2. `SET R1, 0.4` ➔ sets threshold in register `R1`.
3. `CMP_GT R2, R0, R1` ➔ sets `R2 = 1.0` if contamination is higher than 0.4.
4. `ACTUATE remediate` ➔ expends effort proportional to `R2` to chemically neutralize the plume!

---

## 6. Understanding the 4 Experimental Conditions

The MIT paper compared 4 societal conditions. You can switch between them in the header:

1. **Full Culture (The Complete Experience)**:
   - Agents share the physical world, build machines, deposit terrain trails, and fork each other's code.
   - *Result*: Achieves the highest portfolio resilience and fastest recovery from disasters.
2. **No Communication (Code Only)**:
   - Agents cannot leave spatial trails or direct teaching notes, but can still fork code from existing machines.
3. **No Explicit Culture (Terrain Only)**:
   - Agents can only coordinate by modifying physical terrain and encountering machines physically, but cannot inspect or copy the internal bytecode.
4. **Independent Search (Isolated Envelopes)**:
   - $N$ agents run in completely separate, isolated parallel universes.
   - *Result*: Finds good individual peak tools, but completely fails to build balanced, multi-service ecosystems.

---

## 7. Pro Tips & Secret Strategies

- **Tip 1: The Synergy Recipe**: In BioFoundry, mixing **Chitin (40%) + Fungus (35%) + Kelp (15%) + Minerals (10%)** with **WASH ➔ FERMENT ➔ MINERALIZE ➔ PRESS** creates an ultra-durable, self-healing bio-sponge!
- **Tip 2: Stress-Test Your Colony**: Don't wait for natural disasters—hit the **Stress Pulse** button every 150 ticks to force your agents to innovate defensive shields.
- **Tip 3: Watch the Lineage Graph**: If you notice a single machine has 5+ forked descendants, inspect its bytecode in the Material Workbench to see what clever optimization the agents discovered!
- **Tip 4: Speed Up Long Runs**: Use the `5x` or `10x` speed buttons in the top bar to simulate 1,000 ticks in just a couple minutes.
