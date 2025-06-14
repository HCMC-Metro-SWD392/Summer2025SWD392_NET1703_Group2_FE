import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Input, Select } from 'antd';
import { EditOutlined, PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { TrainScheduleApi, type ResponseDTO } from '../../../../api/trainSchedule/TrainScheduleApi';
import type { GetTrainScheduleDTO } from '../../../../api/trainSchedule/TrainScheduleInterface';
import { TrainScheduleType, TrainScheduleStatus } from '../../../../api/trainSchedule/TrainScheduleInterface';
import { StationApi } from '../../../../api/station/StationApi';
import type { Station } from '../../../../api/station/StationInterface';

const { Search } = Input;
const { Option } = Select;

const TrainScheduleList: React.FC = () => {
  const [schedules, setSchedules] = useState<GetTrainScheduleDTO[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedDirection, setSelectedDirection] = useState<TrainScheduleType | undefined>(undefined);
  const navigate = useNavigate();

  // Fetch stations on component mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await StationApi.getAllStations();
        if (response.isSuccess && response.result) {
          setStations(response.result);
        } else {
          message.error('Không thể tải danh sách ga');
        }
      } catch (error) {
        console.error('Error fetching stations:', error);
        message.error('Không thể tải danh sách ga');
      }
    };

    fetchStations();
  }, []);

  const fetchSchedules = async () => {
    if (!selectedStation) {
      message.warning('Vui lòng chọn ga');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching schedules for station:', selectedStation, 'direction:', selectedDirection);
      
      const response = await TrainScheduleApi.getTrainSchedulesByStation({
        stationId: selectedStation,
        direction: selectedDirection
      });

      console.log('API Response:', response);

      if (response.isSuccess && response.result) {
        console.log('Setting schedules:', response.result);
        setSchedules(response.result);
      } else if (response.statusCode === 404) {
        setSchedules([]);
        message.info('Không tìm thấy lịch trình tàu nào cho ga này');
      } else {
        console.error('API Error:', response);
        message.error(response.message || 'Không thể tải danh sách lịch trình tàu');
      }
    } catch (error) {
      console.error('Error fetching train schedules:', error);
      message.error('Không thể tải danh sách lịch trình tàu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered - selectedStation:', selectedStation, 'selectedDirection:', selectedDirection);
    if (selectedStation) {
      fetchSchedules();
    }
  }, [selectedStation, selectedDirection]);

  const columns: ColumnsType<GetTrainScheduleDTO> = [

    {
      title: 'Thời Gian',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      render: (time: string) => {
        const [hours, minutes] = time.split(':');
        return dayjs().hour(parseInt(hours)).minute(parseInt(minutes)).format('HH:mm');
      },
      sorter: (a, b) => {
        const timeA = a.startTime.split(':').map(Number);
        const timeB = b.startTime.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      },
    },
    {
      title: 'Hướng',
      dataIndex: 'direction',
      key: 'direction',
      width: 120,
      render: (direction: TrainScheduleType) => (
        <Tag color={direction === TrainScheduleType.Forward ? 'blue' : 'green'}>
          {direction === TrainScheduleType.Forward ? 'Hướng xuôi' : 'Hướng ngược'}
        </Tag>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: TrainScheduleStatus) => {
        const statusColors = {
          [TrainScheduleStatus.Normal]: 'success',
          [TrainScheduleStatus.Cancelled]: 'error',
          [TrainScheduleStatus.OutOfService]: 'warning'
        };
        const statusText = {
          [TrainScheduleStatus.Normal]: 'Bình thường',
          [TrainScheduleStatus.Cancelled]: 'Bị hủy',
          [TrainScheduleStatus.OutOfService]: 'Không đón khách'
        };
        return (
          <Tag color={statusColors[status]}>
            {statusText[status]}
          </Tag>
        );
      },
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/manager/train-schedule/${record.id}`)}
          >
            Chi Tiết
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            disabled={record.status === TrainScheduleStatus.Cancelled || record.status === TrainScheduleStatus.OutOfService}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (id: string) => {
    navigate(`/manager/train-schedule/${id}/edit`);
  };

  const handleAdd = () => {
    navigate('/manager/create-train-schedule');
  };

  const handleStationChange = (value: string) => {
    setSelectedStation(value);
  };

  const handleDirectionChange = (value: TrainScheduleType | undefined) => {
    setSelectedDirection(value);
  };

  return (
    <div className="w-full h-full p-2 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Quản Lý Lịch Tàu</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <Select
              placeholder="Chọn ga"
              style={{ width: 200 }}
              onChange={handleStationChange}
              value={selectedStation || undefined}
              loading={!stations.length}
            >
              {stations.map(station => (
                <Option key={station.id} value={station.id}>
                  {station.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Chọn hướng"
              style={{ width: 150 }}
              onChange={handleDirectionChange}
              value={selectedDirection}
              allowClear
            >
              <Option value={TrainScheduleType.Forward}>Hướng xuôi</Option>
              <Option value={TrainScheduleType.Backward}>Hướng ngược</Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Tạo Lịch Tàu
          </Button>
        </div>
      </div>
      <div className="w-full overflow-hidden max-w-screen-xl mx-auto">
        <Table
          columns={columns}
          dataSource={schedules}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
          className="w-full"
          size="middle"
          pagination={false}
          bordered
          locale={{
            emptyText: loading ? 'Đang tải...' : 'Không có dữ liệu'
          }}
        />
      </div>
    </div>
  );
};

export default TrainScheduleList;
