'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Client } from '@/types';
import { useClients, useClientActions } from '@/providers/clientProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';

export default function ClientsPage() {
    const { clients, isPending, filters, totalCount } = useClients();
    const { fetchClients, setFilters } = useClientActions();

    useEffect(() => {
        fetchClients();
    }, [filters, fetchClients]);

    const handleSearch = (value: string) => {
        setFilters({ ...filters, searchTerm: value, pageNumber: 1 });
    };

    const handleIndustryChange = (value: string) => {
        setFilters({ ...filters, industry: value, pageNumber: 1 });
    };

    const handleStatusChange = (value: boolean | undefined) => {
        setFilters({ ...filters, isActive: value, pageNumber: 1 });
    };

    const columns: ColumnsType<Client> = [
        {
            title: 'Client',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => <Link href={`/clients/${record.id}`}>{text}</Link>,
        },
        { 
            title: 'Industry', 
            dataIndex: 'industry',
            key: 'industry',
        },
        {
            title: 'ARR',
            dataIndex: 'arr',
            key: 'arr',
            render: v => `R${v?.toLocaleString()}`,
            sorter: (a, b) => a.arr - b.arr,
        },
        { 
            title: 'Owner', 
            dataIndex: 'owner',
            key: 'owner',
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
    ];

    const extra = (
        <Space size="middle">
            <Input.Search
                placeholder="Search clients..."
                onSearch={handleSearch}
                allowClear
                defaultValue={filters.searchTerm}
                style={{ width: 220 }}
            />
            <Select
                placeholder="Industry"
                allowClear
                onChange={handleIndustryChange}
                options={[
                    { value: undefined, label: 'All Industries' },
                    { value: 'Technology', label: 'Technology' },
                    { value: 'Manufacturing', label: 'Manufacturing' },
                    { value: 'Software', label: 'Software' },
                    { value: 'Aerospace', label: 'Aerospace' },
                    { value: 'AI', label: 'AI' }
                ]}
                style={{ width: 140 }}
                value={filters.industry}
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
            <Button type="primary">New Client</Button>
        </Space>
    );

    const breadcrumbs = [
        { title: 'Nexus', href: '/' },
        { title: 'Clients' }
    ];

    return (
        <div>
            <PageHeader 
                title="Clients" 
                breadcrumbs={breadcrumbs}
                extra={extra} 
            />
            <DataTable<Client>
                rowKey="id"
                columns={columns}
                dataSource={clients}
                loading={isPending}
                pagination={{
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    total: totalCount,
                    onChange: (page) => setFilters({ ...filters, pageNumber: page }),
                    showTotal: t => `${t} clients`
                }}
            />
        </div>
    );
}
