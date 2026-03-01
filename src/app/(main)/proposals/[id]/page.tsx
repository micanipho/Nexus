'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    Card, Typography, Tag, Button, Space, Tabs, Descriptions,
    Table, Skeleton, App, Popconfirm, InputNumber,
    Alert, Empty
} from 'antd';
import {
    EditOutlined, DeleteOutlined, PlusOutlined, CheckOutlined,
    SendOutlined, CloseOutlined, FileOutlined, MessageOutlined,
    DownloadOutlined, EyeOutlined, SaveOutlined, UndoOutlined
} from '@ant-design/icons';
import { Proposal, ProposalLineItem, ProposalStatus, UserRole } from '@/types';
import { theme as antdTheme } from 'antd';
import { useHasRole } from '@/hooks/useHasRole';
import { useCrossTenantError } from '@/hooks/useCrossTenantError';
import proposalService from '@/services/proposalService';
import documentService from '@/services/documentService';
import noteService, { Note } from '@/services/noteService';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import NoteModal from '@/components/notes/NoteModal';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';
import CrossTenantError from '@/components/errors/CrossTenantError';
import { formatCurrency, formatCurrencyDetailed } from '@/utils/currencyUtils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

interface EditingRow {
    id: string;
    productServiceName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
}

const EMPTY_LINE_ITEM: Omit<EditingRow, 'id'> = {
    productServiceName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    taxRate: 0,
};

function calcLineTotal(qty: number, unitPrice: number, discount: number, taxRate: number): number {
    return (qty * unitPrice * (1 - discount / 100)) * (1 + taxRate / 100);
}

