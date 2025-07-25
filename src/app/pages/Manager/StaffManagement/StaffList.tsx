import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm, Input } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ManageStaffApi } from '../../../../api/manageStaff/manageStaffApi';
import type { StaffInfo } from '../../../../api/manageStaff/manageStaffInterface';

const StaffList: React.FC = () => {
  const [staffs, setStaffs] = useState<StaffInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

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

  const filteredStaffs = staffs.filter(staff =>
    staff.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
    (staff.phoneNumber && staff.phoneNumber.toLowerCase().includes(searchText.toLowerCase()))
  );

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
      title: 'Mã Nhân Viên',
      dataIndex: 'staffCode',
      key: 'staffCode',
    },
    {
      title: 'Mã Định Danh',
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
        <Input.Search
          placeholder="Tìm kiếm theo tên nhân viên"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ maxWidth: 300 }}
          allowClear
        />
      </div>
      <div className="w-full overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredStaffs}
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
