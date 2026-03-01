'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
    Card, Typography, Tag, Button, Space, Tabs, Descriptions,
    Statistic, Table, Row, Col, Skeleton, App, Popconfirm, Alert, Empty
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    CheckOutlined,
    CloseOutlined,
    FileOutlined,
    MessageOutlined,
    DownloadOutlined,
    EyeOutlined,
    RedoOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import { Contract, ContractRenewal, Activity, UserRole, ContractStatus } from '@/types';
import { theme as antdTheme } from 'antd';
import { useHasRole } from '@/hooks/useHasRole';
import { useCrossTenantError } from '@/hooks/useCrossTenantError';
import contractService from '@/services/contractService';
import activityService from '@/services/activityService';
import documentService from '@/services/documentService';
import noteService, { Note } from '@/services/noteService';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';
import CrossTenantError from '@/components/errors/CrossTenantError';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatCurrency } from '@/utils/currencyUtils';

dayjs.extend(relativeTime);

const CreateRenewalModal = dynamic(() => import('@/components/contracts/CreateRenewalModal'), { ssr: false, loading: () => null });
const CreateActivityModal = dynamic(() => import('@/components/activities/CreateActivityModal'), { ssr: false, loading: () => null });
const CompleteActivityModal = dynamic(() => import('@/components/activities/CompleteActivityModal'), { ssr: false, loading: () => null });
const DocumentUploadModal = dynamic(() => import('@/components/documents/DocumentUploadModal'), { ssr: false, loading: () => null });
const NoteModal = dynamic(() => import('@/components/notes/NoteModal'), { ssr: false, loading: () => null });

const { Text } = Typography;

