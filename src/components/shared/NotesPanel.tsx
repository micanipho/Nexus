'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Space, App, Input, Switch, Typography, Popconfirm, Empty, Avatar } from 'antd';
import { UserOutlined, LockOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { useAuth } from '@/providers/authProvider';
import noteService, { Note, CreateNotePayload, UpdateNotePayload } from '@/services/noteService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

interface NotesPanelProps {
    relatedToType: number;
    relatedToId: string;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ relatedToType, relatedToId }) => {
    const { message } = App.useApp();
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editIsPrivate, setEditIsPrivate] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);

    const extractArray = (res: any): Note[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (res.items && Array.isArray(res.items)) return res.items;
        if (res.data && Array.isArray(res.data)) return res.data;
        if (res.$values && Array.isArray(res.$values)) return res.$values;
        return [];
    };

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await noteService.getNotes({ relatedToType, relatedToId });
            setNotes(extractArray(res));
        } catch {
            message.error('Failed to load notes');
        } finally {
            setLoading(false);
        }
    }, [relatedToType, relatedToId, message]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleAddNote = async () => {
        if (!newContent.trim()) {
            message.warning('Please write a note before submitting');
            return;
        }

        setSubmitting(true);
        try {
            const payload: CreateNotePayload = {
                content: newContent.trim(),
                relatedToType,
                relatedToId,
                isPrivate,
            };
            await noteService.createNote(payload);
            message.success('Note added');
            setNewContent('');
            setIsPrivate(false);
            fetchNotes();
        } catch {
            message.error('Failed to add note');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditSave = async (noteId: string) => {
        if (!editContent.trim()) return;

        setEditSubmitting(true);
        try {
            const payload: UpdateNotePayload = {
                content: editContent.trim(),
                isPrivate: editIsPrivate,
            };
            await noteService.updateNote(noteId, payload);
            message.success('Note updated');
            setEditingNoteId(null);
            fetchNotes();
        } catch {
            message.error('Failed to update note');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDelete = async (noteId: string) => {
        try {
            await noteService.deleteNote(noteId);
            message.success('Note deleted');
            fetchNotes();
        } catch {
            message.error('Failed to delete note');
        }
    };

    const startEditing = (note: Note) => {
        setEditingNoteId(note.id);
        setEditContent(note.content || note.text || '');
        setEditIsPrivate(note.isPrivate);
    };

    const isOwner = (note: Note) => {
        if (!user) return false;
        return note.createdById === user.id || note.createdById === user.userId;
    };

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Add Note Form */}
            <Card size="small" styles={{ body: { padding: 12 } }}>
                <Input.TextArea
                    rows={3}
                    placeholder="Write a note..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    style={{ marginBottom: 8 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                        <Switch
                            size="small"
                            checked={isPrivate}
                            onChange={setIsPrivate}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <LockOutlined style={{ marginRight: 4 }} />
                            Private Note
                        </Text>
                    </Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<SendOutlined />}
                        loading={submitting}
                        onClick={handleAddNote}
                        disabled={!newContent.trim()}
                    >
                        Add Note
                    </Button>
                </div>
            </Card>

            {/* Notes List */}
            {loading ? (
                <Card loading size="small" />
            ) : notes.length === 0 ? (
                <Empty description="No notes yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
                notes.map((note) => (
                    <Card
                        key={note.id}
                        size="small"
                        styles={{ body: { padding: '12px 16px' } }}
                    >
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Avatar size="small" icon={<UserOutlined />} style={{ flexShrink: 0, marginTop: 2 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <Space size={8}>
                                        <Text strong style={{ fontSize: 13 }}>
                                            {note.createdBy || 'Unknown User'}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {dayjs(note.createdAt).fromNow()}
                                        </Text>
                                        {note.isPrivate && (
                                            <LockOutlined style={{ fontSize: 11, color: '#1677ff' }} />
                                        )}
                                    </Space>
                                    <Space size={0}>
                                        {isOwner(note) && editingNoteId !== note.id && (
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<EditOutlined style={{ fontSize: 13 }} />}
                                                onClick={() => startEditing(note)}
                                            />
                                        )}
                                        <Popconfirm
                                            title="Delete this note?"
                                            onConfirm={() => handleDelete(note.id)}
                                        >
                                            <Button
                                                type="text"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined style={{ fontSize: 13 }} />}
                                            />
                                        </Popconfirm>
                                    </Space>
                                </div>

                                {editingNoteId === note.id ? (
                                    <div>
                                        <Input.TextArea
                                            rows={3}
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            style={{ marginBottom: 8 }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Space>
                                                <Switch
                                                    size="small"
                                                    checked={editIsPrivate}
                                                    onChange={setEditIsPrivate}
                                                />
                                                <Text type="secondary" style={{ fontSize: 12 }}>Private</Text>
                                            </Space>
                                            <Space size="small">
                                                <Button size="small" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    loading={editSubmitting}
                                                    onClick={() => handleEditSave(note.id)}
                                                >
                                                    Save
                                                </Button>
                                            </Space>
                                        </div>
                                    </div>
                                ) : (
                                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', fontSize: 13 }}>
                                        {note.content || note.text}
                                    </Paragraph>
                                )}
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </Space>
    );
};

export default NotesPanel;
