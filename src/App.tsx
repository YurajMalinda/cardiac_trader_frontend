import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GameProvider } from "./context/GameContext";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import Game from "./pages/Game";
import { ConfigProvider } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If still loading, show children anyway (they handle their own loading states)
  // This prevents white screen flash during navigation
  if (isLoading) {
    return <>{children}</>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route component (redirect to game if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If still loading, show children anyway (they handle their own loading states)
  // This prevents white screen flash during navigation
  if (isLoading) {
    return <>{children}</>;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/game" replace />;
};

function AppContent() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <PublicRoute>
            <VerifyEmail />
          </PublicRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <Game />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4299e1",
          borderRadius: 8,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          colorBgContainer: "#1a1f3a",
          colorText: "#e2e8f0",
          colorTextSecondary: "#cbd5e0",
        },
        components: {
          Card: {
            borderRadius: 12,
            colorBgContainer: "#1a1f3a",
            colorBorderSecondary: "#2d3748",
          },
          Button: {
            borderRadius: 6,
          },
          Table: {
            colorBgContainer: "#1a1f3a",
            colorBorderSecondary: "#2d3748",
            colorTextHeading: "#e2e8f0",
            colorText: "#cbd5e0",
          },
          Input: {
            colorBgContainer: "#2d3748",
            colorBorder: "#4a5568",
            colorText: "#e2e8f0",
          },
          Select: {
            colorBgContainer: "#2d3748",
            colorBorder: "#4a5568",
            colorText: "#e2e8f0",
          },
          Tabs: {
            colorBgContainer: "#1a1f3a",
            itemColor: "#a0aec0",
            itemSelectedColor: "#4299e1",
            itemHoverColor: "#63b3ed",
            inkBarColor: "#4299e1",
          },
          Alert: {
            colorBgContainer: "#1a1f3a",
            colorInfoBg: "rgba(66, 153, 225, 0.1)",
            colorInfoBorder: "rgba(66, 153, 225, 0.3)",
            colorInfo: "#63b3ed",
            colorSuccessBg: "rgba(72, 187, 120, 0.1)",
            colorSuccessBorder: "rgba(72, 187, 120, 0.3)",
            colorSuccess: "#48bb78",
            colorWarningBg: "rgba(246, 173, 85, 0.1)",
            colorWarningBorder: "rgba(246, 173, 85, 0.3)",
            colorWarning: "#f6ad55",
            colorErrorBg: "rgba(245, 101, 101, 0.1)",
            colorErrorBorder: "rgba(245, 101, 101, 0.3)",
            colorError: "#f56565",
            colorText: "#e2e8f0",
            colorTextHeading: "#e2e8f0",
            borderRadius: 8,
          },
          Radio: {
            colorPrimary: "#4299e1",
            colorText: "#e2e8f0",
            colorTextSecondary: "#a0aec0",
            colorBorder: "#4a5568",
            colorBgContainer: "#2d3748",
            borderRadius: 8,
          },
          Dropdown: {
            colorBgElevated: "#1a1f3a",
            colorText: "#e2e8f0",
            colorTextSecondary: "#cbd5e0",
            borderRadius: 8,
            boxShadowSecondary: "0 4px 12px rgba(0, 0, 0, 0.5)",
            controlItemBgHover: "#2d3748",
            controlItemBgActive: "#2d3748",
            controlItemBgActiveHover: "#4a5568",
          },
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <GameProvider>
            <AppContent />
          </GameProvider>
        </AuthProvider>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="dark"
        style={{
          top: "20px",
        }}
        toastStyle={{
          background: "#1a1f3a",
          color: "#e2e8f0",
          border: "1px solid #2d3748",
          borderRadius: "8px",
        }}
      />
    </ConfigProvider>
  );
}

export default App;
