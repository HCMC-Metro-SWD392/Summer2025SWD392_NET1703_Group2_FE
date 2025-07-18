import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  message,
  Spin,
  Tag,
  Tooltip,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MetroLineApi } from '../../../../api/metroLine/MetroLineApi';
import type { GetMetroLineDTO } from '../../../../api/metroLine/MetroLineInterface';

const { Title } = Typography;
const { Option } = Select;

const MetroLineList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [metroLines, setMetroLines] = useState<GetMetroLineDTO[]>([]);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);

  const fetchMetroLines = async (isActive?: boolean | null) => {
    try {
      setLoading(true);
      const response = await MetroLineApi.getAllMetroLines(isActive);
      
      if (response.isSuccess && response.result) {
        setMetroLines(response.result);
      } else {
        message.error(response.message || 'Không thể tải danh sách tuyến Metro');
      }
    } catch (error) {
      console.error('Error fetching metro lines:', error);
      message.error('Có lỗi xảy ra khi tải danh sách tuyến Metro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetroLines(isActiveFilter);
  }, [isActiveFilter]);

  const handleFilterChange = (value: boolean | null) => {
    setIsActiveFilter(value);
  };

  const columns: ColumnsType<GetMetroLineDTO> = [
    {
      title: 'Số Tuyến',
      dataIndex: 'metroLineNumber',
      key: 'metroLineNumber',
      sorter: (a, b) => a.metroLineNumber.localeCompare(b.metroLineNumber),
      render: (number: string) => `Tuyến ${number}`,
    },
    {
      title: 'Tên Tuyến',
      dataIndex: 'metroName',
      key: 'metroName',
      render: (name: string | undefined) => name || 'Chưa đặt tên',
    },
    {
      title: 'Trạm Bắt Đầu',
      key: 'startStation',
      render: (_, record) => record.startStation?.name || 'N/A',
    },
    {
      title: 'Trạm Kết Thúc',
      key: 'endStation',
      render: (_, record) => record.endStation?.name || 'N/A',
    },
    {
      title: 'Số Trạm',
      key: 'stationCount',
      render: (_, record) => record.metroLineStations.length,
      sorter: (a, b) => a.metroLineStations.length - b.metroLineStations.length,
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/metro-line/${record.id}`)}
          >
            Chi Tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={2}>Quản Lý Tuyến Metro</Title>
        <Space>
          <Tooltip title="Làm mới">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchMetroLines(isActiveFilter)}
              loading={loading}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/create-metro-line')}
          >
            Thêm Tuyến Mới
          </Button>
        </Space>
      </Space>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Typography.Text strong>Lọc theo trạng thái:</Typography.Text>
          <Select
            style={{ width: 200 }}
            value={isActiveFilter}
            onChange={handleFilterChange}
            placeholder="Chọn trạng thái"
            allowClear
          >
            <Option value={null}>Tất cả</Option>
            <Option value={true}>Đang hoạt động</Option>
            <Option value={false}>Ngừng hoạt động</Option>
          </Select>
        </Space>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={metroLines}
            rowKey="id"
            pagination={{
              current,
              pageSize,
              showSizeChanger: true,
              onChange: (page, newPageSize) => {
                setCurrent(page);
                setPageSize(newPageSize);
              },
              showTotal: (total) => `Tổng số ${total} tuyến`,
              locale: {
                items_per_page: 'tuyến / trang',
                jump_to: 'Đi đến',
                jump_to_confirm: 'Xác nhận',
                page: 'Trang',
                prev_page: 'Trang trước',
                next_page: 'Trang sau',
                prev_5: '5 trang trước',
                next_5: '5 trang sau',
                prev_3: '3 trang trước',
                next_3: '3 trang sau',
              },
            }}
            locale={{
              emptyText: 'Không có dữ liệu',
              triggerDesc: 'Sắp xếp giảm dần',
              triggerAsc: 'Sắp xếp tăng dần',
              cancelSort: 'Hủy sắp xếp',
            }}
          />
        </Spin>
      </Card>
    </Space>
  );
};

export default MetroLineList;
