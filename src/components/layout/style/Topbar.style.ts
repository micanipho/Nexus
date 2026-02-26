import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  header: css`
    padding: 0 24px;
    background: ${token.colorBgContainer};
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 1;
    width: 100%;
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,
  menuBtnWrapper: css`
    display: none;
    @media (max-width: 768px) {
      display: flex;
      align-items: center;
    }
  `,
  userSpace: css`
    padding: 4px 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  userName: css`
    font-weight: 500;
    font-size: 14px;
    color: ${token.colorText};
  `,
  tenantInfo: css`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-right: 8px;
    padding: 2px 8px;
    background: ${token.colorFillQuaternary};
    border-radius: 4px;
    border: 1px solid ${token.colorBorderSecondary};
    @media (max-width: 640px) {
      display: none;
    }
  `,
  tenantName: css`
    font-size: 11px;
    font-weight: 600;
    color: ${token.colorTextSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  logoutDesktop: css`
    @media (max-width: 768px) {
      display: none !important;
    }
  `,
  logoutMobile: css`
    display: none !important;
    @media (max-width: 768px) {
      display: inline-flex !important;
    }
  `,
}));

export default useStyles;
