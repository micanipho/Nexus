import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  value: css`
    font-weight: bold;
  `,
  trendContainer: css`
    margin-top: 8px;
  `,
  trendText: css`
    margin-left: 8px;
  `,
}));

export default useStyles;
