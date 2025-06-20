import React, { useEffect, useState } from 'react';

import { 
  Typography, 
  Spin, 
  Alert, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Descriptions, 
  message,
  Card,
  Row,
  Col,
  Statistic,
  Tabs,
  Input
} from 'antd';
import { 
  EyeOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import axiosInstance from '../../../../settings/axiosInstance';

const { Title, Text } = Typography;
const { confirm } = Modal;

interface FormRequest {
  id: string;
  senderId: string;
  title: string;
  content: string;
  formRequestType: number;
  reviewerId: string | null;
  rejectionReason: string | null;
  createdAt: string;
  status: number;
}

const formRequestTypeMap: { [key: number]: string } = {
  0: 'Yêu cầu hoàn tiền',
  1: 'Báo mất vé',
  2: 'Lỗi kỹ thuật',
  3: 'Khiếu nại',
  4: 'Khác',
};

const statusConfigMap: { [key: number]: { color: string; icon: React.ReactNode; text: string } } = {
  0: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Chờ duyệt' },
  1: { color: 'success', icon: <CheckCircleOutlined />, text: 'Đã duyệt' },
  2: { color: 'error', icon: <CloseCircleOutlined />, text: 'Bị từ chối' },
};

const CaseApproval: React.FC = () => {
  const [formRequests, setFormRequests] = useState<FormRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<FormRequest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [activeTab, setActiveTab] = useState<string>('0'); // 0: Pending, 1: Approved, 2: Rejected

  const fetchFormRequests = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(
        `/api/FormRequest/get-all-form-requests?sortBy=createdAt&isAcsending=true&pageNumber=${page}&pageSize=${pageSize}`
      );
      setFormRequests(response.data.result);
      setPagination(prev => ({ ...prev, total: response.data.result.length, current: page, pageSize }));
    } catch (err: any) {
      setError('Không thể tải danh sách các trường hợp đặc biệt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormRequests();
    // eslint-disable-next-line
  }, []);

  const handleViewDetails = (record: FormRequest) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const handleApprove = (record: FormRequest) => {
    console.log('Approving recordId:', record.id);
    confirm({
      title: 'Xác nhận duyệt đơn',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn duyệt đơn "${record.title}"?`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setActionLoading(record.id);
          await axiosInstance.put(`/api/FormRequest/change-form-request-status/${record.id}`, {
            formStatus: 1
          });
          message.success('Đã duyệt đơn thành công!');
          fetchFormRequests();
        } catch (err) {
          message.error('Có lỗi xảy ra khi duyệt đơn.');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleReject = (record: FormRequest) => {
    console.log('Rejecting recordId:', record.id);
    let reason = '';
    Modal.confirm({
      title: 'Nhập lý do từ chối',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Input.TextArea
          rows={3}
          onChange={e => { reason = e.target.value; }}
          placeholder="Nhập lý do từ chối"
        />
      ),
      okText: 'Từ chối',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        if (!reason.trim()) {
          message.error('Vui lòng nhập lý do từ chối!');
          throw new Error('No reason');
        }
        try {
          setActionLoading(record.id);
          await axiosInstance.put(`/api/FormRequest/change-form-request-status/${record.id}`, {
            formStatus: 2,
            rejectionReason: reason
          });
          message.success('Đã từ chối đơn thành công!');
          fetchFormRequests();
        } catch (err) {
          message.error('Có lỗi xảy ra khi từ chối đơn.');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'formRequestType',
      key: 'formRequestType',
      width: 180,
      render: (type: number) => (
        <Tag color="blue" style={{ whiteSpace: 'normal', height: 'auto', lineHeight: '1.5' }}>
          {formRequestTypeMap[type] || type}
        </Tag>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <Text strong className="text-gray-800">{title}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center' as const,
      render: (status: number) => {
        const config = statusConfigMap[status] || statusConfigMap[0];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 240,
      align: 'center' as const,
      render: (record: FormRequest) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="middle"
            style={{ minWidth: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          {record.status === 0 && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="middle"
                loading={actionLoading === record.id}
                onClick={() => handleApprove(record)}
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  minWidth: 110,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Chấp nhận
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="middle"
                loading={actionLoading === record.id}
                onClick={() => handleReject(record)}
                style={{
                  minWidth: 90,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Từ chối
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const getStatistics = () => {
    const total = formRequests.length;
    const pending = formRequests.filter(c => c.status === 0).length;
    const approved = formRequests.filter(c => c.status === 1).length;
    const rejected = formRequests.filter(c => c.status === 2).length;
    return { total, pending, approved, rejected };
  };

  const stats = getStatistics();

  // Sort by createdAt desc (newest first)
  const getSortedData = (data: FormRequest[]) => {
    return [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Filtered data for each tab
  const pendingRequests = getSortedData(formRequests.filter(r => r.status === 0));
  const approvedRequests = getSortedData(formRequests.filter(r => r.status === 1));
  const rejectedRequests = getSortedData(formRequests.filter(r => r.status === 2));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Đang tải danh sách..." />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="my-4" showIcon />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <Title level={2} className="mb-6">Quản lý các trường hợp đặc biệt</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng số"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Bị từ chối"
              value={stats.rejected}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs for status */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '0',
              label: 'Chờ duyệt',
              children: (
                <Table
                  columns={columns}
                  dataSource={pendingRequests}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} trường hợp`,
                  }}
                  className="rounded-xl overflow-hidden"
                  size="middle"
                  scroll={{ x: 'max-content' }}
                />
              ),
            },
            {
              key: '1',
              label: 'Đã duyệt',
              children: (
                <Table
                  columns={columns}
                  dataSource={approvedRequests}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} trường hợp`,
                  }}
                  className="rounded-xl overflow-hidden"
                  size="middle"
                  scroll={{ x: 'max-content' }}
                />
              ),
            },
            {
              key: '2',
              label: 'Bị từ chối',
              children: (
                <Table
                  columns={columns}
                  dataSource={rejectedRequests}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} trường hợp`,
                  }}
                  className="rounded-xl overflow-hidden"
                  size="middle"
                  scroll={{ x: 'max-content' }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết trường hợp đặc biệt"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRequest && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tiêu đề">
              <Text strong>{selectedRequest.title}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Loại yêu cầu">
              <Tag color="blue">{formRequestTypeMap[selectedRequest.formRequestType] || selectedRequest.formRequestType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung">
              <Text>{selectedRequest.content}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {(() => {
                const config = statusConfigMap[selectedRequest.status] || statusConfigMap[0];
                return (
                  <Tag color={config.color} icon={config.icon}>
                    {config.text}
                  </Tag>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            {selectedRequest.reviewerId && (
              <Descriptions.Item label="Người duyệt">
                <Text>{selectedRequest.reviewerId}</Text>
              </Descriptions.Item>
            )}
            {selectedRequest.rejectionReason && (
              <Descriptions.Item label="Lý do từ chối">
                <Text>{selectedRequest.rejectionReason}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CaseApproval;
