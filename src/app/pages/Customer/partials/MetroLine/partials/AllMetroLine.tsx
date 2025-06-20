import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../settings/axiosInstance';
import { Typography, Spin, Alert, Table, Button, Select, Row, Col } from 'antd';

const { Title, Text } = Typography;

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

  const selectedLine = metroLines.find(line => line.id === selectedLineId) || null;

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
      {selectedLine ? (
        <>
          <Typography.Title level={3} className="mb-4">
            {selectedLine.metroName}
          </Typography.Title>
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
                render: (_: any, record: MetroLineStation) => <span className="font-semibold text-gray-800">{record.station.name}</span>,
              },
              {
                title: 'Địa chỉ',
                dataIndex: ['station', 'address'],
                key: 'address',
                render: (_: any, record: MetroLineStation) => <span className="text-gray-600">{record.station.address}</span>,
              },
              {
                title: 'Mô tả',
                dataIndex: ['station', 'description'],
                key: 'description',
                render: (_: any, record: MetroLineStation) => <span className="text-gray-500 text-xs">{record.station.description}</span>,
              },
              {
                title: 'Khoảng cách từ đầu (km)',
                dataIndex: 'distanceFromStart',
                key: 'distanceFromStart',
                align: 'center' as const,
              },
            ]}
            dataSource={selectedLine.metroLineStations}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            className="rounded-xl overflow-hidden mt-4"
            size="middle"
            scroll={{ x: 'max-content' }}
          />
        </>
      ) : (
        <Typography.Text type="secondary">Vui lòng chọn một tuyến Metro để xem danh sách các ga.</Typography.Text>
      )}
    </div>
  );
};

export default AllMetroLine;
