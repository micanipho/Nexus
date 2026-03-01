'use client';

import React from 'react';
import { Typography, Breadcrumb, Space, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStyles from './style/PageHeader.style';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  breadcrumbs: { title: string; href?: string }[];
  extra?: React.ReactNode;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, extra, action }) => {
  const { styles } = useStyles();
  const router = useRouter();

  const breadcrumbItems = breadcrumbs.map((bc) => ({
    title: bc.href ? <Link href={bc.href}>{bc.title}</Link> : bc.title,
  }));

  return (
    <div className={styles.container}>
      <Breadcrumb className={styles.breadcrumb} items={breadcrumbItems} />
      <div className={styles.headerContent}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {breadcrumbs.length >= 3 && (
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()} />
            )}
            <Title level={2} className={styles.title}>
            {title}
            </Title>
            {action}
        </div>
        <Space wrap>{extra}</Space>
      </div>
    </div>
  );
};

export default PageHeader;
