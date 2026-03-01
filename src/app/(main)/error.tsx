'use client';

import React, { useEffect } from 'react';
import { Button, Result, Card } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
  }, [error]);

  return (
    <div style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
      <Card bordered={false} className="shadow-sm">
        <Result
          status="500"
          title="Section Error"
          subTitle="We encountered an issue loading this part of the dashboard."
          extra={
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => reset()}
            >
              Reload Section
            </Button>
          }
        />
      </Card>
    </div>
  );
}
