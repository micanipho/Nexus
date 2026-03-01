'use client';

import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Statistic, 
  Spin, 
  Alert, 
  theme, 
  Skeleton,
  Empty,
  Table,
  Tag,
  Space,
  Button,
  Dropdown,
  MenuProps,
  message
} from 'antd';
import { 
  DollarOutlined, 
  SolutionOutlined, 
  CheckCircleOutlined, 
  LineChartOutlined,
  TeamOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  BulbOutlined
} from '@ant-design/icons';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/shared/PageHeader';
import MetricCard from '@/components/shared/MetricCard';
import RoleGate from '@/components/shared/RoleGate';
import { UserRole, Opportunity } from '@/types';
import dashboardService from '@/services/dashboardService';
import opportunityService from '@/services/opportunityService';
import clientService from '@/services/clientService';
import { useThemeMode } from '@/providers/themeProvider';
import { formatCurrency } from '@/utils/currencyUtils';

const { Text, Title, Paragraph } = Typography;

const ACTIVITY_TYPE_NAMES: Record<string, string> = {
  '1': 'Meetings',
  '2': 'Calls',
  '3': 'Emails',
  '4': 'Tasks',
  '5': 'Presentations',
  '6': 'Others'
};

// Dynamic imports for charts to avoid SSR issues
const Column = dynamic(() => import('@ant-design/plots').then((mod) => mod.Column), { ssr: false });
const Pie = dynamic(() => import('@ant-design/plots').then((mod) => mod.Pie), { ssr: false });

