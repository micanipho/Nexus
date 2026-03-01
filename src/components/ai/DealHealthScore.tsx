'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Progress, Typography, Alert, List, Button, Skeleton, Space, App } from 'antd';
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  SyncOutlined, 
  RobotOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { Opportunity, Activity, Proposal, ProposalStatus } from '@/types';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface DealHealthScoreData {
  score: number;
  label: 'At Risk' | 'Needs Attention' | 'On Track' | 'Strong';
  factors: string[];
  recommendation: string;
}

interface DealHealthScoreProps {
  opportunity: Opportunity;
  activities: Activity[];
  proposals: Proposal[];
}

const DealHealthScore: React.FC<DealHealthScoreProps> = ({ 
  opportunity, 
  activities, 
  proposals 
}) => {
  const [data, setData] = useState<DealHealthScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { message } = App.useApp();

  const analyzeDeal = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const daysSinceActivity = activities.length > 0 
        ? Math.abs(dayjs().diff(dayjs(activities[0].dueDate), 'day')) 
        : 'N/A';
      
      const openProposals = proposals.filter(p => 
        p.status === ProposalStatus.DRAFT || p.status === ProposalStatus.SUBMITTED
      ).length;

      const hasApprovedProposal = proposals.some(p => p.status === ProposalStatus.APPROVED);

      const prompt = `Analyze this sales opportunity and return ONLY a valid JSON object with no markdown, no explanation:
{
  "score": number (0-100),
  "label": "At Risk" | "Needs Attention" | "On Track" | "Strong",
  "factors": string[] (3-5 bullet points explaining the score),
  "recommendation": string (one actionable next step, max 20 words)
}

Opportunity data: 
title=${opportunity.title}, 
stage=${opportunity.stage}, 
probability=${opportunity.probability}%, 
value=${opportunity.currency || 'ZAR'} ${opportunity.estimatedValue}, 
expectedClose=${opportunity.expectedCloseDate}, 
daysSinceActivity=${daysSinceActivity}, 
openProposals=${openProposals}, 
hasApprovedProposal=${hasApprovedProposal}`;

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: "You are a senior sales analyst expert in B2B enterprise sales. You provide concise, data-driven deal health assessments.",
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }

      const result = await response.json();
      
      // Attempt to parse the AI output
      let parsedData: DealHealthScoreData;
      try {
        // AI sometimes wraps JSON in code blocks even if told not to
        const jsonString = result.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        parsedData = JSON.parse(jsonString);
      } catch (parseErr) {
        console.error('Parse error:', parseErr, result.text);
        throw new Error('Invalid response format from AI');
      }

      setData(parsedData);
    } catch (err: any) {
      console.error('Deal analysis error:', err);
      setError(err.message || 'Unable to analyze');
    } finally {
      setLoading(false);
    }
  }, [opportunity, activities, proposals]);

  useEffect(() => {
    analyzeDeal();
  }, [analyzeDeal]);

  const getScoreColor = (score: number) => {
    if (score < 40) return '#ff4d4f'; // red
    if (score < 70) return '#faad14'; // orange
    return '#52c41a'; // green
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ textAlign: 'center' }}>
            <Skeleton.Avatar active size={120} shape="circle" />
          </div>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Space>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <ExclamationCircleOutlined style={{ fontSize: 32, color: '#ff4d4f', marginBottom: 16 }} />
          <Typography.Paragraph>{error}</Typography.Paragraph>
          <Button type="primary" onClick={analyzeDeal} icon={<SyncOutlined />}>
            Retry Analysis
          </Button>
        </div>
      );
    }

    if (!data) return null;

    const scoreColor = getScoreColor(data.score);

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Progress 
            type="circle" 
            percent={data.score} 
            strokeColor={scoreColor}
            format={(percent) => (
              <div style={{ color: scoreColor }}>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{percent}</div>
                <div style={{ fontSize: 12 }}>Health</div>
              </div>
            )}
          />
          <Title level={4} style={{ marginTop: 12, marginBottom: 0 }}>{data.label}</Title>
        </div>

        <div>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>Key Factors:</Text>
          <List
            size="small"
            dataSource={data.factors}
            renderItem={(factor) => (
              <List.Item style={{ border: 'none', padding: '4px 0' }}>
                <Space align="start">
                  {data.score >= 50 ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 4 }} />
                  ) : (
                    <WarningOutlined style={{ color: '#faad14', marginTop: 4 }} />
                  )}
                  <Text style={{ fontSize: '13px' }}>{factor}</Text>
                </Space>
              </List.Item>
            )}
          />
        </div>

        <Alert
          message="Recommendation"
          description={data.recommendation}
          type="info"
          showIcon
          style={{ borderRadius: 8 }}
        />
      </Space>
    );
  };

  return (
    <Card 
      title={
        <Space>
          <RobotOutlined />
          <span>Deal Health</span>
        </Space>
      }
      extra={
        <Button 
          type="text" 
          icon={<SyncOutlined spin={loading} />} 
          onClick={analyzeDeal}
          disabled={loading}
        />
      }
      variant="borderless"
      style={{ height: '100%' }}
    >
      {renderContent()}
    </Card>
  );
};

export default DealHealthScore;
