'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Card, Typography, Tag, Button, Space, Tabs, Select,
    Descriptions, Statistic, Table, Row, Col, Skeleton, App, Popconfirm,
    Avatar, Tooltip, Empty
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
    DownloadOutlined,
    UserOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { Opportunity, UserRole, Activity, Proposal, ProposalStatus } from '@/types';
import { OpportunityStage } from '@/types/enums';
import { useHasRole } from '@/hooks/useHasRole';
import { useCrossTenantError } from '@/hooks/useCrossTenantError';
import opportunityService, { OpportunityStageHistory } from '@/services/opportunityService';
import proposalService from '@/services/proposalService';
import activityService from '@/services/activityService';
import documentService from '@/services/documentService';
import noteService, { Note } from '@/services/noteService';
import api from '@/services/api';
import PageHeader from '@/components/shared/PageHeader';
import OpportunityModal from '@/components/opportunities/OpportunityModal';
import ProposalModal from '@/components/proposals/ProposalModal';
import NoteModal from '@/components/notes/NoteModal';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';
import CreateActivityModal from '@/components/activities/CreateActivityModal';
import CompleteActivityModal from '@/components/activities/CompleteActivityModal';
import CrossTenantError from '@/components/errors/CrossTenantError';
import StatusBadge from '@/components/shared/StatusBadge';
import DealHealthScore from '@/components/ai/DealHealthScore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';

dayjs.extend(relativeTime);

const { Text } = Typography;

