import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useActivityActions } from '@/providers/activityProvider';
import { Activity } from '@/types';

interface CompleteActivityModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly activity: Activity | null;
    readonly onSuccess?: () => void;
}

export default function CompleteActivityModal({ open, onClose, activity, onSuccess }: CompleteActivityModalProps) {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const { completeActivity } = useActivityActions();

    const handleOk = async () => {
        if (!activity) return;

        try {
            const values = await form.validateFields();
            setSubmitting(true);
            
            await completeActivity(activity.id, values.outcome);
            
            message.success('Activity marked as completed');
            form.resetFields();
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            if (!error.errorFields) {
                message.error(error.message || 'Failed to complete activity');
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
            title="Complete Activity"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Mark Complete"
        >
            <div style={{ marginBottom: 24 }}>
                <p>You are completing: <strong>{activity?.subject}</strong></p>
                <p style={{ color: '#666' }}>Please log the outcome or final notes from this activity before closing it.</p>
            </div>

            <Form form={form} layout="vertical" name="complete_activity_form">
                <Form.Item
                    name="outcome"
                    label="Outcome / Meeting Notes"
                    rules={[{ required: true, message: 'Please provide an outcome' }]}
                >
                    <Input.TextArea rows={4} placeholder="e.g. Client confirmed interest in full package. Follow-up proposal review scheduled." />
                </Form.Item>
            </Form>
        </Modal>
    );
}
