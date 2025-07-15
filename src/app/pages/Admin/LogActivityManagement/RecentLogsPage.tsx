import React, { useEffect, useState } from 'react';
import { Table, Card, DatePicker, Tag, Spin } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import axiosInstance from '../../../../settings/axiosInstance';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { RangePicker } = DatePicker;

const RecentLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('week'),
    dayjs().endOf('week'),
  ]);

  const fetchLogs = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const [dateFrom, dateTo] = dateRange;

      const res = await axiosInstance.get('/api/Log/all-logs', {
        params: {
          pageNumber: page,
          pageSize: pageSize,
          dateFrom: dateFrom.format('YYYY-MM-DDT00:00:00'),
          dateTo: dateTo.format('YYYY-MM-DDT23:59:59'),
        },
      });

      const rawData = res.data?.result ?? [];

      const transformed = rawData.map((item: any, index: number) => ({
        key: index,
        user: item.userFullname ?? 'Không rõ',
        action: item.description ?? '',
        time: dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        status:
          item.logType === 'Create'
            ? 'success'
            : item.logType === 'Update'
            ? 'processing'
            : 'error',
      }));

      setLogs(transformed);
      setPagination({
        current: page,
        pageSize,
        total: res.data?.total ?? rawData.length,
      });
    } catch (err) {
      console.error('Lỗi khi tải logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.current, pagination.pageSize);
  }, [dateRange]);

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          success: { color: 'green', text: 'Tạo mới' },
          processing: { color: 'blue', text: 'Chỉnh sửa' },
          error: { color: 'red', text: 'Xóa' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Hoạt động gần đây</h1>

      <div className="mb-4">
        <RangePicker
          value={dateRange}
          onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          allowClear={false}
          format="DD/MM/YYYY"
        />
      </div>

      <Card>
        <Spin spinning={loading}>
          <Table
            dataSource={logs}
            columns={columns}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hoạt động`,
            }}
            onChange={(p) => fetchLogs(p.current!, p.pageSize!)}
            scroll={{ x: 'max-content' }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default RecentLogsPage;
