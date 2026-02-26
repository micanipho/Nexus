'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Switch, App } from 'antd';
import contractService, { CreateContractPayload } from '@/services/contractService';
import proposalService from '@/services/proposalService';
import dashboardService from '@/services/dashboardService';
import { Proposal, ProposalStatus } from '@/types';

interface CreateContractModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSuccess?: () => void;
}

export default function CreateContractModal({ open, onClose, onSuccess }: CreateContractModalProps) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [approvedProposals, setApprovedProposals] = useState<Proposal[]>([]);
    const [salesReps, setSalesReps] = useState<Array<{ userId: string; userName: string }>>([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (open) {
            loadFormData();
        }
    }, [open]);

    const loadFormData = async () => {
        setLoadingData(true);
        try {
            const [proposalsData, repsData] = await Promise.all([
                proposalService.getProposals({ pageNumber: 1, pageSize: 100, status: ProposalStatus.APPROVED }),
                dashboardService.getSalesPerformance(50)
            ]);
            setApprovedProposals(proposalsData.items || []);
            setSalesReps(repsData.topPerformers || []);
        } catch {
            message.error('Failed to load form data');
        } finally {
            setLoadingData(false);
        }
    };

    const handleProposalChange = (proposalId: string) => {
        const proposal = approvedProposals.find(p => p.id === proposalId);
        if (proposal) {
            form.setFieldsValue({
                clientId: proposal.clientId,
                opportunityId: proposal.opportunityId,
                contractValue: proposal.totalAmount,
                currency: 'ZAR',
            });
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const payload: CreateContractPayload = {
                clientId: values.clientId,
                opportunityId: values.opportunityId,
                proposalId: values.proposalId,
                title: values.title,
                contractValue: values.contractValue,
                currency: values.currency || 'ZAR',
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
                ownerId: values.ownerId,
                renewalNoticePeriod: values.renewalNoticePeriod || 60,
                autoRenew: values.autoRenew || false,
                terms: values.terms || undefined,
            };

            await contractService.createContract(payload);

            message.success('Contract created successfully');
            form.resetFields();
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            if (!error.errorFields) {
                message.error(error.response?.data?.message || error.message || 'Failed to create contract');
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
            title="Generate Contract from Proposal"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Create Contract"
            width={640}
        >
            <Form form={form} layout="vertical" name="create_contract_form" initialValues={{ currency: 'ZAR', renewalNoticePeriod: 60, autoRenew: false }}>
                <Form.Item
                    name="proposalId"
                    label="Approved Proposal"
                    rules={[{ required: true, message: 'Please select an approved proposal' }]}
                >
                    <Select
                        placeholder="Select an approved proposal"
                        loading={loadingData}
                        showSearch
                        optionFilterProp="label"
                        onChange={handleProposalChange}
                        options={approvedProposals.map(p => ({
                            value: p.id,
                            label: `${p.opportunityTitle} — ${p.clientName} (R${p.totalAmount?.toLocaleString()})`,
                        }))}
                    />
                </Form.Item>

                {/* Hidden fields auto-populated from proposal */}
                <Form.Item name="clientId" hidden><Input /></Form.Item>
                <Form.Item name="opportunityId" hidden><Input /></Form.Item>

                <Form.Item
                    name="title"
                    label="Contract Title"
                    rules={[{ required: true, message: 'Please provide a contract title' }]}
                >
                    <Input placeholder="e.g. Annual SLA Agreement 2026" />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="contractValue"
                        label="Contract Value"
                        rules={[{ required: true, message: 'Please enter the contract value' }]}
                        style={{ flex: 2 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            addonBefore="R"
                        />
                    </Form.Item>
                    <Form.Item
                        name="currency"
                        label="Currency"
                        style={{ flex: 1 }}
                    >
                        <Select options={[
                            { value: 'ZAR', label: 'ZAR' },
                            { value: 'USD', label: 'USD' },
                            { value: 'EUR', label: 'EUR' },
                            { value: 'GBP', label: 'GBP' },
                        ]} />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="startDate"
                        label="Start Date"
                        rules={[{ required: true, message: 'Please select a start date' }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="endDate"
                        label="End Date"
                        rules={[{ required: true, message: 'Please select an end date' }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item
                    name="ownerId"
                    label="Contract Owner"
                    rules={[{ required: true, message: 'Please select an owner' }]}
                >
                    <Select
                        placeholder="Select contract owner"
                        showSearch
                        optionFilterProp="label"
                        loading={loadingData}
                        options={salesReps.map(rep => ({ value: rep.userId, label: rep.userName }))}
                    />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="renewalNoticePeriod"
                        label="Renewal Notice (days)"
                        style={{ flex: 1 }}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} max={365} />
                    </Form.Item>
                    <Form.Item
                        name="autoRenew"
                        label="Auto-Renew"
                        valuePropName="checked"
                        style={{ flex: 1 }}
                    >
                        <Switch />
                    </Form.Item>
                </div>

                <Form.Item name="terms" label="Terms & Conditions">
                    <Input.TextArea rows={3} placeholder="Standard T&Cs apply. Payment net 30 days." />
                </Form.Item>
            </Form>
        </Modal>
    );
}
