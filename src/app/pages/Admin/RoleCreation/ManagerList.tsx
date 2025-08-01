import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AdminManagerApi } from '../../../../api/manageAdminManager/AdminManagerApi';
import type { GetAdminManagerDTO } from '../../../../api/manageAdminManager/AdminManagerInterface';

const ManagerList: React.FC = () => {
  const [managers, setManagers] = useState<GetAdminManagerDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const response = await AdminManagerApi.getAllManagers({
        pageNumber: 1,
        pageSize: 10,
      });
      if (response.statusCode === 200 && Array.isArray(response.data)) {
        setManagers(response.data);
      } else {
        setManagers([]);
        message.error('No managers found or failed to fetch managers.');
      }
    } catch (error) {
      setManagers([]);
      message.error('Failed to fetch managers');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<GetAdminManagerDTO> = [
    {
      title: 'Tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Tên Tài Khoản',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Địa Chỉ',
      dataIndex: 'address',
      key: 'address',
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
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Mã Định Danh',
      dataIndex: 'identityId',
      key: 'identityId',
    },
  ];

  return (
    <div className="w-full h-full p-2 md:p-6">
      <h2>Danh Sách Quản Lý</h2>
      <Table
        columns={columns}
        dataSource={managers}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        className="w-full"
        size="middle"
        locale={{ emptyText: 'Không tìm thấy quản lý nào.' }}
      />
    </div>
  );
};

export default ManagerList;
