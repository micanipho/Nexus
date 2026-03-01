import Link from 'next/link';
import { Button, Space, Popconfirm, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Opportunity, OpportunityStage } from '@/types';
import { formatCurrency } from '@/utils/currencyUtils';

interface OpportunityColumnDeps {
    currentUserId?: string;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdateStage: (id: string, stage: OpportunityStage) => void;
    onDelete: (id: string) => void;
}

export const getColumns = ({ currentUserId, canUpdate, canDelete, onUpdateStage, onDelete }: OpportunityColumnDeps): ColumnsType<Opportunity> => [
    {
        title: 'Opportunity',
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => <Link href={`/opportunities/${record.id}`}>{text}</Link>,
    },
    {
        title: 'Client',
        dataIndex: 'clientName',
        key: 'clientName',
        render: (text, record) => <Link href={`/clients/${record.clientId}`}>{text}</Link>,
    },
    {
        title: 'Value',
        dataIndex: 'estimatedValue',
        key: 'estimatedValue',
        render: (v) => formatCurrency(v),
        sorter: (a, b) => a.estimatedValue - b.estimatedValue,
        align: 'right',
    },
    {
        title: 'Stage',
        dataIndex: 'stage',
        key: 'stage',
        render: (stage: OpportunityStage, record) => {
            const isOwner = currentUserId === record.ownerId;
            const editable = canUpdate || isOwner;

            return editable ? (
                <Select
                    value={stage}
                    onChange={(value) => onUpdateStage(record.id, value)}
                    style={{ width: 140 }}
                    size="small"
                    options={[
                        { value: 1, label: 'Lead' },
                        { value: 2, label: 'Qualified' },
                        { value: 3, label: 'Proposal' },
                        { value: 4, label: 'Negotiation' },
                        { value: 5, label: 'Closed Won' },
                        { value: 6, label: 'Closed Lost' },
                    ]}
                />
            ) : (
                <span>{stage}</span>
            );
        },
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
            <Space size="small">
                <Link href={`/opportunities/${record.id}`}>
                    <Button size="small">View</Button>
                </Link>
                {canDelete && (
                    <Popconfirm
                        title="Deactivate Opportunity?"
                        description="Are you sure you want to deactivate this opportunity?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                )}
            </Space>
        ),
    },
];
