import { BarChartOutlined, FileExcelOutlined, FilePdfOutlined, LineChartOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import { Button, Card, Col, DatePicker, Radio, Row, Select, Space, Statistic, Typography, message } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { RevenueApi } from '../../../../api/revenue/RevenueApi';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const RevenueReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'days'), dayjs()]);
  const [month, setMonth] = useState<number>(dayjs().month() + 1);
  const [year, setYear] = useState<number>(dayjs().year());
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [yearlyRevenue, setYearlyRevenue] = useState<number>(0);
  const [overTimeRevenue, setOverTimeRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<string>('table');

  useEffect(() => {
    fetchAllRevenue();
    // eslint-disable-next-line
  }, []);

  const fetchAllRevenue = async () => {
    setLoading(true);
    try {
      // Fetch monthly
      const monthRes = await RevenueApi.viewRevenueMonth(month);
      if (monthRes.isSuccess) setMonthlyRevenue(monthRes.result!);
      else setMonthlyRevenue(0);
      // Fetch yearly
      const yearRes = await RevenueApi.viewRevenueYear(year);
      if (yearRes.isSuccess) setYearlyRevenue(yearRes.result!);
      else setYearlyRevenue(0);
      // Fetch over time
      const overTimeRes = await RevenueApi.viewRevenueOverTime(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      );
      if (overTimeRes.isSuccess) setOverTimeRevenue(overTimeRes.result!);
      else setOverTimeRevenue(0);
    } catch (error) {
      setMonthlyRevenue(0);
      setYearlyRevenue(0);
      setOverTimeRevenue(0);
      message.error('Không Có Dữ Liệu Doanh Thu Trong Thời Gian Đã Chọn');
    } finally {
      setLoading(false);
    }
  };

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

  const handleMonthChange = (value: number) => {
    setMonth(value);
  };

  const handleYearChange = (value: number) => {
    setYear(value);
  };

  // Refetch on filter change
  useEffect(() => {
    fetchAllRevenue();
    // eslint-disable-next-line
  }, [month, year, dateRange]);

  return (
    <div className="w-full h-full p-2 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Báo Cáo Doanh Thu</h1>
        </div>
        <Space>
          {/* <Button
            icon={<FileExcelOutlined />}
            onClick={() => handleExport('csv')}
            size="large"
          >
            Export CSV
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={() => handleExport('pdf')}
            size="large"
          >
            Export PDF
          </Button> */}
        </Space>
      </div>

      {/* Filters Section */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Text strong className="block mb-2">Tháng:</Text>
            <Select
              value={month}
              onChange={handleMonthChange}
              className="w-full"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <Select.Option key={i + 1} value={i + 1}>{i + 1}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Text strong className="block mb-2">Năm:</Text>
            <Select
              value={year}
              onChange={handleYearChange}
              className="w-full"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <Select.Option key={dayjs().year() - i} value={dayjs().year() - i}>{dayjs().year() - i}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Text strong className="block mb-2">Doanh Thu Theo Ngày:</Text>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-full"
            />
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <div className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card className="h-full">
              <Statistic
                title="Doanh Thu Tháng"
                value={monthlyRevenue}
                precision={0}
                prefix="₫"
                valueStyle={{ color: '#3f8600' }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="h-full">
              <Statistic
                title="Doanh Thu Năm"
                value={yearlyRevenue}
                precision={0}
                prefix="₫"
                valueStyle={{ color: '#1890ff' }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="h-full">
              <Statistic
                title="Doanh Thu Theo Ngày"
                value={overTimeRevenue}
                precision={0}
                prefix="₫"
                valueStyle={{ color: '#722ed1' }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default RevenueReport;
