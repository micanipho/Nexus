'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Card, Typography, Tag, Button, Space, Tabs, Select,
    Descriptions, Statistic, Table, Row, Col, Skeleton, App, Popconfirm
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    CheckOutlined,
    SendOutlined,
    CloseOutlined,
    FileOutlined,
    MessageOutlined,
    SolutionOutlined,
    InfoCircleOutlined,
    HistoryOutlined,
    FileTextOutlined,
    ScheduleOutlined
} from '@ant-design/icons';
import { Opportunity, UserRole, Activity, Proposal, PricingRequest, ProposalStatus, PricingRequestStatus } from '@/types';
import { theme as antdTheme } from 'antd';
import { OpportunityStage } from '@/types/enums';
import { useHasRole } from '@/hooks/useHasRole';
import { useCrossTenantError } from '@/hooks/useCrossTenantError';
import opportunityService, { OpportunityStageHistory } from '@/services/opportunityService';
import proposalService from '@/services/proposalService';
import activityService from '@/services/activityService';
import pricingRequestService from '@/services/pricingRequestService';
import PageHeader from '@/components/shared/PageHeader';
import OpportunityModal from '@/components/opportunities/OpportunityModal';
import ProposalModal from '@/components/proposals/ProposalModal';
import DocumentsPanel from '@/components/shared/DocumentsPanel';
import NotesPanel from '@/components/shared/NotesPanel';
import CreateActivityModal from '@/components/activities/CreateActivityModal';
import CompleteActivityModal from '@/components/activities/CompleteActivityModal';
import ViewActivityModal from '@/components/activities/ViewActivityModal';
import PricingRequestModal from '@/components/pricing/PricingRequestModal';
import CrossTenantError from '@/components/errors/CrossTenantError';
import StatusBadge from '@/components/shared/StatusBadge';
import DealHealthScore from '@/components/ai/DealHealthScore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currencyUtils';

dayjs.extend(relativeTime);

const { Text } = Typography;

