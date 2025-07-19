import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AdminManagerApi } from '../../../../api/manageAdminManager/AdminManagerApi';
import type { GetAdminManagerDTO } from '../../../../api/manageAdminManager/AdminManagerInterface';

const AdminList: React.FC = () => {
  const [admins, setAdmins] = useState<GetAdminManagerDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await AdminManagerApi.getAllAdmins({
        pageNumber: 1,
        pageSize: 10,
      });
      if (response.statusCode === 200 && Array.isArray(response.data)) {
        setAdmins(response.data);
      } else {
        setAdmins([]);
        message.error('No admins found or failed to fetch admins.');
      }
    } catch (error) {
      setAdmins([]);
      message.error('Failed to fetch admins');
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
      <h2>Danh Sách Admin</h2>
      <Table
        columns={columns}
        dataSource={admins}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        className="w-full"
        size="middle"
        locale={{ emptyText: 'Không tìm thấy admin nào.' }}
      />
    </div>
  );
};

export default AdminList;
