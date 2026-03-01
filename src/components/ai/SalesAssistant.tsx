'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Drawer, Button, Input, Tag, App, Tooltip, theme } from 'antd';
import {
    RobotOutlined,
    SendOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import opportunityService from '@/services/opportunityService';
import clientService from '@/services/clientService';
import proposalService from '@/services/proposalService';
import contractService from '@/services/contractService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface PageContext {
    summary: string;
    suggestions: string[];
}

// ---------------------------------------------------------------------------
// Suggested prompts per page type
// ---------------------------------------------------------------------------
const SUGGESTIONS: Record<string, string[]> = {
    opportunity: [
        'Draft a follow-up email',
        'Suggest next best action',
        'Summarize this deal',
        'Identify risk factors',
    ],
    proposal: [
        'Write an executive summary',
        'Justify the pricing',
        'Predict approval likelihood',
    ],
    contract: [
        'Draft a renewal reminder email',
        'Summarize contract terms',
        'Flag renewal risks',
    ],
    client: [
        'Identify upsell opportunities',
        'Summarize account history',
        'Draft intro email',
    ],
    default: [
        'What should I focus on today?',
        'Help me prepare for a client call',
        'Draft a cold outreach email',
    ],
};

// ---------------------------------------------------------------------------
// Helpers – detect page type & fetch context
// ---------------------------------------------------------------------------
function parsePageInfo(pathname: string): { type: string; id: string | null } {
    const segments = pathname.split('/').filter(Boolean);
    // e.g. ["opportunities", "abc-123"]
    const typeMap: Record<string, string> = {
        opportunities: 'opportunity',
        clients: 'client',
        proposals: 'proposal',
        contracts: 'contract',
    };
    const pageType = typeMap[segments[0]] ?? 'default';
    const id = segments.length >= 2 ? segments[1] : null;
    return { type: pageType, id };
}

