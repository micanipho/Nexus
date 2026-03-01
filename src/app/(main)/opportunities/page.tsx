'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Input, Select, Space, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Opportunity, OpportunityStage, UserRole } from '@/types';
import { useOpportunities, useOpportunityActions } from '@/providers/opportunityProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import { useHasRole } from '@/hooks/useHasRole';
import dashboardService from '@/services/dashboardService';
import { useAuth } from '@/providers/authProvider';
import { getColumns } from './columns';

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

    useEffect(() => { document.title = 'Opportunities | Nexus'; }, []);

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

    const columns = getColumns({
        currentUserId: user?.id,
        canUpdate: canCreate,
        canDelete,
        onUpdateStage: handleUpdateStage,
        onDelete: handleDelete,
    });

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
