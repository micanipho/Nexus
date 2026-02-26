import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  layout: css`
    min-height: 100vh;
  `,
  mainSection: css`
    margin-left: 200px;
    transition: margin-left 0.2s;
    
    @media (max-width: 768px) {
      margin-left: 0;
    }
  `,
  content: css`
    margin: 24px 16px;
    padding: 24px;
    min-height: 280px;
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
  `,
}));

export default useStyles;
