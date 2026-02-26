import React, { useState } from 'react';
import { Modal, Form, Input, Checkbox, message } from 'antd';
import contactService from '@/services/contactService';

interface ContactModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly clientId: string;
    readonly onSuccess?: () => void;
}

export default function ContactModal({ open, onClose, clientId, onSuccess }: ContactModalProps) {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            
            await contactService.createContact({
                ...values,
                clientId: clientId
            });
            
            message.success('Contact added successfully');
            form.resetFields();
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            if (!error.errorFields) {
                message.error(error.message || 'Failed to add contact');
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
            title="Add New Contact"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Add Contact"
        >
            <Form form={form} layout="vertical" name="contact_form" initialValues={{ isPrimaryContact: false }}>
                <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[{ required: true, message: 'Please provide a first name' }]}
                >
                    <Input placeholder="e.g. Jane" />
                </Form.Item>
                <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please provide a last name' }]}
                >
                    <Input placeholder="e.g. Doe" />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                        { required: true, message: 'Please provide an email' },
                        { type: 'email', message: 'Please enter a valid email address' }
                    ]}
                >
                    <Input placeholder="jane.doe@example.com" />
                </Form.Item>
                <Form.Item
                    name="phoneNumber"
                    label="Phone Number"
                >
                    <Input placeholder="+27 11 ..." />
                </Form.Item>
                <Form.Item
                    name="position"
                    label="Position / Role"
                >
                    <Input placeholder="e.g. CTO" />
                </Form.Item>
                <Form.Item
                    name="isPrimaryContact"
                    valuePropName="checked"
                >
                    <Checkbox>Set as Primary Contact</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
}
