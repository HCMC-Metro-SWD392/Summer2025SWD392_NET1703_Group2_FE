import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Input } from 'antd';
import { EditOutlined, PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult, SortOrder } from 'antd/es/table/interface';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { TrainScheduleApi, type ResponseDTO, type PaginationParams } from '../../../../api/trainSchedule/TrainScheduleApi';
import type { GetTrainScheduleDTO } from '../../../../api/trainSchedule/TrainScheduleInterface';
import { TrainScheduleType, TrainScheduleStatus } from '../../../../api/trainSchedule/TrainScheduleInterface';

const { Search } = Input;

interface TableParams {
  pagination: TablePaginationConfig;
  sortField?: string;
  sortOrder?: SortOrder;
  filters?: Record<string, FilterValue | null>;
}

const TrainScheduleList: React.FC = () => {
  const [schedules, setSchedules] = useState<GetTrainScheduleDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    }
  });
  const [filterQuery, setFilterQuery] = useState<string>('');
  const navigate = useNavigate();

  const fetchSchedules = async (params: PaginationParams) => {
    try {
      setLoading(true);
      const response = await TrainScheduleApi.getAllTrainSchedules({
        ...params,
        filterOn: filterQuery ? 'metroLineName' : undefined,
        filterQuery: filterQuery || undefined,
        sortBy: params.sortBy,
        isAscending: params.sortBy ? params.isAscending : undefined
      });

      if (response.isSuccess && response.result) {
        setSchedules(response.result);
        setTableParams(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: response.total ?? (response.result?.length ?? 0)
          }
        }));
      } else if (response.statusCode === 404) {
        setSchedules([]);
        setTableParams(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: 0
          }
        }));
        message.info('No train schedules found');
      } else {
        message.error(response.message || 'Failed to fetch train schedules');
      }
    } catch (error) {
      message.error('Failed to fetch train schedules');
      console.error('Error fetching train schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules({
      pageNumber: tableParams.pagination.current,
      pageSize: tableParams.pagination.pageSize,
      sortBy: tableParams.sortField,
      isAscending: tableParams.sortOrder === 'ascend'
    });
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, tableParams.sortField, tableParams.sortOrder, filterQuery]);

  const columns: ColumnsType<GetTrainScheduleDTO> = [
    {
      title: 'Tuyến Metro',
      dataIndex: 'metroLineName',
      key: 'metroLineName',
      sorter: true,
      sortOrder: tableParams.sortField === 'metroLineName' ? (tableParams.sortOrder as SortOrder) : null,
    },
    {
      title: 'Ga',
      dataIndex: 'stationName',
      key: 'stationName',
      sorter: true,
      sortOrder: tableParams.sortField === 'stationName' ? (tableParams.sortOrder as SortOrder) : null,
    },
    {
      title: 'Thời Gian',
      dataIndex: 'startTime',
      key: 'startTime',
      sorter: true,
      sortOrder: tableParams.sortField === 'startTime' ? (tableParams.sortOrder as SortOrder) : null,
      render: (time: string) => {
        // Assuming time is in "HH:mm:ss" format from the backend
        const [hours, minutes] = time.split(':');
        return dayjs().hour(parseInt(hours)).minute(parseInt(minutes)).format('HH:mm');
      },
    },
    {
      title: 'Hướng',
      dataIndex: 'direction',
      key: 'direction',
      render: (direction: TrainScheduleType) => (
        <Tag color={direction === TrainScheduleType.Up ? 'blue' : 'green'}>
          {direction === TrainScheduleType.Up ? 'Hướng xuôi' : 'Hướng ngược'}
        </Tag>
      ),
      filters: [
        { text: 'Hướng xuôi', value: TrainScheduleType.Up },
        { text: 'Hướng ngược', value: TrainScheduleType.Down },
      ],
      onFilter: (value, record) => record.direction === value,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
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
      filters: [
        { text: 'Bình thường', value: TrainScheduleStatus.Normal },
        { text: 'Bị hủy', value: TrainScheduleStatus.Cancelled },
        { text: 'Không đón khách', value: TrainScheduleStatus.OutOfService },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/manager/train-schedule/${record.id}`)}
          >
            Xem Chi Tiết
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            disabled={record.status === TrainScheduleStatus.Cancelled || record.status === TrainScheduleStatus.OutOfService}
          >
            Chỉnh Sửa
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

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<GetTrainScheduleDTO> | SorterResult<GetTrainScheduleDTO>[]
  ) => {
    const sorterResult = Array.isArray(sorter) ? sorter[0] : sorter;
    
    setTableParams({
      pagination,
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order as SortOrder,
      filters
    });
  };

  const handleSearch = (value: string) => {
    setFilterQuery(value);
    setTableParams(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1
      }
    }));
  };

  return (
    <div className="w-full h-full p-2 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Quản Lý Lịch Tàu</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <Search
            placeholder="Tìm kiếm theo tuyến metro"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
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
          pagination={tableParams.pagination}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          className="w-full"
          size="middle"
        />
      </div>
    </div>
  );
};

export default TrainScheduleList;
