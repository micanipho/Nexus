'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    Card, Typography, Tag, Button, Space, Descriptions,
    Statistic, Row, Col, Skeleton, App, Select, Tooltip, Popconfirm
} from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { PricingRequest, UserRole, PricingRequestStatus } from '@/types';
import { useHasRole } from '@/hooks/useHasRole';
import { useCrossTenantError } from '@/hooks/useCrossTenantError';
import pricingRequestService from '@/services/pricingRequestService';
import dashboardService from '@/services/dashboardService';
import PageHeader from '@/components/shared/PageHeader';
import CrossTenantError from '@/components/errors/CrossTenantError';
import DocumentsPanel from '@/components/shared/DocumentsPanel';
import NotesPanel from '@/components/shared/NotesPanel';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';

dayjs.extend(relativeTime);

const { Text } = Typography;

const priorityConfig: Record<number, { label: string; color: string }> = {
    1: { label: 'Low', color: 'green' },
    2: { label: 'Medium', color: 'gold' },
    3: { label: 'High', color: 'orange' },
    4: { label: 'Urgent', color: 'red' },
};

const statusConfig: Record<number, { label: string; color: string }> = {
    1: { label: 'Pending', color: 'default' },
    2: { label: 'In Progress', color: 'processing' },
    3: { label: 'Completed', color: 'success' },
};

export default function PricingRequestDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { message } = App.useApp();
    const { isCrossTenantError, execute, reset: resetError } = useCrossTenantError();

    const [request, setRequest] = useState<PricingRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [salesReps, setSalesReps] = useState<Array<{ userId: string; userName: string }>>([]);

    const { hasRole: canAssign } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);
    const { hasRole: canComplete } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);

        await execute(async () => {
            const data = await pricingRequestService.getPricingRequestById(id);
            setRequest(data);
            return true;
        });

        if (!isCrossTenantError) {
            setLoading(false);
        }
    }, [id, execute, isCrossTenantError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        document.title = request ? `Pricing Request | Nexus` : 'Pricing Request | Nexus';
    }, [request]);

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

    const handleAssign = async (userId: string) => {
        try {
            await pricingRequestService.assignPricingRequest(id, userId);
            message.success('Request assigned successfully');
            fetchData();
        } catch {
            message.error('Failed to assign request');
        }
    };

    const handleComplete = async () => {
        try {
            await pricingRequestService.completePricingRequest(id);
            message.success('Request marked as completed');
            fetchData();
        } catch {
            message.error('Failed to complete request');
        }
    };

    if (isCrossTenantError) {
        return <CrossTenantError onReset={resetError} />;
    }

    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <Skeleton active paragraph={{ rows: 6 }} />
            </div>
        );
    }

    if (!request) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Text type="secondary">Pricing request not found</Text>
            </div>
        );
    }

    const priority = priorityConfig[request.priority] || { label: `P${request.priority}`, color: 'default' };
    const status = statusConfig[request.status] || { label: 'Unknown', color: 'default' };
    const isOverdue = request.requiredByDate && dayjs(request.requiredByDate).isBefore(dayjs()) && request.status !== PricingRequestStatus.COMPLETED;

    const breadcrumbs = [
        { title: 'Nexus', href: '/dashboard' },
        { title: 'Pricing Requests', href: '/pricing-requests' },
        { title: request.title || 'Unknown' },
    ];

    const extra = (
        <Space size="middle">
            {canAssign && request.status !== PricingRequestStatus.COMPLETED && (
                <Select
                    value={request.assignedToId || undefined}
                    onChange={handleAssign}
                    placeholder="Assign to..."
                    style={{ width: 180 }}
                    showSearch
                    optionFilterProp="label"
                    options={salesReps.map(rep => ({ value: rep.userId, label: rep.userName }))}
                />
            )}
            {request.status === PricingRequestStatus.IN_PROGRESS && canComplete && (
                <Popconfirm title="Mark this request as completed?" onConfirm={handleComplete}>
                    <Button type="primary" icon={<CheckCircleOutlined />}>Complete</Button>
                </Popconfirm>
            )}
        </Space>
    );

    return (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <PageHeader
                title={request.title}
                breadcrumbs={breadcrumbs}
                extra={extra}
            />

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <Statistic
                            title="Status"
                            valueRender={() => <Tag color={status.color}>{status.label}</Tag>}
                            value=" "
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <Statistic
                            title="Priority"
                            valueRender={() => <Tag color={priority.color}>{priority.label}</Tag>}
                            value=" "
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <Statistic
                            title="Required By"
                            valueRender={() => (
                                <span style={{ color: isOverdue ? 'red' : 'inherit' }}>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    {request.requiredByDate ? dayjs(request.requiredByDate).format('MMM D, YYYY') : 'Not Set'}
                                </span>
                            )}
                            value=" "
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card variant="borderless">
                        <Statistic
                            title="Assigned To"
                            valueRender={() => (
                                <span>
                                    <UserOutlined style={{ marginRight: 4 }} />
                                    {request.assignedToName || 'Unassigned'}
                                </span>
                            )}
                            value=" "
                        />
                    </Card>
                </Col>
            </Row>

            <Card variant="borderless" title="Details">
                <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
                    <Descriptions.Item label="Request Number">{request.requestNumber}</Descriptions.Item>
                    <Descriptions.Item label="Opportunity">
                        {request.opportunityId ? (
                            <Link href={`/opportunities/${request.opportunityId}`}>{request.opportunityTitle || 'View Opportunity'}</Link>
                        ) : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created">{dayjs(request.createdAt).format('MMM D, YYYY HH:mm')}</Descriptions.Item>
                    <Descriptions.Item label="Completed">
                        {request.completedDate ? dayjs(request.completedDate).format('MMM D, YYYY HH:mm') : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Description" span={2}>
                        {request.description || 'No description provided.'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card variant="borderless" title="Notes">
                <NotesPanel relatedToType={5} relatedToId={id} />
            </Card>
        </Space>
    );
}
