import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  sider: css`
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    border-right: 1px solid ${token.colorBorderSecondary};
  `,
  logoContainer: css`
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  `,
  logo: css`
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  `,
  logoText: css`
    margin: 0;
    color: ${token.colorPrimary};
    font-size: 1.25rem;
    font-weight: bold;
    letter-spacing: 1px;
    line-height: 1;
    display: flex;
    align-items: center;
  `,
  menu: css`
    border-right: 0;
  `,
}));

export default useStyles;
