import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Typography, Table, Spin, Alert } from 'antd';

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

  useEffect(() => {
    const fetchMetroLines = async () => {
      try {
        const response = await axios.get('/api/MetroLine/metro-lines/all');
        setMetroLines(response.data.result);
      } catch (err: any) {
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
      <Title level={2} className="text-center mb-8">Danh sách các tuyến Metro</Title>
      <div className="flex flex-col gap-8">
        {metroLines.map((line) => {
          const columns = [
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
          ];

          return (
            <Card
              key={line.id}
              className="shadow-lg rounded-2xl border border-gray-200 bg-white"
              title={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <Title level={4} className="!mb-0">{line.metroName} <span className="text-blue-700">(Số: {line.metroLineNumber})</span></Title>
                  <Text type="secondary">Ngày tạo: {new Date(line.createdAt).toLocaleDateString()}</Text>
                </div>
              }
              bordered={false}
            >
              <div className="mb-4 flex flex-col md:flex-row md:gap-8 gap-2">
                <div>
                  <Text strong>Ga bắt đầu:</Text> <span className="text-green-700 font-medium">{line.startStation.name}</span> <span className="text-gray-500">- {line.startStation.address}</span>
                </div>
                <div>
                  <Text strong>Ga kết thúc:</Text> <span className="text-red-700 font-medium">{line.endStation.name}</span> <span className="text-gray-500">- {line.endStation.address}</span>
                </div>
              </div>
              <Table
                columns={columns}
                dataSource={line.metroLineStations.sort((a, b) => a.stationOrder - b.stationOrder)}
                rowKey="id"
                pagination={false}
                className="rounded-xl overflow-hidden"
                size="middle"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AllMetroLine;
