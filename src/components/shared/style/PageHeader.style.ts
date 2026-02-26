import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    margin-bottom: 24px;
  `,
  breadcrumb: css`
    margin-bottom: 8px;
  `,
  headerContent: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  `,
  title: css`
    margin: 0 !important;
    word-break: break-word;
    white-space: normal;
  `,
}));

export default useStyles;
