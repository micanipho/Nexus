'use client';

import React, { useEffect } from 'react';
import { Button, Result, Typography } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
  }, [error]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f5f5f5'
    }}>
      <Result
        status="error"
        title="Something went wrong"
        subTitle="An unexpected error occurred in the Nexus application."
        extra={[
          <Button 
            type="primary" 
            key="retry" 
            icon={<ReloadOutlined />} 
            onClick={() => reset()}
          >
            Try Again
          </Button>,
          <Button 
            key="home" 
            icon={<HomeOutlined />} 
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </Button>,
        ]}
      >
        <div className="desc">
          <Paragraph>
            <Text
              strong
              style={{
                fontSize: 16,
              }}
            >
              Error Details:
            </Text>
          </Paragraph>
          <Paragraph>
            <Text type="secondary">{error.message || 'Unknown application error'}</Text>
          </Paragraph>
          {error.digest && (
            <Paragraph>
              <Text type="secondary" style={{ fontSize: 12 }}>Error ID: {error.digest}</Text>
            </Paragraph>
          )}
        </div>
      </Result>
    </div>
  );
}
