'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, Button } from 'antd';
import { ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Activity, UserRole } from '@/types';
import { theme as antdTheme } from 'antd';
import { useActivities, useActivityActions } from '@/providers/activityProvider';
import { useHasRole } from '@/hooks/useHasRole';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { getColumns } from './columns';

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

export default function ActivitiesPage() {
    const { token } = antdTheme.useToken();
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

    useEffect(() => { document.title = 'Activities | Nexus'; }, []);

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

    const columns = getColumns({
        colorTextDisabled: token.colorTextDisabled,
        onView: openViewModal,
        onEdit: openEditModal,
        onComplete: openCompleteModal,
        onCancel: handleCancelActivity,
    });

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
                    showTotal: t => `${t} activities`,
                    showSizeChanger: false
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
