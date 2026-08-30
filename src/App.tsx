/**
 * SwarmWorld: Stigmergic Technological Evolution in Societies of Language-Model Agents
 * (MIT LAMM Interactive Game & Simulation)
 */

import React, { useEffect, useReducer, useRef, useState } from 'react';
import { sound } from './audio/SoundSynthesizer';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { ResearchCampaign } from './components/campaign/ResearchCampaign';
import { ActiveView, Header } from './components/common/Header';
import { ThemeProvider, useTheme } from './components/common/ThemeContext';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { KnowledgeLineageView } from './components/lineage/KnowledgeLineageView';
import { MetricsDashboard } from './components/metrics/MetricsDashboard';
import { PaperInsightsModal } from './components/paper/PaperInsightsModal';
import { MaterialWorkbench } from './components/workbench/MaterialWorkbench';
import { InspectorModal } from './components/world/InspectorModal';
import { WorldViewport } from './components/world/WorldViewport';
import { SwarmEngine } from './simulation/engine/SwarmEngine';
import { Agent, Artifact, CampaignMission, ConditionType, RealmType } from './types';

function MainApp() {
  const { activeRealm, setActiveRealm } = useTheme();

  // Engine instance initialized in ref
  const engineRef = useRef<SwarmEngine>(new SwarmEngine('biofoundry', 'full_culture', 50, 3202));
  const engine = engineRef.current;

  // React render tick trigger
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Application State
  const [activeView, setActiveView] = useState<ActiveView>('world');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState<boolean>(false);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(50, 500 / speed);
    const interval = setInterval(() => {
      engine.tickStep();
      forceUpdate();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, speed, engine]);

  const handleTogglePlay = () => {
    sound.playClick();
    if (!isPlaying) {
      sound.startAmbient(engine.realm);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepTick = () => {
    sound.playClick();
    engine.tickStep();
    sound.playTickStep();
    forceUpdate();
  };

  const handleResetWorld = () => {
    sound.playClick();
    setIsPlaying(false);
    engine.initializeWorld();
    setSelectedAgent(null);
    setSelectedArtifact(null);
    forceUpdate();
  };

  const handleRealmChange = (realm: RealmType) => {
    sound.playClick();
    setIsPlaying(false);
    setActiveRealm(realm);
    engine.realm = realm;
    engine.initializeWorld();
    sound.updateAmbientRealm(realm);
    setSelectedAgent(null);
    setSelectedArtifact(null);
    forceUpdate();
  };

  const handleConditionChange = (condition: ConditionType) => {
    sound.playClick();
    // Use the engine's condition setter so independent_search builds/tears down
    // its isolated 1-agent member worlds rather than flipping a bare flag.
    engine.setCondition(condition);
    forceUpdate();
  };

  const handlePopulationChange = (n: number) => {
    sound.playClick();
    setIsPlaying(false);
    engine.populationN = n;
    engine.initializeWorld();
    forceUpdate();
  };

  const handleApplyMissionConfig = (mission: CampaignMission) => {
    setIsPlaying(false);
    setActiveRealm(mission.realm);
    engine.realm = mission.realm;
    engine.condition = mission.recommendedCondition;
    engine.initializeWorld();
    sound.updateAmbientRealm(mission.realm);
    setActiveView('world');
    forceUpdate();
  };

  const handleRestoreState = (
    realm: RealmType,
    condition: ConditionType,
    seed: number,
    populationN: number,
    tick: number
  ) => {
    setIsPlaying(false);
    setActiveRealm(realm);
    engine.realm = realm;
    engine.condition = condition;
    engine.seed = seed;
    engine.populationN = populationN;
    engine.initializeWorld();
    engine.tick = tick;
    sound.updateAmbientRealm(realm);
    setActiveView('world');
    forceUpdate();
  };

  const handleSelectAgent = (agent: Agent | null) => {
    if (agent) {
      setIsPaperModalOpen(false);
    }
    setSelectedAgent(agent);
  };

  const handleSelectArtifact = (artifact: Artifact | null) => {
    if (artifact) {
      setIsPaperModalOpen(false);
    }
    setSelectedArtifact(artifact);
  };

  const handleOpenPaperModal = () => {
    setSelectedAgent(null);
    setSelectedArtifact(null);
    setIsPaperModalOpen(true);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-neutral-950 text-neutral-100 font-sans select-none">
      {/* Universal Header */}
      <Header
        engine={engine}
        activeView={activeView}
        setActiveView={setActiveView}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onStepTick={handleStepTick}
        onResetWorld={handleResetWorld}
        onOpenPaperModal={handleOpenPaperModal}
        onRealmChange={handleRealmChange}
        onConditionChange={handleConditionChange}
        onPopulationChange={handlePopulationChange}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      {/* Main Content Body (True One-Page View with Inline Flex & Nested Scrolling) */}
      <main className="flex-1 min-h-0 flex flex-col p-2 sm:p-3 overflow-hidden">
        {activeView === 'world' && (
          <div className="flex-1 min-h-0 w-full h-full">
            <WorldViewport
              engine={engine}
              onSelectAgent={handleSelectAgent}
              onSelectArtifact={handleSelectArtifact}
              selectedAgentId={selectedAgent?.id}
              selectedArtifactId={selectedArtifact?.id}
            />
          </div>
        )}

        {activeView === 'workbench' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <MaterialWorkbench
              engine={engine}
              onArtifactDeployed={() => {
                setActiveView('world');
                forceUpdate();
              }}
            />
          </div>
        )}

        {activeView === 'lineage' && (
          <div className="flex-1 min-h-0 w-full h-full overflow-hidden">
            <KnowledgeLineageView engine={engine} />
          </div>
        )}

        {activeView === 'metrics' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <MetricsDashboard engine={engine} />
          </div>
        )}

        {activeView === 'campaign' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ResearchCampaign
              engine={engine}
              onApplyMissionConfig={handleApplyMissionConfig}
            />
          </div>
        )}

        {activeView === 'leaderboard' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <LeaderboardView
              engine={engine}
              onRestoreState={handleRestoreState}
            />
          </div>
        )}
      </main>

      {/* Deep Entity Inspector Modal */}
      <InspectorModal
        agent={selectedAgent}
        artifact={selectedArtifact}
        onClose={() => {
          setSelectedAgent(null);
          setSelectedArtifact(null);
        }}
      />

      {/* Scientific Research Compendium Modal */}
      {isPaperModalOpen && (
        <PaperInsightsModal onClose={() => setIsPaperModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
