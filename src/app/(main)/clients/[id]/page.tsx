'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Card, Typography, Tag, Button, Space, Tabs, Select, message,
    Descriptions, Statistic, Table, Row, Col, Skeleton, App, Popconfirm
} from 'antd';
import {
    PlusOutlined,
    HistoryOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { Client, Contact, Opportunity, UserRole, Activity, ActivityType } from '@/types';
import { OpportunityStage } from '@/types/enums';
import opportunityService from '@/services/opportunityService';
import clientService from '@/services/clientService';
import contactService from '@/services/contactService';
import activityService from '@/services/activityService';
import PageHeader from '@/components/shared/PageHeader';
import ClientModal from '@/components/clients/ClientModal';
import ContactModal from '@/components/clients/ContactModal';
import OpportunityModal from '@/components/opportunities/OpportunityModal';
import CreateActivityModal from '@/components/activities/CreateActivityModal';
import CompleteActivityModal from '@/components/activities/CompleteActivityModal';
import ViewActivityModal from '@/components/activities/ViewActivityModal';
import { useHasRole } from '@/hooks/useHasRole';
import { useActivityActions } from '@/providers/activityProvider';
import { useClientActions } from '@/providers/clientProvider';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function ClientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { message } = App.useApp();
    const [client, setClient] = useState<Client | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    
    // Activities Modals State
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const { completeActivity, cancelActivity } = useActivityActions();
    const { deactivateClient } = useClientActions();
    const { hasRole: canCreate } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);
    const { hasRole: canDelete } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);
    const { hasRole: canCreateActivity } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER, UserRole.SALES_REP]);

    const fetchClientAndContacts = async () => {
        if (!id) return;
        try {
            const [clientData, contactsData, oppsData, actsData] = await Promise.all([
                clientService.getClientById(id),
                contactService.getContactsByClient(id),
                opportunityService.getOpportunities({ clientId: id, pageNumber: 1, pageSize: 50 }),
                activityService.getActivities({ relatedToId: id, relatedToType: 1, pageNumber: 1, pageSize: 50 })
            ]);
            setClient(clientData);
            setContacts(contactsData);
            setOpportunities(oppsData.items || []);
            setActivities(actsData.items || []);
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

    const handleDelete = async () => {
        if (!id) return;
        try {
            await deactivateClient(id);
            message.success('Client deactivated successfully');
            router.push('/clients');
        } catch {
            message.error('Failed to deactivate client');
        }
    };

    const handleDeleteContact = async (contactId: string, wasPrimary: boolean) => {
        try {
            await contactService.deleteContact(contactId);
            message.success('Contact deleted');

            // If deleted contact was primary, promote the first remaining contact
            if (wasPrimary) {
                const remaining = contacts.filter(c => c.id !== contactId);
                if (remaining.length > 0) {
                    await contactService.setPrimaryContact(remaining[0].id);
                }
            }

            fetchClientAndContacts();
        } catch {
            message.error('Failed to delete contact');
        }
    };

    const handleSetPrimary = async (contactId: string) => {
        try {
            await contactService.setPrimaryContact(contactId);
            message.success('Primary contact updated');
            fetchClientAndContacts();
        } catch {
            message.error('Failed to set primary contact');
        }
    };

    const handleReactivate = async () => {
        if (!id || !client) return;
        try {
            const { id: _, ...updateData } = client;
            await clientService.updateClient(id, { ...updateData, isActive: true });
            message.success('Client reactivated successfully');
            fetchClientAndContacts();
        } catch {
            message.error('Failed to reactivate client');
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
        { title: 'Nexus', href: '/dashboard' },
        { title: 'Clients', href: '/clients' },
        { title: client.name }
    ];

    const extra = (
        <Space size="middle">
            {canDelete && client.isActive && (
                <Popconfirm
                    title="Deactivate Client"
                    description="Are you sure you want to deactivate this client?"
                    onConfirm={handleDelete}
                    okText="Yes, Deactivate"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger icon={<DeleteOutlined />}>Deactivate</Button>
                </Popconfirm>
            )}
            {canDelete && !client.isActive && (
                <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />} 
                    onClick={handleReactivate}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                    Reactivate
                </Button>
            )}
            <Button icon={<EditOutlined />} onClick={() => setIsClientModalOpen(true)} disabled={!canCreate}>Edit Client</Button>
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
                        <Statistic title="Total Contacts" value={client.contactsCount} styles={{ content: { fontWeight: 700 } }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless">
                        <Statistic title="Opportunities" value={client.opportunitiesCount} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless">
                        <Statistic title="Last Contact" value={new Date(client.updatedAt).toLocaleDateString()} prefix={<HistoryOutlined />} />
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
                                    <Descriptions.Item label="Account Owner">{client.createdByName}</Descriptions.Item>
                                    <Descriptions.Item label="Industry">{client.industry}</Descriptions.Item>
                                    <Descriptions.Item label="HQ Location">Johannesburg, South Africa</Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        <Tag color={client.isActive ? 'green' : 'red'}>
                                            {client.isActive ? 'Active' : 'Inactive'}
                                        </Tag>
                                    </Descriptions.Item>
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
                                            { title: 'Name', key: 'name', render: (_: any, r: Contact) => <Text strong>{r.firstName} {r.lastName} {r.isPrimaryContact && <Tag color="blue" style={{marginLeft: 8}}>Primary</Tag>}</Text> },
                                            { title: 'Role', dataIndex: 'position', key: 'position' },
                                            { title: 'Email', dataIndex: 'email', key: 'email' },
                                            { title: 'Actions', key: 'actions', render: (_: any, record: Contact) => (
                                                <Space size="small">
                                                    <Button size="small" type="text" icon={<EditOutlined />} onClick={() => { setSelectedContact(record); setIsContactModalOpen(true); }} />
                                                    {!record.isPrimaryContact && (
                                                        <Button size="small" type="link" onClick={() => handleSetPrimary(record.id)}>
                                                            Set Primary
                                                        </Button>
                                                    )}
                                                    <Popconfirm
                                                        title="Delete this contact?"
                                                        description={record.isPrimaryContact ? 'This is the primary contact. Another contact will be set as primary automatically.' : undefined}
                                                        onConfirm={() => handleDeleteContact(record.id, record.isPrimaryContact)}
                                                        okText="Yes"
                                                        cancelText="No"
                                                        okButtonProps={{ danger: true }}
                                                    >
                                                        <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                                    </Popconfirm>
                                                </Space>
                                            )}
                                        ]}
                                        scroll={{ x: 'max-content' }}
                                    />
                                    <div style={{ marginTop: 16 }}>
                                        <Button type="dashed" block icon={<PlusOutlined />} onClick={() => { setSelectedContact(null); setIsContactModalOpen(true); }}>
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
                                        { 
                                            title: 'Opportunity', 
                                            dataIndex: 'title', 
                                            key: 'title',
                                            render: (text: string, record: Opportunity) => <Link href={`/opportunities/${record.id}`}>{text}</Link>
                                        },
                                        { title: 'Stage', dataIndex: 'stage', key: 'stage',
                                            render: (stage: OpportunityStage, record: Opportunity) => (
                                                canCreate ? (
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
                                                ) : (
                                                    <span>{stage}</span>
                                                )
                                            ),
                                        },
                                        { title: 'Value', dataIndex: 'estimatedValue', key: 'estimatedValue', render: (v: number) => `R${v?.toLocaleString()}` },
                                        { title: 'Probability', dataIndex: 'probability', key: 'probability', render: (p: number) => `${p}%` },
                                    ]}
                                    locale={{ emptyText: 'No opportunities yet. Click "New Opportunity" to create one.' }}
                                    scroll={{ x: 'max-content' }}
                                />
                            ),
                        },
                        {
                            key: 'activities',
                            label: 'Activities',
                            children: (
                                <>
                                    <Table
                                        size="small"
                                        rowKey="id"
                                        dataSource={activities}
                                        columns={[
                                            { 
                                                title: 'Subject', 
                                                dataIndex: 'subject', 
                                                key: 'subject', 
                                                render: (text: string, record: Activity) => (
                                                    <a onClick={() => { setSelectedActivity(record); setIsViewModalOpen(true); }} style={{ fontWeight: 500 }}>{text}</a>
                                                ) 
                                            },
                                            { 
                                                title: 'Due Date', 
                                                dataIndex: 'dueDate', 
                                                key: 'dueDate',
                                                render: (date: string) => {
                                                    const isOverdue = dayjs(date).isBefore(dayjs());
                                                    return <span style={{ color: isOverdue ? 'red' : 'inherit' }}>{dayjs(date).format('MMM D, HH:mm')}</span>;
                                                }
                                            },
                                            { 
                                                title: 'Status', 
                                                dataIndex: 'statusName', 
                                                key: 'statusName',
                                                render: (status: string) => {
                                                    let color = 'gold';
                                                    if (status === 'Completed') color = 'green';
                                                    if (status === 'Cancelled') color = 'default';
                                                    return <Tag color={color}>{status}</Tag>;
                                                }
                                            },
                                            {
                                                title: 'Actions',
                                                key: 'actions',
                                                render: (_: any, record: Activity) => {
                                                    if (record.statusName !== 'Scheduled') return <span style={{ color: '#aaa' }}>Closed</span>;
                                                    return (
                                                        <Space>
                                                            <Button type="link" size="small" onClick={() => { setSelectedActivity(record); setIsCompleteModalOpen(true); }}>Complete</Button>
                                                            <Button type="text" danger size="small" onClick={async () => { await cancelActivity(record.id); fetchClientAndContacts(); }}>Cancel</Button>
                                                        </Space>
                                                    );
                                                }
                                            }
                                        ]}
                                        locale={{ emptyText: 'No activities yet.' }}
                                        scroll={{ x: 'max-content' }}
                                    />
                                    <div style={{ marginTop: 16 }}>
                                        <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setIsActivityModalOpen(true)} disabled={!canCreate}>
                                            Log Activity
                                        </Button>
                                    </div>
                                </>
                            ),
                        },
                    ]}
                />
            </Card>

            <ClientModal
                open={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                client={client}
                onSuccess={fetchClientAndContacts}
            />

            <ContactModal
                open={isContactModalOpen}
                onClose={() => { setIsContactModalOpen(false); setSelectedContact(null); }}
                clientId={id}
                onSuccess={fetchClientAndContacts}
                isFirstContact={contacts.length === 0}
                contact={selectedContact}
            />

            <OpportunityModal
                open={isOpportunityModalOpen}
                onClose={() => setIsOpportunityModalOpen(false)}
                onSuccess={fetchClientAndContacts}
            />

            <CreateActivityModal 
                open={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                onSuccess={fetchClientAndContacts}
                initialRelatedToType={1}
                initialRelatedToId={id}
            />

            <CompleteActivityModal
                open={isCompleteModalOpen}
                onClose={() => setIsCompleteModalOpen(false)}
                activity={selectedActivity}
                onSuccess={fetchClientAndContacts}
            />

            <ViewActivityModal
                open={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                activity={selectedActivity}
            />
        </Space>
    );
}
