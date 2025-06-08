import React, { useState } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

interface Promotion {
  id: string;
  name: string;
  type: 'single_ride' | 'periodic' | 'holiday' | 'loyalty';
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableTickets: string[];
  minimumPurchase: number;
  maxDiscount: number;
}

// Mock data
const mockPromotions: Promotion[] = [
  {
    id: '1',
    name: 'Summer Special',
    type: 'single_ride',
    description: 'Special discount for summer season',
    discountType: 'percentage',
    discountValue: 20,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    isActive: true,
    applicableTickets: ['metro_line_1', 'metro_line_2'],
    minimumPurchase: 0,
    maxDiscount: 100,
  },
  {
    id: '2',
    name: 'Weekend Pass',
    type: 'periodic',
    description: 'Weekend travel package',
    discountType: 'fixed',
    discountValue: 50,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    applicableTickets: ['metro_line_1', 'metro_line_2', 'metro_line_3'],
    minimumPurchase: 100,
    maxDiscount: 200,
  },
  {
    id: '3',
    name: 'Holiday Special',
    type: 'holiday',
    description: 'Special rates for holiday season',
    discountType: 'percentage',
    discountValue: 15,
    startDate: '2024-12-20',
    endDate: '2025-01-05',
    isActive: false,
    applicableTickets: ['metro_line_1', 'bus'],
    minimumPurchase: 50,
    maxDiscount: 150,
  },
];

const PromotionList: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    try {
      setPromotions(promotions.filter(promo => promo.id !== id));
      message.success('Promotion deleted successfully');
    } catch (error) {
      message.error('Failed to delete promotion');
      console.error('Error deleting promotion:', error);
    }
  };

  const handleStatusChange = (id: string, checked: boolean) => {
    try {
      setPromotions(promotions.map(promo => 
        promo.id === id ? { ...promo, isActive: checked } : promo
      ));
      message.success(`Promotion ${checked ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      message.error('Failed to update promotion status');
      console.error('Error updating promotion status:', error);
    }
  };

  const columns: ColumnsType<Promotion> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={
          type === 'single_ride' ? 'blue' :
          type === 'periodic' ? 'green' :
          type === 'holiday' ? 'orange' : 'purple'
        }>
          {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </Tag>
      ),
      filters: [
        { text: 'Single Ride', value: 'single_ride' },
        { text: 'Periodic', value: 'periodic' },
        { text: 'Holiday', value: 'holiday' },
        { text: 'Loyalty', value: 'loyalty' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (_, record) => (
        <span>
          {record.discountType === 'percentage' 
            ? `${record.discountValue}%`
            : `$${record.discountValue}`}
        </span>
      ),
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => (
        <span>
          {dayjs(record.startDate).format('MMM D, YYYY')} - {dayjs(record.endDate).format('MMM D, YYYY')}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this promotion?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (id: string) => {
    // TODO: Implement edit functionality
    console.log('Edit promotion:', id);
  };

  const handleAdd = () => {
    navigate('/manager/create-promotion');
  };

  return (
    <div className="w-full h-full p-2 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Promotion Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Create Promotion
        </Button>
      </div>
      <div className="w-full overflow-hidden">
        <Table
          columns={columns}
          dataSource={promotions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} promotions`,
            responsive: true,
          }}
          scroll={{ x: 'max-content' }}
          className="w-full"
          size="middle"
        />
      </div>
    </div>
  );
};

export default PromotionList;
