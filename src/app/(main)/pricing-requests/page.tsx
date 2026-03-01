'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button, Input, Select, Space, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PricingRequest, UserRole } from '@/types';
import pricingRequestService, { PricingRequestFilters } from '@/services/pricingRequestService';
import dashboardService from '@/services/dashboardService';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { useHasRole } from '@/hooks/useHasRole';
import { getColumns } from './columns';

const PricingRequestModal = dynamic(() => import('@/components/pricing/PricingRequestModal'), { 
    ssr: false,
    loading: () => null
});

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

    useEffect(() => { document.title = 'Pricing Requests | Nexus'; }, []);

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

    const columns = getColumns({
        canAssign,
        canComplete,
        salesReps,
        onAssign: handleAssign,
        onComplete: handleComplete,
    });

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
                    showSizeChanger: false
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
