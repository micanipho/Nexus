'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Card, Typography, Tag, Button, Space, Tabs,
    Descriptions, Statistic, Timeline, Table, Avatar,
    Row, Col, Skeleton, App
} from 'antd';
import {
    UserOutlined,
    PlusOutlined,
    HistoryOutlined,
    ThunderboltOutlined,
    EditOutlined
} from '@ant-design/icons';
import { Client, Opportunity, Contract } from '@/types';
import { OpportunityStage, ContractStatus } from '@/types/enums';
import clientService from '@/services/clientService';
import PageHeader from '@/components/shared/PageHeader';

const { Text } = Typography;

export default function ClientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { message } = App.useApp();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClient = async () => {
            if (!id) return;
            try {
                const data = await clientService.getClientById(id);
                setClient(data);
            } catch (err) {
                message.error('Failed to load client details');
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [id, message]);

    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <Skeleton active avatar paragraph={{ rows: 4 }} />
            </div>
        );
    }

    if (!client) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Text type="secondary">Client not found</Text>
            </div>
        );
    }

    const breadcrumbs = [
        { title: 'Nexus', href: '/' },
        { title: 'Clients', href: '/clients' },
        { title: client.name }
    ];

    const extra = (
        <Space size="middle">
            <Button icon={<EditOutlined />}>Edit Client</Button>
            <Button type="primary" icon={<PlusOutlined />}>New Opportunity</Button>
        </Space>
    );

    return (
        <Space orientation="vertical" size={24} style={{ width: '100%' }}>
            <PageHeader 
                title={client.name} 
                breadcrumbs={breadcrumbs}
                extra={extra}
            />

            {/* Metric Summary Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card variant="borderless">
                        <Statistic title="Annual Recurring Revenue (ARR)" prefix="R" value={client.arr} valueStyle={{ fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless">
                        <Statistic title="Opportunities" value={client.totalOpportunities} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless">
                        <Statistic title="Last Contact" value={client.lastContactDate} prefix={<HistoryOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* Detailed Content Tabs */}
            <Card variant="borderless">
                <Tabs
                    defaultActiveKey="overview"
                    items={[
                        {
                            key: 'overview',
                            label: 'Account Overview',
                            children: (
                                <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
                                    <Descriptions.Item label="Account Owner">{client.owner}</Descriptions.Item>
                                    <Descriptions.Item label="Industry">{client.industry}</Descriptions.Item>
                                    <Descriptions.Item label="HQ Location">Johannesburg, South Africa</Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        <Tag color={client.isActive ? 'green' : 'red'}>
                                            {client.isActive ? 'Active' : 'Inactive'}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Client Since">Jan 2024</Descriptions.Item>
                                </Descriptions>
                            ),
                        },
                        {
                            key: 'contacts',
                            label: 'Contacts',
                            children: (
                                <Table
                                    size="small"
                                    pagination={false}
                                    dataSource={[
                                        { key: '1', name: 'Sarah Smith', role: 'CTO', email: 'sarah@example.com', phone: '+27 11 000 1234' },
                                    ]}
                                    columns={[
                                        { title: 'Name', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
                                        { title: 'Role', dataIndex: 'role', key: 'role' },
                                        { title: 'Email', dataIndex: 'email', key: 'email' },
                                        { title: 'Actions', key: 'actions', render: () => <Button size="small" type="link">Contact</Button> }
                                    ]}
                                />
                            ),
                        },
                        {
                            key: 'opportunities',
                            label: 'Pipeline',
                            children: (
                                <Table
                                    size="small"
                                    rowKey="id"
                                    dataSource={[
                                        { id: 'o-1', name: 'Expansion Project', stage: OpportunityStage.NEGOTIATION, amount: 450000, probability: 75 },
                                    ]}
                                    columns={[
                                        { title: 'Opportunity', dataIndex: 'name', key: 'name' },
                                        { title: 'Stage', dataIndex: 'stage', render: (s) => <Tag color="blue">{s}</Tag> },
                                        { title: 'Value', dataIndex: 'amount', render: (v) => `R${v.toLocaleString()}` },
                                    ]}
                                />
                            ),
                        },
                    ]}
                />
            </Card>
        </Space>
    );
}
