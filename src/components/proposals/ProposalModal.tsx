'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Space, Divider, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import proposalService, { CreateProposalPayload, CreateLineItemPayload } from '@/services/proposalService';
import opportunityService from '@/services/opportunityService';
import { Opportunity } from '@/types';

interface ProposalModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSuccess?: () => void;
    readonly preselectedOpportunityId?: string;
}

const EMPTY_LINE_ITEM: CreateLineItemPayload = {
    productServiceName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    taxRate: 15,
};

export default function ProposalModal({ open, onClose, onSuccess, preselectedOpportunityId }: ProposalModalProps) {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [lineItems, setLineItems] = useState<CreateLineItemPayload[]>([{ ...EMPTY_LINE_ITEM }]);
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
            const oppsData = await opportunityService.getOpportunities({ pageNumber: 1, pageSize: 100 });
            setOpportunities(oppsData.items || []);
        } catch {
            message.error('Failed to load opportunities');
        } finally {
            setLoadingData(false);
        }
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { ...EMPTY_LINE_ITEM }]);
    };

    const removeLineItem = (index: number) => {
        if (lineItems.length <= 1) return;
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const updateLineItem = (index: number, field: keyof CreateLineItemPayload, value: string | number) => {
        const updated = [...lineItems];
        updated[index] = { ...updated[index], [field]: value };
        setLineItems(updated);
    };

    const calculateLineTotal = (item: CreateLineItemPayload): number => {
        const subtotal = item.quantity * item.unitPrice;
        const discounted = subtotal * (1 - item.discount / 100);
        const withTax = discounted * (1 + item.taxRate / 100);
        return Math.round(withTax * 100) / 100;
    };

    const calculateGrandTotal = (): number => {
        return lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            // Validate line items
            const validLineItems = lineItems.filter(li => li.productServiceName.trim() !== '');
            if (validLineItems.length === 0) {
                message.error('Please add at least one line item with a product/service name');
                return;
            }

            setSubmitting(true);

            const payload: CreateProposalPayload = {
                opportunityId: values.opportunityId,
                title: values.title,
                description: values.description,
                currency: values.currency || 'ZAR',
                validUntil: values.validUntil.toISOString(),
                lineItems: validLineItems,
            };

            await proposalService.createProposal(payload);

            message.success('Proposal created successfully');
            form.resetFields();
            setLineItems([{ ...EMPTY_LINE_ITEM }]);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            if (!error.errorFields) {
                message.error(error.message || 'Failed to create proposal');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setLineItems([{ ...EMPTY_LINE_ITEM }]);
        onClose();
    };

    return (
        <Modal
            title="Create Proposal"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Create Proposal"
            width={800}
        >
            <Form form={form} layout="vertical" name="proposal_form" initialValues={{ currency: 'ZAR' }}>
                <Form.Item
                    name="title"
                    label="Proposal Title"
                    rules={[{ required: true, message: 'Please provide a title' }]}
                >
                    <Input placeholder="e.g. Q1 2026 Enterprise Proposal" />
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

                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={2} placeholder="Brief description of the proposal..." />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="currency"
                        label="Currency"
                        style={{ width: 120 }}
                    >
                        <Select
                            options={[
                                { value: 'ZAR', label: 'ZAR' },
                                { value: 'USD', label: 'USD' },
                                { value: 'EUR', label: 'EUR' },
                                { value: 'GBP', label: 'GBP' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="validUntil"
                        label="Valid Until"
                        rules={[{ required: true, message: 'Please select a date' }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Divider>Line Items</Divider>

                {lineItems.map((item, index) => (
                    <div key={index} style={{ background: '#fafafa', padding: '12px', borderRadius: 8, marginBottom: 12, border: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <strong style={{ fontSize: 13 }}>Item {index + 1}</strong>
                            {lineItems.length > 1 && (
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeLineItem(index)}
                                />
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <Input
                                placeholder="Product/Service Name"
                                value={item.productServiceName}
                                onChange={e => updateLineItem(index, 'productServiceName', e.target.value)}
                                style={{ flex: 2 }}
                            />
                            <Input
                                placeholder="Description"
                                value={item.description}
                                onChange={e => updateLineItem(index, 'description', e.target.value)}
                                style={{ flex: 2 }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <InputNumber
                                placeholder="Qty"
                                min={1}
                                value={item.quantity}
                                onChange={v => updateLineItem(index, 'quantity', v || 1)}
                                style={{ width: 80 }}
                                addonBefore="Qty"
                            />
                            <InputNumber
                                placeholder="Unit Price"
                                min={0}
                                value={item.unitPrice}
                                onChange={v => updateLineItem(index, 'unitPrice', v || 0)}
                                style={{ flex: 1 }}
                                addonBefore="Price"
                                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                            <InputNumber
                                placeholder="Discount %"
                                min={0}
                                max={100}
                                value={item.discount}
                                onChange={v => updateLineItem(index, 'discount', v || 0)}
                                style={{ width: 110 }}
                                addonAfter="%"
                                addonBefore="Disc"
                            />
                            <InputNumber
                                placeholder="Tax %"
                                min={0}
                                max={100}
                                value={item.taxRate}
                                onChange={v => updateLineItem(index, 'taxRate', v || 0)}
                                style={{ width: 110 }}
                                addonAfter="%"
                                addonBefore="Tax"
                            />
                            <div style={{ minWidth: 100, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>
                                R{calculateLineTotal(item).toLocaleString()}
                            </div>
                        </div>
                    </div>
                ))}

                <Button
                    type="dashed"
                    onClick={addLineItem}
                    icon={<PlusOutlined />}
                    style={{ width: '100%', marginBottom: 16 }}
                >
                    Add Line Item
                </Button>

                <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 700, padding: '8px 0' }}>
                    Grand Total: R{calculateGrandTotal().toLocaleString()}
                </div>
            </Form>
        </Modal>
    );
}
