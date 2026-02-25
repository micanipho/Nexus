import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  header: css`
    padding: 0 24px;
    background: ${token.colorBgContainer};
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: sticky;
    top: 0;
    z-index: 1;
    width: 100%;
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,
  bellIcon: css`
    font-size: 18px;
  `,
  userSpace: css`
    cursor: pointer;
  `,
}));

export default useStyles;
