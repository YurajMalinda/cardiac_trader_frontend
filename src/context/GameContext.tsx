import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { gameAPI } from '../services/api';
import type { GameSessionDTO, RoundStartDTO } from '../types';

interface GameContextType {
  gameSession: GameSessionDTO | null;
  currentRound: RoundStartDTO | null;
  setGameSession: (session: GameSessionDTO | null) => void;
  setCurrentRound: (round: RoundStartDTO | null) => void;
  loadGameSession: (userId: string) => Promise<void>;
  startNewGame: (userId: string, difficulty?: string) => Promise<void>;
  startRound: (sessionId: string) => Promise<void>;
  clearGameState: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameSession, setGameSession] = useState<GameSessionDTO | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundStartDTO | null>(null);

  const loadGameSession = useCallback(async (userId: string) => {
    const session = await gameAPI.getCurrentSession(userId);
    setGameSession(session);
  }, []);

  const startNewGame = useCallback(async (userId: string, difficulty?: string) => {
    const session = await gameAPI.startNewGame(userId, difficulty);
    setGameSession(session);
  }, []);

  const startRound = useCallback(async (sessionId: string) => {
    const round = await gameAPI.startRound(sessionId);
    setCurrentRound(round);
  }, []);

  // Clear game state (useful for logout)
  const clearGameState = useCallback(() => {
    setGameSession(null);
    setCurrentRound(null);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
        gameSession,
        currentRound,
        setGameSession,
        setCurrentRound,
        loadGameSession,
        startNewGame,
        startRound,
      clearGameState,
    }),
    [gameSession, currentRound, loadGameSession, startNewGame, startRound, clearGameState]
  );

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

