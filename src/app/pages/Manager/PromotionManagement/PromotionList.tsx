import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm, Input } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult, SortOrder } from 'antd/es/table/interface';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { PromotionApi, type ResponseDTO, type PaginationParams } from '../../../../api/promotion/PromotionApi';
import type { GetPromotionDTO } from '../../../../api/promotion/PromotionInterface';
import { PromotionType } from '../../../../api/promotion/PromotionInterface';

const { Search } = Input;

interface TableParams {
  pagination: TablePaginationConfig;
  sortField?: string;
  sortOrder?: SortOrder;
  filters?: Record<string, FilterValue | null>;
}

const PromotionList: React.FC = () => {
  const [promotions, setPromotions] = useState<GetPromotionDTO[]>([]);
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

  const fetchPromotions = async (params: PaginationParams) => {
    try {
      setLoading(true);
      const response = await PromotionApi.getAllPromotions({
        ...params,
        filterOn: filterQuery ? 'code' : undefined,
        filterQuery: filterQuery || undefined,
        sortBy: params.sortBy,
        isAscending: params.sortBy ? params.isAscending : undefined
      });

      if (response.isSuccess && response.result) {
        setPromotions(response.result);
        setTableParams(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: response.total ?? (response.result?.length ?? 0)
          }
        }));
      } else if (response.statusCode === 404) {
        setPromotions([]);
        setTableParams(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: 0
          }
        }));
        message.info('No promotions found');
      } else {
        message.error(response.message || 'Failed to fetch promotions');
      }
    } catch (error) {
      message.error('Failed to fetch promotions');
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions({
      pageNumber: tableParams.pagination.current,
      pageSize: tableParams.pagination.pageSize,
      sortBy: tableParams.sortField,
      isAscending: tableParams.sortOrder === 'ascend'
    });
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, tableParams.sortField, tableParams.sortOrder, filterQuery]);

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement delete API call when available
      message.success('Promotion deleted successfully');
      fetchPromotions({
        pageNumber: tableParams.pagination.current,
        pageSize: tableParams.pagination.pageSize,
        sortBy: tableParams.sortField,
        isAscending: tableParams.sortOrder === 'ascend'
      });
    } catch (error) {
      message.error('Failed to delete promotion');
      console.error('Error deleting promotion:', error);
    }
  };

  const columns: ColumnsType<GetPromotionDTO> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      sortOrder: tableParams.sortField === 'code' ? (tableParams.sortOrder as SortOrder) : null,
    },
    {
      title: 'Loại',
      dataIndex: 'promotionType',
      key: 'promotionType',
      render: (type: PromotionType | number) => {
        const displayType = typeof type === 'number' 
          ? (type === 0 ? PromotionType.Percentage : PromotionType.FixedAmount)
          : type;
        return (
          <Tag color={displayType === PromotionType.Percentage ? 'blue' : 'green'}>
            {displayType === PromotionType.Percentage ? 'Percentage' : 'Fixed Amount'}
          </Tag>
        );
      },
      filters: [
        { text: 'Percentage', value: PromotionType.Percentage },
        { text: 'Fixed Amount', value: PromotionType.FixedAmount },
      ],
      onFilter: (value, record) => {
        const recordType = typeof record.promotionType === 'number' 
          ? (record.promotionType === 0 ? PromotionType.Percentage : PromotionType.FixedAmount)
          : record.promotionType;
        return recordType === value;
      },
    },
    {
      title: 'Giảm Giá',
      key: 'discount',
      render: (_, record) => {
        const displayType = typeof record.promotionType === 'number'
          ? (record.promotionType === 0 ? PromotionType.Percentage : PromotionType.FixedAmount)
          : record.promotionType;

        return (
          <span>
            {displayType === PromotionType.Percentage 
              ? `${record.percentage ?? 'N/A'}%`
              : `${record.fixedAmount ?? 'N/A'} đ`}
          </span>
        );
      },
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Thời Gian',
      key: 'period',
      sorter: true,
      sortOrder: (tableParams.sortField === 'startdate' || tableParams.sortField === 'enddate')
        ? (tableParams.sortOrder as SortOrder)
        : null,
      render: (_, record) => (
        <span>
          {dayjs(record.startDate).format('MMM D, YYYY')} - {dayjs(record.endDate).format('MMM D, YYYY')}
        </span>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/manager/promotion/${record.id}`)}
          >
            Xem Chi Tiết
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            Chỉnh Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (id: string) => {
    navigate(`/manager/promotion/${id}/edit`);
  };

  const handleAdd = () => {
    navigate('/manager/create-promotion');
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<GetPromotionDTO> | SorterResult<GetPromotionDTO>[]
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
        <h1 className="text-2xl font-bold">Quản Lý Khuyến Mãi</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <Search
            placeholder="Tìm kiếm theo mã"
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
            Tạo Khuyến Mãi
          </Button>
        </div>
      </div>
      <div className="w-full overflow-hidden">
        <Table
          columns={columns}
          dataSource={promotions}
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

export default PromotionList;