export default function OpportunityDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { message } = App.useApp();
    const { token } = antdTheme.useToken();
    const { isCrossTenantError, execute, reset: resetError } = useCrossTenantError();

    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [stageHistory, setStageHistory] = useState<OpportunityStageHistory[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [pricingRequests, setPricingRequests] = useState<PricingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const { hasRole: canCreate } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);
    const { hasRole: canDelete } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);
    const { hasRole: canApproveProposal } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);

    const fetchAllData = useCallback(async () => {
        if (!id) return;
        setLoading(true);

        const success = await execute(async () => {
            const oppData = await opportunityService.getOpportunityById(id);
            setOpportunity(oppData);
            
            // Only fetch related data if the opportunity exists and wasn't a cross-tenant err
            if (oppData) {
                const [historyData, propsData, actsData, pricingData] = await Promise.all([
                    opportunityService.getStageHistory(id).catch(() => []),
                    proposalService.getProposals({ opportunityId: id, pageNumber: 1, pageSize: 50 }).catch(() => ({ items: [] })),
                    activityService.getActivities({ relatedToId: id, relatedToType: 2, pageNumber: 1, pageSize: 50 }).catch(() => ({ items: [] })),
                    pricingRequestService.getPricingRequests({ pageNumber: 1, pageSize: 50 }).catch(() => ({ items: [] })),
                ]);

                setStageHistory(Array.isArray(historyData) ? historyData : []);
                setProposals(propsData?.items && Array.isArray(propsData.items) ? propsData.items : []);
                setActivities(actsData?.items && Array.isArray(actsData.items) ? actsData.items : []);
                const allPricing = pricingData?.items && Array.isArray(pricingData.items) ? pricingData.items : [];
                setPricingRequests(allPricing.filter((pr: PricingRequest) => pr.opportunityId === id));
            }
            return true;
        });

        if (!isCrossTenantError) {
          setLoading(false);
        }
    }, [id, execute, isCrossTenantError]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleDelete = async () => {
        try {
            await opportunityService.deactivateOpportunity(id);
            message.success('Opportunity deactivated successfully');
            router.push('/opportunities');
        } catch {
            message.error('Failed to deactivate opportunity');
        }
    };

    const handleProposalSubmit = async (proposalId: string) => {
        try {
            await proposalService.submitProposal(proposalId);
            message.success('Proposal submitted for review');
            fetchAllData();
        } catch {
            message.error('Failed to submit proposal');
        }
    };

    const handleProposalApprove = async (proposalId: string) => {
        try {
            await proposalService.approveProposal(proposalId);
            message.success('Proposal approved');
            fetchAllData();
        } catch {
            message.error('Failed to approve proposal');
        }
    };

    const handleProposalReject = async (proposalId: string) => {
        try {
            await proposalService.rejectProposal(proposalId);
            message.success('Proposal rejected');
            fetchAllData();
        } catch {
            message.error('Failed to reject proposal');
        }
    };

    const [updatingStage, setUpdatingStage] = useState(false);

    const handleStageUpdate = async (newStage: OpportunityStage) => {
        try {
            setUpdatingStage(true);
            await opportunityService.updateStage(id, newStage);
            message.success('Stage updated successfully');
            fetchAllData();
        } catch {
            message.error('Failed to update stage');
        } finally {
            setUpdatingStage(false);
        }
    };

    const handleCompletePricing = async (requestId: string) => {
        try {
            await pricingRequestService.completePricingRequest(requestId);
            message.success('Pricing request completed');
            fetchAllData();
        } catch {
            message.error('Failed to complete pricing request');
        }
    };

    const handleCancelActivity = async (activityId: string) => {
        try {
            await activityService.cancelActivity(activityId);
            message.success('Activity cancelled');
            fetchAllData();
        } catch {
            message.error('Failed to cancel activity');
        }
    };

    if (isCrossTenantError) {
        return <CrossTenantError onReset={resetError} />;
    }

    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <Skeleton active paragraph={{ rows: 6 }} />
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Text type="secondary">Opportunity not found</Text>
            </div>
        );
    }

    const breadcrumbs = [
        { title: 'Nexus', href: '/dashboard' },
        { title: 'Opportunities', href: '/opportunities' },
        { title: opportunity.title || 'Unknown' }
    ];

    const extra = (
        <Space size="middle">
            {canDelete && (
                <Popconfirm
                    title="Deactivate Opportunity"
                    description="Are you sure you want to deactivate this opportunity?"
                    onConfirm={handleDelete}
                    okText="Yes, Deactivate"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger icon={<DeleteOutlined />}>Deactivate</Button>
                </Popconfirm>
            )}
            <Button icon={<EditOutlined />} onClick={() => setIsOpportunityModalOpen(true)} disabled={!canCreate}>Edit</Button>
        </Space>
    );

    const getStageColor = (stage: OpportunityStage | number) => {
        const colors: Record<number, string> = {
            1: 'default', // Lead
            2: 'blue',    // Qualified
            3: 'cyan',    // Proposal
            4: 'orange',  // Negotiation
            5: 'green',   // Closed Won
            6: 'red',     // Closed Lost
        };
        return colors[stage as number] || 'default';
    };

    const getStageName = (stage: OpportunityStage | number) => {
        const names: Record<number, string> = {
            1: 'Lead',
            2: 'Qualified',
            3: 'Proposal',
            4: 'Negotiation',
            5: 'Closed Won',
            6: 'Closed Lost',
        };
        return names[stage as number] || `Stage ${stage}`;
    };

    return (
        <Space orientation="vertical" size={24} style={{ width: '100%' }}>
            <PageHeader 
                title={opportunity.title} 
                breadcrumbs={breadcrumbs}
                extra={extra}
            />

            {/* Metric Summary Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <Statistic 
                            title="Estimated Value" 
                            value={formatCurrency(opportunity.estimatedValue)} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <Statistic 
                            title="Probability" 
                            value={`${opportunity.probability || 0}%`} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <Statistic 
                            title="Expected Close Date" 
                            value={opportunity.expectedCloseDate ? dayjs(opportunity.expectedCloseDate).format('MMM D, YYYY') : 'Not Set'} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text type="secondary" style={{ marginBottom: 4 }}>Current Stage</Text>
                            {canCreate ? (
                                <Select
                                    value={opportunity.stage}
                                    onChange={handleStageUpdate}
                                    loading={updatingStage}
                                    style={{ width: '100%' }}
                                    options={[
                                        { value: 1, label: 'Lead' },
                                        { value: 2, label: 'Qualified' },
                                        { value: 3, label: 'Proposal' },
                                        { value: 4, label: 'Negotiation' },
                                        { value: 5, label: 'Closed Won' },
                                        { value: 6, label: 'Closed Lost' },
                                    ]}
                                />
                            ) : (
                                <Tag color={getStageColor(opportunity.stage)} style={{ alignSelf: 'flex-start', fontSize: 14, padding: '4px 8px' }}>
                                    {getStageName(opportunity.stage)}
                                </Tag>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
            <Col xs={24} xl={17}>
            <Card variant="borderless">
                <Tabs
                    defaultActiveKey="overview"
                    items={[
                        {
                            key: 'overview',
                            label: (<span><InfoCircleOutlined /> Overview</span>),
                            children: (
                                <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
                                    <Descriptions.Item label="Client">
                                        {opportunity.clientId ? (
                                            <Link href={`/clients/${opportunity.clientId}`}>{opportunity.clientName}</Link>
                                        ) : (
                                            opportunity.clientName || 'N/A'
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Owner">{opportunity.ownerName || 'Unassigned'}</Descriptions.Item>
                                    <Descriptions.Item label="Source">
                                        {{
                                            1: 'Outbound',
                                            2: 'Inbound',
                                            3: 'Partner',
                                            4: 'Referral'
                                        }[opportunity.source] || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Description" span={2}>{opportunity.description || 'No description provided.'}</Descriptions.Item>
                                </Descriptions>
                            ),
                        },
                        {
                            key: 'stage-history',
                            label: (<span><HistoryOutlined /> Stage History</span>),
                            children: (
                                <Table
                                    size="small"
                                    rowKey="id"
                                    dataSource={stageHistory}
                                    columns={[
                                        { title: 'From Stage', dataIndex: 'fromStage', key: 'fromStage', render: (s) => getStageName(s) },
                                        { title: 'To Stage', dataIndex: 'toStage', key: 'toStage', render: (s) => <Tag color={getStageColor(s)}>{getStageName(s)}</Tag> },
                                        { title: 'Changed At', dataIndex: 'changedAt', key: 'changedAt', render: (d) => dayjs(d).format('MMM D, YYYY HH:mm') },
                                        { title: 'Notes', dataIndex: 'notes', key: 'notes' },
                                    ]}
                                    locale={{ emptyText: 'No stage history available.' }}
                                    scroll={{ x: 'max-content' }}
                                />
                            ),
                        },
                        {
                            key: 'proposals',
                            label: (<span><FileTextOutlined /> Proposals</span>),
                            children: (
                                <>
                                    <Table
                                        size="small"
                                        rowKey="id"
                                        dataSource={proposals}
                                        columns={[
                                            { title: 'Title', dataIndex: 'title', key: 'title', render: (t, r) => <Link href={`/proposals/${r.id}`}>{t}</Link> },
                                            { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount', render: (v) => formatCurrency(v) },
                                            { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <StatusBadge status={s} /> },
                                            {
                                                title: 'Actions',
                                                key: 'actions',
                                                render: (_, record) => (
                                                    <Space size="small">
                                                        {record.status === ProposalStatus.DRAFT && canCreate && (
                                                            <Popconfirm title="Submit this proposal?" onConfirm={() => handleProposalSubmit(record.id)}>
                                                                <Button size="small" type="primary" ghost icon={<SendOutlined />}>Submit</Button>
                                                            </Popconfirm>
                                                        )}
                                                        {record.status === ProposalStatus.SUBMITTED && canApproveProposal && (
                                                            <>
                                                                <Popconfirm title="Approve this proposal?" onConfirm={() => handleProposalApprove(record.id)}>
                                                                    <Button size="small" type="primary" icon={<CheckOutlined />}>Approve</Button>
                                                                </Popconfirm>
                                                                <Popconfirm title="Reject this proposal?" onConfirm={() => handleProposalReject(record.id)}>
                                                                    <Button size="small" danger icon={<CloseOutlined />}>Reject</Button>
                                                                </Popconfirm>
                                                            </>
                                                        )}
                                                    </Space>
                                                )
                                            }
                                        ]}
                                        locale={{ emptyText: 'No proposals linked to this opportunity.' }}
                                        scroll={{ x: 'max-content' }}
                                    />
                                    <div style={{ marginTop: 16 }}>
                                        <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setIsProposalModalOpen(true)} disabled={!canCreate}>
                                            New Proposal
                                        </Button>
                                    </div>
                                </>
                            ),
                        },
                        {
                            key: 'activities',
                            label: (<span><ScheduleOutlined /> Activities</span>),
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
                                                render: (date) => {
                                                    const isOverdue = dayjs(date).isBefore(dayjs());
                                                    return <span style={{ color: isOverdue ? 'red' : 'inherit' }}>{dayjs(date).format('MMM D, HH:mm')}</span>;
                                                }
                                            },
                                            { 
                                                title: 'Status', 
                                                dataIndex: 'statusName', 
                                                key: 'statusName',
                                                render: (status) => {
                                                    let color = 'gold';
                                                    if (status === 'Completed') color = 'green';
                                                    if (status === 'Cancelled') color = 'default';
                                                    return <Tag color={color}>{status}</Tag>;
                                                }
                                            },
                                            {
                                                title: 'Actions',
                                                key: 'actions',
                                                render: (_, record) => {
                                                    if (record.statusName !== 'Scheduled') return <span style={{ color: token.colorTextDisabled }}>Closed</span>;
                                                    return (
                                                        <Space>
                                                            <Button type="link" size="small" onClick={() => { setSelectedActivity(record); setIsCompleteModalOpen(true); }}>Complete</Button>
                                                            <Button type="text" danger size="small" onClick={() => handleCancelActivity(record.id)}>Cancel</Button>
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
                        {
                            key: 'pricing',
                            label: (<span><SolutionOutlined /> Pricing Requests</span>),
                            children: (
                                <>
                                    <Table
                                        size="small"
                                        rowKey="id"
                                        dataSource={pricingRequests}
                                        columns={[
                                            { title: 'Title', dataIndex: 'title', key: 'title', render: (text: string, record: PricingRequest) => <Link href={`/pricing-requests/${record.id}`}>{text}</Link> },
                                            {
                                                title: 'Priority',
                                                dataIndex: 'priority',
                                                key: 'priority',
                                                render: (p: number) => {
                                                    const config: Record<number, { color: string; label: string }> = {
                                                        1: { color: 'green', label: 'Low' },
                                                        2: { color: 'gold', label: 'Medium' },
                                                        3: { color: 'orange', label: 'High' },
                                                        4: { color: 'red', label: 'Urgent' },
                                                    };
                                                    const { color, label } = config[p] || { color: 'default', label: `Priority ${p}` };
                                                    return <Tag color={color}>{label}</Tag>;
                                                },
                                            },
                                            {
                                                title: 'Status',
                                                dataIndex: 'status',
                                                key: 'status',
                                                render: (s: PricingRequestStatus) => <StatusBadge status={s} />,
                                            },
                                            { title: 'Assigned To', dataIndex: 'assignedToName', key: 'assignedToName', render: (t: string) => t || 'Unassigned' },
                                            {
                                                title: 'Required By',
                                                dataIndex: 'requiredByDate',
                                                key: 'requiredByDate',
                                                render: (d: string) => {
                                                    if (!d) return '—';
                                                    const isOverdue = dayjs(d).isBefore(dayjs());
                                                    return <span style={{ color: isOverdue ? 'red' : 'inherit' }}>{dayjs(d).format('MMM D, YYYY')}</span>;
                                                },
                                            },
                                            {
                                                title: 'Actions',
                                                key: 'actions',
                                                render: (_: unknown, record: PricingRequest) => (
                                                    <Space size="small">
                                                        {record.status === PricingRequestStatus.IN_PROGRESS && canCreate && (
                                                            <Popconfirm title="Mark as completed?" onConfirm={() => handleCompletePricing(record.id)}>
                                                                <Button size="small" type="primary" icon={<CheckOutlined />}>Complete</Button>
                                                            </Popconfirm>
                                                        )}
                                                    </Space>
                                                ),
                                            },
                                        ]}
                                        locale={{ emptyText: 'No pricing requests for this opportunity.' }}
                                        scroll={{ x: 'max-content' }}
                                    />
                                    <div style={{ marginTop: 16 }}>
                                        <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setIsPricingModalOpen(true)} disabled={!canCreate}>
                                            New Pricing Request
                                        </Button>
                                    </div>
                                </>
                            ),
                        },
                        {
                            key: 'documents',
                            label: (<span><FileOutlined /> Documents</span>),
                            children: (
                                <DocumentsPanel relatedToType={2} relatedToId={id} />
                            ),
                        },
                        {
                            key: 'notes',
                            label: (<span><MessageOutlined /> Notes</span>),
                            children: (
                                <NotesPanel relatedToType={2} relatedToId={id} />
                            ),
                        }
                    ]}
                />
            </Card>
            </Col>
            <Col xs={24} xl={7}>
                <DealHealthScore
                    opportunity={opportunity}
                    activities={activities}
                    proposals={proposals}
                />
            </Col>
            </Row>

            <OpportunityModal
                open={isOpportunityModalOpen}
                onClose={() => setIsOpportunityModalOpen(false)}
                opportunity={opportunity}
                onSuccess={fetchAllData}
            />

            <ProposalModal 
                open={isProposalModalOpen}
                onClose={() => setIsProposalModalOpen(false)}
                onSuccess={fetchAllData}
                preselectedOpportunityId={id}
            />

            <CreateActivityModal 
                open={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                onSuccess={fetchAllData}
                initialRelatedToType={2} // Opportunity Activity
                initialRelatedToId={id}
            />

            <CompleteActivityModal
                open={isCompleteModalOpen}
                onClose={() => setIsCompleteModalOpen(false)}
                activity={selectedActivity}
                onSuccess={fetchAllData}
            />

            <ViewActivityModal
                open={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                activity={selectedActivity}
            />

            <PricingRequestModal
                open={isPricingModalOpen}
                onClose={() => setIsPricingModalOpen(false)}
                onSuccess={fetchAllData}
                preselectedOpportunityId={id}
            />

        </Space>
    );
}
