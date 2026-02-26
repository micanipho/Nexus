import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  productionBrowserSourceMaps: false,
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/plots',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    'rc-tree',
    'rc-table'
  ],
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default analyzer(nextConfig);
