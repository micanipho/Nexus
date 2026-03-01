'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button, Input, Select, Space, Popconfirm, App } from 'antd';
import { CheckOutlined, SendOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Proposal, ProposalStatus, UserRole } from '@/types';
import { useProposals, useProposalActions } from '@/providers/proposalProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useHasRole } from '@/hooks/useHasRole';
import { formatCurrency } from '@/utils/currencyUtils';

const ProposalModal = dynamic(() => import('@/components/proposals/ProposalModal'), { 
    ssr: false,
    loading: () => null
});

export default function ProposalsPage() {
    const { message } = App.useApp();
    const { proposals, isPending, filters, totalCount } = useProposals();
    const { fetchProposals, setFilters, submitProposal, approveProposal, rejectProposal } = useProposalActions();
    const { hasRole: canCreate } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);
    const { hasRole: canApprove } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchProposals();
    }, [filters, fetchProposals]);

    const handleSearch = (value: string) => {
        setFilters({ ...filters, searchTerm: value, pageNumber: 1 });
    };

    const handleStatusChange = (value: ProposalStatus | undefined) => {
        setFilters({ ...filters, status: value, pageNumber: 1 });
    };

    const handleSubmit = async (id: string) => {
        try {
            await submitProposal(id);
            message.success('Proposal submitted for review');
            fetchProposals();
        } catch {
            message.error('Failed to submit proposal');
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await approveProposal(id);
            message.success('Proposal approved');
            fetchProposals();
        } catch {
            message.error('Failed to approve proposal');
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectProposal(id);
            message.success('Proposal rejected');
            fetchProposals();
        } catch {
            message.error('Failed to reject proposal');
        }
    };

    const columns: ColumnsType<Proposal> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text, record) => <Link href={`/proposals/${record.id}`}>{text}</Link>,
        },
        {
            title: 'Opportunity',
            dataIndex: 'opportunityTitle',
            key: 'opportunityTitle',
            render: (text, record) => <Link href={`/opportunities/${record.opportunityId}`}>{text}</Link>,
            ellipsis: true,
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            key: 'clientName',
            render: (text, record) => <Link href={`/clients/${record.clientId}`}>{text}</Link>,
        },
        {
            title: 'Total',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (v) => formatCurrency(v),
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            align: 'right',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: ProposalStatus) => <StatusBadge status={status} />,
            width: 120,
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (d: string) => d ? new Date(d).toLocaleDateString() : '—',
            width: 110,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 220,
            render: (_, record) => (
                <Space size="small">
                    <Link href={`/proposals/${record.id}`}>
                        <Button size="small">View</Button>
                    </Link>
                    {record.status === ProposalStatus.DRAFT && canCreate && (
                        <Popconfirm
                            title="Submit this proposal for review?"
                            onConfirm={() => handleSubmit(record.id)}
                            okText="Yes"
                        >
                            <Button size="small" type="primary" ghost icon={<SendOutlined />}>
                                Submit
                            </Button>
                        </Popconfirm>
                    )}
                    {record.status === ProposalStatus.SUBMITTED && canApprove && (
                        <>
                            <Popconfirm
                                title="Approve this proposal?"
                                onConfirm={() => handleApprove(record.id)}
                                okText="Approve"
                            >
                                <Button size="small" type="primary" icon={<CheckOutlined />}>
                                    Approve
                                </Button>
                            </Popconfirm>
                            <Popconfirm
                                title="Reject this proposal?"
                                onConfirm={() => handleReject(record.id)}
                                okText="Reject"
                                okButtonProps={{ danger: true }}
                            >
                                <Button size="small" danger icon={<CloseOutlined />}>
                                    Reject
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const statusOptions = [
        { value: undefined, label: 'All Statuses' },
        { value: ProposalStatus.DRAFT, label: 'Draft' },
        { value: ProposalStatus.SUBMITTED, label: 'Submitted' },
        { value: ProposalStatus.APPROVED, label: 'Approved' },
        { value: ProposalStatus.REJECTED, label: 'Rejected' },
    ];

    const extra = (
        <Space size="middle">
            <Input.Search
                placeholder="Search proposals..."
                onSearch={handleSearch}
                allowClear
                defaultValue={filters.searchTerm}
                style={{ width: 220 }}
            />
            <Select
                placeholder="Status"
                allowClear
                onChange={handleStatusChange}
                options={statusOptions}
                style={{ width: 160 }}
                value={filters.status}
            />
            <Button className="desktop-action-btn" type="primary" disabled={!canCreate} onClick={() => setModalOpen(true)}>
                New Proposal
            </Button>
        </Space>
    );

    const breadcrumbs = [
        { title: 'Nexus', href: '/dashboard' },
        { title: 'Proposals' }
    ];

    return (
        <div>
            <PageHeader 
                title="Proposals" 
                breadcrumbs={breadcrumbs}
                extra={extra} 
                action={<Button className="mobile-fab-btn" type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} disabled={!canCreate} />}
            />
            <DataTable<Proposal>
                rowKey="id"
                columns={columns}
                dataSource={proposals}
                loading={isPending}
                pagination={{
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    total: totalCount,
                    onChange: (page) => setFilters({ ...filters, pageNumber: page }),
                    showTotal: t => `${t} proposals`,
                    showSizeChanger: false
                }}
            />
            <ProposalModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => fetchProposals()}
            />
        </div>
    );
}
