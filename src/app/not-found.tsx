'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
import { HomeOutlined } from '@ant-design/icons';

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f5f5f5'
    }}>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button 
            type="primary" 
            icon={<HomeOutlined />} 
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        }
      />
    </div>
  );
}
