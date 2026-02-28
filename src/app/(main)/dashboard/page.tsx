'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Alert, Card, Table, Typography, Statistic } from 'antd';
import PageHeader from '@/components/shared/PageHeader';
import MetricCard from '@/components/shared/MetricCard';
import { 
  DollarOutlined, 
  LineChartOutlined, 
  TeamOutlined, 
  FileDoneOutlined,
  CalendarOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dashboardService, { 
  DashboardOverview, 
  PipelineMetricsDetail, 
  SalesPerformance, 
  ActivitiesSummary 
} from '@/services/dashboardService';
import { useHasRole } from '@/hooks/useHasRole';
import { UserRole } from '@/types';
import CreateRenewalModal from '@/components/contracts/CreateRenewalModal';
import { Button, Tabs, Tag, Segmented, InputNumber, Space } from 'antd';
import dynamic from 'next/dynamic';

const Line = dynamic(() => import('@ant-design/plots').then((mod) => mod.Line), { ssr: false });
const Column = dynamic(() => import('@ant-design/plots').then((mod) => mod.Column), { ssr: false });
const Pie = dynamic(() => import('@ant-design/plots').then((mod) => mod.Pie), { ssr: false });
import { useActivities, useActivityActions } from '@/providers/activityProvider';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { hasRole: canViewSalesPerf, isLoading: isRoleLoading } = useHasRole([
    UserRole.ADMIN, 
    UserRole.SALES_MANAGER
  ]);

  const [data, setData] = useState<{
    overview: DashboardOverview | null;
    pipeline: PipelineMetricsDetail | null;
    salesPerf: SalesPerformance | null;
    activities: ActivitiesSummary | null;
    expiring: any[];
  }>({
    overview: null,
    pipeline: null,
    salesPerf: null,
    activities: null,
    expiring: []
  });
  
  const { upcomingActivities, overdueActivities } = useActivities();
  const { fetchUpcomingActivities, fetchOverdueActivities } = useActivityActions();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timeRange, setTimeRange] = useState<string>('This Year');
  const [yAxisMax, setYAxisMax] = useState<number | null>(null);
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<{ id: string; clientName: string; clientId: string } | null>(null);

  const handleOpenRenewal = (record: any) => {
      setSelectedContract({ id: record.id, clientName: record.clientName, clientId: record.clientId });
      setRenewalModalOpen(true);
  };

  useEffect(() => {
    // Wait until roles are fully loaded before fetching
    if (isRoleLoading) return;

    fetchUpcomingActivities(7);
    fetchOverdueActivities();

    const fetchData = async () => {
      try {
        setLoading(true);
        const [overview, pipeline, activities, expiring] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getPipelineMetrics(),
          dashboardService.getActivitiesSummary(),
          dashboardService.getContractsExpiring(30)
        ]);

        let salesPerf = null;
        if (canViewSalesPerf) {
          salesPerf = await dashboardService.getSalesPerformance(10);
          if (salesPerf && salesPerf.topPerformers) {
            // Filter out users who haven't worked on any opportunities
            salesPerf.topPerformers = salesPerf.topPerformers
              .filter(p => p.opportunitiesCount > 0)
              .slice(0, 5); // Keep top 5
          }
        }
        
        setData({ overview, pipeline, salesPerf, activities, expiring });
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canViewSalesPerf, isRoleLoading]);

  const breadcrumbs = [
    { title: 'Nexus', href: '/dashboard' },
    { title: 'Dashboard' }
  ];

  if (loading) {
    return <div style={{ padding: '50px', display: 'flex', justifyContent: 'center' }}><Spin size="large" /></div>;
  }

  if (error) {
    // We render the alert, fixing the sonarqube lint error about `Alert` deprecated usage if any, but `message` is standard for <Alert> in antd <= 5
    return <Alert message="Error loading dashboard" description={error} type="error" showIcon />;
  }

  const { overview, pipeline, salesPerf, activities, expiring } = data;

  const formatCurrency = (value: number) => {
    if (!value) return 'R0';
    if (value >= 1000000000000) return `R${(value / 1000000000000).toFixed(1)}T`;
    if (value >= 1000000000) return `R${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `R${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R${(value / 1000).toFixed(1)}K`;
    return `R${value.toLocaleString()}`;
  };

  const performanceColumns = [
    { title: 'Sales Rep', dataIndex: 'userName', key: 'userName' },
    { title: 'Won Deals', dataIndex: 'wonCount', key: 'wonCount' },
    { 
      title: 'Revenue', 
      dataIndex: 'totalRevenue', 
      key: 'totalRevenue',
      render: (val: number) => formatCurrency(val)
    },
    { 
      title: 'Win Rate', 
      dataIndex: 'winRate', 
      key: 'winRate',
      render: (val: number) => `${val.toFixed(1)}%`
    }
  ];

  const contractColumns = [
    { title: 'Contract ID', dataIndex: 'id', key: 'id', render: (text: string) => text.substring(0, 8) },
    { title: 'Client', dataIndex: 'clientName', key: 'clientName' },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate', render: (val: string) => new Date(val).toLocaleDateString() },
    { title: 'Value', dataIndex: 'totalValue', key: 'totalValue', render: (val: number) => formatCurrency(val) },
    { 
      title: 'Action', 
      key: 'action', 
      render: (_: any, record: any) => (
          <Button size="small" type="primary" onClick={() => handleOpenRenewal(record)}>
              Renew
          </Button>
      )
    }
  ];

  const stageColumns = [
    { title: 'Stage', dataIndex: 'stageName', key: 'stageName' },
    { title: 'Count', dataIndex: 'count', key: 'count' },
    { title: 'Value', dataIndex: 'totalValue', key: 'totalValue', render: (val: number) => formatCurrency(val) }
  ];

  // Chart Data Mapping
  const allTrendData = overview?.revenue?.monthlyTrend?.flatMap(d => [
    { month: d.monthName, type: 'Actual', value: d.actual },
    { month: d.monthName, type: 'Projected', value: d.projected },
  ]) || [];

  // Filter based on Segmented control (assuming backend returned more than a year; otherwise this demonstrates the modern interactive capability)
  const currentYear = new Date().getFullYear();
  const currentMonthName = dayjs().format('MMMM');

  let areaData = allTrendData;
  if (timeRange === 'This Year') {
      areaData = allTrendData.filter(d => d.month.includes(currentYear.toString()));
  } else if (timeRange === 'This Month') {
      areaData = allTrendData.filter(d => d.month.includes(currentYear.toString()) && d.month.includes(currentMonthName));
  }

  // Fallback if filtering removes all data (e.g., mock data doesn't have the current year appended yet)
  const finalAreaData = areaData.length > 0 ? areaData : allTrendData;

  const funnelData = pipeline?.stages.map(s => ({ stage: s.stageName, value: s.count })) || [];
  const pieData = Object.entries(activities?.byType || {})
    .filter(([_, value]) => (value as number) > 0)
    .map(([type, value]) => ({ type, value }));

  return (
    <div style={{ paddingBottom: '24px' }}>
      <PageHeader title="Executive Overview" breadcrumbs={breadcrumbs} />
      
      {/* Key Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="Projected Revenue" 
            value={formatCurrency((overview?.revenue?.projectedThisYear || 0) + (overview?.revenue?.thisYear || 0))} 
            prefix={<DollarOutlined />} 
            trend={12} 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="Pipeline Value" 
            value={formatCurrency(overview?.opportunities?.pipelineValue || 0)} 
            prefix={<LineChartOutlined />} 
            trend={8} 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="Active Contracts" 
            value={overview?.contracts?.totalActiveCount?.toString() || "0"} 
            prefix={<TeamOutlined />} 
            trend={3} 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="Win Rate" 
            value={`${overview?.opportunities?.winRate?.toFixed(1) || 0}%`} 
            prefix={<FileDoneOutlined />} 
            trend={-2} 
          />
        </Col>
      </Row>

      {/* Revenue Trend Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card 
            title="Revenue Trend" 
            className="shadow-sm"
            extra={
              <Space>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Text type="secondary" style={{ fontSize: '13px' }}>Y-Max:</Text>
                   <InputNumber 
                      size="small" 
                      placeholder="Auto" 
                      value={yAxisMax} 
                      onChange={val => setYAxisMax(val)} 
                      style={{ width: 100 }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                   />
                </div>
                <Segmented 
                  options={['This Month', 'This Year', 'All Time']} 
                  value={timeRange} 
                  onChange={(value) => setTimeRange(value as string)}
                />
              </Space>
            }
          >
            {finalAreaData.length > 0 ? (
              <Line
                data={finalAreaData}
                xField="month"
                yField="value"
                colorField="type"
                shapeField="smooth"
                point={{ shapeField: 'circle', sizeField: 4 }}
                height={300}
                legend={{ color: { position: 'top' }, itemMarker: 'circle' }}
                scale={{ y: { nice: true, zero: false, ...(yAxisMax ? { max: yAxisMax } : {}) } }}
                axis={{ y: { labelFormatter: (v: any) => formatCurrency(Number(v)) } }}
                interaction={{ tooltip: { crosshairs: true, marker: true } }}
              />
            ) : (
               <div style={{ textAlign: 'center', padding: '50px', color: '#ccc' }}>No revenue data available</div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          <Card title="Sales Performance (Top 5)" style={{ marginBottom: '16px' }} className="shadow-sm">
            {canViewSalesPerf ? (
              <>
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                  <Col span={12}>
                    <Statistic title="Avg Deals Per User" value={salesPerf?.averageDealsPerUser || 0} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="Avg Revenue Per User" value={formatCurrency(salesPerf?.averageRevenuePerUser || 0)} />
                  </Col>
                </Row>
                <Table 
                  dataSource={salesPerf?.topPerformers || []} 
                  columns={performanceColumns} 
                  rowKey="userId" 
                  pagination={false} 
                  size="small"
                  scroll={{ x: 'max-content' }}
                />
              </>
            ) : (
              <Alert 
                message="Restricted Access" 
                description="Sales performance metrics are restricted to Administrators and Sales Managers." 
                type="info" 
                showIcon 
              />
            )}
          </Card>

          <Card title="Pipeline Stages" className="shadow-sm" style={{ marginBottom: '16px' }}>
             <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Statistic title="Conversion Rate" value={`${pipeline?.conversionRate?.toFixed(1) || 0}%`} />
              </Col>
              <Col span={12}>
                <Statistic title="Weighted Pipeline" value={formatCurrency(pipeline?.weightedPipelineValue || 0)} />
              </Col>
            </Row>
            {funnelData.length > 0 ? (
               <Column 
                  data={funnelData}
                  xField="stage"
                  yField="value"
                  colorField="stage"
                  height={250}
                  label={{ 
                    position: 'top',
                    text: (d: any) => d.value === 0 ? '' : String(d.value)
                  }}
                  legend={false}
                  interaction={{ tooltip: { marker: true }, elementHighlight: true }}
               />
            ) : (
               <div style={{ textAlign: 'center', padding: '50px', color: '#ccc' }}>No pipeline data available</div>
            )}
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          <Card title="Activities Summary" style={{ marginBottom: '16px' }} className="shadow-sm">
            <Tabs 
              defaultActiveKey="summary" 
              items={[
                {
                  key: 'summary',
                  label: 'Summary',
                  children: (
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic 
                          title="Total" 
                          value={activities?.totalCount || 0} 
                          prefix={<CalendarOutlined style={{ color: '#1890ff' }} />} 
                        />
                      </Col>
                      <Col span={12}>
                        <div style={{ color: '#52c41a' }}>
                          <Statistic 
                            title="Completed Today" 
                            value={activities?.completedTodayCount || 0} 
                            prefix={<CheckCircleOutlined />} 
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <Statistic 
                          title="Upcoming" 
                          value={activities?.upcomingCount || 0} 
                        />
                      </Col>
                      <Col span={12}>
                        <div style={{ color: '#cf1322' }}>
                          <Statistic 
                            title="Overdue" 
                            value={activities?.overdueCount || 0} 
                            prefix={<WarningOutlined />} 
                          />
                        </div>
                      </Col>
                    </Row>
                  )
                },
                {
                  key: 'distribution',
                  label: 'Distribution',
                  children: (
                    pieData.length > 0 ? (
                      <Pie 
                        data={pieData}
                        angleField="value"
                        colorField="type"
                        radius={0.8}
                        innerRadius={0.5}
                        height={250}
                        label={{ text: 'value', style: { fontWeight: 'bold' } }}
                        legend={{ color: { position: 'bottom' } }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '50px', color: '#ccc' }}>No activities data</div>
                    )
                  )
                },
                {
                  key: 'upcoming',
                  label: 'Upcoming',
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
                      {upcomingActivities.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '16px 0', color: '#ccc' }}>No upcoming activities</div>
                      ) : (
                        upcomingActivities.slice(0, 5).map(item => (
                          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                            <Text strong>{item.subject}</Text>
                            <Text type="secondary" style={{ fontSize: '13px' }}>{dayjs(item.dueDate).format('MMM D, HH:mm')}</Text>
                          </div>
                        ))
                      )}
                    </div>
                  )
                },
                {
                  key: 'overdue',
                  label: <span style={{ color: 'red' }}>Overdue</span>,
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
                      {overdueActivities.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '16px 0', color: '#ccc' }}>No overdue activities!</div>
                      ) : (
                        overdueActivities.slice(0, 5).map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <Text strong style={{ color: 'red' }}>{item.subject}</Text>
                              <Text type="secondary" style={{ fontSize: '13px' }}>{dayjs(item.dueDate).format('MMM D, HH:mm')}</Text>
                            </div>
                            <Tag color="red">Overdue</Tag>
                          </div>
                        ))
                      )}
                    </div>
                  )
                }
              ]}
            />
          </Card>

          <Card title="Contracts Expiring (30 days)" className="shadow-sm">
            <Table 
              dataSource={expiring || []} 
              columns={contractColumns} 
              rowKey="id" 
              pagination={false} 
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>

      {selectedContract && (
          <CreateRenewalModal
              open={renewalModalOpen}
              onClose={() => setRenewalModalOpen(false)}
              contractId={selectedContract.id}
              clientName={selectedContract.clientName}
              clientId={selectedContract.clientId}
          />
      )}
    </div>
  );
}
