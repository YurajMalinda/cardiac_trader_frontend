import axios from 'axios';
import type {
  LoginRequestDTO,
  RegisterRequestDTO,
  ForgotPasswordRequestDTO,
  ResetPasswordRequestDTO,
  AuthResponse,
  ValidateTokenResponse,
  ForgotPasswordResponse,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  GameSessionDTO,
  StockDTO,
  PortfolioDTO,
  TradeRequestDTO,
  TradeResponseDTO,
  RoundStartDTO,
  RoundResultDTO,
  ToolResponse,
  ToolAvailabilityResponse
} from '../types';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies (httpOnly cookies)
});

// Track if we're currently refreshing token to avoid infinite loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

// Add response interceptor to handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Cookies are automatically sent, no need to set Authorization header
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token
        await api.post<AuthResponse>('/auth/refresh');
        
        // Token refreshed successfully, retry original request
        // Cookies are automatically sent, no need to set Authorization header
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth data and redirect to login
        processQueue(refreshError);
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: RegisterRequestDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequestDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },

  validateToken: async (): Promise<ValidateTokenResponse> => {
    const response = await api.get<ValidateTokenResponse>('/auth/validate');
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequestDTO): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequestDTO): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/verify-email', null, {
      params: { token },
    });
    return response.data;
  },

  resendVerificationEmail: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/resend-verification', { email });
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile & { message: string }> => {
    const response = await api.put<UserProfile & { message: string }>('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  },
};

// Game API
export const gameAPI = {
  startNewGame: async (userId: string, difficulty?: string): Promise<GameSessionDTO> => {
    const response = await api.post<GameSessionDTO>('/game/start', null, {
      params: { userId, difficulty: difficulty || 'MEDIUM' },
    });
    return response.data;
  },

  startRound: async (sessionId: string): Promise<RoundStartDTO> => {
    const response = await api.post<RoundStartDTO>('/game/round/start', null, {
      params: { sessionId },
    });
    return response.data;
  },

  completeRound: async (
    sessionId: string,
    roundNumber: number
  ): Promise<RoundResultDTO> => {
    const response = await api.post<RoundResultDTO>(
      '/game/round/complete',
      null,
      {
        params: { sessionId, roundNumber },
      }
    );
    return response.data;
  },

  getCurrentSession: async (userId: string): Promise<GameSessionDTO | null> => {
    try {
      const response = await api.get<GameSessionDTO>('/game/session', {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

// Trading API
export const tradingAPI = {
  buyStock: async (
    sessionId: string,
    request: TradeRequestDTO
  ): Promise<TradeResponseDTO> => {
    const response = await api.post<TradeResponseDTO>('/trading/buy', request, {
      params: { sessionId },
    });
    return response.data;
  },

  sellStock: async (
    sessionId: string,
    request: TradeRequestDTO
  ): Promise<TradeResponseDTO> => {
    const response = await api.post<TradeResponseDTO>('/trading/sell', request, {
      params: { sessionId },
    });
    return response.data;
  },

  getPortfolio: async (sessionId: string): Promise<PortfolioDTO> => {
    const response = await api.get<PortfolioDTO>('/trading/portfolio', {
      params: { sessionId },
    });
    return response.data;
  },
};

// Market API
export const marketAPI = {
  getAvailableStocks: async (sessionId: string): Promise<StockDTO[]> => {
    const response = await api.get<StockDTO[]>('/market/stocks', {
      params: { sessionId },
    });
    return response.data;
  },

  updateMarketPrices: async (sessionId: string): Promise<void> => {
    await api.post('/market/update-prices', null, {
      params: { sessionId },
    });
  },
};

// Tools API
export const toolsAPI = {
  useHint: async (sessionId: string, stockId: string): Promise<ToolResponse> => {
    const response = await api.post<ToolResponse>('/tools/hint', null, {
      params: { sessionId, stockId },
    });
    return response.data;
  },

  useTimeBoost: async (
    sessionId: string,
    secondsToAdd: number = 30
  ): Promise<ToolResponse> => {
    const response = await api.post<ToolResponse>('/tools/time-boost', null, {
      params: { sessionId, secondsToAdd },
    });
    return response.data;
  },

  checkToolAvailability: async (
    sessionId: string,
    toolType: string
  ): Promise<ToolAvailabilityResponse> => {
    const response = await api.get<ToolAvailabilityResponse>(
      '/tools/available',
      {
        params: { sessionId, toolType },
      }
    );
    return response.data;
  },
};

export default api;

