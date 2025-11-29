import { useState, useEffect } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.warning('Reset token is missing. Please use the link from your email.');
    }
  }, [token]);

  const onResetPassword = async (values: { newPassword: string }) => {
    if (!token) {
      toast.error('Reset token is required');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ token, newPassword: values.newPassword });
      toast.success('Password reset successfully! Please log in with your new password.');
      navigate('/login');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || 'Failed to reset password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e27', padding: '16px' }}>
      <Card style={{ width: '100%', maxWidth: '480px', background: 'rgba(26, 31, 58, 0.95)', border: '1px solid rgba(66, 153, 225, 0.3)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', color: '#e2e8f0' }}>Reset Password</h2>
        <Form onFinish={onResetPassword} layout="vertical">
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              disabled={!token}
            >
              Reset Password
            </Button>
          </Form.Item>
          <Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Link to="/login">Back to Login</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;

