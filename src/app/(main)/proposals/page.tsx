'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Input, Select, Space, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Proposal, ProposalStatus, UserRole } from '@/types';
import { useProposals, useProposalActions } from '@/providers/proposalProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import { useHasRole } from '@/hooks/useHasRole';
import { getColumns } from './columns';

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

    useEffect(() => { document.title = 'Proposals | Nexus'; }, []);

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

    const columns = getColumns({
        canCreate,
        canApprove,
        onSubmit: handleSubmit,
        onApprove: handleApprove,
        onReject: handleReject,
    });

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
