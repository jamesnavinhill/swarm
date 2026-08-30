/**
 * Save Manager and Cloud-Sync Utility
 * Implements multi-slot local storage and portable base64 sync tokens for cross-device progress.
 */

import { CampaignMission, ConditionType, LeaderboardEntry, RealmType, SaveStateSlot, SimulationMetrics } from '../types';

export interface FullSavePayload {
  version: string;
  createdAt: string;
  slotId: number;
  realm: RealmType;
  condition: ConditionType;
  seed: number;
  populationN: number;
  tick: number;
  metrics: SimulationMetrics;
  completedMissionIds: string[];
  userLeaderboardEntries: LeaderboardEntry[];
}

const STORAGE_PREFIX = 'swarmworld_save_slot_';
const MISSIONS_KEY = 'swarmworld_campaign_missions';
const LEADERBOARD_KEY = 'swarmworld_user_leaderboard';

export function getSaveSlots(): (SaveStateSlot | null)[] {
  const slots: (SaveStateSlot | null)[] = [];
  for (let i = 1; i <= 3; i++) {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${i}`);
      if (data) {
        slots.push(JSON.parse(data));
      } else {
        slots.push(null);
      }
    } catch {
      slots.push(null);
    }
  }
  return slots;
}

export function saveGameSlot(
  slotId: number,
  realm: RealmType,
  condition: ConditionType,
  seed: number,
  populationN: number,
  tick: number,
  metrics: SimulationMetrics,
  artifactsCount: number,
  completedMissions: string[]
): SaveStateSlot {
  const slotData: SaveStateSlot = {
    slotId,
    name: `Save Slot ${slotId} (${realm.toUpperCase()} - Tick ${tick})`,
    updatedAt: new Date().toISOString(),
    realm,
    condition,
    seed,
    populationN,
    tick,
    metrics,
    artifactsCount,
    campaignProgress: completedMissions.length,
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${slotId}`, JSON.stringify(slotData));
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(completedMissions));
  } catch (e) {
    console.error('Failed to save slot', e);
  }

  return slotData;
}

export function loadGameSlot(slotId: number): SaveStateSlot | null {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${slotId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function exportCloudSyncToken(payload: FullSavePayload): string {
  const jsonStr = JSON.stringify(payload);
  return btoa(encodeURIComponent(jsonStr));
}

export function importCloudSyncToken(token: string): FullSavePayload | null {
  try {
    const jsonStr = decodeURIComponent(atob(token.trim()));
    const payload: FullSavePayload = JSON.parse(jsonStr);
    if (payload.version && payload.realm && payload.seed !== undefined) {
      return payload;
    }
    return null;
  } catch (err) {
    console.error('Invalid cloud sync token', err);
    return null;
  }
}

export function getStoredCompletedMissions(): string[] {
  try {
    const raw = localStorage.getItem(MISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCompletedMission(missionId: string): string[] {
  const current = getStoredCompletedMissions();
  if (!current.includes(missionId)) {
    current.push(missionId);
    try {
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(current));
    } catch {}
  }
  return current;
}

export function getStoredUserLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addUserLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const current = getStoredUserLeaderboard();
  current.unshift(entry);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(current.slice(0, 50)));
  } catch {}
  return current;
}
