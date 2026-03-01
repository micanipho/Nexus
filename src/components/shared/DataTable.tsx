'use client';

import React from 'react';
import { Table, TableProps, Card } from 'antd';

interface DataTableProps<T> extends TableProps<T> {
  tableTitle?: string;
}

function DataTable<T extends object>({ tableTitle, ...props }: DataTableProps<T>) {
  return (
    <Card title={tableTitle} styles={{ body: { padding: 0 } }} variant="borderless">
      <Table<T> 
        {...props} 
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          ...props.pagination
        }} 
        scroll={{ x: 'max-content', ...props.scroll }}
      />
    </Card>
  );
}

export default DataTable;