export default function ContractDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { message } = App.useApp();
    const { token } = antdTheme.useToken();
    const { isCrossTenantError, execute, reset: resetError } = useCrossTenantError();

    const [contract, setContract] = useState<Contract | null>(null);
    const [renewals, setRenewals] = useState<ContractRenewal[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isNoteReadOnly, setIsNoteReadOnly] = useState(false);

    const { hasRole: canManage } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);
    const { hasRole: isAdmin } = useHasRole([UserRole.ADMIN]);

    const extractArray = (res: any) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (res.items && Array.isArray(res.items)) return res.items;
        if (res.data && Array.isArray(res.data)) return res.data;
        if (res.$values && Array.isArray(res.$values)) return res.$values;
        return [];
    };

    const fetchAllData = useCallback(async () => {
        if (!id) return;
        setLoading(true);

        const success = await execute(async () => {
            const contractData = await contractService.getContractById(id);
            setContract(contractData);

            if (contractData) {
                const [renewalsData, actsData, docsRes, notesRes] = await Promise.all([
                    contractService.getRenewals(id).catch(() => []),
                    activityService.getActivities({ relatedToId: id, relatedToType: 4, pageNumber: 1, pageSize: 50 }).catch(() => ({ items: [] })),
                    documentService.getDocuments({ relatedToId: id, relatedToType: 4 }).catch(() => ({ items: [] })),
                    noteService.getNotes({ relatedToId: id, relatedToType: 4 }).catch(() => ({ items: [] }))
                ]);

                setRenewals(Array.isArray(renewalsData) ? renewalsData : extractArray(renewalsData));
                setActivities(actsData?.items && Array.isArray(actsData.items) ? actsData.items : extractArray(actsData));
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

    const handleActivate = async () => {
        try {
            await contractService.activateContract(id);
            message.success('Contract activated successfully');
            fetchAllData();
        } catch {
            message.error('Failed to activate contract');
        }
    };

    const handleCancel = async () => {
        try {
            await contractService.cancelContract(id);
            message.success('Contract cancelled');
            fetchAllData();
        } catch {
            message.error('Failed to cancel contract');
        }
    };

    const handleDelete = async () => {
        try {
            await contractService.deleteContract(id);
            message.success('Contract deleted successfully');
            router.push('/contracts');
        } catch {
            message.error('Failed to delete contract');
        }
    };

    const handleCompleteRenewal = async (renewalId: string) => {
        try {
            await contractService.completeRenewal(renewalId);
            message.success('Renewal completed successfully');
            fetchAllData();
        } catch {
            message.error('Failed to complete renewal');
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

    if (!contract) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Text type="secondary">Contract not found</Text>
            </div>
        );
    }

    const isDraft = contract.statusName === 'Draft' || contract.status === ContractStatus.DRAFT;
    const isActive = contract.statusName === 'Active' || contract.status === ContractStatus.ACTIVE;

    const breadcrumbs = [
        { title: 'Nexus', href: '/dashboard' },
        { title: 'Contracts', href: '/contracts' },
        { title: contract.contractNumber || contract.id.substring(0, 8).toUpperCase() }
    ];

    const extra = (
        <Space size="middle">
            {isDraft && canManage && (
                <Popconfirm
                    title="Activate this contract?"
                    description="This will move the contract to Active status."
                    onConfirm={handleActivate}
                    okText="Activate"
                >
                    <Button type="primary" icon={<PlayCircleOutlined />}>Activate</Button>
                </Popconfirm>
            )}
            {isDraft && canManage && (
                <Popconfirm
                    title="Cancel this contract?"
                    description="This action cannot be undone."
                    onConfirm={handleCancel}
                    okText="Cancel Contract"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger icon={<CloseOutlined />}>Cancel</Button>
                </Popconfirm>
            )}
            {isActive && canManage && (
                <>
                    <Popconfirm
                        title="Cancel this contract?"
                        description="This action cannot be undone."
                        onConfirm={handleCancel}
                        okText="Cancel Contract"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<CloseOutlined />}>Cancel</Button>
                    </Popconfirm>
                    <Button type="primary" icon={<RedoOutlined />} onClick={() => setIsRenewalModalOpen(true)}>Renew</Button>
                </>
            )}
            {isAdmin && (
                <Popconfirm
                    title="Delete Contract"
                    description="Are you sure you want to delete this contract? This cannot be undone."
                    onConfirm={handleDelete}
                    okText="Yes, Delete"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger icon={<DeleteOutlined />}>Delete</Button>
                </Popconfirm>
            )}
        </Space>
    );

    return (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <PageHeader
                title={contract.title || contract.contractNumber}
                breadcrumbs={breadcrumbs}
                extra={extra}
            />

            {contract.isExpiringSoon && (
                <Alert
                    type="warning"
                    showIcon
                    message="Contract Expiring Soon"
                    description={`This contract expires in ${contract.daysUntilExpiry} day${contract.daysUntilExpiry === 1 ? '' : 's'}. Consider initiating a renewal.`}
                    banner
                />
            )}

            {/* Summary Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <Statistic
                            title="Contract Value"
                            value={formatCurrency(contract.contractValue ?? contract.totalValue)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <Statistic
                            title="Start Date"
                            value={contract.startDate ? dayjs(contract.startDate).format('MMM D, YYYY') : 'Not Set'}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <Statistic
                            title="End Date"
                            value={contract.endDate ? dayjs(contract.endDate).format('MMM D, YYYY') : 'Not Set'}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text type="secondary" style={{ marginBottom: 4 }}>Status</Text>
                            <StatusBadge status={contract.statusName || contract.status} />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Tabs */}
            <Card variant="borderless">
                <Tabs
                    defaultActiveKey="details"
                    items={[
                        {
                            key: 'details',
                            label: 'Contract Details',
                            children: (
                                <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
                                    <Descriptions.Item label="Contract Number">{contract.contractNumber || '—'}</Descriptions.Item>
                                    <Descriptions.Item label="Client">{contract.clientName || '—'}</Descriptions.Item>
                                    <Descriptions.Item label="Opportunity ID">{contract.opportunityId || '—'}</Descriptions.Item>
                                    <Descriptions.Item label="Proposal ID">{contract.proposalId || '—'}</Descriptions.Item>
                                    <Descriptions.Item label="Contract Value">{formatCurrency(contract.contractValue ?? contract.totalValue)}</Descriptions.Item>
                                    <Descriptions.Item label="Start Date">{contract.startDate ? dayjs(contract.startDate).format('MMM D, YYYY') : '—'}</Descriptions.Item>
                                    <Descriptions.Item label="End Date">{contract.endDate ? dayjs(contract.endDate).format('MMM D, YYYY') : '—'}</Descriptions.Item>
                                    <Descriptions.Item label="Owner">{contract.ownerName || 'Unassigned'}</Descriptions.Item>
                                    <Descriptions.Item label="Auto Renew">{contract.autoRenew ? 'Yes' : 'No'}</Descriptions.Item>
                                    <Descriptions.Item label="Renewal Notice Period">{contract.renewalNoticePeriod ? `${contract.renewalNoticePeriod} days` : '—'}</Descriptions.Item>
                                    <Descriptions.Item label="Days Until Expiry">{contract.daysUntilExpiry != null ? `${contract.daysUntilExpiry} days` : '—'}</Descriptions.Item>
                                    <Descriptions.Item label="Terms" span={2}>{contract.terms || 'No terms specified.'}</Descriptions.Item>
                                </Descriptions>
                            ),
                        },
                        {
                            key: 'renewals',
                            label: 'Renewals',
                            children: (
                                <>
                                    <DataTable<ContractRenewal>
                                        rowKey="id"
                                        dataSource={renewals}
                                        pagination={false}
                                        size="small"
                                        columns={[
                                            {
                                                title: 'Date',
                                                dataIndex: 'renewalDate',
                                                key: 'renewalDate',
                                                render: (d: string) => d ? dayjs(d).format('MMM D, YYYY') : '—',
                                            },
                                            {
                                                title: 'Status',
                                                dataIndex: 'statusName',
                                                key: 'statusName',
                                                render: (status: string) => <StatusBadge status={status} />,
                                            },
                                            {
                                                title: 'Notes',
                                                dataIndex: 'notes',
                                                key: 'notes',
                                            },
                                            {
                                                title: 'Action',
                                                key: 'action',
                                                render: (_: any, renewal: ContractRenewal) => (
                                                    renewal.statusName === 'Pending' && canManage ? (
                                                        <Button size="small" type="primary" onClick={() => handleCompleteRenewal(renewal.id)}>
                                                            Complete Renewal
                                                        </Button>
                                                    ) : null
                                                ),
                                            },
                                        ]}
                                    />
                                    {isActive && canManage && (
                                        <div style={{ marginTop: 16 }}>
                                            <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setIsRenewalModalOpen(true)}>
                                                Initiate Renewal
                                            </Button>
                                        </div>
                                    )}
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
                                            { title: 'Subject', dataIndex: 'subject', key: 'subject', render: (text: string) => <Text strong>{text}</Text> },
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
                                        <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setIsActivityModalOpen(true)}>
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
                                        <Button size="small" type="primary" onClick={() => setIsDocumentModalOpen(true)}>
                                            Upload Document
                                        </Button>
                                    </div>
                                    {documents.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', background: token.colorBgLayout, borderRadius: 8, padding: '0 16px' }}>
                                            {documents.map((doc, index) => (
                                                <div key={doc.id || index} style={{ padding: '12px 0', borderBottom: index === documents.length - 1 ? 'none' : `1px solid ${token.colorBorderSecondary}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text>{doc.fileName || doc.name || 'Unnamed Document'}</Text>
                                                    <Space>
                                                        <Button
                                                            type="text"
                                                            icon={<DownloadOutlined />}
                                                            size="small"
                                                            onClick={() => documentService.downloadDocument(doc)}
                                                        />
                                                        {canManage && (
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
                                        <Typography.Title level={5} style={{ margin: 0 }}>Contract Notes</Typography.Title>
                                        <Button size="small" type="primary" onClick={() => setIsNoteModalOpen(true)}>
                                            Add Note
                                        </Button>
                                    </div>
                                    {notes.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', background: token.colorBgLayout, borderRadius: 8, padding: '0 16px' }}>
                                            {notes.map((note, index) => (
                                                <div key={note.id || index} style={{ padding: '12px 0', borderBottom: index === notes.length - 1 ? 'none' : `1px solid ${token.colorBorderSecondary}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                                        {canManage && (
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
                        },
                    ]}
                />
            </Card>

            {/* Modals */}
            {contract && (
                <CreateRenewalModal
                    open={isRenewalModalOpen}
                    onClose={() => {
                        setIsRenewalModalOpen(false);
                        fetchAllData();
                    }}
                    contractId={contract.id}
                    clientName={contract.clientName}
                    clientId={contract.clientId}
                />
            )}

            <CreateActivityModal
                open={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                onSuccess={fetchAllData}
                initialRelatedToType={4}
                initialRelatedToId={id}
            />

            <CompleteActivityModal
                open={isCompleteModalOpen}
                onClose={() => setIsCompleteModalOpen(false)}
                activity={selectedActivity}
                onSuccess={fetchAllData}
            />

            <DocumentUploadModal
                open={isDocumentModalOpen}
                onClose={() => setIsDocumentModalOpen(false)}
                onSuccess={fetchAllData}
                relatedToType={4}
                relatedToId={id}
            />

            <NoteModal
                open={isNoteModalOpen}
                onClose={() => { setIsNoteModalOpen(false); setSelectedNote(null); setIsNoteReadOnly(false); }}
                onSuccess={fetchAllData}
                relatedToType={4}
                relatedToId={id}
                note={selectedNote}
                readOnly={isNoteReadOnly}
            />
        </Space>
    );
}
