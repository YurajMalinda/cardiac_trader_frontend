import { useState, useEffect } from 'react';
import { Card, Button, Result } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      toast.error('Verification token is missing');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setLoading(true);
    try {
      await authAPI.verifyEmail(verificationToken);
      setVerified(true);
      toast.success('Email verified successfully!');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || 'Failed to verify email'
      );
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '480px',
    background: 'rgba(26, 31, 58, 0.95)',
    border: '1px solid rgba(66, 153, 225, 0.3)',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0e27',
    padding: '16px',
  };

  if (!token) {
    return (
      <div style={containerStyle}>
        <Card style={cardStyle}>
          <Result
            status="error"
            title={<span style={{ color: '#e2e8f0' }}>Invalid Verification Link</span>}
            subTitle={<span style={{ color: '#a0aec0' }}>The verification link is invalid or missing. Please check your email for the correct link.</span>}
            extra={
              <Link to="/login">
                <Button type="primary">Go to Login</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  if (verified) {
    return (
      <div style={containerStyle}>
        <Card style={cardStyle}>
          <Result
            status="success"
            title={<span style={{ color: '#e2e8f0' }}>Email Verified Successfully!</span>}
            subTitle={<span style={{ color: '#a0aec0' }}>Your email has been verified. You can now log in to your account.</span>}
            extra={
              <Link to="/login">
                <Button type="primary">Go to Login</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Card style={cardStyle}>
        <Result
          status="info"
          title={<span style={{ color: '#e2e8f0' }}>Verifying Email...</span>}
          subTitle={<span style={{ color: '#a0aec0' }}>Please wait while we verify your email address.</span>}
          extra={<Button loading={loading}>Verifying...</Button>}
        />
      </Card>
    </div>
  );
};

export default VerifyEmail;

