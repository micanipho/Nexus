import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, App } from 'antd';
import { useActivityActions } from '@/providers/activityProvider';
import { useClients, useClientActions } from '@/providers/clientProvider';
import { useOpportunities, useOpportunityActions } from '@/providers/opportunityProvider';
import { useAuth } from '@/providers/authProvider';
import { ActivityType, Activity } from '@/types';
import dayjs from 'dayjs';

interface CreateActivityModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSuccess?: () => void;
    // Optional pre-filled relations if opened from a specific context (like a Client page)
    readonly initialRelatedToType?: number; // 1 for Client, 2 for Opportunity
    readonly initialRelatedToId?: string;
    readonly activityToEdit?: Activity | null;
}

export default function CreateActivityModal({ 
    open, 
    onClose, 
    onSuccess,
    initialRelatedToType,
    initialRelatedToId,
    activityToEdit
}: CreateActivityModalProps) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const { createActivity, updateActivity } = useActivityActions();
    const { clients } = useClients();
    const { fetchClients } = useClientActions();
    const { opportunities } = useOpportunities();
    const { fetchOpportunities } = useOpportunityActions();
    const { user } = useAuth();

    // Watch for changes to relatedToType to clear relatedToId if type changes
    const relatedToType = Form.useWatch('relatedToType', form);

    React.useEffect(() => {
        if (open) {
            if (relatedToType === 1 && clients.length === 0) {
                fetchClients({ pageNumber: 1, pageSize: 100 });
            } else if (relatedToType === 2 && opportunities.length === 0) {
                fetchOpportunities({ pageNumber: 1, pageSize: 100 });
            }
        }
    }, [open, relatedToType, clients.length, opportunities.length, fetchClients, fetchOpportunities]);

    React.useEffect(() => {
        if (open) {
            if (activityToEdit) {
                form.setFieldsValue({
                    ...activityToEdit,
                    dueDate: activityToEdit.dueDate ? dayjs(activityToEdit.dueDate) : undefined,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, activityToEdit, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            
            const payload = {
                ...values,
                dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
                assignedToId: user?.id,
                relatedToType: initialRelatedToType || values.relatedToType,
                relatedToId: initialRelatedToId || values.relatedToId,
            };

            if (activityToEdit) {
                await updateActivity(activityToEdit.id, payload);
                message.success('Activity updated successfully');
            } else {
                await createActivity(payload);
                message.success('Activity created successfully');
            }
            
            form.resetFields();
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            if (!error.errorFields) {
                message.error(error.message || 'Failed to create activity');
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
            title={activityToEdit ? "Edit Activity" : "Log New Activity"}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText={activityToEdit ? "Save Changes" : "Create Activity"}
            width={500}
        >
            <Form 
                form={form} 
                layout="vertical" 
                name="activity_form" 
                initialValues={{ 
                    priority: 2, 
                    type: ActivityType.MEETING,
                    duration: 30 
                }}
            >
                {!initialRelatedToType && !initialRelatedToId && !activityToEdit && (
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            name="relatedToType"
                            label="Related To"
                            style={{ flex: 1 }}
                        >
                            <Select 
                                allowClear
                                placeholder="Select entity type"
                                onChange={() => form.setFieldValue('relatedToId', undefined)}
                                options={[
                                    { value: 1, label: 'Client' },
                                    { value: 2, label: 'Opportunity' }
                                ]}
                            />
                        </Form.Item>

                        <Form.Item
                            name="relatedToId"
                            label="Specific Record"
                            style={{ flex: 2 }}
                        >
                            <Select
                                allowClear
                                showSearch
                                placeholder={relatedToType ? "Select the record..." : "Select type first..."}
                                disabled={!relatedToType}
                                optionFilterProp="label"
                                options={
                                    relatedToType === 1 
                                        ? clients.map(c => ({ value: c.id, label: c.name }))
                                        : relatedToType === 2
                                            ? opportunities.map(o => ({ value: o.id, label: o.title }))
                                            : []
                                }
                            />
                        </Form.Item>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="type"
                        label="Activity Type"
                        rules={[{ required: true, message: 'Please select a type' }]}
                        style={{ flex: 1 }}
                    >
                        <Select 
                            options={[
                                { value: ActivityType.MEETING, label: 'Meeting' },
                                { value: ActivityType.CALL, label: 'Call' },
                                { value: ActivityType.EMAIL, label: 'Email' },
                                { value: ActivityType.TASK, label: 'Task' },
                                { value: ActivityType.PRESENTATION, label: 'Presentation' },
                                { value: ActivityType.OTHER, label: 'Other' }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Priority"
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Select 
                            options={[
                                { value: 1, label: 'Low' },
                                { value: 2, label: 'Normal' },
                                { value: 3, label: 'High' },
                                { value: 4, label: 'Urgent' }
                            ]}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="subject"
                    label="Subject"
                    rules={[{ required: true, message: 'Please provide a subject' }]}
                >
                    <Input placeholder="e.g. Discovery Call with client" />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="dueDate"
                        label="Due Date & Time"
                        rules={[{ required: true, message: 'Please select when this happens' }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="duration"
                        label="Duration (mins)"
                        style={{ width: '120px' }}
                    >
                        <InputNumber min={5} step={5} style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item
                    name="location"
                    label="Location / Meeting Link"
                >
                    <Input placeholder="Zoom, Teams, or physical address" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description & Notes"
                >
                    <Input.TextArea rows={4} placeholder="Agenda or notes for this activity..." />
                </Form.Item>
            </Form>
        </Modal>
    );
}
