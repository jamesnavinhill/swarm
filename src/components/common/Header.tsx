/**
 * Minimalist, High-Performance Application Header & Simulation Controller
 * Provides realm switching, condition controls, tick advancement, audio/theme toggles, and view tabs.
 */

import {
  Activity,
  Award,
  BookOpen,
  Cpu,
  Globe,
  Moon,
  Network,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sun,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React from 'react';
import { sound } from '../../audio/SoundSynthesizer';
import { REALM_CONFIGS } from '../../simulation/data/realmsData';
import { SwarmEngine } from '../../simulation/engine/SwarmEngine';
import { ConditionType, RealmType } from '../../types';
import { useTheme } from './ThemeContext';

export type ActiveView = 'world' | 'workbench' | 'lineage' | 'metrics' | 'campaign' | 'leaderboard';

interface HeaderProps {
  engine: SwarmEngine;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepTick: () => void;
  onResetWorld: () => void;
  onOpenPaperModal: () => void;
  onRealmChange: (realm: RealmType) => void;
  onConditionChange: (condition: ConditionType) => void;
  onPopulationChange: (n: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const REALM_SHORT_NAMES: Record<RealmType, string> = {
  biofoundry: 'Bio',
  ashenrealm: 'Ashen',
  proteinrealms: 'Protein',
};

export const Header: React.FC<HeaderProps> = ({
  engine,
  activeView,
  setActiveView,
  isPlaying,
  onTogglePlay,
  onStepTick,
  onResetWorld,
  onOpenPaperModal,
  onRealmChange,
  onConditionChange,
  onPopulationChange,
  speed,
  onSpeedChange,
}) => {
  const { mode, toggleMode, isAudioMuted, toggleAudio } = useTheme();
  const config = REALM_CONFIGS[engine.realm];

  const handleSoundToggle = () => {
    toggleAudio();
    sound.setMuted(!isAudioMuted);
    if (isAudioMuted) {
      sound.startAmbient(engine.realm);
    }
  };

  const renderRealmsGroup = () => (
    <div className="flex items-center gap-0.5 p-0.5 rounded-sm bg-neutral-900 border border-neutral-800 text-[11px] shrink-0">
      {(['biofoundry', 'ashenrealm', 'proteinrealms'] as RealmType[]).map((r) => {
        const isActive = engine.realm === r;
        return (
          <button
            key={r}
            id={`btn-realm-${r}`}
            onClick={() => {
              sound.playClick();
              onRealmChange(r);
            }}
            className={`px-2 py-0.5 rounded-sm text-[11px] font-medium transition-all ${
              isActive
                ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {REALM_SHORT_NAMES[r]}
          </button>
        );
      })}
    </div>
  );

  const renderAdvanceControls = () => (
    <div className="flex items-center gap-1 p-0.5 rounded-sm bg-neutral-900 border border-neutral-800 shadow-xs shrink-0">
      {/* Play/Pause */}
      <button
        id="btn-play-pause"
        onClick={onTogglePlay}
        title={isPlaying ? 'Pause Simulation' : 'Start Simulation'}
        className={`p-1 px-1.5 rounded-sm text-xs flex items-center justify-center transition-all ${
          isPlaying
            ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700'
            : 'bg-neutral-100 text-neutral-950 hover:bg-neutral-200'
        }`}
      >
        {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
      </button>

      {/* Single Step */}
      <button
        id="btn-step-tick"
        onClick={onStepTick}
        disabled={isPlaying}
        className="p-1 rounded-sm text-neutral-300 hover:bg-neutral-800 disabled:opacity-40 transition-colors"
        title="Step Single Tick (Algorithm 1)"
      >
        <SkipForward className="w-3 h-3" />
      </button>

      {/* Speed Multiplier */}
      <div className="flex items-center gap-0.5 px-1 text-[10px] font-mono text-neutral-400 border-l border-neutral-800">
        {[1, 2, 5, 10].map((s) => (
          <button
            key={s}
            onClick={() => {
              sound.playClick();
              onSpeedChange(s);
            }}
            className={`px-1 py-0.2 rounded-sm ${
              speed === s ? 'bg-neutral-800 text-neutral-100 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Fixed-Structure Stable Counters */}
      <div className="px-2 py-0.5 rounded-sm bg-neutral-950 font-mono text-[10px] text-neutral-300 flex items-center gap-2 border border-neutral-800 tabular-nums shrink-0 select-none">
        <span className="inline-block w-[64px] text-left">
          Tick: <strong className="text-neutral-100 font-semibold">{engine.tick}</strong>
        </span>
        <span className="text-neutral-700">|</span>
        <span className="inline-block w-[48px] text-left">
          Inv: <strong className="text-neutral-100 font-semibold">{engine.artifacts.length}</strong>
        </span>
      </div>

      {/* Reset */}
      <button
        id="btn-reset-world"
        onClick={onResetWorld}
        className="p-1 rounded-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
        title="Reset World Seed"
      >
        <RotateCcw className="w-3 h-3" />
      </button>
    </div>
  );

  const renderProtocolGroup = () => (
    <div className="flex items-center gap-1.5 shrink-0">
      <select
        id="select-condition"
        value={engine.condition}
        onChange={(e) => onConditionChange(e.target.value as ConditionType)}
        className="px-2 py-0.5 rounded-sm bg-neutral-900 border border-neutral-800 text-neutral-200 text-[11px] font-medium focus:outline-none focus:border-neutral-600 cursor-pointer"
        title="Experimental Protocol Condition"
      >
        <option value="full_culture">Full Culture</option>
        <option value="no_communication">No Communication</option>
        <option value="no_explicit_culture">No Explicit Culture</option>
        <option value="independent_search">Independent Search</option>
      </select>

      {/* Population N Switcher */}
      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-neutral-900 border border-neutral-800 font-mono text-[10px]">
        <span className="text-neutral-500 mr-0.5">N=</span>
        {[50, 100, 200].map((n) => (
          <button
            key={n}
            onClick={() => {
              sound.playClick();
              onPopulationChange(n);
            }}
            className={`px-1 py-0.2 rounded-sm ${
              engine.populationN === n ? 'bg-neutral-800 text-neutral-100 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  const renderActionIcons = () => (
    <div className="flex items-center gap-1">
      <button
        id="btn-open-compendium"
        onClick={onOpenPaperModal}
        className="p-1 rounded-sm bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-neutral-100 transition-colors"
        title="Paper Insights & Simulation Guide"
      >
        <BookOpen className="w-3 h-3" />
      </button>

      <button
        id="btn-toggle-sound"
        onClick={handleSoundToggle}
        className="p-1 rounded-sm bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
        title={isAudioMuted ? 'Unmute Soundscape' : 'Mute Soundscape'}
      >
        {isAudioMuted ? <VolumeX className="w-3 h-3 text-neutral-500" /> : <Volume2 className="w-3 h-3 text-neutral-300" />}
      </button>

      <button
        id="btn-toggle-theme"
        onClick={toggleMode}
        className="p-1 rounded-sm bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
        title="Toggle Light/Dark Theme"
      >
        {mode === 'dark' ? <Sun className="w-3 h-3 text-neutral-300" /> : <Moon className="w-3 h-3 text-neutral-300" />}
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950 px-3 sm:px-5 py-2 shrink-0">
      <div className="w-full flex flex-col gap-1.5">
        {/* Row 1: Top Bar
            - >= lg: [ Title + Realms ] ... [ Advance Controls ] ... [ Protocol + Icons ]
            - md to lg: [ Title + Realms ] .......................... [ Protocol + Icons ]
            - < md: [ Title ] ....................................... [ Icons ]
        */}
        <div className="w-full flex items-center justify-between gap-2.5">
          {/* Left: Title & (Realms on md+) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <h1 className="text-xs font-extrabold tracking-wider text-neutral-100 uppercase select-none">
              SWARMWORLD
            </h1>

            {/* Realms in top row on md+ */}
            <div className="hidden md:block">
              {renderRealmsGroup()}
            </div>
          </div>

          {/* Center: Advance Controls (in top row on lg+) */}
          <div className="hidden lg:flex items-center justify-center">
            {renderAdvanceControls()}
          </div>

          {/* Right: (Protocol on md+) + Icons */}
          <div className="flex items-center gap-2.5">
            {/* Protocol in top row on md+ */}
            <div className="hidden md:block">
              {renderProtocolGroup()}
            </div>

            {/* Icons on far right with divider on md+ */}
            <div className="flex items-center md:border-l md:border-neutral-800 md:pl-2.5">
              {renderActionIcons()}
            </div>
          </div>
        </div>

        {/* Row 2: Intermediate Row for < md screens: [ Realms ] ... [ Protocol ] */}
        <div className="w-full flex md:hidden items-center justify-between gap-2 pt-1 border-t border-neutral-900/80">
          <div>{renderRealmsGroup()}</div>
          <div>{renderProtocolGroup()}</div>
        </div>

        {/* Row 3 (or Row 2 on md-lg): Advance Controls when screen is < lg */}
        <div className="w-full flex lg:hidden items-center justify-center pt-0.5">
          {renderAdvanceControls()}
        </div>

        {/* Centered Navigation Tabs */}
        <div className="pt-1.5 border-t border-neutral-900 w-full flex items-center justify-center">
          <nav className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs font-medium">
            {[
              { id: 'world', label: 'Ecosystem Map', icon: Globe },
              { id: 'workbench', label: 'Material Workbench', icon: Cpu },
              { id: 'lineage', label: 'Knowledge Lineage', icon: Network },
              { id: 'metrics', label: 'Analytics & Metrics', icon: Activity },
              { id: 'campaign', label: 'Research Missions', icon: Award },
              { id: 'leaderboard', label: 'High Scores & Sync', icon: Trophy },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => {
                    sound.playClick();
                    setActiveView(tab.id as ActiveView);
                  }}
                  title={tab.label}
                  className={`px-2 sm:px-2.5 lg:px-3.5 py-1 rounded-sm flex items-center gap-1.5 transition-all whitespace-nowrap text-xs ${
                    isActive
                      ? 'bg-neutral-800 text-neutral-100 font-semibold border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
