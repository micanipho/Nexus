'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, Button, Tag, Space, Dropdown } from 'antd';
import { Activity, ActivityType, UserRole } from '@/types';
import { useActivities, useActivityActions } from '@/providers/activityProvider';
import { useHasRole } from '@/hooks/useHasRole';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import CreateActivityModal from '@/components/activities/CreateActivityModal';
import CompleteActivityModal from '@/components/activities/CompleteActivityModal';
import { 
    ClockCircleOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    CalendarOutlined,
    PhoneOutlined,
    MailOutlined,
    VideoCameraOutlined,
    DownOutlined,
    ProjectOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

export default function ActivitiesPage() {
    const { activities, myActivities, overdueActivities, isPending, filters, totalCount } = useActivities();
    const { fetchActivities, fetchMyActivities, fetchOverdueActivities, cancelActivity, setFilters } = useActivityActions();
    
    const [activeTab, setActiveTab] = useState('my_activities');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Complete Modal State
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const { hasRole: canCreate } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER, UserRole.SALES_REP]);

    const loadData = () => {
        if (activeTab === 'my_activities') {
            fetchMyActivities(filters.pageNumber, filters.pageSize);
        } else if (activeTab === 'all_activities') {
            fetchActivities();
        } else if (activeTab === 'overdue') {
            fetchOverdueActivities();
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab, filters.pageNumber, filters.pageSize]);

    const handleCreateSuccess = () => {
        loadData();
    };

    const handleCompleteSuccess = () => {
        loadData();
    };

    const openCompleteModal = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsCompleteModalOpen(true);
    };

    const handleCancelActivity = async (id: string) => {
        await cancelActivity(id);
        loadData();
    };

    // Helper rendering functions
    const renderTypeIcon = (type: ActivityType) => {
        switch (type) {
            case ActivityType.CALL: return <PhoneOutlined />;
            case ActivityType.MEETING: return <VideoCameraOutlined />;
            case ActivityType.EMAIL: return <MailOutlined />;
            case ActivityType.PRESENTATION: return <ProjectOutlined />;
            default: return <CalendarOutlined />;
        }
    };

    const columns = [
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            render: (text: string, record: Activity) => (
                <Space>
                    {renderTypeIcon(record.type)}
                    <span style={{ fontWeight: 500 }}>{text}</span>
                </Space>
            )
        },
        {
            title: 'Related To',
            key: 'relatedTo',
            render: (_: any, record: Activity) => (
                record.relatedToName ? (
                    <Tag color={record.relatedToType === 1 ? 'blue' : 'purple'}>
                        {record.relatedToName}
                    </Tag>
                ) : <span style={{ color: '#ccc' }}>-</span>
            )
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date: string) => {
                const isOverdue = dayjs(date).isBefore(dayjs());
                return (
                    <span style={{ color: isOverdue ? 'red' : 'inherit' }}>
                        {dayjs(date).format('MMM D, YYYY HH:mm')}
                    </span>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'statusName',
            key: 'statusName',
            render: (status: string) => {
                let color = 'gold';
                if (status === 'Completed') color = 'green';
                if (status === 'Cancelled') color = 'default';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Activity) => {
                if (record.statusName !== 'Scheduled') return <span style={{ color: '#aaa' }}>Closed</span>;
                
                return (
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'complete',
                                    icon: <CheckCircleOutlined style={{ color: 'green' }} />,
                                    label: 'Mark Complete',
                                    onClick: () => openCompleteModal(record),
                                },
                                {
                                    key: 'cancel',
                                    icon: <CloseCircleOutlined style={{ color: 'red' }} />,
                                    label: 'Cancel Activity',
                                    onClick: () => handleCancelActivity(record.id),
                                }
                            ]
                        }}
                    >
                        <Button type="link" size="small">
                            Actions <DownOutlined />
                        </Button>
                    </Dropdown>
                );
            }
        }
    ];

    const getDataSource = () => {
        if (activeTab === 'my_activities') return myActivities;
        if (activeTab === 'all_activities') return activities;
        if (activeTab === 'overdue') return overdueActivities;
        return [];
    };

    return (
        <div>
            <PageHeader 
                title="Activities" 
                breadcrumbs={[
                    { title: 'Nexus', href: '/' },
                    { title: 'Activities' }
                ]}
                extra={
                    <Button 
                        type="primary" 
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={!canCreate}
                    >
                        Log Activity
                    </Button>
                }
            />

            <Tabs
                activeKey={activeTab}
                onChange={(key) => {
                    setActiveTab(key);
                    setFilters({ pageNumber: 1 }); // reset pagination on tab change
                }}
                items={[
                    { key: 'my_activities', label: 'My Activities' },
                    { key: 'all_activities', label: 'All Activities' },
                    { 
                        key: 'overdue', 
                        label: (
                            <span>
                                <ClockCircleOutlined style={{ color: 'red' }} />
                                Overdue
                            </span>
                        ) 
                    },
                ]}
                style={{ padding: '0 24px' }}
            />

            <DataTable<Activity>
                rowKey="id"
                columns={columns}
                dataSource={getDataSource()}
                loading={isPending}
                pagination={{
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    total: activeTab === 'overdue' ? overdueActivities.length : totalCount,
                    onChange: (page) => setFilters({ pageNumber: page }),
                }}
            />

            <CreateActivityModal 
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            <CompleteActivityModal
                open={isCompleteModalOpen}
                onClose={() => setIsCompleteModalOpen(false)}
                activity={selectedActivity}
                onSuccess={handleCompleteSuccess}
            />
        </div>
    );
}
