'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Input, Select, Space, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Contract, ContractStatus, UserRole, ContractRenewal } from '@/types';
import { theme as antdTheme } from 'antd';
import { useContracts, useContractActions } from '@/providers/contractProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useHasRole } from '@/hooks/useHasRole';
import contractService from '@/services/contractService';
import { getColumns } from './columns';

const CreateContractModal = dynamic(() => import('@/components/contracts/CreateContractModal'), { 
    ssr: false,
    loading: () => null
});

const CreateRenewalModal = dynamic(() => import('@/components/contracts/CreateRenewalModal'), { 
    ssr: false,
    loading: () => null
});

export default function ContractsPage() {
    const { message } = App.useApp();
    const { token } = antdTheme.useToken();
    const { contracts, isPending, filters, totalCount } = useContracts();
    const { fetchContracts, setFilters, activateContract, cancelContract } = useContractActions();
    const { hasRole: canManage } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);
    const [modalOpen, setModalOpen] = useState(false);
    const [renewalModalOpen, setRenewalModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<{ id: string; clientName: string; clientId: string } | null>(null);
    const [expandedRowKeys, setExpandedRowKeys] = useState<readonly React.Key[]>([]);
    const [renewalsByContract, setRenewalsByContract] = useState<Record<string, ContractRenewal[]>>({});
    const [loadingRenewals, setLoadingRenewals] = useState<Record<string, boolean>>({});

    useEffect(() => { document.title = 'Contracts | Nexus'; }, []);

    useEffect(() => {
        fetchContracts();
    }, [filters, fetchContracts]);

    const handleSearch = (value: string) => {
        setFilters({ ...filters, searchTerm: value, pageNumber: 1 });
    };

    const handleStatusChange = (value: ContractStatus | undefined) => {
        setFilters({ ...filters, status: value, pageNumber: 1 });
    };

    const handleActivate = async (id: string) => {
        try {
            await activateContract(id);
            message.success('Contract activated successfully');
            fetchContracts();
        } catch {
            message.error('Failed to activate contract');
        }
    };

    const handleCancel = async (id: string) => {
        try {
            await cancelContract(id);
            message.success('Contract cancelled');
            fetchContracts();
        } catch {
            message.error('Failed to cancel contract');
        }
    };

    const handleOpenRenewal = (record: Contract) => {
        setSelectedContract({ id: record.id, clientName: record.clientName, clientId: record.clientId });
        setRenewalModalOpen(true);
    };

    const loadRenewals = async (contractId: string) => {
        setLoadingRenewals(prev => ({ ...prev, [contractId]: true }));
        try {
            const data = await contractService.getRenewals(contractId);
            setRenewalsByContract(prev => ({ ...prev, [contractId]: data }));
        } catch {
            message.error('Failed to load renewals');
        } finally {
            setLoadingRenewals(prev => ({ ...prev, [contractId]: false }));
        }
    };

    const handleExpand = (expanded: boolean, record: Contract) => {
        if (expanded) {
            setExpandedRowKeys([...expandedRowKeys, record.id]);
            loadRenewals(record.id);
        } else {
            setExpandedRowKeys(expandedRowKeys.filter(k => k !== record.id));
        }
    };

    const handleCompleteRenewal = async (renewalId: string, contractId: string) => {
        try {
            await contractService.completeRenewal(renewalId);
            message.success('Renewal completed successfully');
            await loadRenewals(contractId);
            fetchContracts(); // refresh parent contracts
        } catch {
            message.error('Failed to complete renewal');
        }
    };

    const columns = getColumns({
        canManage,
        onActivate: handleActivate,
        onCancel: handleCancel,
        onRenew: handleOpenRenewal,
    });

    const extra = (
        <Space size="middle">
            <Input.Search
                placeholder="Search contracts..."
                onSearch={handleSearch}
                allowClear
                defaultValue={filters.searchTerm}
                style={{ width: 220 }}
            />
            <Select
                placeholder="Status"
                allowClear
                onChange={handleStatusChange}
                options={[
                    { value: undefined, label: 'All Statuses' },
                    ...Object.values(ContractStatus).map(s => ({ value: s, label: s }))
                ]}
                style={{ width: 160 }}
                value={filters.status}
            />
            <Button className="desktop-action-btn" type="primary" disabled={!canManage} onClick={() => setModalOpen(true)}>New Contract</Button>
        </Space>
    );

    const breadcrumbs = [
        { title: 'Nexus', href: '/dashboard' },
        { title: 'Contracts' }
    ];

    return (
        <div>
            <PageHeader 
                title="Contracts" 
                breadcrumbs={breadcrumbs}
                extra={extra} 
                action={<Button className="mobile-fab-btn" type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} disabled={!canManage} />}
            />
            <DataTable<Contract>
                rowKey="id"
                columns={columns}
                dataSource={contracts}
                loading={isPending}
                pagination={{
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    total: totalCount,
                    onChange: (page) => setFilters({ ...filters, pageNumber: page }),
                    showTotal: t => `${t} contracts`,
                    showSizeChanger: false
                }}
                expandable={{
                    expandedRowKeys,
                    onExpand: handleExpand,
                    expandedRowRender: (record) => {
                        const loading = loadingRenewals[record.id];
                        const items = renewalsByContract[record.id];

                        if (loading) return <div>Loading renewals...</div>;
                        if (!items || items.length === 0) return <div style={{ color: token.colorTextTertiary }}>No renewals found.</div>;

                        return (
                            <DataTable<ContractRenewal>
                                rowKey="id"
                                dataSource={items}
                                pagination={false}
                                size="small"
                                columns={[
                                    { title: 'Date Initiated', dataIndex: 'renewalDate', render: d => new Date(d).toLocaleDateString() },
                                    { title: 'Status', dataIndex: 'statusName', render: (status) => <StatusBadge status={status} /> },
                                    { title: 'Notes', dataIndex: 'notes' },
                                    {
                                        title: 'Action',
                                        render: (_, renewal) => (
                                            renewal.statusName === 'Pending' && canManage ? (
                                                <Button size="small" type="primary" onClick={() => handleCompleteRenewal(renewal.id, record.id)}>
                                                    Complete Renewal
                                                </Button>
                                            ) : null
                                        )
                                    }
                                ]}
                            />
                        );
                    }
                }}
            />
            <CreateContractModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => fetchContracts()}
            />
            {selectedContract && (
                <CreateRenewalModal
                    open={renewalModalOpen}
                    onClose={() => {
                        setRenewalModalOpen(false);
                        loadRenewals(selectedContract.id);
                        if (!expandedRowKeys.includes(selectedContract.id)) {
                            setExpandedRowKeys([...expandedRowKeys, selectedContract.id]);
                        }
                    }}
                    contractId={selectedContract.id}
                    clientName={selectedContract.clientName}
                    clientId={selectedContract.clientId}
                />
            )}
        </div>
    );
}
