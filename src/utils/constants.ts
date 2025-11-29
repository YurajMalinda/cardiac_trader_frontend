/**
 * Configuration Constants
 * Authentication is now enabled, so TEST_USER_ID is no longer needed.
 */

/**
 * API base URL - matches backend server port
 * Can be overridden with VITE_API_BASE_URL environment variable
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const GAME_CONFIG = {
  STARTING_CAPITAL: 10000,
  ROUND_DURATION: 60,
  TOTAL_ROUNDS: 3,
};

export const STOCK_SECTORS = {
  TECH: { name: 'Technology', multiplier: 1.5 },
  MEDICAL: { name: 'Medical', multiplier: 1.3 },
  FINANCE: { name: 'Finance', multiplier: 1.0 },
};