export default function ReportsPage() {
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  
  useEffect(() => { document.title = 'Reports | Nexus'; }, []);

  // Data States
  const [oppMetrics, setOppMetrics] = useState<any>(null);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [topOpps, setTopOpps] = useState<Opportunity[]>([]);
  const [industryData, setIndustryData] = useState<any[]>([]);
  const [activitiesSummary, setActivitiesSummary] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const generateAiInsights = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const dataSummary = {
        metrics: {
          total: oppMetrics?.totalCount,
          won: oppMetrics?.wonCount,
          weightedValue: formatCurrency(oppMetrics?.weightedValue),
          winRate: `${oppMetrics?.winRate?.toFixed(1)}%`
        },
        pipeline: pipelineData.map(p => `${p.stageName}:${p.count}`).join(', '),
        topDeals: topOpps.slice(0, 5).map(o => `${o.title}(${formatCurrency(o.estimatedValue)},${o.probability}%)`).join('; '),
        industries: industryData.slice(0, 3).map(i => `${i.type}:${i.value}`).join(', '),
        activities: activitiesSummary?.byType ? Object.entries(activitiesSummary.byType).map(([k, v]) => `${ACTIVITY_TYPE_NAMES[k] || k}:${v}`).join(', ') : 'N/A'
      };

      const systemPrompt = "You are a Nexus Strategic Sales Analyst. Analyze the provided CRM data summary and provide 3-4 highly actionable strategic insights and 2-3 specific growth suggestions. Be professional, data-driven, and extremely concise (max 250 words). Use bullet points.";
      const userMessage = `Data Summary: ${JSON.stringify(dataSummary)}`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      if (!res.ok) throw new Error('AI analysis failed');
      const data = await res.json();
      setAiInsights(data.text);
      message.success('AI Insights generated successfully!');
    } catch (err: any) {
      message.error(err.message || 'Failed to generate AI insights');
    } finally {
      setAiLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [overview, pipeline, activities, filteredOpps, clients] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getPipelineMetrics(),
        dashboardService.getActivitiesSummary(),
        opportunityService.getOpportunities({ 
          pageNumber: 1, 
          pageSize: 50
        }),
        clientService.getClients({ pageNumber: 1, pageSize: 100 })
      ]);

      setOppMetrics({
        ...overview.opportunities,
        weightedValue: pipeline.weightedPipelineValue
      });
      setPipelineData(pipeline.stages.map(s => ({ stageName: s.stageName, count: s.count })));
      setActivitiesSummary(activities);

      const sortedOpps = (filteredOpps.items || []).sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0)).slice(0, 10);
      setTopOpps(sortedOpps);

      const industries: Record<string, number> = {};
      (clients.items || []).forEach(c => {
        const ind = c.industry || 'Unknown';
        industries[ind] = (industries[ind] || 0) + 1;
      });
      setIndustryData(Object.entries(industries).map(([type, value]) => ({ type, value })));

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { title: 'Nexus', href: '/dashboard' },
    { title: 'Reports' }
  ];

  const chartTheme = isDarkMode ? 'dark' : 'light';
  const labelColor = isDarkMode ? '#ffffff' : '#000000';

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <Title level={4} style={{ marginBottom: '16px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      {icon} {title}
    </Title>
  );

  const topOppsColumns = [
    { 
      title: 'Opportunity', 
      dataIndex: 'title', 
      key: 'title',
      render: (text: string, record: Opportunity) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.clientName}</Text>
        </Space>
      )
    },
    { 
      title: 'Value', 
      dataIndex: 'estimatedValue', 
      key: 'estimatedValue', 
      align: 'right' as const,
      render: (val: number) => <Text strong>{formatCurrency(val)}</Text>
    },
    { 
      title: 'Prob.', 
      dataIndex: 'probability', 
      key: 'probability',
      render: (val: number) => `${val}%`
    }
  ];

  const exportToCSV = () => {
    if (topOpps.length === 0) return;
    const headers = ['Title', 'Client', 'Stage', 'Value', 'Probability'];
    const rows = topOpps.map(o => [`"${o.title}"`, `"${o.clientName}"`, o.stageName, o.estimatedValue, `${o.probability}%`]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Nexus_Top_Deals_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAIReportToPDF = () => {
    if (!aiInsights) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const htmlContent = aiInsights.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '<br/>';
      if (trimmed.startsWith('### ')) return `<h5>${trimmed.substring(4).replace(/\*\*/g, '')}</h5>`;
      if (trimmed.startsWith('## ')) return `<h4>${trimmed.substring(3).replace(/\*\*/g, '')}</h4>`;
      if (trimmed.startsWith('# ')) return `<h3>${trimmed.substring(2).replace(/\*\*/g, '')}</h3>`;
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
        const content = trimmed.includes(' ') ? trimmed.substring(trimmed.indexOf(' ') + 1) : trimmed;
        const bolded = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<div style="margin-left: 20px; margin-bottom: 5px;">• ${bolded}</div>`;
      }
      return `<p>${trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
    }).join('');
    const content = `<html><head><title>Nexus AI Strategic Analysis</title><style>body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #333; line-height: 1.6; } h3 { color: #1677ff; border-bottom: 2px solid #1677ff; padding-bottom: 10px; margin-top: 30px; } h4 { color: #333; margin-top: 25px; margin-bottom: 10px; } h5 { color: #666; margin-top: 20px; margin-bottom: 8px; } .date { color: #888; font-size: 12px; margin-bottom: 30px; } strong { color: #000; } p { margin-bottom: 10px; }</style></head><body><h1 style="margin-bottom: 5px;">Nexus AI Strategic Analysis</h1><div class="date">Report Generated on: ${new Date().toLocaleString()}</div>${htmlContent}</body></html>`;
    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  const MarkdownRenderer = ({ content }: { content: string }) => {
    const lines = content.split('\n');
    return (
      <div style={{ lineHeight: 1.8 }}>
        {lines.map((line, idx) => {
          let processedLine: React.ReactNode = line;
          const trimmedLine = line.trim();
          if (!trimmedLine) return <div key={idx} style={{ height: '8px' }} />;
          if (trimmedLine.startsWith('### ')) return <Title key={idx} level={5} style={{ marginTop: '16px', marginBottom: '8px' }}>{trimmedLine.substring(4).replace(/\*\*/g, '')}</Title>;
          if (trimmedLine.startsWith('## ')) return <Title key={idx} level={4} style={{ marginTop: '20px', marginBottom: '12px' }}>{trimmedLine.substring(3).replace(/\*\*/g, '')}</Title>;
          if (trimmedLine.startsWith('# ')) return <Title key={idx} level={3} style={{ marginTop: '24px', marginBottom: '16px' }}>{trimmedLine.substring(2).replace(/\*\*/g, '')}</Title>;
          const isBullet = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');
          const isNumbered = /^\d+\.\s/.test(trimmedLine);
          if (isBullet || isNumbered) {
            const contentOnly = isBullet ? trimmedLine.substring(2) : trimmedLine.substring(trimmedLine.indexOf(' ') + 1);
            const parts = contentOnly.split('**');
            const formattedContent = parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
            return (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginLeft: '12px', marginBottom: '6px' }}>
                <span style={{ color: token.colorPrimary }}>{isBullet ? '•' : trimmedLine.split('.')[0] + '.'}</span>
                <span>{formattedContent}</span>
              </div>
            );
          }
          if (typeof processedLine === 'string' && processedLine.includes('**')) {
            const parts = processedLine.split('**');
            processedLine = parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
          }
          return <div key={idx} style={{ marginBottom: '12px' }}>{processedLine}</div>;
        })}
      </div>
    );
  };

  const exportMenuItems: MenuProps['items'] = [
    { key: 'csv', label: 'Download Top Deals (CSV)', icon: <FileTextOutlined />, onClick: exportToCSV },
    { key: 'pdf', label: 'Save Report as PDF', icon: <FilePdfOutlined />, onClick: () => window.print() }
  ];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <style jsx global>{`
        @media print {
          .no-print, .ant-btn, .ant-dropdown, .ant-breadcrumb { display: none !important; }
          .ant-card { break-inside: avoid; border: 1px solid #f0f0f0 !important; margin-bottom: 20px !important; }
          body { background: white !important; padding: 0 !important; }
          .ant-layout-content { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
      
      <PageHeader 
        title="Reports & Insights" 
        breadcrumbs={breadcrumbs} 
        extra={
          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
            <Button type="primary" icon={<DownloadOutlined />}>Export Data</Button>
          </Dropdown>
        }
      />

      {error && <Alert message="Report Generation Error" description={error} type="error" showIcon style={{ marginBottom: '24px' }} />}

      {/* TIER 1: EXECUTIVE SUMMARY (Full Width) */}
      <RoleGate roles={[UserRole.ADMIN, UserRole.SALES_MANAGER]}>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <MetricCard title="Pipeline Count" value={oppMetrics?.totalCount || 0} prefix={<SolutionOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <MetricCard title="Weighted Pipeline" value={formatCurrency(oppMetrics?.weightedValue || 0)} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <MetricCard title="Won Deals" value={oppMetrics?.wonCount || 0} prefix={<CheckCircleOutlined />} color={token.colorSuccess} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <MetricCard title="Avg Win Rate" value={`${(oppMetrics?.winRate || 0).toFixed(1)}%`} prefix={<LineChartOutlined />} />
          </Col>
        </Row>
      </RoleGate>

      {/* TIER 2: AI STRATEGIC ANALYSIS (Full Width - Hero) */}
      <Card 
        className="shadow-sm no-print" 
        style={{ marginBottom: '24px', border: `1px solid ${token.colorPrimarySecondary}`, background: isDarkMode ? '#1a1a1a' : '#f0f7ff' }}
        title={<span><RobotOutlined /> Nexus AI Strategic Analysis</span>}
      >
        {!aiInsights ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <BulbOutlined style={{ fontSize: 32, color: token.colorPrimary, marginBottom: 12 }} />
            <Title level={5}>Unlock Strategic Growth suggestions</Title>
            <Paragraph type="secondary">Analyze your pipeline and activity trends with Nexus AI.</Paragraph>
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={generateAiInsights} loading={aiLoading}>Generate AI Report</Button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Tag color="processing" icon={<RobotOutlined />}>AI ANALYSIS COMPLETE</Tag>
              <Button size="small" type="text" onClick={() => setAiInsights(null)}>Reset</Button>
            </div>
            <div style={{ lineHeight: 1.6, color: token.colorText, fontSize: '14px', padding: '20px', background: isDarkMode ? '#000' : '#fff', borderRadius: '8px', border: `1px solid ${token.colorBorderSecondary}`, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
              <MarkdownRenderer content={aiInsights} />
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button icon={<FilePdfOutlined />} onClick={exportAIReportToPDF} type="dashed">Download AI Report (PDF)</Button>
              <Text type="secondary" italic style={{ fontSize: 11 }}>Insights generated based on current period snapshots.</Text>
            </div>
          </div>
        )}
      </Card>

      {/* TIER 3: PIPELINE ANALYSIS (Balanced 12/12) */}
      <RoleGate roles={[UserRole.ADMIN, UserRole.SALES_MANAGER]}>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Pipeline Distribution" className="shadow-sm" style={{ height: '100%' }}>
              {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : (
                pipelineData.length > 0 ? (
                  <Column
                    data={pipelineData}
                    xField="stageName"
                    yField="count"
                    colorField="stageName"
                    height={300}
                    theme={chartTheme}
                    label={{ position: 'top', style: { fill: labelColor } }}
                    axis={{
                      x: { label: { style: { fill: labelColor } }, tickStroke: labelColor },
                      y: { label: { style: { fill: labelColor } }, tickStroke: labelColor }
                    }}
                  />
                ) : <Empty description="No stage data" />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Top 10 High-Value Deals" className="shadow-sm" style={{ height: '100%' }}>
              <Table
                dataSource={topOpps}
                columns={topOppsColumns}
                rowKey="id"
                pagination={false}
                size="small"
                loading={loading}
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </Col>
        </Row>
      </RoleGate>

      {/* TIER 4: STRATEGIC INSIGHTS (Balanced 12/12) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Industry Breakdown" className="shadow-sm">
            {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : (
              industryData.length > 0 ? (
                <Pie
                  data={industryData}
                  angleField="value"
                  colorField="type"
                  radius={0.7}
                  innerRadius={0.5}
                  height={300}
                  theme={chartTheme}
                  legend={{ color: { position: 'bottom', itemLabelFill: labelColor } }}
                  label={{ text: 'value', style: { fill: labelColor, fontWeight: 'bold' } }}
                />
              ) : <Empty />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Activity Distribution" className="shadow-sm">
            {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : (
              activitiesSummary?.byType ? (
                <Pie
                  data={Object.entries(activitiesSummary.byType).map(([type, value]) => ({ 
                    type: ACTIVITY_TYPE_NAMES[type] || type, 
                    value 
                  }))}
                  angleField="value"
                  colorField="type"
                  radius={0.7}
                  height={300}
                  theme={chartTheme}
                  legend={{ color: { position: 'bottom', itemLabelFill: labelColor } }}
                  label={{
                    text: (d: any) => `${d.type}: ${d.value}`,
                    position: 'outside',
                    style: { fill: labelColor, fontWeight: 'bold' }
                  }}
                />
              ) : <Empty />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
