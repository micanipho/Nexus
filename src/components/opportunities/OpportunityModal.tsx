import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, DatePicker, App } from 'antd';
import { useOpportunityActions } from '@/providers/opportunityProvider';
import clientService from '@/services/clientService';
import { Client, OpportunityStage } from '@/types';

interface OpportunityModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSuccess?: () => void;
}

export default function OpportunityModal({ open, onClose, onSuccess }: OpportunityModalProps) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    
    // We are getting this from our Provider instead of service directly so it updates the global state correctly
    const { createOpportunity, fetchOpportunities } = useOpportunityActions();

    useEffect(() => {
        if (open) {
            loadClients();
        }
    }, [open]);

    const loadClients = async () => {
        setLoadingClients(true);
        try {
            // Fetch a list of active clients to populate the dropdown
            const response = await clientService.getClients({ pageNumber: 1, pageSize: 100 });
            setClients(response.items);
        } catch (error) {
            message.error('Failed to load clients list');
        } finally {
            setLoadingClients(false);
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            
            // Format out the date properly if it exists
            const payload = {
                ...values,
                expectedCloseDate: values.expectedCloseDate ? values.expectedCloseDate.toISOString() : undefined,
                ownerId: sessionStorage.getItem('userId') || '4446e829-4761-4da5-8f38-8c20a778500c' // Fallback to Admin from ROLES.md if local storage is missing
            };

            await createOpportunity(payload);
            
            message.success('Opportunity created successfully');
            form.resetFields();
            if (onSuccess) onSuccess();
            
            // Refresh table automatically
            fetchOpportunities();
            
            onClose();
        } catch (error: any) {
            if (!error.errorFields) {
                // Not a validation error, but an API or code error
                message.error(error.message || 'Failed to create opportunity');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Create New Opportunity"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Create Opportunity"
            width={600}
        >
            <Form form={form} layout="vertical" name="opportunity_form" initialValues={{ probability: 50, currency: 'ZAR', source: 1 }}>
                <Form.Item
                    name="title"
                    label="Opportunity Title"
                    rules={[{ required: true, message: 'Please provide a title' }]}
                >
                    <Input placeholder="e.g. Q3 Enterprise Expansion" />
                </Form.Item>
                
                <Form.Item
                    name="clientId"
                    label="Client"
                    rules={[{ required: true, message: 'Please select a client' }]}
                >
                    <Select 
                        placeholder="Select client"
                        loading={loadingClients}
                        options={clients.map(c => ({ value: c.id, label: c.name }))}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="estimatedValue"
                        label="Estimated Value"
                        rules={[{ required: true, message: 'Please provide a value' }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber 
                            style={{ width: '100%' }} 
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                            prefix="R"
                        />
                    </Form.Item>

                    <Form.Item
                        name="currency"
                        label="Currency"
                        rules={[{ required: true }]}
                        style={{ width: '100px' }}
                    >
                        <Select options={[{ value: 'ZAR', label: 'ZAR' }, { value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }]} />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="stage"
                        label="Stage"
                        rules={[{ required: true, message: 'Please select a stage' }]}
                        style={{ flex: 1 }}
                    >
                        <Select 
                            placeholder="Select stage"
                            options={[
                                { value: 1, label: 'Lead' },
                                { value: 2, label: 'Qualified' },
                                { value: 3, label: 'Proposal' },
                                { value: 4, label: 'Negotiation' },
                                { value: 5, label: 'Closed Won' },
                                { value: 6, label: 'Closed Lost' }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="probability"
                        label="Probability (%)"
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="source"
                        label="Lead Source"
                        style={{ flex: 1 }}
                    >
                        <Select 
                            options={[
                                { value: 1, label: 'Outbound' },
                                { value: 2, label: 'Inbound' },
                                { value: 3, label: 'Partner' },
                                { value: 4, label: 'Referral' }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="expectedCloseDate"
                        label="Expected Close Date"
                        rules={[{ required: true, message: 'Please select a date' }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={3} placeholder="Additional details about this opportunity..." />
                </Form.Item>
            </Form>
        </Modal>
    );
}
