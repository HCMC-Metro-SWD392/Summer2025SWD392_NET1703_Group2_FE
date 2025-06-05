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
  Row,
  Col,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

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

// Interfaces
interface Station {
  id: string;
  name: string;
  address: string;
  description: string;
  ticketRoutesAsFirstStation: TicketRoute[];
  ticketRoutesAsLastStation: TicketRoute[];
  checkInProcesses: Process[];
  checkOutProcesses: Process[];
  startStations: MetroLine[];
  endStations: MetroLine[];
  strainSchedules: TrainSchedule[];
  metroLineStations: MetroLineStation[];
}

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
      try {
        setLoading(true);
        const response = await fetch(`/api/stations/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch station data');
        }
        const data = await response.json();
        setStation(data);
      } catch (error) {
        message.error('Failed to fetch station data');
        navigate('/manager/stations');
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
    const [hours, minutes] = timeSpan.split(':');
    return `${hours}h ${minutes}m`;
  };

  const ticketRouteColumns: ColumnsType<TicketRoute> = [
    {
      title: 'Ticket Name',
      dataIndex: 'ticketName',
      key: 'ticketName',
    },
    {
      title: 'Start Station',
      dataIndex: ['startStation', 'name'],
      key: 'startStation',
    },
    {
      title: 'End Station',
      dataIndex: ['endStation', 'name'],
      key: 'endStation',
    },
    {
      title: 'Distance (km)',
      dataIndex: 'distance',
      key: 'distance',
      render: (distance: number | null) => distance?.toFixed(2) ?? 'N/A',
    },
    {
      title: 'Expiration',
      dataIndex: 'expiration',
      key: 'expiration',
      render: (expiration: string) => formatTimeSpan(expiration),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: TicketRouteStatus) => (
        <Tag color={getTicketRouteStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  const processColumns: ColumnsType<Process> = [
    {
      title: 'Ticket ID',
      dataIndex: 'ticketId',
      key: 'ticketId',
    },
    {
      title: 'Check-in Station',
      dataIndex: ['stationCheckIn', 'name'],
      key: 'stationCheckIn',
    },
    {
      title: 'Check-out Station',
      dataIndex: ['stationCheckOut', 'name'],
      key: 'stationCheckOut',
    },
    {
      title: 'Check-in Time',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Check-out Time',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm:ss'),
    },
  ];

  const metroLineColumns: ColumnsType<MetroLine> = [
    {
      title: 'Line Number',
      dataIndex: 'metroLineNumber',
      key: 'metroLineNumber',
    },
    {
      title: 'Line Name',
      dataIndex: 'metroName',
      key: 'metroName',
      render: (name: string | null) => name ?? 'N/A',
    },
    {
      title: 'Start Station',
      dataIndex: ['startStation', 'name'],
      key: 'startStation',
    },
    {
      title: 'End Station',
      dataIndex: ['endStation', 'name'],
      key: 'endStation',
    },
  ];

  const trainScheduleColumns: ColumnsType<TrainSchedule> = [
    {
      title: 'Train ID',
      dataIndex: 'trainId',
      key: 'trainId',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => formatTimeSpan(time),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: TrainScheduleStatus) => (
        <Tag color={getTrainScheduleStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  const metroLineStationColumns: ColumnsType<MetroLineStation> = [
    {
      title: 'Line Number',
      dataIndex: ['metroLine', 'metroLineNumber'],
      key: 'metroLineNumber',
    },
    {
      title: 'Line Name',
      dataIndex: ['metroLine', 'metroName'],
      key: 'metroName',
      render: (name: string | null) => name ?? 'N/A',
    },
    {
      title: 'Station Order',
      dataIndex: 'stationOrder',
      key: 'stationOrder',
    },
    {
      title: 'Distance from Start (km)',
      dataIndex: 'distanceFromStart',
      key: 'distanceFromStart',
      render: (distance: number) => distance.toFixed(2),
    },
  ];

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Ticket Routes',
      children: (
        <Table
          columns={ticketRouteColumns}
          dataSource={[...(station?.ticketRoutesAsFirstStation || []), ...(station?.ticketRoutesAsLastStation || [])]}
          rowKey="id"
        />
      ),
    },
    {
      key: '2',
      label: 'Processes',
      children: (
        <Table
          columns={processColumns}
          dataSource={[...(station?.checkInProcesses || []), ...(station?.checkOutProcesses || [])]}
          rowKey="id"
        />
      ),
    },
    {
      key: '3',
      label: 'Metro Lines',
      children: (
        <Table
          columns={metroLineColumns}
          dataSource={[...(station?.startStations || []), ...(station?.endStations || [])]}
          rowKey="id"
        />
      ),
    },
    {
      key: '4',
      label: 'Train Schedules',
      children: (
        <Table
          columns={trainScheduleColumns}
          dataSource={station?.strainSchedules}
          rowKey="id"
        />
      ),
    },
    {
      key: '5',
      label: 'Station in Metro Lines',
      children: (
        <Table
          columns={metroLineStationColumns}
          dataSource={station?.metroLineStations}
          rowKey="id"
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!station) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography.Text>Station not found</Typography.Text>
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/manager/stations')}
        >
          Back to Stations
        </Button>
        <Title level={2} style={{ margin: 0 }}>Station Details</Title>
      </Space>

      <Card>
        <Descriptions title="Basic Information" bordered>
          <Descriptions.Item label="Station Name" span={3}>
            {station.name}
          </Descriptions.Item>
          <Descriptions.Item label="Address" span={3}>
            {station.address}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={3}>
            {station.description}
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