async function fetchPageContext(
    type: string,
    id: string | null,
): Promise<PageContext> {
    const suggestions = SUGGESTIONS[type] ?? SUGGESTIONS.default;

    if (!id) return { summary: '', suggestions };

    try {
        switch (type) {
            case 'opportunity': {
                const o = await opportunityService.getOpportunityById(id);
                return {
                    summary: `Viewing Opportunity: "${o.title}" | Client: ${o.clientName} | Stage: ${o.stage} | Value: ${o.currency} ${o.estimatedValue?.toLocaleString()} | Probability: ${o.probability}%`,
                    suggestions,
                };
            }
            case 'client': {
                const c = await clientService.getClientById(id);
                return {
                    summary: `Viewing Client: "${c.name}" | Industry: ${c.industry || 'N/A'} | Opportunities: ${c.opportunitiesCount} | Contracts: ${c.contractsCount}`,
                    suggestions,
                };
            }
            case 'proposal': {
                const p = await proposalService.getProposalById(id);
                return {
                    summary: `Viewing Proposal: "${p.title}" (${p.proposalNumber}) | Amount: ${p.currency} ${p.totalAmount?.toLocaleString()} | Status: ${p.statusName} | Line items: ${p.lineItems?.length ?? 0}`,
                    suggestions,
                };
            }
            case 'contract': {
                const ct = await contractService.getContractById(id);
                return {
                    summary: `Viewing Contract: "${ct.title}" (${ct.contractNumber}) | Value: ${ct.currency} ${ct.contractValue?.toLocaleString()} | Expires: ${ct.endDate} | Expiring soon: ${ct.isExpiringSoon ? 'Yes' : 'No'}`,
                    suggestions,
                };
            }
            default:
                return { summary: '', suggestions };
        }
    } catch {
        return { summary: '', suggestions };
    }
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------
function TypingIndicator({ color }: { color: string }) {
    return (
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '12px 18px' }}>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: color,
                        opacity: 0.5,
                        display: 'inline-block',
                        animation: `nexusAiBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                    }}
                />
            ))}
            <style>{`
                @keyframes nexusAiBounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                }
            `}</style>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SalesAssistant() {
    const pathname = usePathname();
    const { user } = useAuth();
    const { token: themeToken } = theme.useToken();

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageCtx, setPageCtx] = useState<PageContext>({ summary: '', suggestions: SUGGESTIONS.default });
    const [contextLoading, setContextLoading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<any>(null);

    // Theme-aware styles
    const primary = themeToken.colorPrimary;
    const styles = useMemo(() => ({
        fab: {
            position: 'fixed' as const,
            bottom: 28,
            right: 28,
            zIndex: 999,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: primary,
            border: 'none',
            boxShadow: `0 4px 14px ${themeToken.colorPrimaryBg}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            color: '#fff',
            fontSize: 24,
        } as React.CSSProperties,
        fabHoverShadow: `0 6px 20px ${themeToken.colorPrimaryBgHover}`,
        fabShadow: `0 4px 14px ${themeToken.colorPrimaryBg}`,
        bubbleBase: {
            maxWidth: '82%',
            padding: '10px 14px',
            borderRadius: 14,
            fontSize: 13,
            lineHeight: 1.55,
            wordBreak: 'break-word' as const,
            whiteSpace: 'pre-wrap' as const,
        },
        userBubble: {
            background: primary,
            color: '#fff',
            borderBottomRightRadius: 4,
            marginLeft: 'auto',
        },
        aiBubble: {
            background: themeToken.colorFillSecondary,
            color: themeToken.colorText,
            borderBottomLeftRadius: 4,
            marginRight: 'auto',
        },
        divider: `1px solid ${themeToken.colorBorderSecondary}`,
    }), [primary, themeToken]);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, loading]);

    // Fetch page context when drawer opens or pathname changes while open
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        setContextLoading(true);
        const { type, id } = parsePageInfo(pathname);
        fetchPageContext(type, id).then((ctx) => {
            if (!cancelled) {
                setPageCtx(ctx);
                setContextLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [open, pathname]);

    const buildSystemPrompt = useCallback(() => {
        const userInfo = user
            ? `Current user: ${user.firstName} ${user.lastName} (${user.roles?.join(', ') || 'Unknown role'}), Tenant: ${user.tenantName || user.tenantId}.`
            : '';
        const pageInfo = pageCtx.summary ? `Current page context: ${pageCtx.summary}.` : '';
        return `You are Nexus AI, a sales assistant embedded in an enterprise CRM called Nexus. You help sales teams close deals faster by providing actionable insights, email drafts, objection handling scripts, and deal summaries. Be concise, professional, and output in plain text unless formatting clearly helps.\n${userInfo}\n${pageInfo}`;
    }, [user, pageCtx.summary]);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || loading) return;

        const userMsg: ChatMessage = { role: 'user', content: content.trim() };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system: buildSystemPrompt(),
                    messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Request failed (${res.status})`);
            }

            const data = await res.json();
            setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
        } catch (err: any) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: `Sorry, I encountered an error: ${err.message}` },
            ]);
        } finally {
            setLoading(false);
        }
    }, [messages, loading, buildSystemPrompt]);

    const handleClear = () => {
        setMessages([]);
        setInput('');
    };

    const handleOpen = () => {
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 300);
    };

    return (
        <>
            {/* Floating Action Button */}
            <Tooltip title="Nexus AI Assistant" placement="left">
                <button
                    type="button"
                    style={styles.fab}
                    onClick={handleOpen}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.08)';
                        e.currentTarget.style.boxShadow = styles.fabHoverShadow;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = styles.fabShadow;
                    }}
                    aria-label="Open AI Assistant"
                >
                    <RobotOutlined />
                </button>
            </Tooltip>

            {/* Drawer */}
            <Drawer
                title={
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RobotOutlined style={{ color: primary }} />
                        Nexus AI Assistant
                    </span>
                }
                placement="right"
                size="default"
                open={open}
                onClose={() => setOpen(false)}
                styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
                extra={
                    <Tooltip title="Clear conversation">
                        <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={handleClear}
                            disabled={messages.length === 0}
                        />
                    </Tooltip>
                }
            >
                {/* Messages area */}
                <div
                    ref={scrollRef}
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                    }}
                >
                    {messages.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', color: themeToken.colorTextSecondary, marginTop: 40 }}>
                            <RobotOutlined style={{ fontSize: 36, color: primary, marginBottom: 12 }} />
                            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: themeToken.colorText }}>How can I help?</div>
                            <div style={{ fontSize: 12 }}>
                                {contextLoading ? 'Loading page context...' : pageCtx.summary || 'Ask me anything about your sales pipeline.'}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <div style={{
                                ...styles.bubbleBase,
                                ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble),
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div style={{ ...styles.bubbleBase, ...styles.aiBubble }}>
                                <TypingIndicator color={themeToken.colorTextSecondary} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggested prompts */}
                <div style={{ padding: '8px 14px 4px', borderTop: styles.divider, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {pageCtx.suggestions.map((s) => (
                        <Tag
                            key={s}
                            style={{ cursor: 'pointer', borderRadius: 12, fontSize: 12 }}
                            color="blue"
                            onClick={() => !loading && sendMessage(s)}
                        >
                            {s}
                        </Tag>
                    ))}
                </div>

                {/* Input area */}
                <div style={{ padding: '10px 14px 14px', display: 'flex', gap: 8 }}>
                    <Input.TextArea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPressEnter={(e) => {
                            if (!e.shiftKey) {
                                e.preventDefault();
                                sendMessage(input);
                            }
                        }}
                        placeholder="Ask Nexus AI..."
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        disabled={loading}
                        style={{ borderRadius: 10 }}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={() => sendMessage(input)}
                        loading={loading}
                        disabled={!input.trim()}
                        style={{ borderRadius: 10, height: 'auto' }}
                    />
                </div>
            </Drawer>
        </>
    );
}
