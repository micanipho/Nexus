'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button, Input, Select, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Opportunity, OpportunityStage, UserRole } from '@/types';
import { useOpportunities, useOpportunityActions } from '@/providers/opportunityProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useHasRole } from '@/hooks/useHasRole';
import dashboardService from '@/services/dashboardService';
import { formatCurrency } from '@/utils/currencyUtils';
import { App, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '@/providers/authProvider';

const OpportunityModal = dynamic(() => import('@/components/opportunities/OpportunityModal'), { 
    ssr: false,
    loading: () => null
});

export default function OpportunitiesPage() {
    const { message } = App.useApp();
    const { user } = useAuth();
    const { opportunities, isPending, filters, totalCount } = useOpportunities();
    const { fetchOpportunities, fetchMyOpportunities, setFilters, updateStage, assignOpportunity, deactivateOpportunity } = useOpportunityActions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [salesReps, setSalesReps] = useState<Array<{ userId: string; userName: string }>>([]);
    const { hasRole: canAssign } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);
    const { hasRole: canCreate } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);
    const { hasRole: isSalesRep } = useHasRole([UserRole.SALES_REP]);
    const { hasRole: canDelete } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);

    useEffect(() => {
        const loadSalesReps = async () => {
            try {
                const data = await dashboardService.getSalesPerformance(50);
                setSalesReps(data.topPerformers || []);
            } catch {
                // Silently fail - the dropdown will just be empty
            }
        };
        loadSalesReps();
    }, []);

    const handleUpdateStage = async (id: string, newStage: OpportunityStage) => {
        try {
            await updateStage(id, newStage);
            message.success('Stage updated successfully');
            fetchOpportunities();
        } catch {
            message.error('Failed to update opportunity stage');
        }
    };

    const handleAssign = async (opportunityId: string, userId: string) => {
        try {
            await assignOpportunity(opportunityId, userId);
            message.success('Opportunity assigned successfully');
            fetchOpportunities();
        } catch {
            message.error('Failed to assign opportunity');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deactivateOpportunity(id);
            message.success('Opportunity deactivated successfully');
            if (isSalesRep) {
                fetchMyOpportunities(filters);
            } else {
                fetchOpportunities();
            }
        } catch {
            message.error('Failed to deactivate opportunity');
        }
    };

    useEffect(() => {
        if (isSalesRep) {
            fetchMyOpportunities(filters);
        } else {
            fetchOpportunities();
        }
    }, [filters, fetchOpportunities, fetchMyOpportunities, isSalesRep]);

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
            dataIndex: 'estimatedValue',
            key: 'estimatedValue',
            render: (v) => formatCurrency(v),
            sorter: (a, b) => a.estimatedValue - b.estimatedValue,
            align: 'right',
        },
        {
            title: 'Stage',
            dataIndex: 'stage',
            key: 'stage',
            render: (stage: OpportunityStage, record) => {
                const isOwner = user?.id === record.ownerId;
                const canUpdate = canCreate || isOwner;
                
                return canUpdate ? (
                    <Select
                        value={stage}
                        onChange={(value) => handleUpdateStage(record.id, value)}
                        style={{ width: 140 }}
                        size="small"
                        options={[
                            { value: 1, label: 'Lead' },
                            { value: 2, label: 'Qualified' },
                            { value: 3, label: 'Proposal' },
                            { value: 4, label: 'Negotiation' },
                            { value: 5, label: 'Closed Won' },
                            { value: 6, label: 'Closed Lost' }
                        ]}
                    />
                ) : (
                    <span>{stage}</span>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Link href={`/opportunities/${record.id}`}>
                        <Button size="small">View</Button>
                    </Link>
                    {canDelete && (
                        <Popconfirm
                            title="Deactivate Opportunity?"
                            description="Are you sure you want to deactivate this opportunity?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                        >
                            <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            ),
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
            <Button className="desktop-action-btn" type="primary" onClick={() => setIsModalOpen(true)} disabled={!canCreate}>New Opportunity</Button>
        </Space>
    );

    const breadcrumbs = [
        { title: 'Nexus', href: '/dashboard' },
        { title: 'Opportunities' }
    ];

    return (
        <div>
            <PageHeader 
                title="Opportunities" 
                breadcrumbs={breadcrumbs}
                extra={extra} 
                action={<Button className="mobile-fab-btn" type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} disabled={!canCreate} />}
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
                    showTotal: t => `${t} opportunities`,
                    showSizeChanger: false
                }}
            />
            
            <OpportunityModal 
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
