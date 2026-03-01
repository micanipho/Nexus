import Link from 'next/link';
import { Button, Space, Popconfirm } from 'antd';
import { SendOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Proposal, ProposalStatus } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatCurrency } from '@/utils/currencyUtils';

interface ProposalColumnDeps {
    canCreate: boolean;
    canApprove: boolean;
    onSubmit: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export const getColumns = ({ canCreate, canApprove, onSubmit, onApprove, onReject }: ProposalColumnDeps): ColumnsType<Proposal> => [
    {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
        render: (text, record) => <Link href={`/proposals/${record.id}`}>{text}</Link>,
    },
    {
        title: 'Opportunity',
        dataIndex: 'opportunityTitle',
        key: 'opportunityTitle',
        render: (text, record) => <Link href={`/opportunities/${record.opportunityId}`}>{text}</Link>,
        ellipsis: true,
    },
    {
        title: 'Client',
        dataIndex: 'clientName',
        key: 'clientName',
        render: (text, record) => <Link href={`/clients/${record.clientId}`}>{text}</Link>,
    },
    {
        title: 'Total',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: (v) => formatCurrency(v),
        sorter: (a, b) => a.totalAmount - b.totalAmount,
        align: 'right',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: ProposalStatus) => <StatusBadge status={status} />,
        width: 120,
    },
    {
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (d: string) => d ? new Date(d).toLocaleDateString() : '—',
        width: 110,
    },
    {
        title: 'Actions',
        key: 'actions',
        width: 220,
        render: (_, record) => (
            <Space size="small">
                <Link href={`/proposals/${record.id}`}>
                    <Button size="small">View</Button>
                </Link>
                {record.status === ProposalStatus.DRAFT && canCreate && (
                    <Popconfirm
                        title="Submit this proposal for review?"
                        onConfirm={() => onSubmit(record.id)}
                        okText="Yes"
                    >
                        <Button size="small" type="primary" ghost icon={<SendOutlined />}>
                            Submit
                        </Button>
                    </Popconfirm>
                )}
                {record.status === ProposalStatus.SUBMITTED && canApprove && (
                    <>
                        <Popconfirm
                            title="Approve this proposal?"
                            onConfirm={() => onApprove(record.id)}
                            okText="Approve"
                        >
                            <Button size="small" type="primary" icon={<CheckOutlined />}>
                                Approve
                            </Button>
                        </Popconfirm>
                        <Popconfirm
                            title="Reject this proposal?"
                            onConfirm={() => onReject(record.id)}
                            okText="Reject"
                            okButtonProps={{ danger: true }}
                        >
                            <Button size="small" danger icon={<CloseOutlined />}>
                                Reject
                            </Button>
                        </Popconfirm>
                    </>
                )}
            </Space>
        ),
    },
];
