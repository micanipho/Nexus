import React from 'react';
import { Modal, Descriptions, Tag, Space, Typography, Badge, theme } from 'antd';
import { Activity, ActivityType } from '@/types';
import { useClients } from '@/providers/clientProvider';
import { useOpportunities } from '@/providers/opportunityProvider';
import { useAuth } from '@/providers/authProvider';
import { 
    PhoneOutlined, 
    VideoCameraOutlined, 
    MailOutlined, 
    ProjectOutlined, 
    CalendarOutlined,
    ClockCircleOutlined,
    UserOutlined,
    EnvironmentOutlined,
    LinkOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

interface ViewActivityModalProps {
    open: boolean;
    onClose: () => void;
    activity: Activity | null;
}

export default function ViewActivityModal({ open, onClose, activity }: ViewActivityModalProps) {
    const { token } = theme.useToken();
    const { clients } = useClients();
    const { opportunities } = useOpportunities();
    const { user } = useAuth();

    if (!activity) return null;

    // Resolve names if backend only returned IDs
    const relatedName = activity.relatedToName || (
        activity.relatedToType === 1 
            ? clients.find(c => c.id === activity.relatedToId)?.name 
            : activity.relatedToType === 2 
                ? opportunities.find(o => o.id === activity.relatedToId)?.title 
                : undefined
    );

    const assignedName = activity.assignedToName || (
        activity.assignedToId === user?.id 
            ? `${user?.firstName} ${user?.lastName}` 
            : 'Unknown User'
    );

    const renderTypeIcon = (type: ActivityType) => {
        switch (type) {
            case ActivityType.CALL: return <PhoneOutlined />;
            case ActivityType.MEETING: return <VideoCameraOutlined />;
            case ActivityType.EMAIL: return <MailOutlined />;
            case ActivityType.PRESENTATION: return <ProjectOutlined />;
            default: return <CalendarOutlined />;
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'Completed') return 'success';
        if (status === 'Cancelled') return 'default';
        return 'processing';
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 4: return 'red'; // Urgent
            case 3: return 'orange'; // High
            case 1: return 'green'; // Low
            default: return 'blue'; // Normal
        }
    };

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 4: return 'Urgent';
            case 3: return 'High';
            case 1: return 'Low';
            default: return 'Normal';
        }
    };

    const isOverdue = activity.statusName === 'Scheduled' && dayjs(activity.dueDate).isBefore(dayjs());

    return (
        <Modal
            title={
                <Space align="center" size="middle">
                    {renderTypeIcon(activity.type)}
                    <span>{activity.subject}</span>
                    <Badge status={getStatusColor(activity.statusName) as any} text={activity.statusName} />
                </Space>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <div style={{ marginTop: '24px' }}>
                <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }} bordered size="small">
                    <Descriptions.Item label="Due Date" span={2}>
                        <Space>
                            <CalendarOutlined />
                            <Text type={isOverdue ? 'danger' : undefined} strong={isOverdue}>
                                {dayjs(activity.dueDate).format('dddd, MMMM D, YYYY [at] HH:mm')}
                            </Text>
                            {isOverdue && <Tag color="red">Overdue</Tag>}
                        </Space>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Duration">
                        <Space>
                            <ClockCircleOutlined />
                            {activity.duration ? `${activity.duration} minutes` : 'Not specified'}
                        </Space>
                    </Descriptions.Item>

                    <Descriptions.Item label="Priority">
                        <Tag color={getPriorityColor(activity.priority)}>{getPriorityLabel(activity.priority)}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Related To" span={2}>
                        {relatedName ? (
                            <Space>
                                <LinkOutlined />
                                <Tag color={activity.relatedToType === 1 ? 'blue' : 'purple'}>
                                    {activity.relatedToType === 1 ? 'Client: ' : 'Opportunity: '}
                                    {relatedName}
                                </Tag>
                            </Space>
                        ) : (
                            <Text type="secondary">None</Text>
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="Location" span={2}>
                        {activity.location ? (
                            <Space>
                                <EnvironmentOutlined />
                                <Text>{activity.location}</Text>
                            </Space>
                        ) : (
                            <Text type="secondary">Not specified</Text>
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="Assigned To" span={2}>
                        <Space>
                            <UserOutlined />
                            <Text>{assignedName}</Text>
                        </Space>
                    </Descriptions.Item>
                </Descriptions>

                {(activity.description || activity.outcome) && (
                    <div style={{ marginTop: '24px' }}>
                        {activity.description && (
                            <div style={{ marginBottom: '16px' }}>
                                <Text strong>Description & Notes</Text>
                                <Paragraph style={{ marginTop: '8px', padding: '12px', background: token.colorBgLayout, borderRadius: '4px' }}>
                                    {activity.description}
                                </Paragraph>
                            </div>
                        )}

                        {activity.outcome && (
                            <div>
                                <Text strong>Outcome / Resolution</Text>
                                <Paragraph style={{ marginTop: '8px', padding: '12px', background: token.colorSuccessBg, border: `1px solid ${token.colorSuccessBorder}`, borderRadius: '4px' }}>
                                    {activity.outcome}
                                </Paragraph>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
