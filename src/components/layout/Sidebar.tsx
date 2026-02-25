'use client';

import React from 'react';
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

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { styles } = useStyles();

  const menuItems: MenuItem[] = [
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
    },
  ];

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
