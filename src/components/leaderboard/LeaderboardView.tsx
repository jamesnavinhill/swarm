/**
 * Leaderboards, Cloud Saves, and Cross-Device Progress Sync
 * Enables competitive benchmarking across standard world seeds and zero-db cross-device cloud sync.
 */

import { Check, Cloud, Copy, Download, Globe, HardDrive, RefreshCw, Trophy, Upload, User } from 'lucide-react';
import React, { useState } from 'react';
import { sound } from '../../audio/SoundSynthesizer';
import { LEADERBOARD_BENCHMARKS } from '../../simulation/data/realmsData';
import { SwarmEngine } from '../../simulation/engine/SwarmEngine';
import {
  addUserLeaderboardEntry,
  exportCloudSyncToken,
  getSaveSlots,
  getStoredCompletedMissions,
  getStoredUserLeaderboard,
  importCloudSyncToken,
  loadGameSlot,
  saveGameSlot,
} from '../../storage/saveManager';
import { LeaderboardEntry } from '../../types';

interface LeaderboardProps {
  engine: SwarmEngine;
  onRestoreState: (realm: any, condition: any, seed: number, populationN: number, tick: number) => void;
}

export const LeaderboardView: React.FC<LeaderboardProps> = ({ engine, onRestoreState }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'cloudsync' | 'slots'>('leaderboard');
  const [userEntries, setUserEntries] = useState<LeaderboardEntry[]>(getStoredUserLeaderboard());
  const [playerName, setPlayerName] = useState<string>('Researcher 01');
  const [syncToken, setSyncToken] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const slots = getSaveSlots();
  const currentMetric = engine.metricsHistory[engine.metricsHistory.length - 1];

  const handleRecordSubmission = () => {
    sound.playSuccess();
    const newEntry: LeaderboardEntry = {
      id: `usr_${Date.now()}`,
      playerName,
      realm: engine.realm,
      condition: engine.condition,
      seed: engine.seed,
      populationN: engine.populationN,
      ticksElapsed: engine.tick,
      discoveryFrontierAUC: currentMetric?.discoveryFrontierAUC ?? 0,
      portfolioResilience: currentMetric?.portfolioResilience ?? 0,
      heldOutResilienceAUC: engine.heldOutReports.length > 0 ? engine.heldOutReports[engine.heldOutReports.length - 1].overallResilienceAUC : 0,
      validatedInventions: currentMetric?.validatedInventionsCount ?? 0,
      submittedAt: new Date().toISOString(),
      isUserSubmission: true,
    };

    const updated = addUserLeaderboardEntry(newEntry);
    setUserEntries([...updated]);
  };

  const handleGenerateCloudToken = () => {
    sound.playClick();
    const payload = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      slotId: 1,
      realm: engine.realm,
      condition: engine.condition,
      seed: engine.seed,
      populationN: engine.populationN,
      tick: engine.tick,
      metrics: currentMetric || {
        tick: engine.tick,
        bestArtifactPerformance: 0,
        discoveryFrontierAUC: 0,
        portfolioResilience: 0,
        currentServiceCoverage: 0,
        validatedInventionsCount: 0,
        multiAgentArtifactFraction: 0,
        crossAgentForkFraction: 0,
        artifactContactAUC: 0,
        spatialEntropy: 0,
        maxForkDepth: 1,
        activeArtifactsCount: engine.artifacts.length,
        phenotypeCounts: { C1_artifact_centered: 0, C2_mobile_exploration: 0, C3_stationary_low_activity: 0 },
        roleCounts: { R1_constructor: 0, R2_caretaker: 0, R3_coordinator: 0, R4_surveyor: 0 },
      },
      completedMissionIds: getStoredCompletedMissions(),
      userLeaderboardEntries: userEntries,
    };

    const token = exportCloudSyncToken(payload);
    setSyncToken(token);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(syncToken);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportToken = () => {
    sound.playClick();
    const payload = importCloudSyncToken(syncToken);
    if (payload) {
      sound.playSuccess();
      setSyncStatus('✓ Successfully imported cloud state!');
      onRestoreState(payload.realm, payload.condition, payload.seed, payload.populationN, payload.tick);
    } else {
      setSyncStatus('✕ Invalid sync token format.');
    }
  };

  const allEntries = [...userEntries, ...LEADERBOARD_BENCHMARKS].sort((a, b) => b.portfolioResilience - a.portfolioResilience);

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-neutral-800 pb-2">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('leaderboard');
          }}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'leaderboard' ? 'bg-neutral-800 text-neutral-100 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Global & Local Leaderboard
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('cloudsync');
          }}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'cloudsync' ? 'bg-neutral-800 text-neutral-100 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          Cloud Saves & Cross-Device Sync
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('slots');
          }}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'slots' ? 'bg-neutral-800 text-neutral-100 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          Local Save Slots
        </button>
      </div>

      {/* Tab 1: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-5">
          {/* Submit Current Run Bar */}
          <div className="p-3.5 rounded-md bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3.5">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your Researcher Alias"
                className="px-3 py-1.5 rounded-sm bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
              />
              <span className="text-xs text-neutral-400 font-mono text-[11px]">
                Tick {engine.tick} • Resilience {currentMetric?.portfolioResilience.toFixed(4) ?? '0.000'}
              </span>
            </div>
            <button
              onClick={handleRecordSubmission}
              className="w-full sm:w-auto px-4 py-1.5 rounded-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              Submit Current Simulation Run
            </button>
          </div>

          {/* Table */}
          <div className="rounded-md bg-neutral-900 border border-neutral-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Researcher / Group</th>
                    <th className="px-4 py-3">Realm</th>
                    <th className="px-4 py-3">Condition</th>
                    <th className="px-4 py-3">Seed / N</th>
                    <th className="px-4 py-3">Portfolio Resilience</th>
                    <th className="px-4 py-3">Discovery AUC</th>
                    <th className="px-4 py-3">Inventions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {allEntries.map((e, idx) => (
                    <tr
                      key={e.id}
                      className={`hover:bg-neutral-800/40 transition-colors ${
                        e.isUserSubmission ? 'bg-neutral-800/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-bold font-mono text-neutral-300">#{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-neutral-100 flex items-center gap-2">
                        {e.isUserSubmission ? <User className="w-3.5 h-3.5 text-neutral-400" /> : <Globe className="w-3.5 h-3.5 text-neutral-400" />}
                        {e.playerName}
                      </td>
                      <td className="px-4 py-3 capitalize text-neutral-300">{e.realm}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-neutral-400">{e.condition.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 font-mono text-neutral-400">s{e.seed} (N={e.populationN})</td>
                      <td className="px-4 py-3 font-semibold text-neutral-200 font-mono">{e.portfolioResilience.toFixed(4)}</td>
                      <td className="px-4 py-3 font-mono text-neutral-300">{e.discoveryFrontierAUC.toFixed(4)}</td>
                      <td className="px-4 py-3 font-mono text-neutral-200 font-bold">{e.validatedInventions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cloud Sync */}
      {activeTab === 'cloudsync' && (
        <div className="p-5 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
              <Cloud className="w-3.5 h-3.5 text-neutral-400" />
              Cross-Device Cloud Sync Token
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Export your full simulation state, completed research missions, and high scores into a portable cryptographic token. Paste it on any tablet, mobile, or desktop device to instantly resume.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              onClick={handleGenerateCloudToken}
              className="py-2.5 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold text-xs flex items-center justify-center gap-2 border border-neutral-700 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Generate Sync Token from Current Session
            </button>
            <button
              onClick={handleImportToken}
              className="py-2.5 rounded-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Import & Restore from Sync Token
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-neutral-400 font-medium">Sync Token Payload (Base64)</label>
              {syncToken && (
                <button
                  onClick={handleCopyToken}
                  className="text-xs text-neutral-300 hover:text-neutral-100 font-medium flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied to Clipboard' : 'Copy Token'}
                </button>
              )}
            </div>
            <textarea
              value={syncToken}
              onChange={(e) => setSyncToken(e.target.value)}
              rows={4}
              placeholder="Click 'Generate Sync Token' or paste a token from another device here..."
              className="w-full p-3 rounded-sm bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
            />
            {syncStatus && (
              <div className="mt-2 text-xs font-medium text-neutral-300">{syncStatus}</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Local Save Slots */}
      {activeTab === 'slots' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((slotId) => {
            const slotData = slots[slotId - 1];
            return (
              <div key={slotId} className="p-4 rounded-md bg-neutral-900 border border-neutral-800 shadow-sm flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                    <span className="font-bold uppercase tracking-wider text-[11px]">Slot {slotId}</span>
                    <span className="font-mono text-[11px]">{slotData ? new Date(slotData.updatedAt).toLocaleDateString() : 'Empty'}</span>
                  </div>
                  {slotData ? (
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-neutral-200">{slotData.name}</div>
                      <div className="text-neutral-400">Realm: <span className="text-neutral-200 capitalize">{slotData.realm}</span></div>
                      <div className="text-neutral-400">Condition: <span className="text-neutral-200">{slotData.condition}</span></div>
                      <div className="text-neutral-400">Inventions: <span className="text-neutral-200 font-bold">{slotData.metrics.validatedInventionsCount}</span></div>
                      <div className="text-neutral-400">Resilience: <span className="text-neutral-200 font-mono">{slotData.metrics.portfolioResilience.toFixed(4)}</span></div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-neutral-500 italic">No saved simulation in this slot.</div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      sound.playSuccess();
                      saveGameSlot(
                        slotId,
                        engine.realm,
                        engine.condition,
                        engine.seed,
                        engine.populationN,
                        engine.tick,
                        currentMetric || {
                          tick: engine.tick,
                          bestArtifactPerformance: 0,
                          discoveryFrontierAUC: 0,
                          portfolioResilience: 0,
                          currentServiceCoverage: 0,
                          validatedInventionsCount: 0,
                          multiAgentArtifactFraction: 0,
                          crossAgentForkFraction: 0,
                          artifactContactAUC: 0,
                          spatialEntropy: 0,
                          maxForkDepth: 1,
                          activeArtifactsCount: engine.artifacts.length,
                          phenotypeCounts: { C1_artifact_centered: 0, C2_mobile_exploration: 0, C3_stationary_low_activity: 0 },
                          roleCounts: { R1_constructor: 0, R2_caretaker: 0, R3_coordinator: 0, R4_surveyor: 0 },
                        },
                        engine.artifacts.length,
                        getStoredCompletedMissions()
                      );
                    }}
                    className="flex-1 py-1.5 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs transition-colors border border-neutral-700"
                  >
                    Save Slot
                  </button>
                  {slotData && (
                    <button
                      onClick={() => {
                        sound.playSuccess();
                        onRestoreState(slotData.realm, slotData.condition, slotData.seed, slotData.populationN, slotData.tick);
                      }}
                      className="flex-1 py-1.5 rounded-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-medium text-xs transition-colors"
                    >
                      Load Slot
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
