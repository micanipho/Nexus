import Link from 'next/link';
import { Button, Tag, Space, Popconfirm } from 'antd';
import { DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Client } from '@/types';

interface ClientColumnDeps {
    canDelete: boolean;
    onDelete: (id: string) => void;
    onReactivate: (id: string, client: Client) => void;
    successColor: string;
}

export const getColumns = ({ canDelete, onDelete, onReactivate, successColor }: ClientColumnDeps): ColumnsType<Client> => [
    {
        title: 'Client',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <Link href={`/clients/${record.id}`}>{text}</Link>,
    },
    {
        title: 'Industry',
        dataIndex: 'industry',
        key: 'industry',
    },
    {
        title: 'Opportunities',
        dataIndex: 'opportunitiesCount',
        key: 'opportunitiesCount',
        sorter: (a, b) => (a.opportunitiesCount || 0) - (b.opportunitiesCount || 0),
    },
    {
        title: 'Contracts',
        dataIndex: 'contractsCount',
        key: 'contractsCount',
        sorter: (a, b) => (a.contractsCount || 0) - (b.contractsCount || 0),
    },
    {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive: boolean) => (
            <Tag color={isActive ? 'green' : 'red'}>
                {isActive ? 'Active' : 'Inactive'}
            </Tag>
        ),
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
            <Space size="small">
                <Link href={`/clients/${record.id}`}>
                    <Button size="small">View</Button>
                </Link>
                {canDelete && record.isActive && (
                    <Popconfirm
                        title="Deactivate Client?"
                        description="Are you sure you want to deactivate this client?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                )}
                {canDelete && !record.isActive && (
                    <Button
                        size="small"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => onReactivate(record.id, record)}
                        style={{ backgroundColor: successColor, borderColor: successColor }}
                    />
                )}
            </Space>
        ),
    },
];
