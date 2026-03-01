'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Checkbox, Button, App, Typography } from 'antd';
import dayjs from 'dayjs';
import noteService, { CreateNotePayload, Note, UpdateNotePayload } from '@/services/noteService';

const { Text } = Typography;

interface NoteModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSuccess?: () => void;
    readonly relatedToType: number;
    readonly relatedToId: string;
    readonly note?: Note | null;
    readonly readOnly?: boolean;
}

export default function NoteModal({ open, onClose, onSuccess, relatedToType, relatedToId, note, readOnly }: NoteModalProps) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (note) {
                form.setFieldsValue({
                    content: note.content,
                    isPrivate: note.isPrivate,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, form, note]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            if (note) {
                const payload: UpdateNotePayload = {
                    content: values.content,
                    isPrivate: values.isPrivate || false,
                };
                await noteService.updateNote(note.id, payload);
                message.success('Note updated successfully');
            } else {
                const payload: CreateNotePayload = {
                    content: values.content,
                    isPrivate: values.isPrivate || false,
                    relatedToType,
                    relatedToId,
                };
                await noteService.createNote(payload);
                message.success('Note added successfully');
            }

            form.resetFields();
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            if (!error.errorFields) {
                message.error(error.message || 'Failed to save note');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title={readOnly ? "View Note" : (note ? "Edit Note" : "Add Note")}
            open={open}
            onOk={readOnly ? onClose : handleOk}
            onCancel={onClose}
            confirmLoading={submitting}
            okText={readOnly ? "Close" : (note ? "Update Note" : "Save Note")}
            footer={readOnly ? [
                <Button key="close" type="primary" onClick={onClose}>Close</Button>
            ] : undefined}
        >
            {readOnly && note ? (
                <div style={{ padding: '8px 0' }}>
                    <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            By {note.createdBy || 'Unknown User'} • {dayjs(note.createdAt).format('MMMM D, YYYY HH:mm')}
                        </Text>
                    </div>
                    <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', minHeight: 100, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                        {note.content || note.text}
                    </Typography.Paragraph>
                </div>
            ) : (
                <Form form={form} layout="vertical" name="note_form" initialValues={{ isPrivate: false }}>
                <Form.Item
                    name="content"
                    label="Note Content"
                    rules={[{ required: true, message: 'Please write your note content' }]}
                >
                    <Input.TextArea rows={4} placeholder="e.g. Discussed pricing structures for Q3 expansion..." />
                </Form.Item>

                <Form.Item name="isPrivate" valuePropName="checked">
                    <Checkbox>Make this note private</Checkbox>
                </Form.Item>
            </Form>
            )}
        </Modal>
    );
}
