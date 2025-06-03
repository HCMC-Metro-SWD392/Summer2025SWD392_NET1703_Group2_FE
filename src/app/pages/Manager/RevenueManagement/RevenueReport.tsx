import React, { useState } from 'react';
import { Card, Row, Col, DatePicker, Select, Button, Table, Statistic, Space, Typography, Radio } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, LineChartOutlined, BarChartOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

interface RevenueData {
  key: string;
  date: string;
  ticketType: string;
  quantity: number;
  revenue: number;
  refunds: number;
  netRevenue: number;
}

const RevenueReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'days'), dayjs()]);
  const [ticketType, setTicketType] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('daily');
  const [viewType, setViewType] = useState<string>('table');

  // Mock data for demonstration
  const mockData: RevenueData[] = [
    {
      key: '1',
      date: '2025-05-01',
      ticketType: 'Single Ride',
      quantity: 150,
      revenue: 1500000,
      refunds: 50000,
      netRevenue: 1450000,
    },
    {
      key: '2',
      date: '2025-05-02',
      ticketType: 'Periodic',
      quantity: 75,
      revenue: 2250000,
      refunds: 0,
      netRevenue: 2250000,
    },
    // Add more mock data as needed
  ];

  const columns: ColumnsType<RevenueData> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      width: 150,
    },
    {
      title: 'Ticket Type',
      dataIndex: 'ticketType',
      key: 'ticketType',
      filters: [
        { text: 'Single Ride', value: 'Single Ride' },
        { text: 'Periodic', value: 'Periodic' },
      ],
      onFilter: (value, record) => record.ticketType === value,
      width: 180,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      width: 120,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `₫${value.toLocaleString()}`,
      sorter: (a, b) => a.revenue - b.revenue,
      width: 180,
    },
    {
      title: 'Refunds',
      dataIndex: 'refunds',
      key: 'refunds',
      render: (value: number) => `₫${value.toLocaleString()}`,
      sorter: (a, b) => a.refunds - b.refunds,
      width: 150,
    },
    {
      title: 'Net Revenue',
      dataIndex: 'netRevenue',
      key: 'netRevenue',
      render: (value: number) => `₫${value.toLocaleString()}`,
      sorter: (a, b) => a.netRevenue - b.netRevenue,
      width: 180,
    },
  ];

  const handleExport = (format: 'csv' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting to ${format}...`);
  };

  const handleViewTypeChange = (e: RadioChangeEvent) => {
    setViewType(e.target.value);
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Title level={4}>Revenue Report</Title>
        <Text type="secondary">View and analyze revenue data from ticket sales</Text>
      </div>

      {/* Filters Section */}
      <div className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Text strong>Date Range:</Text>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Ticket Type:</Text>
            <Select
              value={ticketType}
              onChange={setTicketType}
              style={{ width: '100%' }}
            >
              <Select.Option value="all">All Types</Select.Option>
              <Select.Option value="single">Single Ride</Select.Option>
              <Select.Option value="periodic">Periodic</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Report Type:</Text>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: '100%' }}
            >
              <Select.Option value="daily">Daily</Select.Option>
              <Select.Option value="weekly">Weekly</Select.Option>
              <Select.Option value="monthly">Monthly</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Space>
              <Button
                icon={<FileExcelOutlined />}
                onClick={() => handleExport('csv')}
              >
                Export CSV
              </Button>
              <Button
                icon={<FilePdfOutlined />}
                onClick={() => handleExport('pdf')}
              >
                Export PDF
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Summary Statistics */}
      <div className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={3750000}
                precision={0}
                prefix="₫"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Tickets Sold"
                value={225}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Refunds"
                value={50000}
                precision={0}
                prefix="₫"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Net Revenue"
                value={3700000}
                precision={0}
                prefix="₫"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* View Type Toggle */}
      <div className="mb-4">
        <Radio.Group value={viewType} onChange={handleViewTypeChange}>
          <Radio.Button value="table"><LineChartOutlined /> Table View</Radio.Button>
          <Radio.Button value="chart"><BarChartOutlined /> Chart View</Radio.Button>
        </Radio.Group>
      </div>

      {/* Data Display */}
      {viewType === 'table' ? (
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            dataSource={mockData}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      ) : (
        <Card>
          {/* TODO: Add chart visualization component */}
          <div className="h-96 flex items-center justify-center">
            <Text type="secondary">Chart visualization will be implemented here</Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RevenueReport;
