'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Proposal, ProposalStatus } from '@/types';
import { useProposals, useProposalActions } from '@/providers/proposalProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useHasRole } from '@/hooks/useHasRole';
import { UserRole } from '@/types';

export default function ProposalsPage() {
    const { proposals, isPending, filters, totalCount } = useProposals();
    const { fetchProposals, setFilters } = useProposalActions();
    const { hasRole: canCreate } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);

    useEffect(() => {
        fetchProposals();
    }, [filters, fetchProposals]);

    const handleSearch = (value: string) => {
        setFilters({ ...filters, searchTerm: value, pageNumber: 1 });
    };

    const handleStatusChange = (value: ProposalStatus | undefined) => {
        setFilters({ ...filters, status: value, pageNumber: 1 });
    };

    const columns: ColumnsType<Proposal> = [
        {
            title: 'Opportunity',
            dataIndex: 'opportunityTitle',
            key: 'opportunityTitle',
            render: (text, record) => <Link href={`/opportunities/${record.opportunityId}`}>{text}</Link>,
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            key: 'clientName',
            render: (text, record) => <Link href={`/clients/${record.clientId}`}>{text}</Link>,
        },
        {
            title: 'Value',
            dataIndex: 'totalValue',
            key: 'totalValue',
            render: v => `R${v?.toLocaleString()}`,
            sorter: (a, b) => a.totalValue - b.totalValue,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: ProposalStatus) => <StatusBadge status={status} />,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Link href={`/proposals/${record.id}`}>
                        <Button size="small">View</Button>
                    </Link>
                </Space>
            ),
        },
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
                options={[
                    { value: undefined, label: 'All Statuses' },
                    ...Object.values(ProposalStatus).map(s => ({ value: s, label: s }))
                ]}
                style={{ width: 160 }}
                value={filters.status}
            />
            <Button type="primary" disabled={!canCreate}>New Proposal</Button>
        </Space>
    );

    const breadcrumbs = [
        { title: 'Nexus', href: '/' },
        { title: 'Proposals' }
    ];

    return (
        <div>
            <PageHeader 
                title="Proposals" 
                breadcrumbs={breadcrumbs}
                extra={extra} 
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
                    showTotal: t => `${t} proposals`
                }}
            />
        </div>
    );
}
