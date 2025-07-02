import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  message,
  Space,
  Typography,
  Table,
  Modal,
  Spin,
  Row,
  Col,
  Popconfirm,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult, SortOrder } from 'antd/es/table/interface';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { FareApi, type PaginationParams } from '../../../../api/fareRule/FareApi';
import type { FareRule, CreateFareRuleDTO, UpdateFareRuleDTO, ResponseDTO } from '../../../../api/fareRule/FareInterface';

const { Title } = Typography;

interface TableParams {
  pagination: TablePaginationConfig;
  sortField?: string;
  sortOrder?: SortOrder;
  filters?: Record<string, FilterValue | null>;
}

const FareRuleManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fareRules, setFareRules] = useState<FareRule[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<FareRule | null>(null);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    sortField: 'minDistance',
    sortOrder: 'ascend'
  });

  useEffect(() => {
    fetchFareRules({
      pageNumber: tableParams.pagination.current,
      pageSize: tableParams.pagination.pageSize,
      sortBy: tableParams.sortField,
      isAscending: tableParams.sortOrder === 'ascend'
    });
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, tableParams.sortField, tableParams.sortOrder]);

  const fetchFareRules = async (params: PaginationParams) => {
    try {
      setLoading(true);
      const response = await FareApi.getAllFareRules(params);
      
      if (response.isSuccess && response.result) {
        setFareRules(response.result);
        setTableParams(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: response.total || 0,
            current: params.pageNumber || 1,
            pageSize: params.pageSize || 10
          }
        }));
      } else if (response.statusCode === 404) {
        setFareRules([]);
        setTableParams(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: 0,
            current: 1
          }
        }));
        message.info('Không tìm thấy quy tắc giá vé nào');
      } else {
        message.error(response.message || 'Không thể tải danh sách quy tắc giá vé');
      }
    } catch (error) {
      console.error('Error fetching fare rules:', error);
      message.error('Có lỗi xảy ra khi tải danh sách quy tắc giá vé');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: CreateFareRuleDTO | UpdateFareRuleDTO) => {
    try {
      setLoading(true);
      let response: ResponseDTO<FareRule>;

      if (editingRule) {
        response = await FareApi.updateFareRule({
          id: editingRule.id,
          ...values
        } as UpdateFareRuleDTO);
      } else {
        response = await FareApi.createFareRule(values as CreateFareRuleDTO);
      }

      if (response.isSuccess) {
        message.success(`Quy tắc giá vé đã được ${editingRule ? 'cập nhật' : 'tạo mới'} thành công`);
        setIsModalVisible(false);
        form.resetFields();
        setEditingRule(null);
        fetchFareRules({
          pageNumber: tableParams.pagination.current,
          pageSize: tableParams.pagination.pageSize,
          sortBy: tableParams.sortField,
          isAscending: tableParams.sortOrder === 'ascend'
        });
      } else {
        message.error(response.message || `Không thể ${editingRule ? 'cập nhật' : 'tạo mới'} quy tắc giá vé`);
      }
    } catch (error) {
      console.error('Error submitting fare rule:', error);
      message.error(`Có lỗi xảy ra khi ${editingRule ? 'cập nhật' : 'tạo mới'} quy tắc giá vé`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      // TODO: Implement delete endpoint in FareApi
      message.error('Chức năng xóa chưa được triển khai');
    } catch (error) {
      console.error('Error deleting fare rule:', error);
      message.error('Có lỗi xảy ra khi xóa quy tắc giá vé');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule: FareRule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      minDistance: rule.minDistance,
      maxDistance: rule.maxDistance,
      fare: rule.fare,
    });
    setIsModalVisible(true);
  };

  const showModal = () => {
    setEditingRule(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<FareRule> | SorterResult<FareRule>[]
  ) => {
    const sorterResult = Array.isArray(sorter) ? sorter[0] : sorter;
    setTableParams({
      pagination,
      sortField: sorterResult && sorterResult.field ? (sorterResult.field as string) : 'minDistance',
      sortOrder: sorterResult && sorterResult.order ? (sorterResult.order as SortOrder) : 'ascend',
      filters
    });
  };

  const columns: ColumnsType<FareRule> = [
    {
      title: 'Khoảng Cách (km)',
      dataIndex: 'minDistance',
      key: 'distance',
      render: (_, record) => `${record.minDistance} - ${record.maxDistance}`,
      align: 'center',
    },
    {
      title: 'Giá Vé (VND)',
      dataIndex: 'fare',
      key: 'fare',
      render: (fare: number) => fare.toLocaleString('vi-VN'),
      align: 'center',
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Chỉnh Sửa
          </Button>
        </Space>
      ),
      align: 'center',
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '8px' }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={2}>Quản Lý Quy Tắc Giá Vé</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
          >
            Thêm Quy Tắc Mới
          </Button>
        </Space>

        <Card style={{ padding: '8px' }}>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={fareRules}
              rowKey="id"
              pagination={{
                ...tableParams.pagination,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} quy tắc giá vé`,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              locale={{
                emptyText: 'Không có dữ liệu',
                triggerDesc: 'Sắp xếp giảm dần',
                triggerAsc: 'Sắp xếp tăng dần',
                cancelSort: 'Hủy sắp xếp',
              }}
              size="small"
              style={{ margin: 0, padding: 0 }}
            />
          </Spin>
        </Card>

        <Modal
          title={editingRule ? 'Chỉnh Sửa Quy Tắc Giá Vé' : 'Thêm Quy Tắc Giá Vé Mới'}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingRule(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={loading}
          >
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  name="minDistance"
                  label="Khoảng Cách Tối Thiểu (km)"
                  rules={[
                    { required: true, message: 'Vui lòng nhập khoảng cách tối thiểu' },
                    { type: 'number', min: 0, message: 'Khoảng cách phải lớn hơn hoặc bằng 0' }
                  ]}
                  dependencies={['maxDistance']}
                  style={{ marginBottom: 8 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Nhập khoảng cách tối thiểu"
                    min={0}
                    step={1}
                    precision={0}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="maxDistance"
                  label="Khoảng Cách Tối Đa (km)"
                  rules={[
                    { required: true, message: 'Vui lòng nhập khoảng cách tối đa' },
                    { type: 'number', min: 0, message: 'Khoảng cách phải lớn hơn hoặc bằng 0' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || !getFieldValue('minDistance') || value > getFieldValue('minDistance')) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Khoảng cách tối đa phải lớn hơn khoảng cách tối thiểu'));
                      },
                    }),
                  ]}
                  dependencies={['minDistance']}
                  style={{ marginBottom: 8 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Nhập khoảng cách tối đa"
                    min={0}
                    step={1}
                    precision={0}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="fare"
                  label="Giá Vé (VND)"
                  rules={[
                    { required: true, message: 'Vui lòng nhập giá vé' },
                    { type: 'number', min: 0, message: 'Giá vé phải lớn hơn hoặc bằng 0' }
                  ]}
                  style={{ marginBottom: 8 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Nhập giá vé"
                    min={0}
                    addonBefore="₫"
                    step={1}
                    precision={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingRule ? 'Cập Nhật' : 'Thêm Mới'}
                </Button>
                <Button 
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingRule(null);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </div>
  );
};

export default FareRuleManagement; 