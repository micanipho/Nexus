'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Opportunity, OpportunityStage } from '@/types';
import { useOpportunities, useOpportunityActions } from '@/providers/opportunityProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';

export default function OpportunitiesPage() {
    const { opportunities, isPending, filters, totalCount } = useOpportunities();
    const { fetchOpportunities, setFilters } = useOpportunityActions();

    useEffect(() => {
        fetchOpportunities();
    }, [filters, fetchOpportunities]);

    const handleSearch = (value: string) => {
        setFilters({ ...filters, searchTerm: value, pageNumber: 1 });
    };

    const handleStageChange = (value: OpportunityStage | undefined) => {
        setFilters({ ...filters, stage: value, pageNumber: 1 });
    };

    const handleStatusChange = (value: boolean | undefined) => {
        setFilters({ ...filters, isActive: value, pageNumber: 1 });
    };

    const columns: ColumnsType<Opportunity> = [
        {
            title: 'Opportunity',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => <Link href={`/opportunities/${record.id}`}>{text}</Link>,
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            key: 'clientName',
            render: (text, record) => <Link href={`/clients/${record.clientId}`}>{text}</Link>,
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: v => `R${v?.toLocaleString()}`,
            sorter: (a, b) => a.value - b.value,
        },
        {
            title: 'Stage',
            dataIndex: 'stage',
            key: 'stage',
            render: (stage: OpportunityStage) => <StatusBadge status={stage} />,
        },
        {
            title: 'Probability',
            dataIndex: 'probability',
            key: 'probability',
            render: (p) => `${p}%`,
        },
        {
            title: 'Close Date',
            dataIndex: 'expectedCloseDate',
            key: 'expectedCloseDate',
        },
        {
            title: 'Owner',
            dataIndex: 'ownerName',
            key: 'ownerName',
        },
    ];

    const extra = (
        <Space size="middle">
            <Input.Search
                placeholder="Search opportunities..."
                onSearch={handleSearch}
                allowClear
                defaultValue={filters.searchTerm}
                style={{ width: 220 }}
            />
            <Select
                placeholder="Stage"
                allowClear
                onChange={handleStageChange}
                options={[
                    { value: undefined, label: 'All Stages' },
                    ...Object.values(OpportunityStage).map(s => ({ value: s, label: s }))
                ]}
                style={{ width: 160 }}
                value={filters.stage}
            />
            <Select
                placeholder="Status"
                allowClear
                onChange={handleStatusChange}
                options={[
                    { value: undefined, label: 'All Status' },
                    { value: true, label: 'Active' },
                    { value: false, label: 'Inactive' }
                ]}
                style={{ width: 120 }}
                value={filters.isActive}
            />
            <Button type="primary">New Opportunity</Button>
        </Space>
    );

    const breadcrumbs = [
        { title: 'Nexus', href: '/' },
        { title: 'Opportunities' }
    ];

    return (
        <div>
            <PageHeader 
                title="Opportunities" 
                breadcrumbs={breadcrumbs}
                extra={extra} 
            />
            <DataTable<Opportunity>
                rowKey="id"
                columns={columns}
                dataSource={opportunities}
                loading={isPending}
                pagination={{
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    total: totalCount,
                    onChange: (page) => setFilters({ ...filters, pageNumber: page }),
                    showTotal: t => `${t} opportunities`
                }}
            />
        </div>
    );
}
