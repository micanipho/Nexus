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
    padding: clamp(12px, 3vh, 24px) clamp(16px, 5vw, 64px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  `,
  logoWrapper: css`
    display: flex;
    align-items: center;
    gap: clamp(12px, 2vw, 20px);
  `,
  logoImage: css`
    width: clamp(35px, 4vw, 54px);
    height: auto;
    flex-shrink: 0;
  `,
  logo: css`
    font-size: clamp(30px, 6vw, 62px);
    font-weight: 900;
    color: #0b3b73;
    letter-spacing: -1.5px;
    line-height: 1;
    display: flex;
    align-items: center;
  `,
  navLink: css`
    font-size: 16px;
    font-weight: 500;
  `,
  primaryButtonSmall: css`
    height: 40px;
    padding: 0 24px;
    font-size: 16px;
    border-radius: 20px;
  `,
  content: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    padding: 0 24px;
  `,
  heroSection: css`
    text-align: center;
    max-width: 800px;
  `,
  title: css`
    font-size: clamp(40px, 10vw, 84px);
    font-weight: 900;
    line-height: 1;
    margin-bottom: 32px;
    letter-spacing: -2px;
    color: #111;
  `,
  gradientText: css`
    background: linear-gradient(90deg, #1890ff, #0b3b73);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  paragraph: css`
    font-size: clamp(18px, 2vw, 24px);
    color: #666;
    margin-bottom: 48px;
    font-weight: 400;
    max-width: 600px;
    margin-inline: auto;
  `,
  primaryButton: css`
    height: 64px;
    padding: 0 48px;
    font-size: 20px;
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(24, 144, 255, 0.2);
  `,
}));

export default useStyles;
