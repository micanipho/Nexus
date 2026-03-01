'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, App, Select, Upload, Modal, Form, Input, Popconfirm, Empty } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { UserRole } from '@/types';
import { useHasRole } from '@/hooks/useHasRole';
import documentService, { DocumentInfo } from '@/services/documentService';
import dayjs from 'dayjs';

const { Dragger } = Upload;

const DOCUMENT_CATEGORIES: Record<number, string> = {
    1: 'Contract',
    2: 'Proposal',
    3: 'Presentation',
    4: 'Quote',
    5: 'Report',
    6: 'Other',
};

interface DocumentsPanelProps {
    relatedToType: number;
    relatedToId: string;
    readonly?: boolean;
}

const DocumentsPanel: React.FC<DocumentsPanelProps> = ({ relatedToType, relatedToId, readonly }) => {
    const { message } = App.useApp();
    const [documents, setDocuments] = useState<DocumentInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();
    const { hasRole: canDelete } = useHasRole([UserRole.ADMIN, UserRole.SALES_MANAGER]);

    const extractArray = (res: any): DocumentInfo[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (res.items && Array.isArray(res.items)) return res.items;
        if (res.data && Array.isArray(res.data)) return res.data;
        if (res.$values && Array.isArray(res.$values)) return res.$values;
        return [];
    };

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await documentService.getDocuments({ relatedToType, relatedToId });
            setDocuments(extractArray(res));
        } catch {
            message.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    }, [relatedToType, relatedToId, message]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleDownload = (doc: DocumentInfo) => {
        documentService.downloadDocument(doc);
    };

    const handleDelete = async (id: string) => {
        try {
            await documentService.deleteDocument(id);
            message.success('Document deleted');
            fetchDocuments();
        } catch {
            message.error('Failed to delete document');
        }
    };

    const handleUpload = async () => {
        try {
            const values = await form.validateFields();

            if (fileList.length === 0) {
                message.error('Please select a file to upload');
                return;
            }

            const file = fileList[0].originFileObj as File;

            if (file.size > 50 * 1024 * 1024) {
                message.error('File size must be under 50MB');
                return;
            }

            setUploading(true);

            await documentService.uploadDocument({
                file,
                category: values.documentCategory,
                relatedToType,
                relatedToId,
                description: values.description,
            });

            message.success('Document uploaded successfully');
            form.resetFields();
            setFileList([]);
            setUploadModalOpen(false);
            fetchDocuments();
        } catch (error: any) {
            if (!error.errorFields) {
                message.error(error.message || 'Failed to upload document');
            }
        } finally {
            setUploading(false);
        }
    };

    const columns: ColumnsType<DocumentInfo> = [
        {
            title: 'File Name',
            dataIndex: 'fileName',
            key: 'fileName',
            render: (text: string) => text || 'Unnamed Document',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (val: number, record) => record.categoryName || DOCUMENT_CATEGORIES[val] || 'Other',
        },
        {
            title: 'Uploaded By',
            dataIndex: 'uploadedByName',
            key: 'uploadedBy',
            render: (_: string, record: DocumentInfo) => record.uploadedByName || record.uploadedBy || 'Unknown',
        },
        {
            title: 'Date',
            dataIndex: 'uploadedAt',
            key: 'uploadedAt',
            render: (d: string) => d ? dayjs(d).format('MMM D, YYYY') : '—',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, record: DocumentInfo) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => handleDownload(record)}
                    />
                    {!readonly && canDelete && (
                        <Popconfirm
                            title="Delete this document?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <>
            <Table<DocumentInfo>
                rowKey="id"
                size="small"
                dataSource={documents}
                columns={columns}
                loading={loading}
                pagination={false}
                locale={{ emptyText: <Empty description="No documents attached" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                scroll={{ x: 'max-content' }}
            />
            {!readonly && (
                <div style={{ marginTop: 16 }}>
                    <Button type="dashed" block icon={<UploadOutlined />} onClick={() => setUploadModalOpen(true)}>
                        Upload Document
                    </Button>
                </div>
            )}

            <Modal
                title="Upload Document"
                open={uploadModalOpen}
                onOk={handleUpload}
                onCancel={() => { setUploadModalOpen(false); form.resetFields(); setFileList([]); }}
                confirmLoading={uploading}
                okText="Upload"
            >
                <Form form={form} layout="vertical" initialValues={{ documentCategory: 6 }}>
                    <Form.Item label="Select File" required>
                        <Dragger
                            multiple={false}
                            fileList={fileList}
                            beforeUpload={() => false}
                            onChange={(info) => {
                                setFileList(info.fileList.slice(-1));
                            }}
                            onRemove={() => {
                                setFileList([]);
                            }}
                        >
                            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            <p className="ant-upload-hint">Supports single file upload up to 50MB.</p>
                        </Dragger>
                    </Form.Item>

                    <Form.Item
                        name="documentCategory"
                        label="Document Category"
                        rules={[{ required: true, message: 'Please select a category' }]}
                    >
                        <Select
                            options={Object.entries(DOCUMENT_CATEGORIES).map(([value, label]) => ({
                                value: Number(value),
                                label,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item name="description" label="Description (Optional)">
                        <Input.TextArea rows={2} placeholder="Optional description..." />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default DocumentsPanel;
