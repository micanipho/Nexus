'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, App, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import documentService, { UploadDocumentPayload } from '@/services/documentService';
import type { UploadFile } from 'antd/es/upload/interface';

const { Dragger } = Upload;

interface DocumentUploadModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSuccess?: () => void;
    readonly relatedToType: number;
    readonly relatedToId: string;
}

export default function DocumentUploadModal({ open, onClose, onSuccess, relatedToType, relatedToId }: DocumentUploadModalProps) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if (open) {
            form.resetFields();
            setFileList([]);
        }
    }, [open, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            if (fileList.length === 0) {
                message.error('Please select a file to upload');
                return;
            }

            const file = fileList[0].originFileObj as File;
            
            if (file.size > 50 * 1024 * 1024) {
               message.error('File size must be strictly smaller than 50MB');
               return; 
            }

            setSubmitting(true);

            const payload: UploadDocumentPayload = {
                file,
                category: values.category,
                relatedToType,
                relatedToId,
                description: values.description,
            };

            await documentService.uploadDocument(payload);

            message.success('Document uploaded successfully');
            setFileList([]);
            form.resetFields();
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            if (!error.errorFields) {
                message.error(error.message || 'Failed to upload document');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Upload Document"
            open={open}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={submitting}
            okText="Upload"
        >
            <Form form={form} layout="vertical" name="upload_document_form" initialValues={{ category: 1 }}>

                <Form.Item label="Select File" required>
                    <Dragger
                        multiple={false}
                        fileList={fileList}
                        beforeUpload={() => false} // Prevent auto uploading
                        onChange={(info) => {
                            // Only allow one file
                            let newFileList = [...info.fileList];
                            newFileList = newFileList.slice(-1);
                            setFileList(newFileList);
                        }}
                        onRemove={(file) => {
                            setFileList([]);
                        }}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                            Supports single file upload up to 50MB.
                        </p>
                    </Dragger>
                </Form.Item>

                <Form.Item
                    name="category"
                    label="Document Category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                >
                    <Select>
                        <Select.Option value={1}>Proposal</Select.Option>
                        <Select.Option value={2}>Contract</Select.Option>
                        <Select.Option value={3}>Invoice</Select.Option>
                        <Select.Option value={4}>Technical spec</Select.Option>
                        <Select.Option value={5}>Other</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description (Optional)"
                >
                    <Input.TextArea rows={2} placeholder="Optional detailed description..." />
                </Form.Item>

            </Form>
        </Modal>
    );
}
