'use client';

import React, { useMemo } from 'react';
import { Layout, Menu, Drawer, Grid } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  SolutionOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  AccountBookOutlined,
  HistoryOutlined,
  SettingOutlined,

} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';
import Image from 'next/image';
import useStyles from './style/Sidebar.style';
import { useAuth } from '../../providers/authProvider';
import { UserRole } from '../../types';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number] & {
  roles?: UserRole[];
};

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { styles } = useStyles();
  const { user } = useAuth();

  const allMenuItems: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/clients',
      icon: <TeamOutlined />,
      label: 'Clients',
    },
    {
      key: '/opportunities',
      icon: <SolutionOutlined />,
      label: 'Pipeline',
    },
    {
      key: '/pricing-requests',
      icon: <AccountBookOutlined />,
      label: 'Pricing Requests',
    },
    {
      key: '/proposals',
      icon: <FileTextOutlined />,
      label: 'Proposals',
    },
    {
      key: '/contracts',
      icon: <FileProtectOutlined />,
      label: 'Contracts',
    },
    {
      key: '/activities',
      icon: <HistoryOutlined />,
      label: 'Activities',
    },
    {
      type: 'divider',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      roles: [UserRole.ADMIN],
    },
  ];

  const menuItems = useMemo(() => {

    return allMenuItems.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      return user?.roles?.some((r) => item.roles!.includes(r)) ?? false;
    });
  }, [user?.roles]);

  const sidebarContent = (
      <>
        <div className={styles.logoContainer}>
          <Image 
            src="/logo.svg" 
            alt="Nexus Logo" 
            width={24} 
            height={24} 
            className={styles.logo}
          />
          <h2 className={styles.logoText}>NEXUS</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => {
            router.push(key);
            onMobileClose(); // auto-close drawer on click on mobile
          }}
          className={styles.menu}
        />
      </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <Sider
        breakpoint="md"
        collapsedWidth="0"
        trigger={null}
        theme="dark"
        className={`${styles.sider} desktop-sidebar`}
      >
        {sidebarContent}
      </Sider>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        title={null}
        placement="left"
        onClose={onMobileClose}
        open={mobileOpen}
        styles={{ body: { padding: 0, backgroundColor: '#0B3B73' } }}
        width={250}
        className="mobile-sidebar-drawer"
        closable={false}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
