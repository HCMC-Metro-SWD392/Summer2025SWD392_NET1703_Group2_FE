import React, { useEffect, useState } from 'react';
import { Card, DatePicker, Table, Tag, Button, Form, Alert } from 'antd';
import axiosInstance from '../../../../settings/axiosInstance';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;

const TicketTransactionPage: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [noData, setNoData] = useState(false);
  const [showNoDataAlert, setShowNoDataAlert] = useState(false);

  const fetchData = async (params: {
    page?: number;
    pageSize?: number;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/DashBoard/ticket-statistics', {
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          isAccendingCreated: false,
          pageNumber: params.page,
          pageSize: params.pageSize,
        },
      });

      const items = res.data?.result ?? [];
      const total = 20;

      setNoData(items.length === 0);
      if (items.length === 0) {
        setShowNoDataAlert(true);
        setTimeout(() => setShowNoDataAlert(false), 3000);
      }

      const transformed = items.map((item: any, index: number) => ({
        key: item.orderCode ?? index,
        ticketId: item.orderCode ?? `TCKT-${index}`,
        customer: item.userFullName ?? 'Không rõ',
        event: item.detailTicket[0] ?? 'Không rõ',
        time: item.timeOfPurchase,
        status: item.paymentStatus ?? 'completed',
      }));

      setData(transformed);
      setPagination((prev) => ({
        ...prev,
        total,
        current: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      }));
    } catch (err) {
      setNoData(true);
      setShowNoDataAlert(true);
      setTimeout(() => setShowNoDataAlert(false), 2000);
      console.error('Lỗi khi lấy dữ liệu giao dịch vé:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const range = form.getFieldValue('range');
    let dateFrom, dateTo;
    if (range && range[0] && range[1]) {
      dateFrom = range[0].format('YYYY-MM-DDT00:00:00');
      dateTo = range[1].format('YYYY-MM-DDT23:59:59');
    } else {
      dateFrom = '1900-01-01T00:00:00';
      dateTo = '2100-12-31T23:59:59';
    }
    fetchData({
      dateFrom,
      dateTo,
      page: 1,
      pageSize: pagination.pageSize,
    });
  };

  const handleTableChange = (paginationInfo: any) => {
    const range = form.getFieldValue('range');
    let dateFrom, dateTo;
    if (range && range[0] && range[1]) {
      dateFrom = range[0].format('YYYY-MM-DDT00:00:00');
      dateTo = range[1].format('YYYY-MM-DDT23:59:59');
    } else {
      dateFrom = '1900-01-01T00:00:00';
      dateTo = '2100-12-31T23:59:59';
    }
    fetchData({
      dateFrom,
      dateTo,
      page: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    });
  };

  useEffect(() => {
    fetchData({
      dateFrom: '1900-01-01T00:00:00',
      dateTo: '2100-12-31T23:59:59',
      page: 1,
      pageSize: 10,
    });
  }, []);

  const columns = [
    {
      title: 'Mã vé',
      dataIndex: 'ticketId',
      key: 'ticketId',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Tuyến',
      dataIndex: 'event',
      key: 'event',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          'Đã thanh toán': { color: 'success', text: 'Đã thanh toán' },
          'Chưa thanh toán': { color: 'error', text: 'Chưa thanh toán' },
        };
        const config = statusConfig[status] || {
          color: 'default',
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Giao dịch vé</h1>

      <Card className="mb-4">
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="range" label="Khoảng ngày">
            <RangePicker format="DD/MM/YYYY" allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tìm kiếm
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        {showNoDataAlert && (
          <div style={{ marginBottom: 16 }}>
            <Alert message="Không tìm thấy dữ liệu giao dịch vé trong khoảng thời gian này." type="error" showIcon />
          </div>
        )}
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default TicketTransactionPage;
