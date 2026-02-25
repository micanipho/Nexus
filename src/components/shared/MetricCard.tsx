'use client';

import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface MetricCardProps {
  title: string;
  value: string | number;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: number; // percentage
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  prefix, 
  suffix, 
  trend, 
  loading 
}) => {
  return (
    <Card loading={loading} bordered={false} className="metric-card">
      <Statistic
        title={<Text type="secondary">{title}</Text>}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ fontWeight: 'bold' }}
      />
      {trend !== undefined && (
        <div style={{ marginTop: 8 }}>
          <Text type={trend >= 0 ? 'success' : 'danger'}>
            {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(trend)}%
          </Text>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            vs last month
          </Text>
        </div>
      )}
    </Card>
  );
};

export default MetricCard;
