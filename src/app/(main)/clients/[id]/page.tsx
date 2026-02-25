// 'use client';
//
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import {
//     Card, Flex, Typography, Tag, Button, Space, Tabs,
//     Descriptions, Statistic, Timeline, Table, Avatar, Tooltip,
//     Row, Col
// } from 'antd';
// import {
//     UserOutlined,
//     PlusOutlined,
//     PhoneOutlined,
//     MailOutlined,
//     FileTextOutlined,
//     HistoryOutlined,
//     ThunderboltOutlined,
//     EditOutlined
// } from '@ant-design/icons';
// import { Client, Opportunity, Contract, Activity } from '@/types';
// import { ClientHealth, OpportunityStage, ContractStatus, ActivityType, ActivityStatus } from '@/types/enums';
//
// const { Title, Text } = Typography;
//
// export default function ClientDetailPage() {
//     const { id } = useParams<{ id: string }>();
//     const [client, setClient] = useState<Client | null>(null);
//
//     useEffect(() => {
//         // GET /api/clients/{id}
//         setClient({
//             id: id as string,
//             name: 'Global Tech Solutions',
//             industry: 'Information Technology',
//             owner: 'Nhlakanipho M.',
//             health: ClientHealth.GOOD,
//             website: 'https://global-tech.example.com',
//             location: 'Sandton, Johannesburg',
//             arr: 1450000,
//             mrr: 120000,
//             renewDate: '2026-08-15',
//         });
//     }, [id]);
//
//     if (!client) return null;
//
//     const HealthTag = () =>
//         client.health === ClientHealth.GOOD ? <Tag color="green">Good Health</Tag> :
//             client.health === ClientHealth.AT_RISK ? <Tag color="orange">At Risk</Tag> :
//                 <Tag color="red">Poor Health</Tag>;
//
//     return (
//         <Flex vertical gap={24}>
//             {/* Header Section */}
//             <Card variant="borderless">
//                 <Flex align="center" justify="space-between" wrap="wrap" gap={16}>
//                     <Flex gap={16} align="center">
//                         <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
//                         <div>
//                             <Title level={2} style={{ marginBottom: 0 }}>
//                                 {client.name} <HealthTag />
//                             </Title>
//                             <Text type="secondary">{client.location} • {client.website}</Text>
//                         </div>
//                     </Flex>
//                     <Space size="middle">
//                         <Button icon={<EditOutlined />}>Edit Client</Button>
//                         <Button type="primary" icon={<PlusOutlined />}>New Opportunity</Button>
//                     </Space>
//                 </Flex>
//             </Card>
//
//             {/* Metric Summary Cards */}
//             <Row gutter={[16, 16]}>
//                 <Col xs={24} sm={8}>
//                     <Card variant="borderless">
//                         <Statistic title="Annual Recurring Revenue (ARR)" prefix="R" value={client.arr} styles={{ content: { fontWeight: 700 } }} />
//                     </Card>
//                 </Col>
//                 <Col xs={24} sm={8}>
//                     <Card variant="borderless">
//                         <Statistic title="Monthly Revenue" prefix="R" value={client.mrr} />
//                     </Card>
//                 </Col>
//                 <Col xs={24} sm={8}>
//                     <Card variant="borderless">
//                         <Statistic title="Next Renewal Date" value={client.renewDate} prefix={<HistoryOutlined />} />
//                     </Card>
//                 </Col>
//             </Row>
//
//             {/* Detailed Content Tabs */}
//             <Card variant="borderless">
//                 <Tabs
//                     defaultActiveKey="overview"
//                     items={[
//                         {
//                             key: 'overview',
//                             label: 'Account Overview',
//                             children: (
//                                 <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
//                                     <Descriptions.Item label="Account Owner">{client.owner}</Descriptions.Item>
//                                     <Descriptions.Item label="Industry">{client.industry}</Descriptions.Item>
//                                     <Descriptions.Item label="HQ Location">{client.location}</Descriptions.Item>
//                                     <Descriptions.Item label="Website"><a href={client.website} target="_blank">{client.website}</a></Descriptions.Item>
//                                     <Descriptions.Item label="Client Since">Jan 2024</Descriptions.Item>
//                                     <Descriptions.Item label="Account Health"><HealthTag /></Descriptions.Item>
//                                 </Descriptions>
//                             ),
//                         },
//                         {
//                             key: 'contacts',
//                             label: 'Contacts',
//                             children: (
//                                 <Table
//                                     size="small"
//                                     pagination={false}
//                                     dataSource={[
//                                         { key: '1', name: 'Sarah Smith', role: 'CTO', email: 'sarah@globaltech.com', phone: '+27 11 000 1234' },
//                                         { key: '2', name: 'John Dube', role: 'Procurement Manager', email: 'john@globaltech.com', phone: '+27 11 000 5678' }
//                                     ]}
//                                     columns={[
//                                         { title: 'Name', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
//                                         { title: 'Role', dataIndex: 'role', key: 'role' },
//                                         { title: 'Email', dataIndex: 'email', key: 'email' },
//                                         { title: 'Phone', dataIndex: 'phone', key: 'phone' },
//                                         { title: 'Actions', key: 'actions', render: () => <Button size="small" type="link">Contact</Button> }
//                                     ]}
//                                 />
//                             ),
//                         },
//                         {
//                             key: 'opportunities',
//                             label: 'Pipeline',
//                             children: (
//                                 <Table
//                                     size="small"
//                                     rowKey="id"
//                                     dataSource={[
//                                         { id: 'o-1', name: 'Cloud Infrastructure Upgrade', stage: OpportunityStage.NEGOTIATION, amount: 450000, probability: 75 },
//                                         { id: 'o-2', name: 'Cybersecurity Suite', stage: OpportunityStage.QUALIFICATION, amount: 280000, probability: 40 }
//                                     ]}
//                                     columns={[
//                                         { title: 'Opportunity', dataIndex: 'name', key: 'name' },
//                                         { title: 'Stage', dataIndex: 'stage', render: (s) => <Tag color="blue">{s}</Tag> },
//                                         { title: 'Value', dataIndex: 'amount', render: (v) => `R${v.toLocaleString()}` },
//                                         { title: 'Prob.', dataIndex: 'probability', render: (p) => `${p}%` },
//                                     ]}
//                                 />
//                             ),
//                         },
//                         {
//                             key: 'contracts',
//                             label: 'Contracts & Renewals',
//                             children: (
//                                 <Table
//                                     size="small"
//                                     rowKey="id"
//                                     dataSource={[
//                                         { id: 'ct-1', code: 'CT-2024-88', status: ContractStatus.ACTIVE, end: '2026-08-15', value: 1200000 },
//                                     ]}
//                                     columns={[
//                                         { title: 'Contract ID', dataIndex: 'code' },
//                                         { title: 'Status', dataIndex: 'status', render: (s) => <Tag color="green">{s}</Tag> },
//                                         { title: 'Expiration', dataIndex: 'end' },
//                                         { title: 'Total Value', dataIndex: 'value', render: (v) => `R${v.toLocaleString()}` },
//                                     ]}
//                                 />
//                             ),
//                         },
//                         {
//                             key: 'activity',
//                             label: 'Engagement History',
//                             children: (
//                                 <div style={{ padding: '20px 0' }}>
//                                     <Timeline
//                                         mode="left"
//                                         items={[
//                                             {
//                                                 label: 'Today 10:15',
//                                                 children: (
//                                                     <div>
//                                                         <Text strong>Discovery Call Completed</Text>
//                                                         <br />
//                                                         <Text type="secondary">Discussed expansion into Durban branch. Assigned to Nhlakanipho.</Text>
//                                                     </div>
//                                                 ),
//                                                 color: 'blue'
//                                             },
//                                             {
//                                                 label: 'Feb 20, 2026',
//                                                 children: 'Proposal for Cybersecurity Suite sent to Procurement.',
//                                                 color: 'green'
//                                             },
//                                             {
//                                                 label: 'Feb 15, 2026',
//                                                 children: 'In-person Demo at HQ Offices.',
//                                                 dot: <ThunderboltOutlined style={{ fontSize: '16px' }} />,
//                                                 color: 'orange'
//                                             }
//                                         ]}
//                                     />
//                                 </div>
//                             ),
//                         },
//                     ]}
//                 />
//             </Card>
//         </Flex>
//     );
// }
