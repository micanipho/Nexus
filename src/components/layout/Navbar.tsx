'use client';

import React, { useMemo } from 'react';
import { Menu, Dropdown, Button, Avatar, App, Drawer, Switch, theme } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  SolutionOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LogoutOutlined,
  CopyOutlined,
  UserOutlined,
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
  SearchOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { MenuProps } from 'antd';
import useStyles from './style/Navbar.style';
import { useAuth, useAuthActions } from '../../providers/authProvider';
import { UserRole } from '../../types';
import { useThemeMode } from '../../providers/themeProvider';
import InviteModal from '../shared/InviteModal';

type MenuItem = Required<MenuProps>['items'][number] & {
  roles?: UserRole[];
};

interface NavbarProps {
  onOpenSearch?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { user } = useAuth();
  const authActions = useAuthActions();
  const { message } = App.useApp();
  const { isDarkMode, toggleDarkMode } = useThemeMode();
  
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);

  const allMenuItems: MenuItem[] = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/clients', icon: <TeamOutlined />, label: 'Clients' },
    { key: '/opportunities', icon: <SolutionOutlined />, label: 'Opportunities' },
    { key: '/pricing-requests', icon: <SolutionOutlined />, label: 'Pricing Requests' },
    { key: '/proposals', icon: <FileTextOutlined />, label: 'Proposals' },
    { key: '/contracts', icon: <FileProtectOutlined />, label: 'Contracts' },
    { key: '/activities', icon: <HistoryOutlined />, label: 'Activities' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
  ];

  const menuItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      return user?.roles?.some((r) => item.roles!.includes(r)) ?? false;
    });
  }, [user?.roles]);

  const handleLogout = async () => {
    if (authActions) {
      await authActions.logout();
    }
  };

  const copyTenantId = () => {
    if (user?.tenantId) {
      navigator.clipboard.writeText(user.tenantId);
      message.success('Workspace ID copied to clipboard');
    }
  };

  const userDropdownItems: MenuProps['items'] = [
    {
      key: 'tenant',
      icon: <CopyOutlined />,
      label: 'Copy Workspace ID',
      onClick: copyTenantId,
    },
    ...(user?.roles?.some(role => role === UserRole.ADMIN || role === UserRole.SALES_MANAGER) ? [
      {
        key: 'invite',
        icon: <TeamOutlined />,
        label: 'Invite Team Member',
        onClick: () => setInviteModalOpen(true),
      }
    ] : []),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: 'red' }} />,
      label: <span style={{ color: 'red' }}>Logout</span>,
      onClick: handleLogout,
    },
  ];

  const logoSection = (
    <div className={styles.logoContainer} onClick={() => router.push('/dashboard')}>
      <Image src="/logo.svg" alt="Nexus Logo" width={28} height={28} />
      <h2 className="logo-text">NEXUS</h2>
    </div>
  );

  return (
    <>
      <header className={styles.header}>
        {logoSection}

        <div className={styles.menuContainer}>
           <div className={styles.desktopOnly}>
             <Menu
                mode="horizontal"
                selectedKeys={[pathname]}
                items={menuItems}
                onClick={({ key }) => router.push(key)}
             />
           </div>
        </div>

        <div className={styles.rightSection}>
          <Button 
            type="text" 
            shape="circle" 
            size="large"
            onClick={onOpenSearch}
            icon={<SearchOutlined style={{ fontSize: '18px' }} />}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />

          <Button 
            type="text" 
            shape="circle" 
            size="large"
            onClick={toggleDarkMode}
            icon={isDarkMode ? <SunOutlined style={{ fontSize: '18px', color: '#FAAD14' }} /> : <MoonOutlined style={{ fontSize: '18px', color: '#8c8c8c' }} />}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />

          <Dropdown menu={{ items: userDropdownItems }} trigger={['click']} placement="bottomRight">
            <Avatar 
                size="large" 
                icon={<UserOutlined />} 
                style={{ cursor: 'pointer', backgroundColor: token.colorPrimary }}
            />
          </Dropdown>

          <Button 
            className={styles.mobileOnly} 
            type="text" 
            icon={<MenuOutlined style={{ fontSize: '20px' }} />} 
            onClick={() => setMobileMenuOpen(true)} 
          />
        </div>
      </header>

      <Drawer
        title={logoSection}
        placement="top"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 } }}
        closable={true}
      >
         <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={({ key }) => {
                router.push(key);
                setMobileMenuOpen(false);
            }}
            style={{ borderRight: 'none', paddingTop: '16px' }}
         />
      </Drawer>

      <InviteModal 
        open={inviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
