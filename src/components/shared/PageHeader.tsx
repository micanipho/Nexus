'use client';

import React from 'react';
import { Typography, Breadcrumb, Space } from 'antd';
import Link from 'next/link';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  breadcrumbs: { title: string; href?: string }[];
  extra?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, extra }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Breadcrumb style={{ marginBottom: 8 }}>
        {breadcrumbs.map((bc, index) => (
          <Breadcrumb.Item key={index}>
            {bc.href ? <Link href={bc.href}>{bc.title}</Link> : bc.title}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          {title}
        </Title>
        <Space>{extra}</Space>
      </div>
    </div>
  );
};

export default PageHeader;
