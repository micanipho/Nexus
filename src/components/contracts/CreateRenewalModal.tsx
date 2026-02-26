'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useContractActions } from '@/providers/contractProvider';
import opportunityService from '@/services/opportunityService';
import { Opportunity } from '@/types';

interface CreateRenewalModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly contractId: string;
    readonly clientName: string;
    readonly clientId: string;
}

export default function CreateRenewalModal({ open, onClose, contractId, clientName, clientId }: CreateRenewalModalProps) {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [clientOpportunities, setClientOpportunities] = useState<Opportunity[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const { createRenewal } = useContractActions();

    useEffect(() => {
        if (open && clientId) {
            loadFormData();
        }
    }, [open, clientId]);

    const loadFormData = async () => {
        setLoadingData(true);
        try {
            // Ideally we fetch opportunities just for this client to link the renewal
            // The API doesn't currently strictly require linking an opportunity, but if it exists, it's good practice.
            // Using a large page size since we don't have a specific `getOpportunitiesByClientId` endpoint
            const oppsData = await opportunityService.getOpportunities({ pageNumber: 1, pageSize: 100 });
            const filteredOpps = oppsData.items ? oppsData.items.filter(o => o.clientId === clientId) : [];
            setClientOpportunities(filteredOpps);
        } catch {
            message.error('Failed to load opportunities');
        } finally {
            setLoadingData(false);
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            await createRenewal(contractId, {
                renewalOpportunityId: values.renewalOpportunityId || undefined,
                notes: values.notes,
            });

            message.success('Contract renewal initiated successfully');
            form.resetFields();
            onClose();
        } catch (error: any) {
            if (!error.errorFields) {
                message.error(error.message || 'Failed to create renewal');
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
            title={`Renew Contract — ${clientName}`}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Initiate Renewal"
        >
            <Form form={form} layout="vertical" name="create_renewal_form">
                <Form.Item
                    name="renewalOpportunityId"
                    label="Link Opportunity (Optional)"
                    tooltip="You can link an existing opportunity dedicated to this renewal"
                >
                    <Select
                        placeholder="Select an opportunity"
                        allowClear
                        loading={loadingData}
                        showSearch
                        optionFilterProp="label"
                        options={clientOpportunities.map(o => ({
                            value: o.id,
                            label: o.title,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="notes"
                    label="Renewal Notes"
                    rules={[{ required: true, message: 'Please provide renewal notes' }]}
                >
                    <Input.TextArea 
                        rows={4} 
                        placeholder="e.g. Annual CPI adjustment of 8% applied to all terms..." 
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
