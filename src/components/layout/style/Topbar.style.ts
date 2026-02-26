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
  bellIcon: css`
    font-size: 18px;
  `,
  userSpace: css`
    cursor: pointer;
  `,
}));

export default useStyles;
