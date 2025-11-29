import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Space, Typography, Divider, Alert, Layout } from 'antd';
import { UserOutlined, MailOutlined, CheckCircleOutlined, CloseCircleOutlined, LockOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';
import Header from '../components/Header';
import type { UserProfile, UpdateProfileRequest } from '../types';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authAPI.getProfile();
      setProfile(data);
      form.setFieldsValue({
        displayName: data.displayName,
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || '',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || 'Failed to load profile'
      );
    }
  };

  const handleUpdate = async (values: UpdateProfileRequest) => {
    setLoading(true);
    try {
      const updated = await authAPI.updateProfile(values);
      setProfile(updated as UserProfile);
      setEditing(false);
      toast.success('Profile updated successfully!');
      // Refresh auth context
      window.location.reload(); // Simple refresh to update context
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!profile?.email) return;
    
    setLoading(true);
    try {
      await authAPI.resendVerificationEmail(profile.email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || 'Failed to send verification email'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string; confirmPassword?: string }) => {
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed successfully!');
      passwordForm.resetFields();
      setChangingPassword(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#0a0e27' }}>
        <Header />
        <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <Card style={{ background: '#1a1f3a', border: '1px solid #2d3748', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center', color: '#e2e8f0' }}>Loading profile...</div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#0a0e27' }}>
      <Header />
      <div style={{ padding: '24px' }}>
        <div className="max-w-4xl mx-auto w-full">
          <Card className="shadow-lg">
          <Space direction="vertical" size="large" className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Title level={2} className="mb-0">User Profile</Title>
              {!editing && (
                <Button type="primary" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Email Verification Alert */}
            {!profile.emailVerified && (
              <Alert
                message="Email Not Verified"
                description={
                  <div>
                    <Text>Please verify your email address to access all features.</Text>
                    <Button
                      type="link"
                      size="small"
                      onClick={handleResendVerification}
                      loading={loading}
                      className="ml-2"
                    >
                      Resend Verification Email
                    </Button>
                  </div>
                }
                type="warning"
                showIcon
                closable
              />
            )}

            {editing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdate}
                className="mt-4"
              >
                <Form.Item label="Avatar URL" name="avatarUrl">
                  <Input
                    placeholder="Enter avatar image URL"
                    prefix={<UserOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  label="Display Name"
                  name="displayName"
                  rules={[
                    { required: true, message: 'Please enter a display name!' },
                    { max: 100, message: 'Display name must be less than 100 characters' },
                  ]}
                >
                  <Input placeholder="Enter display name" />
                </Form.Item>

                <Form.Item
                  label="Bio"
                  name="bio"
                  rules={[
                    { max: 500, message: 'Bio must be less than 500 characters' },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Save Changes
                    </Button>
                    <Button onClick={() => {
                      setEditing(false);
                      form.resetFields();
                    }}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <div className="mt-4">
                <Space direction="vertical" size="large" className="w-full">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-start gap-6">
                    <Avatar
                      size={120}
                      src={profile.avatarUrl}
                      icon={<UserOutlined />}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1">
                      <Title level={3} className="mb-2">
                        {profile.displayName || profile.username}
                      </Title>
                      <Space direction="vertical" size="small">
                        <Space>
                          <UserOutlined />
                          <Text strong>Username:</Text>
                          <Text>{profile.username}</Text>
                        </Space>
                        <Space>
                          <MailOutlined />
                          <Text strong>Email:</Text>
                          <Text>{profile.email}</Text>
                          {profile.emailVerified ? (
                            <Space className="text-green-600">
                              <CheckCircleOutlined />
                              <Text type="success">Verified</Text>
                            </Space>
                          ) : (
                            <Space className="text-orange-600">
                              <CloseCircleOutlined />
                              <Text type="warning">Not Verified</Text>
                            </Space>
                          )}
                        </Space>
                      </Space>
                    </div>
                  </div>

                  <Divider />

                  {/* Bio */}
                  {profile.bio && (
                    <div>
                      <Title level={5}>Bio</Title>
                      <Text>{profile.bio}</Text>
                    </div>
                  )}

                  <Divider />

                  {/* Account Info */}
                  <div>
                    <Title level={5}>Account Information</Title>
                    <Space direction="vertical" size="small" className="mt-2">
                      {profile.createdAt && (
                        <div>
                          <Text strong>Member since: </Text>
                          <Text>{new Date(profile.createdAt).toLocaleDateString()}</Text>
                        </div>
                      )}
                      {profile.lastLoginAt && (
                        <div>
                          <Text strong>Last login: </Text>
                          <Text>{new Date(profile.lastLoginAt).toLocaleString()}</Text>
                        </div>
                      )}
                    </Space>
                  </div>

                  <Divider />

                  {/* Change Password */}
                  <div>
                    <Title level={5}>Security</Title>
                    {!changingPassword ? (
                      <Button
                        icon={<LockOutlined />}
                        onClick={() => setChangingPassword(true)}
                        className="mt-2"
                      >
                        Change Password
                      </Button>
                    ) : (
                      <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                        className="mt-4"
                        style={{ maxWidth: '400px' }}
                      >
                        <Form.Item
                          label="Current Password"
                          name="currentPassword"
                          rules={[{ required: true, message: 'Please enter your current password!' }]}
                        >
                          <Input.Password placeholder="Enter current password" />
                        </Form.Item>

                        <Form.Item
                          label="New Password"
                          name="newPassword"
                          rules={[
                            { required: true, message: 'Please enter a new password!' },
                            { min: 6, message: 'Password must be at least 6 characters' },
                          ]}
                        >
                          <Input.Password placeholder="Enter new password" />
                        </Form.Item>

                        <Form.Item
                          label="Confirm New Password"
                          name="confirmPassword"
                          dependencies={['newPassword']}
                          rules={[
                            { required: true, message: 'Please confirm your new password!' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match!'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password placeholder="Confirm new password" />
                        </Form.Item>

                        <Form.Item>
                          <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                              Change Password
                            </Button>
                            <Button onClick={() => {
                              setChangingPassword(false);
                              passwordForm.resetFields();
                            }}>
                              Cancel
                            </Button>
                          </Space>
                        </Form.Item>
                      </Form>
                    )}
                  </div>
                </Space>
              </div>
            )}
          </Space>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

