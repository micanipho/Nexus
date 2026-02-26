'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Client, UserRole } from '@/types';
import { useClients, useClientActions } from '@/providers/clientProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ClientModal from '@/components/clients/ClientModal';
import { useHasRole } from '@/hooks/useHasRole';

export default function ClientsPage() {
    const { clients, isPending, filters, totalCount } = useClients();
    const { fetchClients, setFilters } = useClientActions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { hasRole: canCreate } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);

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
            title: 'Opportunities',
            dataIndex: 'opportunitiesCount',
            key: 'opportunitiesCount',
            sorter: (a, b) => (a.opportunitiesCount || 0) - (b.opportunitiesCount || 0),
        },
        {
            title: 'Contracts',
            dataIndex: 'contractsCount',
            key: 'contractsCount',
            sorter: (a, b) => (a.contractsCount || 0) - (b.contractsCount || 0),
        },
        { 
            title: 'Created By', 
            dataIndex: 'createdByName',
            key: 'createdByName',
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
        <Space size="middle" wrap>
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
            <Button className="desktop-action-btn" type="primary" onClick={() => setIsModalOpen(true)} disabled={!canCreate}>New Client</Button>
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
                action={<Button className="mobile-fab-btn" type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} disabled={!canCreate} />}
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
            <ClientModal 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => fetchClients()} 
            />
        </div>
    );
}
