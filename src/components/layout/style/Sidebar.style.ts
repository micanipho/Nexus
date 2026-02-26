import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  sider: css`
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    background: #0B3B73 !important;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  `,
  logoContainer: css`
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.05);
  `,
  logo: css`
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    filter: brightness(0) invert(1);
  `,
  logoText: css`
    margin: 0;
    color: #FFFFFF;
    font-size: 1.25rem;
    font-weight: bold;
    letter-spacing: 1px;
    line-height: 1;
    display: flex;
    align-items: center;
  `,
  menu: css`
    background: transparent !important;
    border-right: 0;
    
    .ant-menu-item {
      margin: 4px 8px !important;
      width: calc(100% - 16px) !important;
      border-radius: 8px !important;
    }

    .ant-menu-item-selected {
      background-color: #0B2545 !important;
      color: #FFFFFF !important;
    }
  `,
}));

export default useStyles;
