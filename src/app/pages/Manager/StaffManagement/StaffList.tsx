import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ManageStaffApi } from '../../../../api/manageStaff/manageStaffApi';
import type { StaffInfo } from '../../../../api/manageStaff/manageStaffInterface';

const StaffList: React.FC = () => {
  const [staffs, setStaffs] = useState<StaffInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const response = await ManageStaffApi.getAllStaff();
      if (response.isSuccess && response.result) {
        setStaffs(response.result);
      } else {
        setStaffs([]);
        message.error(response.message || 'Failed to fetch staff');
      }
    } catch (error) {
      setStaffs([]);
      message.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<StaffInfo> = [
    {
      title: 'Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Địa Chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Mã Danh Tính',
      dataIndex: 'identityId',
      key: 'identityId',
    },
    {
      title: 'Giới Tính',
      dataIndex: 'sex',
      key: 'sex',
    },
    {
      title: 'Ngày Sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
    },
  ];

  return (
    <div className="w-full h-full p-2 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        
      </div>
      <div className="w-full overflow-hidden">
        <Table
          columns={columns}
          dataSource={staffs}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          className="w-full"
          size="middle"
        />
      </div>
    </div>
  );
};

export default StaffList;
