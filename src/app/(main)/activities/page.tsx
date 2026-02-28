'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, Button, Tag, Space, Dropdown } from 'antd';
import { Activity, ActivityType, UserRole } from '@/types';
import { useActivities, useActivityActions } from '@/providers/activityProvider';
import { useHasRole } from '@/hooks/useHasRole';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';

const CreateActivityModal = dynamic(() => import('@/components/activities/CreateActivityModal'), { 
    ssr: false,
    loading: () => null
});

const CompleteActivityModal = dynamic(() => import('@/components/activities/CompleteActivityModal'), { 
    ssr: false,
    loading: () => null
});

const ViewActivityModal = dynamic(() => import('@/components/activities/ViewActivityModal'), { 
    ssr: false,
    loading: () => null
});
import { 
    ClockCircleOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    CalendarOutlined,
    PhoneOutlined,
    MailOutlined,
    VideoCameraOutlined,
    DownOutlined,
    ProjectOutlined,
    PlusOutlined,
    EditOutlined
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

    // Edit Modal State (reusing Create Modal)
    const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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

    const openViewModal = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsViewModalOpen(true);
    };

    const openEditModal = (activity: Activity) => {
        setActivityToEdit(activity);
        setIsCreateModalOpen(true);
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
                    <a onClick={() => openViewModal(record)} style={{ fontWeight: 500 }}>{text}</a>
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
                const isClosed = record.statusName !== 'Scheduled';
                
                return (
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'view',
                                    label: 'View Details',
                                    onClick: () => openViewModal(record),
                                },
                                {
                                    key: 'divider',
                                    type: 'divider',
                                },
                                ...(isClosed ? [] : [
                                    {
                                        key: 'edit',
                                        icon: <EditOutlined style={{ color: 'blue' }} />,
                                        label: 'Edit Activity',
                                        onClick: () => openEditModal(record),
                                    },
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
                                ])
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
                    { title: 'Nexus', href: '/dashboard' },
                    { title: 'Activities' }
                ]}
                action={
                    <Button 
                        className="mobile-fab-btn" 
                        type="primary" 
                        shape="circle" 
                        icon={<PlusOutlined />} 
                        onClick={() => {
                            setActivityToEdit(null);
                            setIsCreateModalOpen(true);
                        }} 
                        disabled={!canCreate} 
                    />
                }
                extra={
                    <Button 
                        className="desktop-action-btn"
                        type="primary" 
                        onClick={() => {
                            setActivityToEdit(null);
                            setIsCreateModalOpen(true);
                        }}
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
                activityToEdit={activityToEdit}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setTimeout(() => setActivityToEdit(null), 300); // clear after animation
                }}
                onSuccess={handleCreateSuccess}
            />

            <CompleteActivityModal
                open={isCompleteModalOpen}
                onClose={() => setIsCompleteModalOpen(false)}
                activity={selectedActivity}
                onSuccess={handleCompleteSuccess}
            />

            <ViewActivityModal
                open={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                activity={selectedActivity}
            />
        </div>
    );
}
