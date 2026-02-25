'use client';

import React from 'react';
import { Row, Col } from 'antd';
import PageHeader from '@/components/shared/PageHeader';
import MetricCard from '@/components/shared/MetricCard';
import { 
  DollarOutlined, 
  LineChartOutlined, 
  TeamOutlined, 
  FileDoneOutlined 
} from '@ant-design/icons';

export default function DashboardPage() {
  const breadcrumbs = [
    { title: 'Nexus', href: '/' },
    { title: 'Dashboard' }
  ];

  return (
    <div>
      <PageHeader title="Executive Overview" breadcrumbs={breadcrumbs} />
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="Total Revenue" 
            value="$4.2M" 
            prefix={<DollarOutlined />} 
            trend={12} 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="Pipeline Value" 
            value="$12.8M" 
            prefix={<LineChartOutlined />} 
            trend={8} 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="Active Clients" 
            value="156" 
            prefix={<TeamOutlined />} 
            trend={3} 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="Win Rate" 
            value="64%" 
            prefix={<FileDoneOutlined />} 
            trend={-2} 
          />
        </Col>
      </Row>
    </div>
  );
}
