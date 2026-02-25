import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${token.colorBgLayout};
    padding: 24px;
  `,
  card: css`
    width: 100%;
    max-width: 440px;
    padding: clamp(24px, 4vw, 40px);
    box-shadow: ${token.boxShadowTertiary};
    border-radius: 16px;
    background: ${token.colorBgContainer};
  `,
  header: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
  `,
  logoWrapper: css`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  `,
  logo: css`
    width: 48px;
    height: auto;
  `,
  title: css`
    font-size: 32px;
    font-weight: 900;
    color: ${token.colorPrimary};
    margin: 0;
    line-height: 1;
    letter-spacing: -1.5px;
    display: flex;
    align-items: center;
  `,
  subtitle: css`
    font-size: 16px;
  `,
  errorAlert: css`
    margin-bottom: 24px;
  `,
  formItem: css`
    margin-bottom: 20px;
  `,
  passwordItem: css`
    margin-bottom: 24px;
  `,
  footer: css`
    text-align: center;
    margin-top: 32px;
    font-size: 14px;
  `,
  registerParagraph: css`
    margin-top: 12px;
  `,
  submitButton: css`
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 10px;
    margin-top: 16px;
  `,
  input: css`
    height: 44px;
    font-size: 14px;
    border-radius: 8px;
  `,
}));

export default useStyles;
