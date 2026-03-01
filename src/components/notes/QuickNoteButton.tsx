'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Checkbox, Select, Button, App, Tooltip, theme } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import noteService, { CreateNotePayload } from '@/services/noteService';

const RELATED_TO_OPTIONS = [
    { label: 'General', value: 0 },
    { label: 'Client', value: 1 },
    { label: 'Opportunity', value: 2 },
    { label: 'Proposal', value: 3 },
    { label: 'Contract', value: 4 },
];

export default function QuickNoteButton() {
    const { message } = App.useApp();
    const { token } = theme.useToken();
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        form.resetFields();
        setOpen(false);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const payload: CreateNotePayload = {
                content: values.content,
                isPrivate: values.isPrivate || false,
                relatedToType: values.relatedToType ?? 0,
                relatedToId: values.relatedToId || '',
            };

            await noteService.createNote(payload);
            message.success('Note saved');
            handleClose();
        } catch (error: any) {
            if (!error.errorFields) {
                message.error(error.message || 'Failed to save note');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Tooltip title="Quick Note" placement="left">
                <Button
                    type="primary"
                    shape="circle"
                    icon={<FormOutlined />}
                    onClick={handleOpen}
                    style={{
                        position: 'fixed',
                        bottom: 88,
                        right: 28,
                        zIndex: 999,
                        width: 48,
                        height: 48,
                        boxShadow: `0 4px 14px ${token.colorPrimaryBg}`,
                    }}
                />
            </Tooltip>

            <Modal
                title="Quick Note"
                open={open}
                onOk={handleSubmit}
                onCancel={handleClose}
                confirmLoading={submitting}
                okText="Save Note"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ isPrivate: false, relatedToType: 0 }}
                >
                    <Form.Item
                        name="content"
                        label="Note"
                        rules={[{ required: true, message: 'Please write your note' }]}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Write your note here..."
                            autoFocus
                        />
                    </Form.Item>

                    <Form.Item name="relatedToType" label="Related To">
                        <Select options={RELATED_TO_OPTIONS} />
                    </Form.Item>

                    <Form.Item name="isPrivate" valuePropName="checked">
                        <Checkbox>Private note</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
