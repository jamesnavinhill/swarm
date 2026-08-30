/**
 * Research Campaign & Scientific Missions
 * Interactive challenges guiding players through the fundamental findings of the SwarmWorld paper.
 */

import confetti from 'canvas-confetti';
import { Award, CheckCircle2, ChevronRight, Compass, Flame, Lock, Play, Sparkles, Target, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { sound } from '../../audio/SoundSynthesizer';
import { CAMPAIGN_MISSIONS } from '../../simulation/data/realmsData';
import { SwarmEngine } from '../../simulation/engine/SwarmEngine';
import { getStoredCompletedMissions, saveCompletedMission } from '../../storage/saveManager';
import { CampaignMission } from '../../types';

interface CampaignProps {
  engine: SwarmEngine;
  onApplyMissionConfig: (mission: CampaignMission) => void;
}

export const ResearchCampaign: React.FC<CampaignProps> = ({ engine, onApplyMissionConfig }) => {
  const [completedIds, setCompletedIds] = useState<string[]>(getStoredCompletedMissions());
  const [selectedMission, setSelectedMission] = useState<CampaignMission>(CAMPAIGN_MISSIONS[0]);

  const metrics = engine.metricsHistory[engine.metricsHistory.length - 1];

  const handleSelectMission = (m: CampaignMission) => {
    sound.playClick();
    setSelectedMission(m);
  };

  const handleStartMission = (m: CampaignMission) => {
    sound.playClick();
    onApplyMissionConfig(m);
  };

  const handleClaimMission = (m: CampaignMission) => {
    sound.playSuccess();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    const updated = saveCompletedMission(m.id);
    setCompletedIds(updated);
  };

  // Evaluate if current engine state satisfies target metrics
  const isSatisfied = (m: CampaignMission): boolean => {
    if (!metrics) return false;
    if (m.realm !== engine.realm) return false;

    if (m.targetMetrics.minInventions && metrics.validatedInventionsCount < m.targetMetrics.minInventions) return false;
    if (m.targetMetrics.minPortfolioResilience && metrics.portfolioResilience < m.targetMetrics.minPortfolioResilience) return false;
    if (m.targetMetrics.minDiscoveryAUC && metrics.discoveryFrontierAUC < m.targetMetrics.minDiscoveryAUC) return false;

    return true;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Mission List (5 cols) */}
      <div className="lg:col-span-5 space-y-2.5">
        <div className="flex items-center justify-between px-1 mb-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Research Campaign Roadmap
          </h2>
          <span className="text-xs font-mono text-neutral-300 font-semibold">
            {completedIds.length} / {CAMPAIGN_MISSIONS.length} Completed
          </span>
        </div>

        {CAMPAIGN_MISSIONS.map((m, idx) => {
          const isDone = completedIds.includes(m.id);
          const isCurrent = selectedMission.id === m.id;

          return (
            <div
              key={m.id}
              onClick={() => handleSelectMission(m)}
              className={`p-3.5 rounded-md border cursor-pointer transition-all ${
                isCurrent
                  ? 'bg-neutral-900 border-neutral-600 shadow-sm ring-1 ring-neutral-700'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-sm border ${
                    isDone ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-100">{m.title}</h3>
                    <div className="text-[11px] text-neutral-400 uppercase font-mono mt-0.5">
                      {m.realm} • {m.recommendedCondition.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Mission Briefing & Verification Panel (7 cols) */}
      <div className="lg:col-span-7 space-y-5">
        <div className="p-5 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5">
            <div>
              <span className="text-[11px] font-mono text-neutral-400 uppercase font-semibold">Active Protocol</span>
              <h2 className="text-base font-bold text-neutral-100 mt-0.5">{selectedMission.title}</h2>
            </div>
            <div className="px-2.5 py-1.5 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-300 font-semibold text-xs flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              +{selectedMission.rewards.xp} XP
            </div>
          </div>

          {/* Scientific Briefing */}
          <div>
            <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Scientific Briefing</h4>
            <p className="text-xs text-neutral-300 leading-relaxed">{selectedMission.briefing}</p>
          </div>

          {/* Core Paper Hypothesis */}
          <div className="p-3 rounded-sm bg-neutral-950 border border-neutral-800 text-xs">
            <span className="font-semibold text-neutral-300 uppercase tracking-wider block mb-1 text-[11px]">Core Hypothesis Tested</span>
            <p className="text-neutral-400 italic text-xs">{selectedMission.scientificHypothesis}</p>
          </div>

          {/* Target Metrics Verification */}
          <div>
            <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Target Validation Criteria</h4>
            <div className="space-y-1.5 text-xs">
              {selectedMission.targetMetrics.minInventions && (
                <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300">Validated Inventions</span>
                  <span className="font-mono font-semibold text-neutral-200">
                    Current: {metrics?.validatedInventionsCount ?? 0} / Target: {selectedMission.targetMetrics.minInventions}
                  </span>
                </div>
              )}

              {selectedMission.targetMetrics.minPortfolioResilience && (
                <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300">Portfolio Resilience</span>
                  <span className="font-mono font-semibold text-neutral-200">
                    Current: {metrics?.portfolioResilience.toFixed(4) ?? '0.0000'} / Target: {selectedMission.targetMetrics.minPortfolioResilience.toFixed(4)}
                  </span>
                </div>
              )}

              {selectedMission.targetMetrics.minDiscoveryAUC && (
                <div className="p-2.5 rounded-sm bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300">Discovery Frontier AUC</span>
                  <span className="font-mono font-semibold text-neutral-200">
                    Current: {metrics?.discoveryFrontierAUC.toFixed(4) ?? '0.0000'} / Target: {selectedMission.targetMetrics.minDiscoveryAUC.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Rewards Badge */}
          <div className="p-3 rounded-sm bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-300 font-medium">
              <Award className="w-3.5 h-3.5 text-neutral-400" />
              <span>Unlock Badge: <strong>{selectedMission.rewards.badge}</strong></span>
            </div>
            {selectedMission.rewards.unlockedFeedstock && (
              <span className="text-xs text-neutral-400 font-mono">
                + Unlocked {selectedMission.rewards.unlockedFeedstock}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              onClick={() => handleStartMission(selectedMission)}
              className="flex-1 py-2 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Configure Simulation for Mission
            </button>

            {isSatisfied(selectedMission) && !completedIds.includes(selectedMission.id) ? (
              <button
                onClick={() => handleClaimMission(selectedMission)}
                className="flex-1 py-2 rounded-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Claim Research Victory
              </button>
            ) : completedIds.includes(selectedMission.id) ? (
              <div className="flex-1 py-2 rounded-sm bg-neutral-800 text-neutral-300 font-semibold text-xs text-center border border-neutral-700">
                ✓ Completed
              </div>
            ) : (
              <div className="flex-1 py-2 rounded-sm bg-neutral-950 text-neutral-500 font-medium text-xs text-center border border-neutral-800">
                In Progress...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
