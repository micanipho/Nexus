'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Space, message, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Contract, ContractStatus, UserRole } from '@/types';
import { useContracts, useContractActions } from '@/providers/contractProvider';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useHasRole } from '@/hooks/useHasRole';
import CreateContractModal from '@/components/contracts/CreateContractModal';

export default function ContractsPage() {
    const { contracts, isPending, filters, totalCount } = useContracts();
    const { fetchContracts, setFilters, activateContract, cancelContract } = useContractActions();
    const { hasRole: canManage } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.BUSINESS_DEVELOPMENT_MANAGER]);
    const [modalOpen, setModalOpen] = useState(false);

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

    const columns: ColumnsType<Contract> = [
        {
            title: 'Contract #',
            dataIndex: 'contractNumber',
            key: 'contractNumber',
            render: (text, record) => <Link href={`/contracts/${record.id}`}>{text || record.id.substring(0, 8).toUpperCase()}</Link>,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            key: 'clientName',
            render: (text, record) => <Link href={`/clients/${record.clientId}`}>{text}</Link>,
        },
        {
            title: 'Value',
            dataIndex: 'contractValue',
            key: 'contractValue',
            render: (v, record) => `${record.currency || 'R'}${(v ?? record.totalValue)?.toLocaleString()}`,
            sorter: (a, b) => (a.contractValue ?? a.totalValue) - (b.contractValue ?? b.totalValue),
        },
        {
            title: 'Status',
            dataIndex: 'statusName',
            key: 'statusName',
            render: (statusName: string, record) => <StatusBadge status={statusName || record.status} />,
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (d) => d ? new Date(d).toLocaleDateString() : '—',
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (d) => d ? new Date(d).toLocaleDateString() : '—',
        },
        {
            title: 'Owner',
            dataIndex: 'ownerName',
            key: 'ownerName',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const isDraft = record.statusName === 'Draft' || record.status === ContractStatus.DRAFT;
                return (
                    <Space>
                        <Link href={`/contracts/${record.id}`}>
                            <Button size="small">View</Button>
                        </Link>
                        {isDraft && canManage && (
                            <Popconfirm
                                title="Activate this contract?"
                                description="This will move the contract to Active status."
                                onConfirm={() => handleActivate(record.id)}
                                okText="Activate"
                            >
                                <Button size="small" type="primary">Activate</Button>
                            </Popconfirm>
                        )}
                        {isDraft && canManage && (
                            <Popconfirm
                                title="Cancel this contract?"
                                description="This action cannot be undone."
                                onConfirm={() => handleCancel(record.id)}
                                okText="Cancel Contract"
                                okButtonProps={{ danger: true }}
                            >
                                <Button size="small" danger>Cancel</Button>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        },
    ];

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
            <Button type="primary" disabled={!canManage} onClick={() => setModalOpen(true)}>New Contract</Button>
        </Space>
    );

    const breadcrumbs = [
        { title: 'Nexus', href: '/' },
        { title: 'Contracts' }
    ];

    return (
        <div>
            <PageHeader 
                title="Contracts" 
                breadcrumbs={breadcrumbs}
                extra={extra} 
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
                    showTotal: t => `${t} contracts`
                }}
            />
            <CreateContractModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => fetchContracts()}
            />
        </div>
    );
}
