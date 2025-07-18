import { EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, message, Popconfirm, Space, Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult, SortOrder } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PromotionApi, type PaginationParams } from '../../../../api/promotion/PromotionApi';
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
  const [isNewlyCreated, setIsNewlyCreated] = useState(false);
  const navigate = useNavigate();

  const fetchPromotions = async (params: PaginationParams) => {
    try {
      setLoading(true);
      const response = await PromotionApi.getAllPromotions({
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        filterOn: filterQuery ? 'code' : undefined,
        filterQuery: filterQuery ? filterQuery.toUpperCase() : undefined,
        sortBy: params.sortBy || 'createdAt',
        isAscending: params.sortBy ? params.isAscending : false,
        isActive: true,
      } as any);

      if (response.isSuccess && response.result) {
        setPromotions(response.result);
        setTableParams(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: 10,
            current: params.pageNumber || 1,
            pageSize: params.pageSize || 10
          }
        }));
      } else if (response.statusCode === 404) {
        setPromotions([]);
        setTableParams(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: 0,
            current: 1
          }
        }));
        message.info('Không tìm thấy mã giảm giá nào');
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

  useEffect(() => {
    // Check if we're coming back from creating a new promotion
    const params = new URLSearchParams(window.location.search);
    const newlyCreated = params.get('newlyCreated');
    
    if (newlyCreated === 'true' && !isNewlyCreated) {
      setIsNewlyCreated(true);
      // Reset to first page and default sorting
      setTableParams(prev => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          current: 1
        },
        sortField: 'createdAt',
        sortOrder: 'descend'
      }));
    }
  }, []);

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
            {displayType === PromotionType.Percentage ? 'Phần trăm' : 'Số tiền cố định'}
          </Tag>
        );
      },
      filters: [
        { text: 'Phần trăm', value: PromotionType.Percentage },
        { text: 'Số tiền cố định', value: PromotionType.FixedAmount },
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
              : `${record.fixedAmount?.toLocaleString('vi-VN') ?? 'N/A'} đ`}
          </span>
        );
      },
    },
    {
      title: 'Ngày Bắt Đầu',
      key: 'period',
      sorter: true,
      sortOrder: (tableParams.sortField === 'startdate')
        ? (tableParams.sortOrder as SortOrder)
        : null,
      render: (_, record) => (
        <span>
          {dayjs(record.startDate).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Ngày Kết Thúc',
      key: 'period',
      sorter: true,
      sortOrder: (tableParams.sortField === 'enddate')
        ? (tableParams.sortOrder as SortOrder)
        : null,
      render: (_, record) => (
        <span>
          {dayjs(record.endDate).format('DD/MM/YYYY')}
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
    setIsNewlyCreated(false);
    navigate('/manager/create-promotion');
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<GetPromotionDTO> | SorterResult<GetPromotionDTO>[]
  ) => {
    const sorterResult = Array.isArray(sorter) ? sorter[0] : sorter;
    
    setTableParams(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        ...pagination,
      },
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order as SortOrder,
      filters
    }));
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
          pagination={{
            ...tableParams.pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
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
