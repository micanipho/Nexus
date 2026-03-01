import { Button, Dropdown, Space, Tag } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined,
    PhoneOutlined,
    MailOutlined,
    VideoCameraOutlined,
    DownOutlined,
    ProjectOutlined,
    EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { Activity, ActivityType } from '@/types';

interface ActivityColumnDeps {
    colorTextDisabled: string;
    onView: (record: Activity) => void;
    onEdit: (record: Activity) => void;
    onComplete: (record: Activity) => void;
    onCancel: (id: string) => void;
}

const renderTypeIcon = (type: ActivityType) => {
    switch (type) {
        case ActivityType.CALL: return <PhoneOutlined />;
        case ActivityType.MEETING: return <VideoCameraOutlined />;
        case ActivityType.EMAIL: return <MailOutlined />;
        case ActivityType.PRESENTATION: return <ProjectOutlined />;
        default: return <CalendarOutlined />;
    }
};

export const getColumns = ({ colorTextDisabled, onView, onEdit, onComplete, onCancel }: ActivityColumnDeps): ColumnsType<Activity> => [
    {
        title: 'Subject',
        dataIndex: 'subject',
        key: 'subject',
        render: (text: string, record: Activity) => (
            <Space>
                {renderTypeIcon(record.type)}
                <a onClick={() => onView(record)} style={{ fontWeight: 500 }}>{text}</a>
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
            ) : <span style={{ color: colorTextDisabled }}>-</span>
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
                                onClick: () => onView(record),
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
                                    onClick: () => onEdit(record),
                                },
                                {
                                    key: 'complete',
                                    icon: <CheckCircleOutlined style={{ color: 'green' }} />,
                                    label: 'Mark Complete',
                                    onClick: () => onComplete(record),
                                },
                                {
                                    key: 'cancel',
                                    icon: <CloseCircleOutlined style={{ color: 'red' }} />,
                                    label: 'Cancel Activity',
                                    onClick: () => onCancel(record.id),
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
