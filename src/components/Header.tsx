import { Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Space, Avatar, Dropdown, type MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';

const { Header: AntHeader } = Layout;

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { clearGameState } = useGame();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Clear game state before logout
    clearGameState();
    await logout();
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <Link to="/profile" style={{ color: '#e2e8f0' }}>
          Profile
        </Link>
      ),
    },
    {
      key: 'divider',
      type: 'divider',
      style: { borderColor: '#2d3748' },
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span style={{ color: '#e2e8f0' }}>Logout</span>,
      onClick: handleLogout,
      danger: true,
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AntHeader
      style={{
        background: '#1a1f3a',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #2d3748',
      }}
    >
      <Link to="/game" style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 'bold' }}>
        Cardiac Trader
      </Link>
      <Space>
        <Link to="/game">
          <Button type="text" style={{ color: '#e2e8f0' }}>
            Game
          </Button>
        </Link>
        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          dropdownRender={(menu) => (
            <div
              style={{
                background: '#1a1f3a',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
              }}
            >
              {menu}
            </div>
          )}
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              src={user?.avatarUrl}
              icon={<UserOutlined />}
              size="small"
            />
            <span style={{ color: '#e2e8f0' }}>
              {user?.displayName || user?.username || 'User'}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;

