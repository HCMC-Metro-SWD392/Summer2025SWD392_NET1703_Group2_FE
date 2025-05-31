import React, { useState } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  role: string;
  department: string;
  createdAt: string;
}

// Mock data
const mockStaffs: Staff[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '0123456789',
    status: 'Active',
    role: 'Staff',
    department: 'IT',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '0987654321',
    status: 'Active',
    role: 'Staff',
    department: 'HR',
    createdAt: '2024-01-16',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '0123456780',
    status: 'Inactive',
    role: 'Staff',
    department: 'Finance',
    createdAt: '2024-01-17',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '0987654320',
    status: 'Active',
    role: 'Staff',
    department: 'IT',
    createdAt: '2024-01-18',
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david.brown@example.com',
    phone: '0123456781',
    status: 'Active',
    role: 'Staff',
    department: 'HR',
    createdAt: '2024-01-19',
  },
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '0987654322',
    status: 'Inactive',
    role: 'Staff',
    department: 'Finance',
    createdAt: '2024-01-20',
  },
  {
    id: '7',
    name: 'Robert Wilson',
    email: 'robert.wilson@example.com',
    phone: '0123456782',
    status: 'Active',
    role: 'Staff',
    department: 'IT',
    createdAt: '2024-01-21',
  },
  {
    id: '8',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    phone: '0987654323',
    status: 'Active',
    role: 'Staff',
    department: 'HR',
    createdAt: '2024-01-22',
  },
  {
    id: '9',
    name: 'James Taylor',
    email: 'james.taylor@example.com',
    phone: '0123456783',
    status: 'Inactive',
    role: 'Staff',
    department: 'Finance',
    createdAt: '2024-01-23',
  },
  {
    id: '10',
    name: 'Emma Martinez',
    email: 'emma.martinez@example.com',
    phone: '0987654324',
    status: 'Active',
    role: 'Staff',
    department: 'IT',
    createdAt: '2024-01-24',
  },
];

const StaffList: React.FC = () => {
  const [staffs, setStaffs] = useState<Staff[]>(mockStaffs);
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    try {
      setStaffs(staffs.filter(staff => staff.id !== id));
      message.success('Staff deleted successfully');
    } catch (error) {
      message.error('Failed to delete staff');
      console.error('Error deleting staff:', error);
    }
  };

  const columns: ColumnsType<Staff> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      filters: [
        { text: 'IT', value: 'IT' },
        { text: 'HR', value: 'HR' },
        { text: 'Finance', value: 'Finance' },
      ],
      onFilter: (value, record) => record.department === value,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'Staff' ? 'blue' : 'green'}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
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
            title="Are you sure you want to delete this staff?"
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
    console.log('Edit staff:', id);
  };

  const handleAdd = () => {
    // TODO: Implement add functionality
    console.log('Add new staff');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Add New Staff
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={staffs}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} staff members`,
        }}
      />
    </div>
  );
};

export default StaffList;
