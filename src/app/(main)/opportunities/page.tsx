'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Opportunity, OpportunityStage } from '@/types';
import { useOpportunities, useOpportunityActions } from '@/providers/opportunityProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import OpportunityModal from '@/components/opportunities/OpportunityModal';
import dashboardService from '@/services/dashboardService';

export default function OpportunitiesPage() {
    const { opportunities, isPending, filters, totalCount } = useOpportunities();
    const { fetchOpportunities, setFilters, updateStage, assignOpportunity } = useOpportunityActions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [salesReps, setSalesReps] = useState<Array<{ userId: string; userName: string }>>([]);

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
            dataIndex: 'estimatedValue',
            key: 'estimatedValue',
            render: v => `R${v?.toLocaleString()}`,
            sorter: (a, b) => a.estimatedValue - b.estimatedValue,
        },
        {
            title: 'Stage',
            dataIndex: 'stage',
            key: 'stage',
            render: (stage: OpportunityStage, record) => (
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
            ),
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
        {
            title: 'Assign',
            key: 'assign',
            width: 180,
            render: (_, record) => (
                <Select
                    value={record.ownerId || undefined}
                    onChange={(value) => handleAssign(record.id, value)}
                    placeholder="Assign rep"
                    style={{ width: 160 }}
                    size="small"
                    showSearch
                    optionFilterProp="label"
                    options={salesReps.map(rep => ({ value: rep.userId, label: rep.userName }))}
                />
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
            <Button type="primary" onClick={() => setIsModalOpen(true)}>New Opportunity</Button>
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
            
            <OpportunityModal 
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
