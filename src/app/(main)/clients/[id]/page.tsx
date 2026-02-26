'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Card, Typography, Tag, Button, Space, Tabs, Select, message,
    Descriptions, Statistic, Table, Row, Col, Skeleton, App
} from 'antd';
import {
    PlusOutlined,
    HistoryOutlined,
    EditOutlined
} from '@ant-design/icons';
import { Client, Contact, Opportunity, UserRole } from '@/types';
import { OpportunityStage } from '@/types/enums';
import opportunityService from '@/services/opportunityService';
import clientService from '@/services/clientService';
import contactService from '@/services/contactService';
import PageHeader from '@/components/shared/PageHeader';
import ContactModal from '@/components/clients/ContactModal';
import OpportunityModal from '@/components/opportunities/OpportunityModal';
import { useHasRole } from '@/hooks/useHasRole';

const { Text } = Typography;

export default function ClientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { message } = App.useApp();
    const [client, setClient] = useState<Client | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
    const { hasRole: canCreate } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);

    const fetchClientAndContacts = async () => {
        if (!id) return;
        try {
            const [clientData, contactsData, oppsData] = await Promise.all([
                clientService.getClientById(id),
                contactService.getContactsByClient(id),
                opportunityService.getOpportunities({ clientId: id, pageNumber: 1, pageSize: 50 })
            ]);
            setClient(clientData);
            setContacts(contactsData);
            setOpportunities(oppsData.items || []);
        } catch (err) {
            message.error('Failed to load client details');
        } finally {
            setLoading(false);
        }
    };

    const handleStageUpdate = async (oppId: string, newStage: OpportunityStage) => {
        try {
            await opportunityService.updateStage(oppId, newStage);
            message.success('Stage updated');
            fetchClientAndContacts();
        } catch {
            message.error('Failed to update stage');
        }
    };

    useEffect(() => {
        fetchClientAndContacts();
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
            <Button icon={<EditOutlined />} disabled={!canCreate}>Edit Client</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsOpportunityModalOpen(true)} disabled={!canCreate}>New Opportunity</Button>
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
                                <>
                                    <Table
                                        size="small"
                                        pagination={false}
                                        rowKey="id"
                                        dataSource={contacts}
                                        columns={[
                                            { title: 'Name', key: 'name', render: (_, r) => <Text strong>{r.firstName} {r.lastName} {r.isPrimaryContact && <Tag color="blue" style={{marginLeft: 8}}>Primary</Tag>}</Text> },
                                            { title: 'Role', dataIndex: 'position', key: 'position' },
                                            { title: 'Email', dataIndex: 'email', key: 'email' },
                                            { title: 'Actions', key: 'actions', render: () => <Button size="small" type="link">Contact</Button> }
                                        ]}
                                    />
                                    <div style={{ marginTop: 16 }}>
                                        <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setIsContactModalOpen(true)}>
                                            Add New Contact
                                        </Button>
                                    </div>
                                </>
                            ),
                        },
                        {
                            key: 'opportunities',
                            label: 'Pipeline',
                            children: (
                                <Table
                                    size="small"
                                    rowKey="id"
                                    dataSource={opportunities}
                                    columns={[
                                        { title: 'Opportunity', dataIndex: 'title', key: 'title' },
                                        { title: 'Stage', dataIndex: 'stage', key: 'stage',
                                            render: (stage: OpportunityStage, record: Opportunity) => (
                                                <Select
                                                    value={stage}
                                                    onChange={(value) => handleStageUpdate(record.id, value)}
                                                    style={{ width: 140 }}
                                                    size="small"
                                                    options={[
                                                        { value: 1, label: 'Lead' },
                                                        { value: 2, label: 'Qualified' },
                                                        { value: 3, label: 'Proposal' },
                                                        { value: 4, label: 'Negotiation' },
                                                        { value: 5, label: 'Closed Won' },
                                                        { value: 6, label: 'Closed Lost' }
                                                    ]}
                                                />
                                            ),
                                        },
                                        { title: 'Value', dataIndex: 'estimatedValue', key: 'estimatedValue', render: (v: number) => `R${v?.toLocaleString()}` },
                                        { title: 'Probability', dataIndex: 'probability', key: 'probability', render: (p: number) => `${p}%` },
                                    ]}
                                    locale={{ emptyText: 'No opportunities yet. Click "New Opportunity" to create one.' }}
                                />
                            ),
                        },
                    ]}
                />
            </Card>

            <ContactModal 
                open={isContactModalOpen} 
                onClose={() => setIsContactModalOpen(false)} 
                clientId={id} 
                onSuccess={fetchClientAndContacts} 
            />

            <OpportunityModal
                open={isOpportunityModalOpen}
                onClose={() => setIsOpportunityModalOpen(false)}
            />
        </Space>
    );
}
