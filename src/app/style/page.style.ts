import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  layout: css`
    min-height: 100vh;
    background: ${token.colorBgContainer};
    overflow: hidden;
    position: relative;
  `,
  decorationTop: css`
    position: absolute;
    top: -10%;
    right: -5%;
    width: 40vw;
    height: 40vw;
    background: rgba(24, 144, 255, 0.05);
    borderRadius: 50%;
    filter: blur(80px);
    z-index: 0;
  `,
  decorationBottom: css`
    position: absolute;
    bottom: -10%;
    left: -5%;
    width: 30vw;
    height: 30vw;
    background: rgba(11, 59, 115, 0.05);
    borderRadius: 50%;
    filter: blur(60px);
    z-index: 0;
  `,
  header: css`
    background: transparent;
    padding: clamp(12px, 2vh, 20px) clamp(16px, 5vw, 48px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  `,
  logoWrapper: css`
    display: flex;
    align-items: center;
    gap: 12px;
  `,
  logoImage: css`
    width: 32px;
    height: auto;
    flex-shrink: 0;
  `,
  logo: css`
    font-size: 32px;
    font-weight: 900;
    color: ${token.colorPrimary};
    letter-spacing: -1px;
    line-height: 1;
    display: flex;
    align-items: center;
  `,
  navLink: css`
    font-size: 15px;
    font-weight: 500;
  `,
  primaryButtonSmall: css`
    height: 36px;
    padding: 0 20px;
    font-size: 14px;
    border-radius: 18px;
  `,
  content: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    padding: 0 24px;
    flex: 1;
  `,
  heroSection: css`
    text-align: center;
    max-width: 720px;
    margin-top: -40px;
  `,
  title: css`
    font-size: clamp(32px, 6vw, 64px);
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 24px;
    letter-spacing: -1.5px;
    color: ${token.colorText};
  `,
  gradientText: css`
    background: linear-gradient(90deg, #1890ff, #0b3b73);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  paragraph: css`
    font-size: clamp(16px, 1.5vw, 18px);
    color: ${token.colorTextSecondary};
    margin-bottom: 40px;
    font-weight: 400;
    max-width: 540px;
    margin-inline: auto;
  `,
  primaryButton: css`
    height: 54px;
    padding: 0 36px;
    font-size: 17px;
    border-radius: 10px;
    box-shadow: 0 10px 20px rgba(24, 144, 255, 0.2);
  `,
}));

export default useStyles;
