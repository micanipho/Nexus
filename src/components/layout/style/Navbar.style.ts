import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  header: css`
    position: fixed;
    top: 16px;
    left: 24px;
    right: 24px;
    z-index: 1000;
    display: flex;
    align-items: center;
    padding: 0 24px;
    background: ${token.colorBgContainer}b3; /* b3 is 70% opacity in hex */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 16px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.07);
    border: 1px solid ${token.colorBorderSecondary};
    height: 72px;
    transition: all 0.3s ease;

    @media (max-width: 768px) {
      left: 12px;
      right: 12px;
      top: 12px;
      padding: 0 16px;
    }
  `,
  logoContainer: css`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: 32px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    img {
      filter: drop-shadow(0 2px 6px ${token.colorPrimary}40);
      transition: all 0.3s ease;
    }
    
    &:hover {
      transform: translateY(-1px) scale(1.02);
      
      img {
        filter: drop-shadow(0 4px 12px ${token.colorPrimary}80);
      }
      
      .logo-text {
        text-shadow: 0 0 16px ${token.colorPrimary}60;
      }
    }
    
    .logo-text {
      font-size: 20px;
      font-weight: 800; /* Bolder */
      color: ${token.colorPrimary};
      margin: 0;
      letter-spacing: -0.5px;
      transition: all 0.3s ease;
    }
  `,
  menuContainer: css`
    flex: 1;
    display: flex;
    justify-content: center;

    .ant-menu {
      background: transparent;
      border-bottom: none;
      line-height: 70px;
    }

    .ant-menu-item {
      font-weight: 500;
      color: ${token.colorText} !important;
      padding: 0 20px;
      border-radius: 8px;
      margin: 0 4px;
      transition: all 0.2s;

      &:hover, &.ant-menu-item-active {
        background: ${token.colorFillTertiary} !important;
        color: ${token.colorPrimary} !important;
      }

      &.ant-menu-item-selected {
        background: ${token.colorPrimaryBg} !important;
        color: ${token.colorPrimary} !important;
        
        &::after {
          display: none; // Remove bottom border
        }
      }
    }
  `,
  rightSection: css`
    display: flex;
    align-items: center;
    gap: 16px;
  `,
  userInfo: css`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.2;
    
    .tenant-name {
      font-size: 11px;
      color: ${token.colorTextSecondary};
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: ${token.colorText};
    }
  `,
  desktopOnly: css`
    @media (max-width: 992px) {
      display: none;
    }
  `,
  mobileOnly: css`
    display: none;
    @media (max-width: 992px) {
      display: block;
    }
  `,
}));

export default useStyles;
