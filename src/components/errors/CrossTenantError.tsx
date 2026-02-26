'use client';

import React from 'react';
import { Result, Button, Typography } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import useStyles from './CrossTenantError.style';

const { Paragraph } = Typography;

interface CrossTenantErrorProps {
  onReset?: () => void;
}

const CrossTenantError: React.FC<CrossTenantErrorProps> = ({ onReset }) => {
  const router = useRouter();
  const { styles } = useStyles();

  const handleGoToDashboard = () => {
    onReset?.();
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      <Result
        icon={<StopOutlined className={styles.icon} />}
        status="error"
        title="Access Denied"
        subTitle="The resource you're trying to access belongs to a different organization."
        extra={[
          <Button
            key="dashboard"
            type="primary"
            size="large"
            onClick={handleGoToDashboard}
          >
            Go to Dashboard
          </Button>,
        ]}
      >
        <Paragraph type="secondary" className={styles.helpText}>
          If you believe this is a mistake, please contact your organization administrator
          or switch to the correct organization.
        </Paragraph>
      </Result>
    </div>
  );
};

export default CrossTenantError;
