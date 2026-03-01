'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button, Input, Select, Space, Tag, App, Tooltip } from 'antd';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import { PricingRequest } from '@/types';
import { UserRole } from '@/types';
import pricingRequestService, { PricingRequestFilters } from '@/services/pricingRequestService';
import dashboardService from '@/services/dashboardService';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { useHasRole } from '@/hooks/useHasRole';

const PricingRequestModal = dynamic(() => import('@/components/pricing/PricingRequestModal'), { 
    ssr: false,
    loading: () => null
});

const priorityLabels: Record<number, { label: string; color: string }> = {
    1: { label: 'Low', color: 'green' },
    2: { label: 'Medium', color: 'gold' },
    3: { label: 'High', color: 'orange' },
    4: { label: 'Urgent', color: 'red' },
};

const statusLabels: Record<number, { label: string; color: string }> = {
    1: { label: 'Pending', color: 'default' },
    2: { label: 'In Progress', color: 'processing' },
    3: { label: 'Completed', color: 'success' },
};

export default function PricingRequestsPage() {
    const { message } = App.useApp();
    const [requests, setRequests] = useState<PricingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [salesReps, setSalesReps] = useState<Array<{ userId: string; userName: string }>>([]);
    const [filters, setFilters] = useState<PricingRequestFilters>({
        pageNumber: 1,
        pageSize: 10,
    });

    const { hasRole: canCreate } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER, UserRole.SALES_REP]);
    const { hasRole: canAssign } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);
    const { hasRole: canComplete } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await pricingRequestService.getPricingRequests(filters);
            setRequests(data.items || []);
            setTotalCount(data.totalCount || 0);
        } catch {
            message.error('Failed to load pricing requests');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    useEffect(() => {
        const loadReps = async () => {
            try {
                const data = await dashboardService.getSalesPerformance(50);
                setSalesReps(data.topPerformers || []);
            } catch {
                // Silently fail
            }
        };
        loadReps();
    }, []);

    const handleAssign = async (id: string, userId: string) => {
        try {
            await pricingRequestService.assignPricingRequest(id, userId);
            message.success('Request assigned successfully');
            fetchRequests();
        } catch {
            message.error('Failed to assign request');
        }
    };

    const handleComplete = async (id: string) => {
        try {
            await pricingRequestService.completePricingRequest(id);
            message.success('Request marked as completed');
            fetchRequests();
        } catch {
            message.error('Failed to complete request');
        }
    };

    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, searchTerm: value, pageNumber: 1 }));
    };

    const handleStatusFilter = (value: number | undefined) => {
        setFilters(prev => ({ ...prev, status: value, pageNumber: 1 }));
    };

    const handlePriorityFilter = (value: number | undefined) => {
        setFilters(prev => ({ ...prev, priority: value, pageNumber: 1 }));
    };

    const columns: ColumnsType<PricingRequest> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: PricingRequest) => <Link href={`/pricing-requests/${record.id}`}>{text}</Link>,
        },
        {
            title: 'Opportunity',
            dataIndex: 'opportunityTitle',
            key: 'opportunityTitle',
            render: (text: string, record: PricingRequest) => record.opportunityId ? <Link href={`/opportunities/${record.opportunityId}`}>{text}</Link> : text,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            render: (p: number) => {
                const info = priorityLabels[p] || { label: `P${p}`, color: 'default' };
                return <Tag color={info.color}>{info.label}</Tag>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (s: number) => {
                const info = statusLabels[s] || { label: 'Unknown', color: 'default' };
                return <Tag color={info.color}>{info.label}</Tag>;
            },
        },
        {
            title: 'Assigned To',
            key: 'assignedTo',
            width: 180,
            render: (_, record) => (
                <Select
                    value={record.assignedToId || undefined}
                    onChange={(value) => handleAssign(record.id, value)}
                    placeholder="Assign"
                    style={{ width: 160 }}
                    size="small"
                    showSearch
                    optionFilterProp="label"
                    options={salesReps.map(rep => ({ value: rep.userId, label: rep.userName }))}
                    disabled={record.status === 3 || !canAssign}
                />
            ),
        },
        {
            title: 'Required By',
            dataIndex: 'requiredByDate',
            key: 'requiredByDate',
            width: 120,
            render: (d: string) => d ? new Date(d).toLocaleDateString() : '—',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 90,
            render: (_, record) => (
                record.status === 2 && canComplete ? (
                    <Tooltip title="Mark as Completed">
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleComplete(record.id)}
                        >
                            Complete
                        </Button>
                    </Tooltip>
                ) : record.status === 3 ? (
                    <Tag color="success">Done</Tag>
                ) : null
            ),
        },
    ];

    const extra = (
        <Space size="middle">
            <Input.Search
                placeholder="Search requests..."
                onSearch={handleSearch}
                allowClear
                style={{ width: 220 }}
            />
            <Select
                placeholder="Status"
                allowClear
                onChange={handleStatusFilter}
                options={[
                    { value: 1, label: 'Pending' },
                    { value: 2, label: 'In Progress' },
                    { value: 3, label: 'Completed' },
                ]}
                style={{ width: 140 }}
                value={filters.status}
            />
            <Select
                placeholder="Priority"
                allowClear
                onChange={handlePriorityFilter}
                options={[
                    { value: 1, label: 'Low' },
                    { value: 2, label: 'Medium' },
                    { value: 3, label: 'High' },
                    { value: 4, label: 'Urgent' },
                ]}
                style={{ width: 120 }}
                value={filters.priority}
            />
            <Button className="desktop-action-btn" type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} disabled={!canCreate}>
                New Request
            </Button>
        </Space>
    );

    const breadcrumbs = [
        { title: 'Nexus', href: '/dashboard' },
        { title: 'Pricing Requests' },
    ];

    return (
        <div>
            <PageHeader
                title="Pricing Requests"
                breadcrumbs={breadcrumbs}
                extra={extra}
                action={<Button className="mobile-fab-btn" type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} disabled={!canCreate} />}
            />
            <DataTable<PricingRequest>
                rowKey="id"
                columns={columns}
                dataSource={requests}
                loading={loading}
                pagination={{
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    total: totalCount,
                    onChange: (page) => setFilters(prev => ({ ...prev, pageNumber: page })),
                    showTotal: t => `${t} requests`,
                }}
                locale={{ emptyText: 'No pricing requests yet. Click "New Request" to create one.' }}
            />

            <PricingRequestModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchRequests}
            />
        </div>
    );
}