export default function ProposalDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { message } = App.useApp();
    const { token } = antdTheme.useToken();
    const { isCrossTenantError, execute, reset: resetError } = useCrossTenantError();

    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Editing state
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editingValues, setEditingValues] = useState<EditingRow | null>(null);
    const [addingNew, setAddingNew] = useState(false);
    const [newItemValues, setNewItemValues] = useState<Omit<EditingRow, 'id'>>(EMPTY_LINE_ITEM);
    const [savingLineItem, setSavingLineItem] = useState(false);

    // Modal state
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isNoteReadOnly, setIsNoteReadOnly] = useState(false);

    // RBAC
    const { hasRole: canEdit } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);
    const { hasRole: canApprove } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);
    const { hasRole: canDelete } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);

    const isDraft = proposal?.status === ProposalStatus.DRAFT;

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
            const proposalData = await proposalService.getProposalById(id);
            setProposal(proposalData);

            if (proposalData) {
                const [docsRes, notesRes] = await Promise.all([
                    documentService.getDocuments({ relatedToId: id, relatedToType: 3 }).catch(() => ({ items: [] })),
                    noteService.getNotes({ relatedToId: id, relatedToType: 3 }).catch(() => ({ items: [] })),
                ]);
                setDocuments(extractArray(docsRes));
                setNotes(extractArray(notesRes));
            }
            return true;
        });

        if (success !== undefined) {
            setLoading(false);
        }
    }, [id, execute]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // --- Status actions ---
    const handleSubmit = async () => {
        try {
            await proposalService.submitProposal(id);
            message.success('Proposal submitted for approval');
            fetchAllData();
        } catch {
            message.error('Failed to submit proposal');
        }
    };

    const handleApprove = async () => {
        try {
            await proposalService.approveProposal(id);
            message.success('Proposal approved');
            fetchAllData();
        } catch {
            message.error('Failed to approve proposal');
        }
    };

    const handleReject = async () => {
        try {
            await proposalService.rejectProposal(id);
            message.success('Proposal rejected');
            fetchAllData();
        } catch {
            message.error('Failed to reject proposal');
        }
    };

    // --- Line item actions ---
    const startEditing = (record: ProposalLineItem) => {
        setEditingRowId(record.id);
        setEditingValues({
            id: record.id,
            productServiceName: record.productServiceName,
            description: record.description,
            quantity: record.quantity,
            unitPrice: record.unitPrice,
            discount: record.discount,
            taxRate: record.taxRate,
        });
    };

    const cancelEditing = () => {
        setEditingRowId(null);
        setEditingValues(null);
    };

    const saveEditing = async () => {
        if (!editingValues || !editingRowId) return;
        setSavingLineItem(true);
        try {
            await proposalService.updateLineItem(id, editingRowId, {
                productServiceName: editingValues.productServiceName,
                description: editingValues.description,
                quantity: editingValues.quantity,
                unitPrice: editingValues.unitPrice,
                discount: editingValues.discount,
                taxRate: editingValues.taxRate,
            });
            message.success('Line item updated');
            cancelEditing();
            fetchAllData();
        } catch {
            message.error('Failed to update line item');
        } finally {
            setSavingLineItem(false);
        }
    };

    const handleAddLineItem = async () => {
        setSavingLineItem(true);
        try {
            await proposalService.addLineItem(id, {
                productServiceName: newItemValues.productServiceName || 'New Item',
                description: newItemValues.description,
                quantity: newItemValues.quantity,
                unitPrice: newItemValues.unitPrice,
                discount: newItemValues.discount,
                taxRate: newItemValues.taxRate,
            });
            message.success('Line item added');
            setAddingNew(false);
            setNewItemValues(EMPTY_LINE_ITEM);
            fetchAllData();
        } catch {
            message.error('Failed to add line item');
        } finally {
            setSavingLineItem(false);
        }
    };

    const handleDeleteLineItem = async (lineItemId: string) => {
        try {
            await proposalService.deleteLineItem(id, lineItemId);
            message.success('Line item removed');
            fetchAllData();
        } catch {
            message.error('Failed to remove line item');
        }
    };

    // --- Rendering ---
    if (isCrossTenantError) {
        return <CrossTenantError onReset={resetError} />;
    }

    if (loading) {
        return (
            <div style={{ padding: 24 }}>
                <Skeleton active paragraph={{ rows: 8 }} />
            </div>
        );
    }

    if (!proposal) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Text type="secondary">Proposal not found</Text>
            </div>
        );
    }

    const breadcrumbs = [
        { title: 'Nexus', href: '/dashboard' },
        { title: 'Proposals', href: '/proposals' },
        { title: proposal.proposalNumber || 'Detail' },
    ];

    const lineItems: ProposalLineItem[] = proposal.lineItems || [];
    const grandTotal = lineItems.reduce(
        (sum, li) => sum + calcLineTotal(li.quantity, li.unitPrice, li.discount, li.taxRate),
        0,
    );

    // --- Action buttons per status ---
    const actionButtons = (
        <Space size="middle">
            {isDraft && canEdit && (
                <Popconfirm
                    title="Submit for Approval"
                    description="Once submitted, the proposal can no longer be edited. Continue?"
                    onConfirm={handleSubmit}
                    okText="Yes, Submit"
                    cancelText="Cancel"
                >
                    <Button type="primary" icon={<SendOutlined />}>Submit for Approval</Button>
                </Popconfirm>
            )}
            {proposal.status === ProposalStatus.SUBMITTED && canApprove && (
                <>
                    <Popconfirm
                        title="Approve Proposal"
                        description="Are you sure you want to approve this proposal?"
                        onConfirm={handleApprove}
                        okText="Yes, Approve"
                        cancelText="Cancel"
                    >
                        <Button type="primary" icon={<CheckOutlined />}>Approve</Button>
                    </Popconfirm>
                    <Popconfirm
                        title="Reject Proposal"
                        description="Are you sure you want to reject this proposal?"
                        onConfirm={handleReject}
                        okText="Yes, Reject"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<CloseOutlined />}>Reject</Button>
                    </Popconfirm>
                </>
            )}
        </Space>
    );

    // --- Editable cell renderer ---
    const renderEditableCell = (
        value: string | number,
        field: keyof EditingRow,
        recordId: string,
        type: 'text' | 'number' = 'number',
    ) => {
        if (editingRowId === recordId && editingValues) {
            if (type === 'text') {
                return (
                    <input
                        value={editingValues[field] as string}
                        onChange={(e) => setEditingValues({ ...editingValues, [field]: e.target.value })}
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${token.colorBorder}`, borderRadius: 4 }}
                    />
                );
            }
            return (
                <InputNumber
                    value={editingValues[field] as number}
                    onChange={(v) => setEditingValues({ ...editingValues, [field]: v ?? 0 })}
                    size="small"
                    style={{ width: '100%' }}
                    min={0}
                />
            );
        }
        return value;
    };

    // --- New row cell renderer ---
    const renderNewCell = (
        field: keyof Omit<EditingRow, 'id'>,
        type: 'text' | 'number' = 'number',
    ) => {
        if (type === 'text') {
            return (
                <input
                    value={newItemValues[field] as string}
                    onChange={(e) => setNewItemValues({ ...newItemValues, [field]: e.target.value })}
                    placeholder={field === 'productServiceName' ? 'Product/Service name' : 'Description'}
                    style={{ width: '100%', padding: '4px 8px', border: `1px solid ${token.colorBorder}`, borderRadius: 4 }}
                />
            );
        }
        return (
            <InputNumber
                value={newItemValues[field] as number}
                onChange={(v) => setNewItemValues({ ...newItemValues, [field]: v ?? 0 })}
                size="small"
                style={{ width: '100%' }}
                min={0}
            />
        );
    };

    const lineItemColumns = [
        {
            title: 'Product/Service',
            dataIndex: 'productServiceName',
            key: 'productServiceName',
            width: 180,
            render: (v: string, r: ProposalLineItem) => renderEditableCell(v, 'productServiceName', r.id, 'text'),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 200,
            render: (v: string, r: ProposalLineItem) => renderEditableCell(v, 'description', r.id, 'text'),
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 80,
            render: (v: number, r: ProposalLineItem) => renderEditableCell(v, 'quantity', r.id),
        },
        {
            title: 'Unit Price',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: 120,
            render: (v: number, r: ProposalLineItem) => renderEditableCell(v, 'unitPrice', r.id),
        },
        {
            title: 'Discount %',
            dataIndex: 'discount',
            key: 'discount',
            width: 100,
            render: (v: number, r: ProposalLineItem) => renderEditableCell(v, 'discount', r.id),
        },
        {
            title: 'Tax %',
            dataIndex: 'taxRate',
            key: 'taxRate',
            width: 90,
            render: (v: number, r: ProposalLineItem) => renderEditableCell(v, 'taxRate', r.id),
        },
        {
            title: 'Line Total',
            key: 'lineTotal',
            width: 120,
            render: (_: unknown, r: ProposalLineItem) => {
                const vals = editingRowId === r.id && editingValues ? editingValues : r;
                const total = calcLineTotal(vals.quantity, vals.unitPrice, vals.discount, vals.taxRate);
                return <Text strong>{`${proposal.currency || 'ZAR'} ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</Text>;
            },
        },
        ...(isDraft && canEdit
            ? [{
                title: 'Actions',
                key: 'actions',
                width: 120,
                render: (_: unknown, record: ProposalLineItem) => {
                    if (editingRowId === record.id) {
                        return (
                            <Space size="small">
                                <Button size="small" type="primary" icon={<SaveOutlined />} loading={savingLineItem} onClick={saveEditing} />
                                <Button size="small" icon={<UndoOutlined />} onClick={cancelEditing} />
                            </Space>
                        );
                    }
                    return (
                        <Space size="small">
                            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => startEditing(record)} />
                            <Popconfirm title="Remove this line item?" onConfirm={() => handleDeleteLineItem(record.id)}>
                                <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Space>
                    );
                },
            }]
            : []),
    ];

    // New-row data source appended when adding
    const newRowData: any[] = addingNew
        ? [{
            id: '__new__',
            productServiceName: newItemValues.productServiceName,
            description: newItemValues.description,
            quantity: newItemValues.quantity,
            unitPrice: newItemValues.unitPrice,
            discount: newItemValues.discount,
            taxRate: newItemValues.taxRate,
        }]
        : [];

    const newRowColumns = lineItemColumns.map((col) => {
        if (col.key === 'actions') {
            return {
                ...col,
                render: () => (
                    <Space size="small">
                        <Button size="small" type="primary" icon={<SaveOutlined />} loading={savingLineItem} onClick={handleAddLineItem} />
                        <Button size="small" icon={<CloseOutlined />} onClick={() => { setAddingNew(false); setNewItemValues(EMPTY_LINE_ITEM); }} />
                    </Space>
                ),
            };
        }
        if (col.dataIndex) {
            const field = col.dataIndex as keyof Omit<EditingRow, 'id'>;
            const type = (field === 'productServiceName' || field === 'description') ? 'text' as const : 'number' as const;
            return {
                ...col,
                render: () => renderNewCell(field, type),
            };
        }
        if (col.key === 'lineTotal') {
            return {
                ...col,
                render: () => {
                    const total = calcLineTotal(newItemValues.quantity, newItemValues.unitPrice, newItemValues.discount, newItemValues.taxRate);
                    return <Text strong>{`${proposal.currency || 'ZAR'} ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</Text>;
                },
            };
        }
        return col;
    });

    const statusBanner = (
        <>
            {proposal.status === ProposalStatus.APPROVED && (
                <Alert
                    type="success"
                    showIcon
                    message="This proposal has been approved."
                    description={proposal.approvedDate ? `Approved on ${dayjs(proposal.approvedDate).format('MMM D, YYYY')}` : undefined}
                    style={{ marginBottom: 16 }}
                />
            )}
            {proposal.status === ProposalStatus.REJECTED && (
                <Alert
                    type="error"
                    showIcon
                    message="This proposal has been rejected."
                    style={{ marginBottom: 16 }}
                />
            )}
            {proposal.status === ProposalStatus.SUBMITTED && (
                <Alert
                    type="info"
                    showIcon
                    message="This proposal has been submitted and is awaiting review."
                    description={proposal.submittedDate ? `Submitted on ${dayjs(proposal.submittedDate).format('MMM D, YYYY')}` : undefined}
                    style={{ marginBottom: 16 }}
                />
            )}
        </>
    );

    return (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <PageHeader
                title={proposal.title || proposal.proposalNumber}
                breadcrumbs={breadcrumbs}
                action={<StatusBadge status={proposal.status} />}
                extra={actionButtons}
            />

            {statusBanner}

            {/* Proposal Info Card */}
            <Card variant="borderless" title="Proposal Information">
                <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
                    <Descriptions.Item label="Proposal Number">{proposal.proposalNumber}</Descriptions.Item>
                    <Descriptions.Item label="Client">
                        <Link href={`/clients/${proposal.clientId}`}>{proposal.clientName}</Link>
                    </Descriptions.Item>
                    <Descriptions.Item label="Opportunity">
                        <Link href={`/opportunities/${proposal.opportunityId}`}>{proposal.opportunityTitle}</Link>
                    </Descriptions.Item>
                    <Descriptions.Item label="Valid Until">
                        {proposal.validUntil ? dayjs(proposal.validUntil).format('MMM D, YYYY') : 'Not set'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created">
                        {dayjs(proposal.createdAt).format('MMM D, YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Amount" span={3}>
                        <Text strong style={{ fontSize: 16 }}>
                            {formatCurrencyDetailed(grandTotal)}
                        </Text>
                    </Descriptions.Item>
                    {proposal.description && (
                        <Descriptions.Item label="Description" span={3}>
                            {proposal.description}
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Card>

            {/* Line Items + Notes + Documents */}
            <Card variant="borderless">
                <Tabs
                    defaultActiveKey="lineItems"
                    items={[
                        {
                            key: 'lineItems',
                            label: 'Line Items',
                            children: (
                                <>
                                    <Table
                                        size="small"
                                        rowKey="id"
                                        dataSource={lineItems}
                                        columns={lineItemColumns}
                                        pagination={false}
                                        scroll={{ x: 'max-content' }}
                                        locale={{ emptyText: 'No line items yet.' }}
                                        summary={() => (
                                            <Table.Summary fixed>
                                                <Table.Summary.Row>
                                                    <Table.Summary.Cell index={0} colSpan={isDraft && canEdit ? 6 : 6}>
                                                        <Text strong>Grand Total</Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1}>
                                                        <Text strong style={{ fontSize: 15 }}>
                                                            {formatCurrencyDetailed(grandTotal)}
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                    {isDraft && canEdit && <Table.Summary.Cell index={2} />}
                                                </Table.Summary.Row>
                                            </Table.Summary>
                                        )}
                                    />

                                    {/* New row inline form */}
                                    {addingNew && (
                                        <Table
                                            size="small"
                                            rowKey="id"
                                            dataSource={newRowData}
                                            columns={newRowColumns}
                                            pagination={false}
                                            showHeader={false}
                                            scroll={{ x: 'max-content' }}
                                            style={{ marginTop: -1 }}
                                        />
                                    )}

                                    {isDraft && canEdit && !addingNew && (
                                        <div style={{ marginTop: 16 }}>
                                            <Button
                                                type="dashed"
                                                block
                                                icon={<PlusOutlined />}
                                                onClick={() => setAddingNew(true)}
                                            >
                                                Add Line Item
                                            </Button>
                                        </div>
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
                                        <Title level={5} style={{ margin: 0 }}>Proposal Notes</Title>
                                        <Button size="small" type="primary" onClick={() => { setSelectedNote(null); setIsNoteReadOnly(false); setIsNoteModalOpen(true); }}>
                                            Add Note
                                        </Button>
                                    </div>
                                    {notes.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', background: token.colorBgLayout, borderRadius: 8, padding: '0 16px' }}>
                                            {notes.map((note: any, index: number) => (
                                                <div key={note.id || index} style={{ padding: '12px 0', borderBottom: index === notes.length - 1 ? 'none' : `1px solid ${token.colorBorderSecondary}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ flex: 1, overflow: 'hidden', marginRight: 16 }}>
                                                        <Text strong style={{ display: 'block' }}>
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
                        },
                        {
                            key: 'documents',
                            label: (<span><FileOutlined /> Documents</span>),
                            children: (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <Title level={5} style={{ margin: 0 }}>Attached Documents</Title>
                                        <Button size="small" type="primary" onClick={() => setIsDocumentModalOpen(true)}>
                                            Upload Document
                                        </Button>
                                    </div>
                                    {documents.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', background: token.colorBgLayout, borderRadius: 8, padding: '0 16px' }}>
                                            {documents.map((doc: any, index: number) => (
                                                <div key={doc.id || index} style={{ padding: '12px 0', borderBottom: index === documents.length - 1 ? 'none' : `1px solid ${token.colorBorderSecondary}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    ]}
                />
            </Card>

            {/* Modals */}
            <NoteModal
                open={isNoteModalOpen}
                onClose={() => { setIsNoteModalOpen(false); setSelectedNote(null); setIsNoteReadOnly(false); }}
                onSuccess={fetchAllData}
                relatedToType={3}
                relatedToId={id}
                note={selectedNote}
                readOnly={isNoteReadOnly}
            />

            <DocumentUploadModal
                open={isDocumentModalOpen}
                onClose={() => setIsDocumentModalOpen(false)}
                onSuccess={fetchAllData}
                relatedToType={3}
                relatedToId={id}
            />
        </Space>
    );
}
