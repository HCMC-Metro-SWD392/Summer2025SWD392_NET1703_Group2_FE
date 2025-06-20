import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../settings/axiosInstance';
import { Typography, Spin, Alert, Table, Button, Select, Row, Col, Input, Space, Card } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

interface Station {
  id: string;
  name: string;
  address: string;
  description: string;
}

interface MetroLineStation {
  id: string;
  distanceFromStart: number;
  stationOrder: number;
  station: Station;
}

interface MetroLine {
  id: string;
  metroLineNumber: number;
  metroName: string;
  createdAt: string;
  startStation: Station;
  endStation: Station;
  metroLineStations: MetroLineStation[];
}

const AllMetroLine: React.FC = () => {
  const [metroLines, setMetroLines] = useState<MetroLine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  
  // Search and filter states
  const [searchText, setSearchText] = useState<string>('');
  const [filterDistance, setFilterDistance] = useState<string>('all');
  const [filteredStations, setFilteredStations] = useState<MetroLineStation[]>([]);

  const selectedLine = metroLines.find(line => line.id === selectedLineId) || null;

  // Filter and search logic
  useEffect(() => {
    if (selectedLine) {
      let filtered = [...selectedLine.metroLineStations];
      
      // Search filter
      if (searchText) {
        filtered = filtered.filter(station => 
          station.station.name.toLowerCase().includes(searchText.toLowerCase()) ||
          station.station.address.toLowerCase().includes(searchText.toLowerCase()) ||
          station.station.description.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      // Distance filter
      if (filterDistance !== 'all') {
        const distanceValue = parseFloat(filterDistance);
        filtered = filtered.filter(station => station.distanceFromStart <= distanceValue);
      }
      
      setFilteredStations(filtered);
    } else {
      setFilteredStations([]);
    }
  }, [selectedLine, searchText, filterDistance]);

  useEffect(() => {
    const fetchMetroLines = async () => {
      try {
        const response = await axiosInstance.get('/api/MetroLine/metro-lines/all');
        console.log('API Response:', response.data);
        console.log('Metro Lines:', response.data.result);
        // Deep clone để tránh lỗi reference khi sort
        const deepCloned = JSON.parse(JSON.stringify(response.data.result));
        setMetroLines(deepCloned);
        // Tự động chọn tuyến có số tuyến nhỏ nhất
        const lines = response.data.result;
        if (lines && lines.length > 0) {
          const minLine = lines.reduce((prev: MetroLine, curr: MetroLine) => prev.metroLineNumber < curr.metroLineNumber ? prev : curr);
          setSelectedLineId(minLine.id);
        }
      } catch (err: any) {
        console.error('Error:', err);
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        setError('Không thể tải dữ liệu tuyến Metro.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetroLines();
  }, []);

  const handleClearFilters = () => {
    setSearchText('');
    setFilterDistance('all');
  };

  const hasActiveFilters = searchText || filterDistance !== 'all';

  if (loading) return <div className="flex justify-center items-center min-h-[300px]"><Spin size="large" tip="Đang tải dữ liệu..." /></div>;
  if (error) return <Alert type="error" message={error} className="my-4" showIcon />;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Row gutter={[16, 16]} align="middle" className="mb-4">
        <Col flex="none">
          <Select
            showSearch
            placeholder="Chọn tuyến Metro"
            optionFilterProp="children"
            value={selectedLineId}
            onChange={setSelectedLineId}
            style={{ minWidth: 240 }}
            filterOption={(input, option) => {
              if (!option?.value) return false;
              const line = metroLines.find(line => line.id === option.value);
              return !!line && line.metroName.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {metroLines
              .slice()
              .sort((a, b) => a.metroLineNumber - b.metroLineNumber)
              .map(line => (
                <Select.Option key={line.id} value={line.id}>
                  {line.metroName}
                </Select.Option>
              ))}
          </Select>
        </Col>
      </Row>
      
      {selectedLine && (
        <>
          <Typography.Title level={3} className="mb-4">
            {selectedLine.metroName}
          </Typography.Title>
          
          {/* Search and Filter Section */}
          <Card className="mb-4" size="small">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Tìm kiếm ga, địa chỉ, mô tả..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Lọc theo khoảng cách"
                  value={filterDistance}
                  onChange={setFilterDistance}
                  style={{ width: '100%' }}
                  prefix={<FilterOutlined />}
                >
                  <Select.Option value="all">Tất cả khoảng cách</Select.Option>
                  <Select.Option value="5">≤ 5 km</Select.Option>
                  <Select.Option value="10">≤ 10 km</Select.Option>
                  <Select.Option value="15">≤ 15 km</Select.Option>
                  <Select.Option value="20">≤ 20 km</Select.Option>
                  <Select.Option value="30">≤ 30 km</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={24} md={10}>
                <Space>
                  {hasActiveFilters && (
                    <Button 
                      icon={<ClearOutlined />} 
                      onClick={handleClearFilters}
                      size="small"
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                  <Text type="secondary" className="text-sm">
                    {filteredStations.length} ga được tìm thấy
                    {selectedLine.metroLineStations.length !== filteredStations.length && 
                      ` (trong tổng số ${selectedLine.metroLineStations.length} ga)`
                    }
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          <Table
            columns={[
              {
                title: 'STT',
                dataIndex: 'stationOrder',
                key: 'stationOrder',
                width: 70,
                align: 'center' as const,
                sorter: (a: MetroLineStation, b: MetroLineStation) => a.stationOrder - b.stationOrder,
              },
              {
                title: 'Tên ga',
                dataIndex: ['station', 'name'],
                key: 'name',
                render: (_: any, record: MetroLineStation) => {
                  const name = record.station.name;
                  if (searchText && name.toLowerCase().includes(searchText.toLowerCase())) {
                    const parts = name.split(new RegExp(`(${searchText})`, 'gi'));
                    return (
                      <span className="font-semibold text-gray-800">
                        {parts.map((part, index) => 
                          part.toLowerCase() === searchText.toLowerCase() ? 
                            <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
                            part
                        )}
                      </span>
                    );
                  }
                  return <span className="font-semibold text-gray-800">{name}</span>;
                },
              },
              {
                title: 'Địa chỉ',
                dataIndex: ['station', 'address'],
                key: 'address',
                render: (_: any, record: MetroLineStation) => {
                  const address = record.station.address;
                  if (searchText && address.toLowerCase().includes(searchText.toLowerCase())) {
                    const parts = address.split(new RegExp(`(${searchText})`, 'gi'));
                    return (
                      <span className="text-gray-600">
                        {parts.map((part, index) => 
                          part.toLowerCase() === searchText.toLowerCase() ? 
                            <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
                            part
                        )}
                      </span>
                    );
                  }
                  return <span className="text-gray-600">{address}</span>;
                },
              },
              {
                title: 'Mô tả',
                dataIndex: ['station', 'description'],
                key: 'description',
                render: (_: any, record: MetroLineStation) => {
                  const description = record.station.description;
                  if (searchText && description.toLowerCase().includes(searchText.toLowerCase())) {
                    const parts = description.split(new RegExp(`(${searchText})`, 'gi'));
                    return (
                      <span className="text-gray-500 text-xs">
                        {parts.map((part, index) => 
                          part.toLowerCase() === searchText.toLowerCase() ? 
                            <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
                            part
                        )}
                      </span>
                    );
                  }
                  return <span className="text-gray-500 text-xs">{description}</span>;
                },
              },
              {
                title: 'Khoảng cách từ đầu (km)',
                dataIndex: 'distanceFromStart',
                key: 'distanceFromStart',
                align: 'center' as const,
                sorter: (a: MetroLineStation, b: MetroLineStation) => a.distanceFromStart - b.distanceFromStart,
              },
            ]}
            dataSource={filteredStations}
            rowKey="id"
            pagination={{ 
              pageSize: 8,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} ga`,
            }}
            className="rounded-xl overflow-hidden mt-4"
            size="middle"
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: hasActiveFilters ? 
                'Không tìm thấy ga nào phù hợp với bộ lọc hiện tại' : 
                'Không có dữ liệu ga'
            }}
          />
        </>
      )}
      
      {!selectedLine && (
        <Typography.Text type="secondary">Vui lòng chọn một tuyến Metro để xem danh sách các ga.</Typography.Text>
      )}
    </div>
  );
};

export default AllMetroLine;
