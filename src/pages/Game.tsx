import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Statistic,
  Row,
  Col,
  Radio,
  Alert,
  Layout,
} from "antd";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import { gameAPI, tradingAPI, authAPI } from "../services/api";
import TradingPanel from "../components/TradingPanel";
import PortfolioPanel from "../components/PortfolioPanel";
import MarketPanel from "../components/MarketPanel";
import ToolsPanel from "../components/ToolsPanel";
import RoundResultModal from "../components/RoundResultModal";
import GameSummaryModal from "../components/GameSummaryModal";
import Header from "../components/Header";
import type { RoundResultDTO, PortfolioDTO, StockDTO, GameSummaryDTO } from "../types";
import { DifficultyLevel } from "../types";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

const Game = () => {
  const { user } = useAuth();
  const {
    gameSession,
    currentRound,
    loadGameSession,
    startNewGame,
    startRound,
    setCurrentRound,
    setGameSession,
  } = useGame();
  const [portfolio, setPortfolio] = useState<PortfolioDTO | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResultDTO | null>(null);
  const [gameSummary, setGameSummary] = useState<GameSummaryDTO | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [timeBoostAdded, setTimeBoostAdded] = useState<number>(0); // Track total time added by boosts
  const [selectedStock, setSelectedStock] = useState<StockDTO | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(
    DifficultyLevel.MEDIUM
  );
  const [marketRefreshTrigger, setMarketRefreshTrigger] = useState(0);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);

  useEffect(() => {
    // Only load game session if we don't already have one
    // This prevents overwriting a newly created game session
    if (user?.userId && !gameSession) {
      loadGameSession(user.userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]); // Load when user changes

  useEffect(() => {
    // Check email verification status
    if (user?.emailVerified !== undefined) {
      setEmailVerified(user.emailVerified);
    } else if (user?.userId) {
      // Fetch fresh profile data
      authAPI
        .getProfile()
        .then((profile) => setEmailVerified(profile.emailVerified))
        .catch(() => setEmailVerified(null));
    }
  }, [user]);

  const loadPortfolio = useCallback(async () => {
    if (gameSession?.id) {
      try {
        const data = await tradingAPI.getPortfolio(gameSession.id);
        setPortfolio(data);
        // Trigger market panel refresh to update "Owned" shares
        setMarketRefreshTrigger((prev) => prev + 1);
        // Refresh game session to update currentCapital
        if (user?.userId) {
          loadGameSession(user.userId);
        }
      } catch {
        console.error("Failed to load portfolio");
      }
    }
  }, [gameSession?.id, loadGameSession, user?.userId]);

  useEffect(() => {
    if (gameSession?.id) {
      loadPortfolio();
      const interval = setInterval(loadPortfolio, 5000);
      return () => clearInterval(interval);
    }
  }, [gameSession?.id, loadPortfolio]);

  useEffect(() => {
    if (currentRound) {
      // Start timer immediately based on server start time
      // Don't wait for images - timer should run independently
      const serverStartTime = currentRound.startTime;
      setRoundStartTime(serverStartTime);
      setTimeBoostAdded(0); // Reset time boost when new round starts

      // Calculate initial remaining time based on server start time
      const now = Date.now();
      const elapsed = Math.floor((now - serverStartTime) / 1000);
      const remaining = Math.max(0, currentRound.durationSeconds - elapsed);
      setTimeRemaining(remaining);
    }
  }, [currentRound]);

  const handleRoundComplete = useCallback(async () => {
    if (!gameSession?.id || !currentRound) return;
    try {
      const result = await gameAPI.completeRound(
        gameSession.id,
        currentRound.roundNumber
      );
      setRoundResult(result);
    } catch {
      toast.error("Failed to complete round");
    }
  }, [gameSession?.id, currentRound]);

  useEffect(() => {
    if (currentRound && roundStartTime > 0) {
      const timer = setInterval(() => {
        // Calculate elapsed time based on server start time
        // Add timeBoostAdded to account for time boosts
        const now = Date.now();
        const elapsed = Math.floor((now - roundStartTime) / 1000);
        const remaining = Math.max(0, currentRound.durationSeconds + timeBoostAdded - elapsed);

        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
          handleRoundComplete();
        }
      }, 100); // Update every 100ms for smoother countdown

      return () => clearInterval(timer);
    }
  }, [currentRound, roundStartTime, timeBoostAdded, handleRoundComplete]);

  const handleStartGame = async () => {
    if (!user?.userId) return;
    try {
      await startNewGame(user.userId, selectedDifficulty);
      toast.success(`Game started with ${selectedDifficulty} difficulty!`);
    } catch {
      toast.error("Failed to start game");
    }
  };

  const handleStartRound = async () => {
    if (!gameSession?.id) return;
    try {
      await startRound(gameSession.id);
      toast.success("Round started!");
    } catch {
      toast.error("Failed to start round");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Require authentication
  // Don't return null - show loading state with dark background to prevent white flash
  if (!user) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#0a0e27" }}>
        <div style={{ minHeight: "100vh", background: "#0a0e27" }} />
      </Layout>
    );
  }

  if (!gameSession) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#0a0e27" }}>
        <Header />
        <div
          style={{
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <Card
            style={{
              borderRadius: "16px",
              background: "rgba(26, 31, 58, 0.95)",
              border: "1px solid rgba(66, 153, 225, 0.3)",
              boxShadow:
                "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(66, 153, 225, 0.1)",
              backdropFilter: "blur(10px)",
              maxWidth: "600px",
              width: "100%",
            }}
            bodyStyle={{
              padding: "clamp(32px, 5vw, 48px)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <h1
                style={{
                  fontSize: "clamp(28px, 5vw, 40px)",
                  background: "linear-gradient(135deg, #4299e1 0%, #63b3ed 50%, #9f7aea 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "12px",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                }}
              >
                ❤️ Cardiac Trader
              </h1>
              <p
                style={{
                  color: "#a0aec0",
                  marginBottom: "32px",
                  fontSize: "clamp(14px, 2vw, 18px)",
                  lineHeight: "1.6",
                }}
              >
                A stock trading game with heart puzzles
              </p>

              <div
                style={{
                  marginBottom: "32px",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    marginBottom: "16px",
                    color: "#e2e8f0",
                    fontWeight: "600",
                    fontSize: "16px",
                    textAlign: "center",
                  }}
                >
                  Select Difficulty:
                </div>
                <Radio.Group
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  size="large"
                  style={{
                    width: "100%",
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <Radio.Button
                    value={DifficultyLevel.EASY}
                    style={{
                      flex: 1,
                      height: "56px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: "600",
                      background:
                        selectedDifficulty === DifficultyLevel.EASY
                          ? "rgba(72, 187, 120, 0.2)"
                          : "#2d3748",
                      border:
                        selectedDifficulty === DifficultyLevel.EASY
                          ? "2px solid #48bb78"
                          : "1px solid #4a5568",
                      color:
                        selectedDifficulty === DifficultyLevel.EASY
                          ? "#48bb78"
                          : "#a0aec0",
                      transition: "all 0.3s ease",
                    }}
                  >
                    🟢 Easy
                  </Radio.Button>
                  <Radio.Button
                    value={DifficultyLevel.MEDIUM}
                    style={{
                      flex: 1,
                      height: "56px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: "600",
                      background:
                        selectedDifficulty === DifficultyLevel.MEDIUM
                          ? "rgba(66, 153, 225, 0.2)"
                          : "#2d3748",
                      border:
                        selectedDifficulty === DifficultyLevel.MEDIUM
                          ? "2px solid #4299e1"
                          : "1px solid #4a5568",
                      color:
                        selectedDifficulty === DifficultyLevel.MEDIUM
                          ? "#63b3ed"
                          : "#a0aec0",
                      transition: "all 0.3s ease",
                    }}
                  >
                    🔵 Medium
                  </Radio.Button>
                  <Radio.Button
                    value={DifficultyLevel.HARD}
                    style={{
                      flex: 1,
                      height: "56px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: "600",
                      background:
                        selectedDifficulty === DifficultyLevel.HARD
                          ? "rgba(245, 101, 101, 0.2)"
                          : "#2d3748",
                      border:
                        selectedDifficulty === DifficultyLevel.HARD
                          ? "2px solid #f56565"
                          : "1px solid #4a5568",
                      color:
                        selectedDifficulty === DifficultyLevel.HARD
                          ? "#f56565"
                          : "#a0aec0",
                      transition: "all 0.3s ease",
                    }}
                  >
                    🔴 Hard
                  </Radio.Button>
                </Radio.Group>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "20px",
                    background:
                      selectedDifficulty === DifficultyLevel.EASY
                        ? "rgba(72, 187, 120, 0.1)"
                        : selectedDifficulty === DifficultyLevel.MEDIUM
                        ? "rgba(66, 153, 225, 0.1)"
                        : "rgba(245, 101, 101, 0.1)",
                    borderRadius: "12px",
                    border:
                      selectedDifficulty === DifficultyLevel.EASY
                        ? "1px solid rgba(72, 187, 120, 0.3)"
                        : selectedDifficulty === DifficultyLevel.MEDIUM
                        ? "1px solid rgba(66, 153, 225, 0.3)"
                        : "1px solid rgba(245, 101, 101, 0.3)",
                    fontSize: "14px",
                    color: "#cbd5e0",
                    textAlign: "left",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "12px",
                      fontWeight: "700",
                      fontSize: "16px",
                      color: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {selectedDifficulty === DifficultyLevel.EASY && (
                      <>
                        <span>🟢</span>
                        <span>Easy Mode</span>
                      </>
                    )}
                    {selectedDifficulty === DifficultyLevel.MEDIUM && (
                      <>
                        <span>🔵</span>
                        <span>Medium Mode</span>
                      </>
                    )}
                    {selectedDifficulty === DifficultyLevel.HARD && (
                      <>
                        <span>🔴</span>
                        <span>Hard Mode</span>
                      </>
                    )}
                  </div>
                  {selectedDifficulty === DifficultyLevel.EASY && (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "24px",
                        lineHeight: "1.8",
                        listStyle: "none",
                      }}
                    >
                      <li style={{ marginBottom: "8px" }}>
                        ⏱️ <strong>60 seconds</strong> per round
                      </li>
                      <li style={{ marginBottom: "8px" }}>
                        📊 <strong>±10%</strong> price variance
                      </li>
                      <li style={{ marginBottom: "8px" }}>
                        🖼️ <strong>Slight blur</strong> (2px) on images
                      </li>
                      <li>
                        🎁 <strong>Lower thresholds</strong> for tool unlocks
                      </li>
                    </ul>
                  )}
                  {selectedDifficulty === DifficultyLevel.MEDIUM && (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "24px",
                        lineHeight: "1.8",
                        listStyle: "none",
                      }}
                    >
                      <li style={{ marginBottom: "8px" }}>
                        ⏱️ <strong>40 seconds</strong> per round
                      </li>
                      <li style={{ marginBottom: "8px" }}>
                        📊 <strong>±20%</strong> price variance
                      </li>
                      <li style={{ marginBottom: "8px" }}>
                        🖼️ <strong>Medium blur</strong> (4px) on images
                      </li>
                      <li>
                        🎁 <strong>Standard thresholds</strong> for tool unlocks
                      </li>
                    </ul>
                  )}
                  {selectedDifficulty === DifficultyLevel.HARD && (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "24px",
                        lineHeight: "1.8",
                        listStyle: "none",
                      }}
                    >
                      <li style={{ marginBottom: "8px" }}>
                        ⏱️ <strong>30 seconds</strong> per round
                      </li>
                      <li style={{ marginBottom: "8px" }}>
                        📊 <strong>±30%</strong> price variance
                      </li>
                      <li style={{ marginBottom: "8px" }}>
                        🖼️ <strong>Strong blur</strong> (8px) on images
                      </li>
                      <li>
                        🎁 <strong>Higher thresholds</strong> for tool unlocks
                      </li>
                    </ul>
                  )}
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                onClick={handleStartGame}
                style={{
                  background:
                    "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "18px",
                  height: "56px",
                  padding: "0 48px",
                  boxShadow: "0 4px 12px rgba(66, 153, 225, 0.4)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(66, 153, 225, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(66, 153, 225, 0.4)";
                }}
              >
                🎮 Start New Game
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleResendVerification = async () => {
    if (!user?.email) return;

    try {
      await authAPI.resendVerificationEmail(user.email);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          "Failed to send verification email"
      );
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#0a0e27" }}>
      <Header />
      <div style={{ padding: "24px" }}>
        {/* Email Verification Alert - Only show if user has email */}
        {emailVerified === false && user?.email && (
          <Alert
            message="Email Not Verified"
            description={
              <div style={{ color: "#cbd5e0" }}>
                <span>Verify your email for password recovery. </span>
                <a
                  onClick={handleResendVerification}
                  style={{
                    cursor: "pointer",
                    color: "#63b3ed",
                    fontWeight: "600",
                    textDecoration: "underline",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#4299e1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#63b3ed";
                  }}
                >
                  Resend verification email
                </a>
              </div>
            }
            type="info"
            showIcon
            closable
            style={{
              marginBottom: "24px",
              background: "rgba(66, 153, 225, 0.1)",
              border: "1px solid rgba(66, 153, 225, 0.3)",
              borderRadius: "8px",
            }}
          />
        )}

        <Card
          className="mb-6"
          style={{
            background: "#1a1f3a",
            border: "1px solid #2d3748",
            borderRadius: "12px",
          }}
          bodyStyle={{ padding: "24px" }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Statistic
                title={
                  <span
                    style={{
                      color: "#a0aec0",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    Current Capital
                  </span>
                }
                value={portfolio?.cash ?? gameSession.currentCapital}
                prefix="$"
                precision={2}
                valueStyle={{
                  color: "#48bb78",
                  fontSize: "26px",
                  fontWeight: "bold",
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Statistic
                title={
                  <span
                    style={{
                      color: "#a0aec0",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    Round
                  </span>
                }
                value={gameSession.currentRound}
                suffix={`/ 3`}
                valueStyle={{
                  color: "#63b3ed",
                  fontSize: "26px",
                  fontWeight: "bold",
                }}
              />
              {gameSession.difficultyLevel && (
                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "11px",
                    color:
                      gameSession.difficultyLevel === DifficultyLevel.EASY
                        ? "#48bb78"
                        : gameSession.difficultyLevel === DifficultyLevel.HARD
                        ? "#f56565"
                        : "#63b3ed",
                    fontWeight: "600",
                  }}
                >
                  {gameSession.difficultyLevel === DifficultyLevel.EASY &&
                    "🟢 Easy"}
                  {gameSession.difficultyLevel === DifficultyLevel.MEDIUM &&
                    "🔵 Medium"}
                  {gameSession.difficultyLevel === DifficultyLevel.HARD &&
                    "🔴 Hard"}
                </div>
              )}
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Statistic
                title={
                  <span
                    style={{
                      color: "#a0aec0",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    Time Remaining
                  </span>
                }
                value={
                  !currentRound
                    ? "Waiting..."
                    : formatTime(timeRemaining)
                }
                valueStyle={{
                  color:
                    !currentRound
                      ? "#718096"
                      : timeRemaining < 10
                      ? "#fc8181"
                      : timeRemaining < 30
                      ? "#f6ad55"
                      : "#48bb78",
                  fontSize: "26px",
                  fontWeight: "bold",
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              {!currentRound &&
                gameSession &&
                gameSession.currentRound <= 3 && (
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleStartRound}
                    block
                    style={{
                      height: "100%",
                      background: "#4299e1",
                      border: "none",
                      fontWeight: "bold",
                      fontSize: "16px",
                      minHeight: "80px",
                    }}
                  >
                    Start Round {gameSession.currentRound}
                  </Button>
                )}
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col xs={24} sm={24} md={24} lg={14} xl={14}>
            <MarketPanel
              sessionId={gameSession.id}
              onStockSelect={setSelectedStock}
              selectedStockId={selectedStock?.id}
              roundNumber={currentRound?.roundNumber}
              difficultyLevel={gameSession.difficultyLevel}
              refreshTrigger={marketRefreshTrigger}
              onImagesLoaded={() => {
                // Images loaded callback
              }}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={10} xl={10}>
            <TradingPanel
              sessionId={gameSession.id}
              onTrade={loadPortfolio}
              selectedStock={selectedStock}
            />
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <PortfolioPanel portfolio={portfolio} />
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <ToolsPanel 
              sessionId={gameSession.id}
              onTimeBoost={(secondsAdded) => {
                // Add to timeBoostAdded which is used in the timer calculation
                setTimeBoostAdded((prev) => prev + secondsAdded);
                // Also immediately add to current time remaining for instant feedback
                setTimeRemaining((prev) => prev + secondsAdded);
              }}
            />
          </Col>
        </Row>

        {roundResult && (
          <RoundResultModal
            result={roundResult}
            onClose={async () => {
              setRoundResult(null);
              if (roundResult.gameComplete) {
                // Fetch game summary before showing it
                if (gameSession?.id) {
                  try {
                    const summary = await gameAPI.getGameSummary(gameSession.id);
                    setGameSummary(summary);
                  } catch (error) {
                    console.error("Failed to fetch game summary:", error);
                    toast.error("Failed to load game summary");
                    // Still clear the game session even if summary fails
                    if (user?.userId) {
                      loadGameSession(user.userId).then(() => {
                        setCurrentRound(null);
                      });
                    } else {
                      setCurrentRound(null);
                    }
                  }
                } else {
                  // No session ID, just clear
                  if (user?.userId) {
                    loadGameSession(user.userId).then(() => {
                      setCurrentRound(null);
                    });
                  } else {
                    setCurrentRound(null);
                  }
                }
              } else {
                handleStartRound();
              }
            }}
          />
        )}

        {gameSummary && (
          <GameSummaryModal
            summary={gameSummary}
            onClose={() => {
              setGameSummary(null);
              toast.success("Game Complete!");
              // Explicitly clear game session and round to return to difficulty selection
              // Don't call loadGameSession as it's unnecessary - just clear the state directly
              setGameSession(null);
              setCurrentRound(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Game;
