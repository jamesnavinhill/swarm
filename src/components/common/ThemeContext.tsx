/**
 * Theme and Accessibility Context
 * Manages Dark/Light mode and Realm-themed accent color palettes.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { RealmType } from '../../types';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  activeRealm: RealmType;
  setActiveRealm: (realm: RealmType) => void;
  accentColor: string;
  isAudioMuted: boolean;
  toggleAudio: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [activeRealm, setActiveRealm] = useState<RealmType>('biofoundry');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('swarmworld_theme_mode') as ThemeMode;
    const initialMode = savedMode === 'light' ? 'light' : 'dark';
    setMode(initialMode);
    applyThemeClass(initialMode);
  }, []);

  const applyThemeClass = (m: ThemeMode) => {
    const root = document.documentElement;
    if (m === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  };

  const toggleMode = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem('swarmworld_theme_mode', next);
    applyThemeClass(next);
  };

  const toggleAudio = () => {
    setIsAudioMuted(prev => !prev);
  };

  const accentColor = activeRealm === 'biofoundry' 
    ? '#3d7a5a' 
    : activeRealm === 'ashenrealm' 
    ? '#b0523b' 
    : '#4a7291';

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleMode,
        activeRealm,
        setActiveRealm,
        accentColor,
        isAudioMuted,
        toggleAudio,
      }}
    >
      <div className={mode === 'dark' ? 'dark bg-neutral-950 text-neutral-100' : 'light bg-neutral-50 text-neutral-900'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
