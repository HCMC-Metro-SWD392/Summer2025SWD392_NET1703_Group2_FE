import { BarChartOutlined, FileExcelOutlined, FilePdfOutlined, LineChartOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import { Button, Card, Col, DatePicker, Radio, Row, Select, Space, Statistic, Typography, message } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { RevenueApi } from '../../../../api/revenue/RevenueApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<{ month: number; revenue: number }[]>([]);

  useEffect(() => {
    fetchAllRevenue();
    fetchMonthlyRevenueData(year);
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

  const fetchMonthlyRevenueData = async (year: number) => {
    setLoading(true);
    try {
      const now = dayjs();
      const currentYear = now.year();
      const currentMonth = now.month() + 1;
      // Only include months up to the current month
      const months = year === currentYear
        ? Array.from({ length: currentMonth }, (_, i) => i + 1)
        : Array.from({ length: 12 }, (_, i) => i + 1);
      const data: { month: number; revenue: number }[] = [];
      for (const m of months) {
        try {
          const res = await RevenueApi.viewRevenueMonth(m);
          if (res.isSuccess && res.result != null) {
            data.push({ month: m, revenue: res.result });
          } else {
            data.push({ month: m, revenue: 0 });
          }
        } catch (error: any) {
          // If error is 404, treat as no data
          if (error?.response?.status === 404) {
            data.push({ month: m, revenue: 0 });
          } else {
            // For other errors, you may want to handle differently or break
            data.push({ month: m, revenue: 0 });
          }
        }
      }
      setMonthlyRevenueData(data);
    } catch (error) {
      setMonthlyRevenueData([]);
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
    fetchMonthlyRevenueData(year);
    // eslint-disable-next-line
  }, [month, year, dateRange]);

  return (
    <div className="w-full h-full p-2 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Báo Cáo Doanh Thu</h1>

      {/* Monthly Revenue Section */}
      <Card className="mb-6">
        <Title level={4}>Doanh Thu Tháng</Title>
        <Text type="secondary">Chọn tháng để xem doanh thu tháng hiện tại.</Text>
        <Row gutter={[16, 16]} align="middle" className="mt-2">
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
          <Col xs={24} md={16} className="flex items-center">
            <Statistic
              title="Doanh Thu Tháng"
              value={monthlyRevenue}
              precision={0}
              prefix="₫"
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Col>
        </Row>
        {/* Monthly Revenue Chart */}
        <div className="mt-6">
          <Title level={5}>Biểu Đồ Doanh Thu Theo Tháng (Năm hiện tại)</Title>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={(m) => `Tháng ${m}`} />
              <YAxis tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip formatter={(value: number) => value.toLocaleString()} labelFormatter={(m) => `Tháng ${m}`} />
              <Bar dataKey="revenue" fill="#1890ff" name="Doanh Thu" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Yearly Revenue Section */}
      <Card className="mb-6">
        <Title level={4}>Doanh Thu Năm</Title>
        <Text type="secondary">Chọn năm để xem tổng doanh thu của năm đó.</Text>
        <Row gutter={[16, 16]} align="middle" className="mt-2">
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
          <Col xs={24} md={16} className="flex items-center">
            <Statistic
              title="Doanh Thu Năm"
              value={yearlyRevenue}
              precision={0}
              prefix="₫"
              valueStyle={{ color: '#1890ff' }}
              loading={loading}
            />
          </Col>
        </Row>
      </Card>

      {/* Overtime Revenue Section */}
      <Card className="mb-6">
        <Title level={4}>Doanh Thu Theo Ngày</Title>
        <Text type="secondary">Chọn khoảng ngày để xem doanh thu trong khoảng thời gian đó.</Text>
        <Row gutter={[16, 16]} align="middle" className="mt-2">
          <Col xs={24} md={12}>
            <Text strong className="block mb-2">Doanh Thu Theo Ngày:</Text>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-full"
            />
          </Col>
          <Col xs={24} md={12} className="flex items-center">
            <Statistic
              title="Doanh Thu Theo Ngày"
              value={overTimeRevenue}
              precision={0}
              prefix="₫"
              valueStyle={{ color: '#722ed1' }}
              loading={loading}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default RevenueReport;
