'use client';

import React, { useMemo } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  SolutionOutlined,
  FileProtectOutlined,
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
  /** When set, the item is only visible to users who hold one of these roles. */
  roles?: UserRole[];
};

const Sidebar: React.FC = () => {
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

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      theme="dark"
      className={styles.sider}
    >
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
        onClick={({ key }) => router.push(key)}
        className={styles.menu}
      />
    </Sider>
  );
};

export default Sidebar;
