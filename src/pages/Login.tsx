import { useState } from "react";
import { Form, Input, Button, Card, Tabs, Typography } from "antd";
import { Link } from "react-router-dom";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const onLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      toast.success(`🎉 Welcome back, ${values.username}!`);
      setTimeout(() => {
        navigate("/game");
      }, 500);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          "❌ Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values: {
    username: string;
    password: string;
    email: string;
  }) => {
    setLoading(true);
    try {
      await register(values.username, values.password, values.email);
      if (values.email) {
        toast.success(
          <div>
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>
              ✨ Account created successfully!
            </div>
            <div style={{ fontSize: "13px", color: "#cbd5e0" }}>
              Welcome, {values.username}! Please check your email to verify your
              account.
            </div>
          </div>,
          { autoClose: 5000 }
        );
      } else {
        toast.success(
          <div>
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>
              ✨ Account created successfully!
            </div>
            <div style={{ fontSize: "13px", color: "#cbd5e0" }}>
              Welcome, {values.username}! You can add an email later for
              password recovery.
            </div>
          </div>,
          { autoClose: 4000 }
        );
      }
      setTimeout(() => {
        navigate("/game");
      }, 500);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        <div>
          <div style={{ fontWeight: "600", marginBottom: "4px" }}>
            ❌ Registration Failed
          </div>
          <div style={{ fontSize: "13px", color: "#cbd5e0" }}>
            {axiosError.response?.data?.message ||
              "Please check your information and try again."}
          </div>
        </div>,
        { autoClose: 4000 }
      );
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword({ email: values.email });
      toast.success(
        <div>
          <div style={{ fontWeight: "600", marginBottom: "4px" }}>
            📧 Reset Link Sent!
          </div>
          <div style={{ fontSize: "13px", color: "#cbd5e0" }}>
            {response.message ||
              "Please check your email for password reset instructions."}
          </div>
        </div>,
        { autoClose: 5000 }
      );
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        <div>
          <div style={{ fontWeight: "600", marginBottom: "4px" }}>
            ❌ Failed to Send Reset Email
          </div>
          <div style={{ fontSize: "13px", color: "#cbd5e0" }}>
            {axiosError.response?.data?.message ||
              "Please check your email address and try again."}
          </div>
        </div>,
        { autoClose: 4000 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2d3748 100%)",
        padding: "16px",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background:
            "radial-gradient(circle, rgba(66, 153, 225, 0.1) 0%, transparent 70%)",
          animation: "pulse 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-card {
          animation: fadeIn 0.6s ease-out;
          max-width: 100%;
          box-sizing: border-box;
        }
        .login-card * {
          box-sizing: border-box;
        }
        .login-card .ant-form-item {
          width: 100%;
          margin-bottom: 20px;
        }
        .login-card .ant-input,
        .login-card .ant-input-password,
        .login-card .ant-btn {
          width: 100%;
          box-sizing: border-box;
        }
        /* Responsive max-width adjustments */
        @media (min-width: 768px) {
          .login-card {
            max-width: 480px !important;
          }
        }
        @media (max-width: 767px) {
          .login-card {
            max-width: calc(100vw - 32px) !important;
          }
        }
        @media (max-width: 480px) {
          .login-card {
            max-width: calc(100vw - 32px) !important;
          }
          .login-card .ant-form-item {
            margin-bottom: 16px;
          }
        }
        @media (max-width: 360px) {
          .login-card {
            max-width: calc(100vw - 32px) !important;
          }
        }
      `}</style>

      <Card
        className="login-card"
        style={{
          width: "100%",
          maxWidth: "min(480px, calc(100vw - 32px))",
          borderRadius: "16px",
          background: "rgba(26, 31, 58, 0.95)",
          border: "1px solid rgba(66, 153, 225, 0.3)",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(66, 153, 225, 0.1)",
          backdropFilter: "blur(10px)",
          boxSizing: "border-box",
        }}
        bodyStyle={{
          padding: "clamp(24px, 5vw, 40px) clamp(20px, 4vw, 32px)",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              fontSize: "clamp(48px, 8vw, 64px)",
              marginBottom: "12px",
              animation: "float 3s ease-in-out infinite",
              lineHeight: "1",
            }}
          >
            ❤️
          </div>
          <Title
            level={1}
            style={{
              color: "#e2e8f0",
              marginBottom: "8px",
              fontSize: "clamp(24px, 5vw, 36px)",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #4299e1 0%, #9f7aea 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: "1.2",
              wordBreak: "break-word",
            }}
          >
            Cardiac Trader
          </Title>
          <Paragraph
            style={{
              color: "#a0aec0",
              marginBottom: 0,
              fontSize: "clamp(14px, 3vw, 16px)",
              lineHeight: "1.5",
            }}
          >
            Trade stocks, solve heart puzzles, and master the market
          </Paragraph>
        </div>

        <Tabs
          defaultActiveKey="login"
          size="large"
          style={{
            color: "#e2e8f0",
            width: "100%",
          }}
          items={[
            {
              key: "login",
              label: (
                <span
                  style={{
                    color: "#e2e8f0",
                    fontSize: "clamp(14px, 3vw, 16px)",
                    fontWeight: "600",
                  }}
                >
                  🔐 Login
                </span>
              ),
              children: (
                <Form
                  onFinish={onLogin}
                  layout="vertical"
                  requiredMark={false}
                  style={{ marginTop: "24px", width: "100%" }}
                >
                  <Form.Item
                    name="username"
                    label={
                      <span style={{ color: "#cbd5e0", fontWeight: "600" }}>
                        Username
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please input your username!",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined style={{ color: "#4299e1" }} />}
                      placeholder="Enter your username"
                      style={{
                        background: "#2d3748",
                        border: "1px solid #4a5568",
                        color: "#e2e8f0",
                        height: "48px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label={
                      <span style={{ color: "#cbd5e0", fontWeight: "600" }}>
                        Password
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined style={{ color: "#4299e1" }} />}
                      placeholder="Enter your password"
                      style={{
                        background: "#2d3748",
                        border: "1px solid #4a5568",
                        color: "#e2e8f0",
                        height: "48px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: "16px" }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      loading={loading}
                      style={{
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        background:
                          "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(66, 153, 225, 0.4)",
                      }}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
                    <Link
                      to="/forgot-password"
                      style={{
                        color: "#4299e1",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = "underline";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = "none";
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "register",
              label: (
                <span
                  style={{
                    color: "#e2e8f0",
                    fontSize: "clamp(14px, 3vw, 16px)",
                    fontWeight: "600",
                  }}
                >
                  ✨ Register
                </span>
              ),
              children: (
                <Form
                  onFinish={onRegister}
                  layout="vertical"
                  requiredMark={false}
                  style={{ marginTop: "24px", width: "100%" }}
                >
                  <Form.Item
                    name="username"
                    label={
                      <span style={{ color: "#cbd5e0", fontWeight: "600" }}>
                        Username
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please input your username!",
                      },
                      {
                        min: 3,
                        message: "Username must be at least 3 characters",
                      },
                      {
                        max: 50,
                        message: "Username must be less than 50 characters",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined style={{ color: "#4299e1" }} />}
                      placeholder="Choose a username"
                      style={{
                        background: "#2d3748",
                        border: "1px solid #4a5568",
                        color: "#e2e8f0",
                        height: "48px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label={
                      <span style={{ color: "#cbd5e0", fontWeight: "600" }}>
                        Email{" "}
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          (Optional)
                        </Text>
                      </span>
                    }
                    rules={[
                      { type: "email", message: "Please enter a valid email!" },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<MailOutlined style={{ color: "#4299e1" }} />}
                      placeholder="your@email.com (for password recovery)"
                      style={{
                        background: "#2d3748",
                        border: "1px solid #4a5568",
                        color: "#e2e8f0",
                        height: "48px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label={
                      <span style={{ color: "#cbd5e0", fontWeight: "600" }}>
                        Password
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                      {
                        min: 6,
                        message: "Password must be at least 6 characters",
                      },
                    ]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined style={{ color: "#4299e1" }} />}
                      placeholder="Create a password (min 6 characters)"
                      style={{
                        background: "#2d3748",
                        border: "1px solid #4a5568",
                        color: "#e2e8f0",
                        height: "48px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      loading={loading}
                      style={{
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        background:
                          "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(66, 153, 225, 0.4)",
                      }}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </Form.Item>
                  <div style={{ marginTop: "16px", textAlign: "center" }}>
                    <Text style={{ color: "#a0aec0", fontSize: "12px" }}>
                      By registering, you agree to start trading! 🎮
                    </Text>
                  </div>
                </Form>
              ),
            },
            {
              key: "forgot-password",
              label: (
                <span
                  style={{
                    color: "#e2e8f0",
                    fontSize: "clamp(14px, 3vw, 16px)",
                    fontWeight: "600",
                  }}
                >
                  🔑 Reset Password
                </span>
              ),
              children: (
                <div style={{ marginTop: "24px" }}>
                  <Paragraph
                    style={{
                      color: "#a0aec0",
                      textAlign: "center",
                      marginBottom: "32px",
                      fontSize: "14px",
                    }}
                  >
                    Enter your email address and we'll send you a password reset
                    link.
                  </Paragraph>
                  <Form
                    onFinish={onForgotPassword}
                    layout="vertical"
                    requiredMark={false}
                    style={{ width: "100%" }}
                  >
                    <Form.Item
                      name="email"
                      label={
                        <span style={{ color: "#cbd5e0", fontWeight: "600" }}>
                          Email
                        </span>
                      }
                      rules={[
                        { required: true, message: "Please input your email!" },
                        {
                          type: "email",
                          message: "Please enter a valid email!",
                        },
                      ]}
                    >
                      <Input
                        size="large"
                        prefix={<MailOutlined style={{ color: "#4299e1" }} />}
                        placeholder="Enter your email address"
                        style={{
                          background: "#2d3748",
                          border: "1px solid #4a5568",
                          color: "#e2e8f0",
                          height: "48px",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                      />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: "16px" }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        loading={loading}
                        style={{
                          height: "48px",
                          fontSize: "16px",
                          fontWeight: "bold",
                          background:
                            "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(66, 153, 225, 0.4)",
                        }}
                      >
                        {loading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
                      <Link
                        to="/reset-password"
                        style={{
                          color: "#4299e1",
                          textDecoration: "none",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = "none";
                        }}
                      >
                        Already have a reset token?
                      </Link>
                    </Form.Item>
                  </Form>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Login;
