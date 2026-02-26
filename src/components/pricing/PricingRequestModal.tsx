'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, App } from 'antd';
import pricingRequestService, { CreatePricingRequestPayload } from '@/services/pricingRequestService';
import opportunityService from '@/services/opportunityService';
import dashboardService from '@/services/dashboardService';
import { Opportunity } from '@/types';

interface PricingRequestModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSuccess?: () => void;
    readonly preselectedOpportunityId?: string;
}

export default function PricingRequestModal({ open, onClose, onSuccess, preselectedOpportunityId }: PricingRequestModalProps) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [salesReps, setSalesReps] = useState<Array<{ userId: string; userName: string }>>([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (open) {
            loadFormData();
            if (preselectedOpportunityId) {
                form.setFieldsValue({ opportunityId: preselectedOpportunityId });
            }
        }
    }, [open, preselectedOpportunityId, form]);

    const loadFormData = async () => {
        setLoadingData(true);
        try {
            const [oppsData, repsData] = await Promise.all([
                opportunityService.getOpportunities({ pageNumber: 1, pageSize: 100 }),
                dashboardService.getSalesPerformance(50)
            ]);
            setOpportunities(oppsData.items || []);
            setSalesReps(repsData.topPerformers || []);
        } catch {
            message.error('Failed to load form data');
        } finally {
            setLoadingData(false);
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const payload: CreatePricingRequestPayload = {
                opportunityId: values.opportunityId,
                title: values.title,
                description: values.description,
                priority: values.priority,
                requiredByDate: values.requiredByDate.toISOString(),
                assignedToId: values.assignedToId || undefined,
            };

            await pricingRequestService.createPricingRequest(payload);

            message.success('Pricing request created successfully');
            form.resetFields();
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            if (!error.errorFields) {
                message.error(error.message || 'Failed to create pricing request');
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
            title="Create Pricing Request"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Submit Request"
            width={600}
        >
            <Form form={form} layout="vertical" name="pricing_request_form" initialValues={{ priority: 2 }}>
                <Form.Item
                    name="title"
                    label="Request Title"
                    rules={[{ required: true, message: 'Please provide a title' }]}
                >
                    <Input placeholder="e.g. Custom Volume Pricing" />
                </Form.Item>

                <Form.Item
                    name="opportunityId"
                    label="Linked Opportunity"
                    rules={[{ required: true, message: 'Please select an opportunity' }]}
                >
                    <Select
                        placeholder="Select opportunity"
                        loading={loadingData}
                        showSearch
                        optionFilterProp="label"
                        options={opportunities.map(o => ({ value: o.id, label: `${o.title} — ${o.clientName}` }))}
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={3} placeholder="Details about what pricing is needed..." />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="priority"
                        label="Priority"
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Select
                            options={[
                                { value: 1, label: '🟢 Low' },
                                { value: 2, label: '🟡 Medium' },
                                { value: 3, label: '🟠 High' },
                                { value: 4, label: '🔴 Urgent' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="requiredByDate"
                        label="Required By"
                        rules={[{ required: true, message: 'Please select a date' }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item
                    name="assignedToId"
                    label="Assign To (Optional)"
                    tooltip="If assigned, request status will automatically be set to In Progress"
                >
                    <Select
                        placeholder="Leave empty for Pending status"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        loading={loadingData}
                        options={salesReps.map(rep => ({ value: rep.userId, label: rep.userName }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
