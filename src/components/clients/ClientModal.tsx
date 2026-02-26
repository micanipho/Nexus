import React, { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useClientActions } from '@/providers/clientProvider';

interface ClientModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSuccess?: () => void;
}

export default function ClientModal({ open, onClose, onSuccess }: ClientModalProps) {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const { createClient } = useClientActions();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            await createClient(values);
            message.success('Client created successfully');
            form.resetFields();
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            // Validation errors don't need a message, they show inline
            if (!error.errorFields) {
                message.error(error.message || 'Failed to create client');
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
            title="Create New Client"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Create Client"
        >
            <Form form={form} layout="vertical" name="client_form">
                <Form.Item
                    name="name"
                    label="Client Name"
                    rules={[{ required: true, message: 'Please provide a client name' }]}
                >
                    <Input placeholder="e.g. Acme Corp" />
                </Form.Item>
                <Form.Item
                    name="industry"
                    label="Industry"
                    rules={[{ required: true, message: 'Please select an industry' }]}
                >
                    <Select 
                        placeholder="Select industry"
                        options={[
                            { value: 'Technology', label: 'Technology' },
                            { value: 'Manufacturing', label: 'Manufacturing' },
                            { value: 'Software', label: 'Software' },
                            { value: 'Aerospace', label: 'Aerospace' },
                            { value: 'AI', label: 'AI' },
                            { value: 'Other', label: 'Other' },
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    name="clientType"
                    label="Client Type"
                    rules={[{ required: true, message: 'Please select a client type' }]}
                >
                    <Select 
                        placeholder="Select client type"
                        options={[
                            { value: 1, label: 'Government' },
                            { value: 2, label: 'Private' },
                            { value: 3, label: 'Partner' },
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    name="companySize"
                    label="Company Size"
                >
                    <Select 
                        placeholder="Select company size"
                        options={[
                            { value: '1-10', label: '1-10' },
                            { value: '11-50', label: '11-50' },
                            { value: '51-200', label: '51-200' },
                            { value: '201-500', label: '201-500' },
                            { value: '500-1000', label: '500-1000' },
                            { value: '1000+', label: '1000+' },
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    name="website"
                    label="Website"
                >
                    <Input placeholder="https://..." />
                </Form.Item>
                <Form.Item
                    name="taxNumber"
                    label="Tax Number"
                >
                    <Input placeholder="Tax ID / VAT number" />
                </Form.Item>
                <Form.Item
                    name="billingAddress"
                    label="Billing Address"
                >
                    <Input.TextArea rows={3} placeholder="Full billing address" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
