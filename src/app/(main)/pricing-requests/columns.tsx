import Link from 'next/link';
import { Button, Select, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PricingRequest } from '@/types';

const priorityLabels: Record<number, { label: string; color: string }> = {
    1: { label: 'Low', color: 'green' },
    2: { label: 'Medium', color: 'gold' },
    3: { label: 'High', color: 'orange' },
    4: { label: 'Urgent', color: 'red' },
};

const statusLabels: Record<number, { label: string; color: string }> = {
    1: { label: 'Pending', color: 'default' },
    2: { label: 'In Progress', color: 'processing' },
    3: { label: 'Completed', color: 'success' },
};

interface PricingRequestColumnDeps {
    canAssign: boolean;
    canComplete: boolean;
    salesReps: Array<{ userId: string; userName: string }>;
    onAssign: (id: string, userId: string) => void;
    onComplete: (id: string) => void;
}

export const getColumns = ({ canAssign, canComplete, salesReps, onAssign, onComplete }: PricingRequestColumnDeps): ColumnsType<PricingRequest> => [
    {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (text: string, record: PricingRequest) => <Link href={`/pricing-requests/${record.id}`}>{text}</Link>,
    },
    {
        title: 'Opportunity',
        dataIndex: 'opportunityTitle',
        key: 'opportunityTitle',
        render: (text: string, record: PricingRequest) => record.opportunityId ? <Link href={`/opportunities/${record.opportunityId}`}>{text}</Link> : text,
    },
    {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        width: 100,
        render: (p: number) => {
            const info = priorityLabels[p] || { label: `P${p}`, color: 'default' };
            return <Tag color={info.color}>{info.label}</Tag>;
        },
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (s: number) => {
            const info = statusLabels[s] || { label: 'Unknown', color: 'default' };
            return <Tag color={info.color}>{info.label}</Tag>;
        },
    },
    {
        title: 'Assigned To',
        key: 'assignedTo',
        width: 180,
        render: (_, record) => (
            <Select
                value={record.assignedToId || undefined}
                onChange={(value) => onAssign(record.id, value)}
                placeholder="Assign"
                style={{ width: 160 }}
                size="small"
                showSearch
                optionFilterProp="label"
                options={salesReps.map(rep => ({ value: rep.userId, label: rep.userName }))}
                disabled={record.status === 3 || !canAssign}
            />
        ),
    },
    {
        title: 'Required By',
        dataIndex: 'requiredByDate',
        key: 'requiredByDate',
        width: 120,
        render: (d: string) => d ? new Date(d).toLocaleDateString() : '—',
    },
    {
        title: 'Actions',
        key: 'actions',
        width: 90,
        render: (_, record) => (
            record.status === 2 && canComplete ? (
                <Tooltip title="Mark as Completed">
                    <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => onComplete(record.id)}
                    >
                        Complete
                    </Button>
                </Tooltip>
            ) : record.status === 3 ? (
                <Tag color="success">Done</Tag>
            ) : null
        ),
    },
];
