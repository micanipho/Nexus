import Link from 'next/link';
import { Button, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Contract, ContractStatus } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatCurrency } from '@/utils/currencyUtils';

interface ContractColumnDeps {
    canManage: boolean;
    onActivate: (id: string) => void;
    onCancel: (id: string) => void;
    onRenew: (record: Contract) => void;
}

export const getColumns = ({ canManage, onActivate, onCancel, onRenew }: ContractColumnDeps): ColumnsType<Contract> => [
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
        render: (v, record) => formatCurrency(v ?? record.totalValue),
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
            const isActive = record.statusName === 'Active' || record.status === ContractStatus.ACTIVE;
            return (
                <Space>
                    <Link href={`/contracts/${record.id}`}>
                        <Button size="small">View</Button>
                    </Link>
                    {isDraft && canManage && (
                        <Popconfirm
                            title="Activate this contract?"
                            description="This will move the contract to Active status."
                            onConfirm={() => onActivate(record.id)}
                            okText="Activate"
                        >
                            <Button size="small" type="primary">Activate</Button>
                        </Popconfirm>
                    )}
                    {isActive && canManage && (
                        <Button size="small" type="primary" onClick={() => onRenew(record)}>
                            Renew
                        </Button>
                    )}
                    {isDraft && canManage && (
                        <Popconfirm
                            title="Cancel this contract?"
                            description="This action cannot be undone."
                            onConfirm={() => onCancel(record.id)}
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
