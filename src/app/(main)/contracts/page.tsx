'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Contract, ContractStatus } from '@/types';
import { useContracts, useContractActions } from '@/providers/contractProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';

export default function ContractsPage() {
    const { contracts, isPending, filters, totalCount } = useContracts();
    const { fetchContracts, setFilters } = useContractActions();

    useEffect(() => {
        fetchContracts();
    }, [filters, fetchContracts]);

    const handleSearch = (value: string) => {
        setFilters({ ...filters, searchTerm: value, pageNumber: 1 });
    };

    const handleStatusChange = (value: ContractStatus | undefined) => {
        setFilters({ ...filters, status: value, pageNumber: 1 });
    };

    const columns: ColumnsType<Contract> = [
        {
            title: 'Contract ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Link href={`/contracts/${text}`}>{text.substring(0, 8).toUpperCase()}</Link>,
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
            render: (status: ContractStatus) => <StatusBadge status={status} />,
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
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
                placeholder="Search contracts..."
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
                    ...Object.values(ContractStatus).map(s => ({ value: s, label: s }))
                ]}
                style={{ width: 160 }}
                value={filters.status}
            />
            <Button type="primary">New Contract</Button>
        </Space>
    );

    const breadcrumbs = [
        { title: 'Nexus', href: '/' },
        { title: 'Contracts' }
    ];

    return (
        <div>
            <PageHeader 
                title="Contracts" 
                breadcrumbs={breadcrumbs}
                extra={extra} 
            />
            <DataTable<Contract>
                rowKey="id"
                columns={columns}
                dataSource={contracts}
                loading={isPending}
                pagination={{
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    total: totalCount,
                    onChange: (page) => setFilters({ ...filters, pageNumber: page }),
                    showTotal: t => `${t} contracts`
                }}
            />
        </div>
    );
}
