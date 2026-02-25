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
  `,
  logoText: css`
    margin: 0;
    color: ${token.colorPrimary};
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 2px;
  `,
  menu: css`
    border-right: 0;
  `,
}));

export default useStyles;
