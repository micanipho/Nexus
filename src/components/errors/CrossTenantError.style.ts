import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 48px 24px;
  `,
  icon: css`
    font-size: 64px;
    color: ${token.colorError};
  `,
  helpText: css`
    text-align: center;
    max-width: 480px;
    margin: 0 auto;
  `,
}));

export default useStyles;
