// Enums matching backend (using const objects for erasableSyntaxOnly compatibility)
export const GameSessionStatus = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  ABANDONED: "ABANDONED",
} as const;

export type GameSessionStatus =
  (typeof GameSessionStatus)[keyof typeof GameSessionStatus];

export const StockSector = {
  TECH: "TECH",
  MEDICAL: "MEDICAL",
  FINANCE: "FINANCE",
} as const;

export type StockSector = (typeof StockSector)[keyof typeof StockSector];

export const ToolType = {
  HINT: "HINT",
  TIME_BOOST: "TIME_BOOST",
} as const;

export type ToolType = (typeof ToolType)[keyof typeof ToolType];

export const DifficultyLevel = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

export type DifficultyLevel =
  (typeof DifficultyLevel)[keyof typeof DifficultyLevel];

export const TransactionType = {
  BUY: "BUY",
  SELL: "SELL",
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

// DTOs matching backend
export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface RegisterRequestDTO {
  username: string;
  password: string;
  email: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordRequestDTO {
  token: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface AuthResponse {
  message: string;
  userId: string; // UUID
  username: string;
  displayName?: string;
  email?: string;
  emailVerified?: boolean;
  avatarUrl?: string;
  token?: string; // Optional - tokens are in httpOnly cookies, not in response
}

export interface ValidateTokenResponse {
  valid: boolean;
  userId?: string; // UUID
  username?: string;
  displayName?: string;
  email?: string;
  emailVerified?: boolean;
  avatarUrl?: string;
  message?: string;
}

export interface UserProfile {
  userId: string; // UUID
  username: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface GameSessionDTO {
  id: string; // UUID
  userId: string; // UUID
  currentRound: number;
  startingCapital: number;
  currentCapital: number;
  status: GameSessionStatus;
  difficultyLevel?: DifficultyLevel;
  hasActiveRound: boolean;
}

export interface StockDTO {
  id: string; // UUID
  symbol: string;
  companyName: string;
  sector: StockSector;
  heartImageUrl: string;
  marketPrice: number;
  sharesOwned?: number;
  averagePrice?: number;
  totalValue?: number;
  realStockSymbol?: string; // Real stock symbol from Alpha Vantage (e.g., "AAPL" for HTCH)
}

export interface HoldingDTO {
  stockId: string; // UUID
  symbol: string;
  companyName: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface PortfolioDTO {
  cash: number;
  totalStockValue: number;
  totalPortfolioValue: number;
  holdings: HoldingDTO[];
}

export interface TradeRequestDTO {
  stockId: string; // UUID
  shares: number;
}

export interface TradeResponseDTO {
  transactionId: string; // UUID
  stockId: string; // UUID
  stockSymbol: string;
  transactionType: TransactionType;
  shares: number;
  pricePerShare: number;
  totalValue: number;
  remainingCash: number;
  timestamp: string;
  message: string;
}

export interface RoundStartDTO {
  roundId: string; // UUID
  gameSessionId: string; // UUID
  roundNumber: number;
  capital: number;
  durationSeconds: number;
  availableStocks: StockDTO[];
  startTime: number;
}

export interface RoundResultDTO {
  roundId: string; // UUID
  roundNumber: number;
  capitalAtStart: number;
  capitalAtEnd: number;
  profitLoss: number;
  profitLossPercentage: number;
  revealedStocks: StockDTO[];
  unlockedTools: string[];
  gameComplete: boolean;
  nextRoundNumber?: number;
}

export interface RoundSummaryDTO {
  roundId: string; // UUID
  roundNumber: number;
  capitalAtStart: number;
  capitalAtEnd: number;
  profitLoss: number;
  profitLossPercentage: number;
  durationSeconds?: number;
}

export interface GameSummaryDTO {
  gameSessionId: string; // UUID
  difficultyLevel: DifficultyLevel;
  startingCapital: number;
  finalCapital: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  startedAt: string; // ISO date string
  completedAt: string; // ISO date string
  rounds: RoundSummaryDTO[];
  bestRoundNumber?: number;
  worstRoundNumber?: number;
  bestRoundProfit?: number;
  worstRoundProfit?: number;
}

// Tool responses can have different structures
export interface HintResponse {
  message: string;
  success: boolean;
}

export interface TimeBoostResponse {
  message: string;
  newDuration: number;
  secondsAdded: number;
  success?: boolean; // Only present on error
}

export type ToolResponse = HintResponse | TimeBoostResponse;

export interface ToolAvailabilityResponse {
  available: boolean;
  toolType: string;
  error?: string;
}
