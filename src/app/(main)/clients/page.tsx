'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Input, Select, Space, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Client, UserRole } from '@/types';
import { theme as antdTheme } from 'antd';
import { useClients, useClientActions } from '@/providers/clientProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import { useHasRole } from '@/hooks/useHasRole';
import clientService from '@/services/clientService';
import { getColumns } from './columns';

const ClientModal = dynamic(() => import('@/components/clients/ClientModal'), { 
    ssr: false,
    loading: () => null
});

export default function ClientsPage() {
    const { message } = App.useApp();
    const { token } = antdTheme.useToken();
    const { clients, isPending, filters, totalCount } = useClients();
    const { fetchClients, setFilters, deactivateClient } = useClientActions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { hasRole: canCreate } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);
    const { hasRole: canDelete } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);

    useEffect(() => { document.title = 'Clients | Nexus'; }, []);

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

    const handleDelete = async (id: string) => {
        try {
            await deactivateClient(id);
            message.success('Client deactivated successfully');
            fetchClients();
        } catch {
            message.error('Failed to deactivate client');
        }
    };

    const handleReactivate = async (id: string, client: Client) => {
        try {
            const { id: _, ...updateData } = client;
            await clientService.updateClient(id, { ...updateData, isActive: true });
            message.success('Client reactivated successfully');
            fetchClients();
        } catch {
            message.error('Failed to reactivate client');
        }
    };

    const columns = getColumns({
        canDelete,
        onDelete: handleDelete,
        onReactivate: handleReactivate,
        successColor: token.colorSuccess,
    });

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
        { title: 'Nexus', href: '/dashboard' },
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
                    showTotal: t => `${t} clients`,
                    showSizeChanger: false
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
