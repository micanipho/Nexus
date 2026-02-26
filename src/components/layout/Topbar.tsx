'use client';

import React from 'react';
import { Layout, Space, Typography, Button, Popconfirm, Tooltip, App } from 'antd';
import { LogoutOutlined, MenuOutlined, CopyOutlined } from '@ant-design/icons';
import { useAuth, useAuthActions } from '@/providers/authProvider';
import useStyles from './style/Topbar.style';

const { Header } = Layout;
const { Text } = Typography;

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { message } = App.useApp();
  const { styles } = useStyles();
  const { user } = useAuth();
  const authActions = useAuthActions();
  
  const handleLogout = async () => {
    if (authActions) {
      await authActions.logout();
    }
  };

  const copyTenantId = () => {
    if (user?.tenantId) {
      navigator.clipboard.writeText(user.tenantId);
      message.success('Tenant ID copied to clipboard');
    }
  };

  return (
    <Header className={styles.header}>
      <div className={styles.menuBtnWrapper}>
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          onClick={onMenuClick} 
          style={{ fontSize: '18px', marginRight: '16px' }}
        />
      </div>
      <div style={{ flex: 1 }} /> {/* Spacer if menu is hidden */}
      <Space size={12}>
        <div className={styles.tenantInfo}>
          <Text className={styles.tenantName}>{user?.tenantName || 'Organisation'}</Text>
          <Tooltip title="Copy Workspace ID">
            <Button 
              type="text" 
              size="small" 
              icon={<CopyOutlined style={{ fontSize: '12px' }} />} 
              onClick={copyTenantId}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </Tooltip>
        </div>

        <div className={styles.userSpace}>
          <Text className={styles.userName}>
            {user ? `${user.firstName} ${user.lastName}` : 'John Doe'}
          </Text>
        </div>
        
        <Popconfirm
          title="Logout"
          description="Are you sure you want to log out?"
          onConfirm={handleLogout}
          okText="Yes"
          cancelText="No"
          placement="bottomRight"
        >
          <Button 
            type="text" 
            danger 
            icon={<LogoutOutlined />} 
            className={styles.logoutDesktop}
          >
            Logout
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<LogoutOutlined />} 
            className={styles.logoutMobile}
          />
        </Popconfirm>
      </Space>
    </Header>
  );
};

export default Topbar;
