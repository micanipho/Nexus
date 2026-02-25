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
    width: clamp(400px, 60vw, 720px);
    padding: clamp(32px, 5vw, 80px);
    box-shadow: ${token.boxShadowTertiary};
    border-radius: 24px;
    background: ${token.colorBgContainer};
  `,
  header: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: clamp(40px, 6vh, 64px);
  `,
  logoWrapper: css`
    display: flex;
    align-items: center;
    gap: clamp(12px, 2vw, 24px);
    margin-bottom: 16px;
  `,
  logo: css`
    width: clamp(56px, 7vw, 88px);
    height: auto;
  `,
  title: css`
    font-size: clamp(40px, 5.5vw, 72px);
    font-weight: 900 ;
    color: ${token.colorPrimary};
    margin: 0;
    line-height: 1;
    letter-spacing: -3px;
    display: flex;
    align-items: center;
  `,
  subtitle: css`
    font-size: clamp(18px, 2vw, 24px);
  `,
  errorAlert: css`
    margin-bottom: 32px;
  `,
  formItem: css`
    margin-bottom: 24px;
  `,
  passwordItem: css`
    margin-bottom: 32px;
  `,
  footer: css`
    text-align: center;
    margin-top: 40px;
    font-size: clamp(16px, 1.2vw, 20px);
  `,
  registerParagraph: css`
    margin-top: 16px;
  `,
  submitButton: css`
    width: 100%;
    height: clamp(64px, 8vh, 80px);
    font-size: clamp(18px, 1.5vw, 24px);
    font-weight: 700;
    border-radius: 16px;
    margin-top: 24px;
  `,
  input: css`
    height: clamp(56px, 7vh, 72px);
    font-size: clamp(16px, 1.2vw, 20px);
    border-radius: 12px;
  `,
}));

export default useStyles;
