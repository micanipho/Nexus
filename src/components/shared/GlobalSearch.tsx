'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Input, List, Spin, Empty, Typography } from 'antd';
import { 
  SearchOutlined, 
  TeamOutlined, 
  SolutionOutlined, 
  FileTextOutlined,
  EnterOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import clientService from '@/services/clientService';
import opportunityService from '@/services/opportunityService';
import proposalService from '@/services/proposalService';
import { Client, Opportunity, Proposal } from '@/types';
import useStyles from './style/GlobalSearch.style';

const { Text } = Typography;

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

type SearchResult = 
  | { type: 'client'; data: Client }
  | { type: 'opportunity'; data: Opportunity }
  | { type: 'proposal'; data: Proposal };

const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const { styles, cx } = useStyles();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    clients: Client[];
    opportunities: Opportunity[];
    proposals: Proposal[];
  }>({ clients: [], opportunities: [], proposals: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<any>(null);

  // Flattened results for keyboard navigation
  const flatResults = useMemo(() => {
    const list: SearchResult[] = [];
    results.clients.forEach(c => list.push({ type: 'client', data: c }));
    results.opportunities.forEach(o => list.push({ type: 'opportunity', data: o }));
    results.proposals.forEach(p => list.push({ type: 'proposal', data: p }));
    return list;
  }, [results]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults({ clients: [], opportunities: [], proposals: [] });
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ clients: [], opportunities: [], proposals: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [clientsRes, oppsRes, proposalsRes] = await Promise.all([
          clientService.getClients({ searchTerm: query, pageNumber: 1, pageSize: 5 }),
          opportunityService.getOpportunities({ searchTerm: query, pageNumber: 1, pageSize: 5 }),
          proposalService.getProposals({ searchTerm: query, pageNumber: 1, pageSize: 5 })
        ]);

        setResults({
          clients: clientsRes.items || [],
          opportunities: oppsRes.items || [],
          proposals: proposalsRes.items || []
        });
        setSelectedIndex(0);
      } catch (error) {
        // Silently fail search errors
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = (result: SearchResult) => {
    onClose();
    switch (result.type) {
      case 'client':
        router.push(`/clients/${result.data.id}`);
        break;
      case 'opportunity':
        router.push(`/opportunities/${result.data.id}`);
        break;
      case 'proposal':
        router.push(`/proposals/${result.data.id}`);
        break;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleNavigate(flatResults[selectedIndex]);
    }
  };

  const renderResultItem = (result: SearchResult, index: number, overallIndex: number) => {
    const isSelected = overallIndex === selectedIndex;
    let icon = <TeamOutlined />;
    let title = '';
    let description = '';

    if (result.type === 'client') {
      icon = <TeamOutlined />;
      title = result.data.name;
      description = result.data.industry || 'No industry';
    } else if (result.type === 'opportunity') {
      icon = <SolutionOutlined />;
      title = result.data.title;
      description = `Stage: ${result.data.stage} • ${result.data.clientName}`;
    } else if (result.type === 'proposal') {
      icon = <FileTextOutlined />;
      title = result.data.title;
      description = `Status: ${result.data.statusName} • ${result.data.clientName}`;
    }

    return (
      <div 
        key={`${result.type}-${result.data.id}`}
        className={cx(styles.resultItem, isSelected && styles.selectedItem)}
        onClick={() => handleNavigate(result)}
        onMouseEnter={() => setSelectedIndex(overallIndex)}
      >
        <div className={styles.icon}>{icon}</div>
        <div className={styles.content}>
          <div className={styles.title}>{title}</div>
          <div className={styles.description}>{description}</div>
        </div>
        {isSelected && <EnterOutlined style={{ opacity: 0.5 }} />}
      </div>
    );
  };

  let currentOverallIndex = 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      className={styles.modal}
      width={600}
      centered
      destroyOnHidden
    >
      <div className={styles.searchContainer}>
        <Input
          ref={inputRef}
          prefix={<SearchOutlined style={{ fontSize: '20px', color: '#bfbfbf', marginRight: '8px' }} />}
          placeholder="Search clients, opportunities, proposals..."
          variant="borderless"
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>

      <div className={styles.resultsContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spin tip="Searching..." />
          </div>
        ) : query && flatResults.length === 0 ? (
          <Empty description="No results found" className={styles.empty} />
        ) : !query ? (
          <div className={styles.empty}>Type to search across Nexus...</div>
        ) : (
          <>
            {results.clients.length > 0 && (
              <div>
                <div className={styles.sectionHeader}>Clients</div>
                {results.clients.map((c, i) => renderResultItem({ type: 'client', data: c }, i, currentOverallIndex++))}
              </div>
            )}
            {results.opportunities.length > 0 && (
              <div>
                <div className={styles.sectionHeader}>Opportunities</div>
                {results.opportunities.map((o, i) => renderResultItem({ type: 'opportunity', data: o }, i, currentOverallIndex++))}
              </div>
            )}
            {results.proposals.length > 0 && (
              <div>
                <div className={styles.sectionHeader}>Proposals</div>
                {results.proposals.map((p, i) => renderResultItem({ type: 'proposal', data: p }, i, currentOverallIndex++))}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8c8c8c' }}>
        <div>
          <Text keyboard>↑↓</Text> to navigate <Text keyboard>Enter</Text> to select
        </div>
        <div>
          <Text keyboard>Esc</Text> to close
        </div>
      </div>
    </Modal>
  );
};

export default GlobalSearch;