export default function OpportunityDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { message } = App.useApp();
    const { isCrossTenantError, execute, reset: resetError } = useCrossTenantError();

    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [stageHistory, setStageHistory] = useState<OpportunityStageHistory[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isNoteReadOnly, setIsNoteReadOnly] = useState(false);

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
                const [historyData, propsData, actsData, docsRes, notesRes] = await Promise.all([
                    opportunityService.getStageHistory(id).catch(() => []),
                    proposalService.getProposals({ opportunityId: id, pageNumber: 1, pageSize: 50 }).catch(() => ({ items: [] })),
                    activityService.getActivities({ relatedToId: id, relatedToType: 2, pageNumber: 1, pageSize: 50 }).catch(() => ({ items: [] })),
                    documentService.getDocuments({ relatedToId: id, relatedToType: 2 }).catch(() => ({ items: [] })),
                    noteService.getNotes({ relatedToId: id, relatedToType: 2 }).catch(() => ({ items: [] }))
                ]);
                
                setStageHistory(Array.isArray(historyData) ? historyData : []);
                setProposals(propsData?.items && Array.isArray(propsData.items) ? propsData.items : []);
                setActivities(actsData?.items && Array.isArray(actsData.items) ? actsData.items : []);
                
                // Endpoints might return a paginated wrapper line { items: [...] } or direct arrays or .data wrapped
                const extractArray = (res: any) => {
                    if (!res) return [];
                    if (Array.isArray(res)) return res;
                    if (res.items && Array.isArray(res.items)) return res.items;
                    if (res.data && Array.isArray(res.data)) return res.data;
                    if (res.$values && Array.isArray(res.$values)) return res.$values;
                    return [];
                };

                setDocuments(extractArray(docsRes));
                setNotes(extractArray(notesRes));
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
            await opportunityService.deleteOpportunity(id);
            message.success('Opportunity deleted successfully');
            router.push('/opportunities');
        } catch {
            message.error('Failed to delete opportunity');
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
                    title="Delete Opportunity"
                    description="Are you sure you want to delete this opportunity?"
                    onConfirm={handleDelete}
                    okText="Yes, Delete"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger icon={<DeleteOutlined />}>Delete</Button>
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
                            value={`${opportunity.currency || 'ZAR'} ${opportunity.estimatedValue?.toLocaleString() || 0}`} 
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
                            <Tag color={getStageColor(opportunity.stage)} style={{ alignSelf: 'flex-start', fontSize: 14, padding: '4px 8px' }}>
                                {getStageName(opportunity.stage)}
                            </Tag>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card variant="borderless">
                        <Tabs
                            defaultActiveKey="overview"
                            items={[
                                {
                                    key: 'overview',
                                    label: 'Overview',
                                    children: (
                                        <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
                                            <Descriptions.Item label="Client">{opportunity.clientName || 'N/A'}</Descriptions.Item>
                                            <Descriptions.Item label="Owner">{opportunity.ownerName || 'Unassigned'}</Descriptions.Item>
                                            <Descriptions.Item label="Source">
                                                {{
                                                    1: 'Outbound',
                                                    2: 'Inbound',
                                                    3: 'Partner',
                                                    4: 'Referral'
                                                }[opportunity.source] || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Currency">{opportunity.currency || 'ZAR'}</Descriptions.Item>
                                            <Descriptions.Item label="Description" span={2}>{opportunity.description || 'No description provided.'}</Descriptions.Item>
                                        </Descriptions>
                                    ),
                                },
                                {
                                    key: 'stage-history',
                                    label: 'Stage History',
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
                                    label: 'Proposals',
                                    children: (
                                        <>
                                            <Table
                                                size="small"
                                                rowKey="id"
                                                dataSource={proposals}
                                                columns={[
                                                    { title: 'Proposal #', dataIndex: 'proposalNumber', key: 'proposalNumber' },
                                                    { title: 'Title', dataIndex: 'title', key: 'title', render: (t, r) => <Link href={`/proposals/${r.id}`}>{t}</Link> },
                                                    { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount', render: (v, r) => `${r.currency || 'R'}${v?.toLocaleString()}` },
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
                                    label: 'Activities',
                                    children: (
                                        <>
                                            <Table
                                                size="small"
                                                rowKey="id"
                                                dataSource={activities}
                                                columns={[
                                                    { title: 'Subject', dataIndex: 'subject', key: 'subject', render: (text) => <Text strong>{text}</Text> },
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
                                                            if (record.statusName !== 'Scheduled') return <span style={{ color: '#aaa' }}>Closed</span>;
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
                                    key: 'documents',
                                    label: (<span><FileOutlined /> Documents</span>),
                                    children: (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                <Typography.Title level={5} style={{ margin: 0 }}>Attached Documents</Typography.Title>
                                                {canCreate && (
                                                    <Button size="small" type="primary" onClick={() => setIsDocumentModalOpen(true)}>
                                                        Upload Document
                                                    </Button>
                                                )}
                                            </div>
                                            {documents.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', background: '#fafafa', borderRadius: 8, padding: '0 16px' }}>
                                                    {documents.map((doc, index) => (
                                                        <div key={index} style={{ padding: '12px 0', borderBottom: index === documents.length - 1 ? 'none' : '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Text>{doc.fileName || doc.name || 'Unnamed Document'}</Text>
                                                            <Space>
                                                                <Button 
                                                                    type="text" 
                                                                    icon={<DownloadOutlined />} 
                                                                    size="small" 
                                                                    onClick={() => documentService.downloadDocument(doc)}
                                                                />
                                                                {canDelete && (
                                                                    <Popconfirm
                                                                        title="Delete this document?"
                                                                        onConfirm={async () => {
                                                                            await documentService.deleteDocument(doc.id);
                                                                            message.success('Document deleted');
                                                                            fetchAllData();
                                                                        }}
                                                                        okText="Yes"
                                                                        cancelText="No"
                                                                        okButtonProps={{ danger: true }}
                                                                    >
                                                                        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                                                                    </Popconfirm>
                                                                )}
                                                            </Space>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Empty description="No documents attached" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                            )}
                                        </>
                                    ),
                                },
                                {
                                    key: 'notes',
                                    label: (<span><MessageOutlined /> Notes</span>),
                                    children: (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                <Typography.Title level={5} style={{ margin: 0 }}>Opportunity Notes</Typography.Title>
                                                {canCreate && (
                                                    <Button size="small" type="primary" onClick={() => setIsNoteModalOpen(true)}>
                                                        Add Note
                                                    </Button>
                                                )}
                                            </div>
                                            {notes.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', background: '#fafafa', borderRadius: 8, padding: '0 16px' }}>
                                                    {notes.map((note, index) => (
                                                        <div key={index} style={{ padding: '12px 0', borderBottom: index === notes.length - 1 ? 'none' : '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ flex: 1, overflow: 'hidden', marginRight: 16 }}>
                                                                <Text strong ellipsis style={{ display: 'block' }}>
                                                                    {note.content || note.text}
                                                                </Text>
                                                                <Space size={4}>
                                                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                                                        {dayjs(note.createdAt).fromNow()}
                                                                    </Text>
                                                                    {note.isPrivate && <Tag color="blue" style={{ fontSize: 10, lineHeight: '14px', height: 16, padding: '0 4px' }}>Private</Tag>}
                                                                </Space>
                                                            </div>
                                                            <Space size={0}>
                                                                <Button 
                                                                    type="text" 
                                                                    size="small" 
                                                                    icon={<EyeOutlined style={{ fontSize: 14 }} />} 
                                                                    onClick={() => { setSelectedNote(note); setIsNoteReadOnly(true); setIsNoteModalOpen(true); }}
                                                                />
                                                                <Button 
                                                                    type="text" 
                                                                    size="small" 
                                                                    icon={<EditOutlined style={{ fontSize: 14 }} />} 
                                                                    onClick={() => { setSelectedNote(note); setIsNoteReadOnly(false); setIsNoteModalOpen(true); }}
                                                                />
                                                                {canDelete && (
                                                                    <Popconfirm
                                                                        title="Delete this note?"
                                                                        onConfirm={async () => {
                                                                            await noteService.deleteNote(note.id);
                                                                            message.success('Note deleted');
                                                                            fetchAllData();
                                                                        }}
                                                                    >
                                                                        <Button type="text" size="small" danger icon={<DeleteOutlined style={{ fontSize: 14 }} />} />
                                                                    </Popconfirm>
                                                                )}
                                                            </Space>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Empty description="No notes yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                            )}
                                        </>
                                    ),
                                }
                            ]}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
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

            <NoteModal
                open={isNoteModalOpen}
                onClose={() => { setIsNoteModalOpen(false); setSelectedNote(null); setIsNoteReadOnly(false); }}
                onSuccess={fetchAllData}
                relatedToType={2} // Opportunity
                relatedToId={id}
                note={selectedNote}
                readOnly={isNoteReadOnly}
            />

            <DocumentUploadModal
                open={isDocumentModalOpen}
                onClose={() => setIsDocumentModalOpen(false)}
                onSuccess={fetchAllData}
                relatedToType={2} // Opportunity
                relatedToId={id}
            />
        </Space>
    );
}
