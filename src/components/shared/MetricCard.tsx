'use client';

import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import useStyles from './style/MetricCard.style';

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
  const { styles } = useStyles();

  return (
    <Card loading={loading} bordered={false}>
      <Statistic
        title={<Text type="secondary">{title}</Text>}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ fontWeight: 'bold' }} // Ant Design Statistic valueStyle is a direct prop, but we can also use className if supported or keep it for now if it's the standard way for this specific component's sub-element. However, let's try to move it.
      />
      {trend !== undefined && (
        <div className={styles.trendContainer}>
          <Text type={trend >= 0 ? 'success' : 'danger'}>
            {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(trend)}%
          </Text>
          <Text type="secondary" className={styles.trendText}>
            vs last month
          </Text>
        </div>
      )}
    </Card>
  );
};

export default MetricCard;
