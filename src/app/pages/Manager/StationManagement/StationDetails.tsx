import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  message,
  Space,
  Typography,
  Tabs,
  Table,
  Tag,
  Spin,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { StationApi } from '../../../../api/station/StationApi';
import type { Station, ResponseDTO } from '../../../../api/station/StationInterface';

const { Title } = Typography;

// Enums
enum TicketRouteStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Maintenance = 'Maintenance'
}

enum TrainScheduleStatus {
  OnTime = 'OnTime',
  Delayed = 'Delayed',
  Cancelled = 'Cancelled',
  Completed = 'Completed'
}

// Interfaces for related entities
interface TicketRoute {
  id: string;
  ticketName: string;
  startStationId: string;
  endStationId: string;
  distance: number | null;
  expiration: string; // TimeSpan in ISO format
  status: TicketRouteStatus;
  startStation: Station;
  endStation: Station;
  tickets: Ticket[];
}

interface Process {
  id: string;
  ticketId: string;
  stationCheckInId: string;
  stationCheckOutId: string;
  checkInTime: string;
  checkOutTime: string;
  tickets: Ticket[];
  stationCheckIn: Station;
  stationCheckOut: Station;
}

interface MetroLine {
  id: string;
  metroLineNumber: number;
  metroName: string | null;
  startStationId: string;
  endStationId: string;
  startStation: Station;
  endStation: Station;
  metroLineStations: MetroLineStation[];
}

interface TrainSchedule {
  id: string;
  trainId: string;
  startStationId: string;
  startTime: string; // TimeSpan in ISO format
  status: TrainScheduleStatus;
  startStation: Station;
  trains: Train[];
}

interface MetroLineStation {
  id: string;
  metroLineId: string;
  stationId: string;
  distanceFromStart: number;
  stationOrder: number;
  metroLine: MetroLine;
  station: Station;
}

interface Ticket {
  id: string;
  // Add other ticket properties as needed
}

interface Train {
  id: string;
  // Add other train properties as needed
}

const StationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [station, setStation] = useState<Station | null>(null);

  useEffect(() => {
    const fetchStationData = async () => {
      if (!id) {
        message.error('Không tìm thấy ID trạm');
        navigate('/manager/station');
        return;
      }

      try {
        setLoading(true);
        const response = await StationApi.getStationById(id);
        
        if (response.isSuccess && response.result) {
          setStation(response.result);
        } else {
          message.error(response.message || 'Không thể tải thông tin trạm');
          navigate('/manager/station');
        }
      } catch (error) {
        console.error('Error fetching station:', error);
        message.error('Có lỗi xảy ra khi tải thông tin trạm');
        navigate('/manager/station');
      } finally {
        setLoading(false);
      }
    };

    fetchStationData();
  }, [id, navigate]);

  const getTicketRouteStatusColor = (status: TicketRouteStatus) => {
    switch (status) {
      case TicketRouteStatus.Active:
        return 'success';
      case TicketRouteStatus.Inactive:
        return 'default';
      case TicketRouteStatus.Maintenance:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTrainScheduleStatusColor = (status: TrainScheduleStatus) => {
    switch (status) {
      case TrainScheduleStatus.OnTime:
        return 'success';
      case TrainScheduleStatus.Delayed:
        return 'warning';
      case TrainScheduleStatus.Cancelled:
        return 'error';
      case TrainScheduleStatus.Completed:
        return 'processing';
      default:
        return 'default';
    }
  };

  const formatTimeSpan = (timeSpan: string) => {
    try {
      const [hours, minutes] = timeSpan.split(':');
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error formatting time span:', error);
      return 'Invalid time format';
    }
  };

  const ticketRouteColumns: ColumnsType<TicketRoute> = [
    {
      title: 'Tên Vé',
      dataIndex: 'ticketName',
      key: 'ticketName',
    },
    {
      title: 'Trạm Đi',
      dataIndex: ['startStation', 'name'],
      key: 'startStation',
    },
    {
      title: 'Trạm Đến',
      dataIndex: ['endStation', 'name'],
      key: 'endStation',
    },
    {
      title: 'Khoảng Cách (km)',
      dataIndex: 'distance',
      key: 'distance',
      render: (distance: number | null) => distance?.toFixed(2) ?? 'N/A',
    },
    {
      title: 'Thời Hạn',
      dataIndex: 'expiration',
      key: 'expiration',
      render: (expiration: string) => formatTimeSpan(expiration),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: TicketRouteStatus) => (
        <Tag color={getTicketRouteStatusColor(status)}>
          {status === TicketRouteStatus.Active ? 'Hoạt Động' :
           status === TicketRouteStatus.Inactive ? 'Không Hoạt Động' :
           status === TicketRouteStatus.Maintenance ? 'Bảo Trì' : status}
        </Tag>
      ),
    },
  ];

  const processColumns: ColumnsType<Process> = [
    {
      title: 'Mã Vé',
      dataIndex: 'ticketId',
      key: 'ticketId',
    },
    {
      title: 'Trạm Check-in',
      dataIndex: ['stationCheckIn', 'name'],
      key: 'stationCheckIn',
    },
    {
      title: 'Trạm Check-out',
      dataIndex: ['stationCheckOut', 'name'],
      key: 'stationCheckOut',
    },
    {
      title: 'Thời Gian Check-in',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Thời Gian Check-out',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm:ss'),
    },
  ];

  const metroLineColumns: ColumnsType<MetroLine> = [
    {
      title: 'Số Tuyến',
      dataIndex: 'metroLineNumber',
      key: 'metroLineNumber',
    },
    {
      title: 'Tên Tuyến',
      dataIndex: 'metroName',
      key: 'metroName',
      render: (name: string | null) => name ?? 'N/A',
    },
    {
      title: 'Trạm Đi',
      dataIndex: ['startStation', 'name'],
      key: 'startStation',
    },
    {
      title: 'Trạm Đến',
      dataIndex: ['endStation', 'name'],
      key: 'endStation',
    },
  ];

  const trainScheduleColumns: ColumnsType<TrainSchedule> = [
    {
      title: 'Mã Tàu',
      dataIndex: 'trainId',
      key: 'trainId',
    },
    {
      title: 'Giờ Khởi Hành',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => formatTimeSpan(time),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: TrainScheduleStatus) => (
        <Tag color={getTrainScheduleStatusColor(status)}>
          {status === TrainScheduleStatus.OnTime ? 'Đúng Giờ' :
           status === TrainScheduleStatus.Delayed ? 'Trễ' :
           status === TrainScheduleStatus.Cancelled ? 'Hủy' :
           status === TrainScheduleStatus.Completed ? 'Hoàn Thành' : status}
        </Tag>
      ),
    },
  ];

  const metroLineStationColumns: ColumnsType<MetroLineStation> = [
    {
      title: 'Số Tuyến',
      dataIndex: ['metroLine', 'metroLineNumber'],
      key: 'metroLineNumber',
    },
    {
      title: 'Tên Tuyến',
      dataIndex: ['metroLine', 'metroName'],
      key: 'metroName',
      render: (name: string | null) => name ?? 'N/A',
    },
    {
      title: 'Thứ Tự Trạm',
      dataIndex: 'stationOrder',
      key: 'stationOrder',
    },
    {
      title: 'Khoảng Cách Từ Điểm Đầu (km)',
      dataIndex: 'distanceFromStart',
      key: 'distanceFromStart',
      render: (distance: number) => distance.toFixed(2),
    },
  ];

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Tuyến Vé',
      children: (
        <Table
          columns={ticketRouteColumns}
          dataSource={[...(station?.ticketRoutesAsFirstStation || []), ...(station?.ticketRoutesAsLastStation || [])]}
          rowKey="id"
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      ),
    },
    {
      key: '2',
      label: 'Quá Trình',
      children: (
        <Table
          columns={processColumns}
          dataSource={[...(station?.checkInProcesses || []), ...(station?.checkOutProcesses || [])]}
          rowKey="id"
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      ),
    },
    {
      key: '3',
      label: 'Tuyến Metro',
      children: (
        <Table
          columns={metroLineColumns}
          dataSource={[...(station?.startStations || []), ...(station?.endStations || [])]}
          rowKey="id"
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      ),
    },
    {
      key: '4',
      label: 'Lịch Tàu',
      children: (
        <Table
          columns={trainScheduleColumns}
          dataSource={station?.strainSchedules}
          rowKey="id"
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      ),
    },
    {
      key: '5',
      label: 'Trạm Trong Tuyến',
      children: (
        <Table
          columns={metroLineStationColumns}
          dataSource={station?.metroLineStations}
          rowKey="id"
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Đang tải thông tin trạm..." />
      </div>
    );
  }

  if (!station) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography.Text>Không tìm thấy thông tin trạm</Typography.Text>
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/manager/station')}
        >
          Quay lại
        </Button>
        <Title level={2} style={{ margin: 0 }}>Chi Tiết Trạm Metro</Title>
      </Space>

      <Card>
        <Descriptions title="Thông Tin Cơ Bản" bordered>
          <Descriptions.Item label="Tên Trạm" span={3}>
            {station.name}
          </Descriptions.Item>
          <Descriptions.Item label="Địa Chỉ" span={3}>
            {station.address || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Mô Tả" span={3}>
            {station.description || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </Space>
  );
};

export default StationDetails;
