import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  layout: css`
    min-height: 100vh;
    background: #f0f2f5;
  `,
  mainSection: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 100px; /* Room for floating Navbar */
  `,
  content: css`
    margin: 0 auto;
    width: 100%;
    max-width: 1400px;
    padding: 0 24px 24px 24px;
    min-height: calc(100vh - 100px);
    border-radius: ${token.borderRadiusLG}px;
  `,
}));

export default useStyles;
