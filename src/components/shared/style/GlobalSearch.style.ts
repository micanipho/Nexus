import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  modal: {
    '.ant-modal-content': {
      padding: 0,
      borderRadius: '8px',
      overflow: 'hidden',
      background: token.colorBgContainer,
    },
    '.ant-modal-body': {
      padding: 0,
    }
  },
  searchContainer: {
    padding: '12px 16px',
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
  },
  searchInput: {
    '.ant-input-affix-wrapper': {
      border: 'none',
      boxShadow: 'none !important',
      backgroundColor: 'transparent',
      padding: '8px 0',
    },
    '.ant-input': {
      fontSize: '18px',
      color: token.colorText,
    },
    '.ant-input-search-button': {
      display: 'none',
    }
  },
  resultsContainer: {
    maxHeight: '450px',
    overflowY: 'auto',
    padding: '8px 0',
  },
  sectionHeader: {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: token.colorTextDescription,
    background: token.colorFillAlter,
  },
  resultItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '&:hover': {
      background: token.colorFillTertiary,
    }
  },
  selectedItem: {
    background: token.colorFillTertiary,
  },
  icon: {
    fontSize: '20px',
    color: token.colorPrimary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    background: token.colorPrimaryBg,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: 500,
    color: token.colorText,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  description: {
    fontSize: '12px',
    color: token.colorTextDescription,
  },
  empty: {
    padding: '32px',
    textAlign: 'center',
    color: token.colorTextDescription,
  }
}));

export default useStyles;
