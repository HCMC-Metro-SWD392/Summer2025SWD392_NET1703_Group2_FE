import React, { useEffect, useState } from 'react';
import {
  Typography,
  Spin,
  Alert,
  Table,
  Button,
  Tag,
  Modal,
  Descriptions,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Tabs,
  Input,
  Image
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
import TabPane from 'antd/es/tabs/TabPane';
import dayjs from 'dayjs';

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
  imageUrls?: string[];
}

const formRequestTypeMap: { [key: number]: string } = {
  0: 'Nộp đơn',
  1: 'Nộp đơn',
  2: 'Nộp đơn',
  3: 'Nộp đơn',
  4: 'Khác',
};

const statusConfigMap: { [key: number]: { color: string; icon: React.ReactNode; text: string } } = {
  0: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Chờ duyệt' },
  1: { color: 'success', icon: <CheckCircleOutlined />, text: 'Đã duyệt' },
  2: { color: 'error', icon: <CloseCircleOutlined />, text: 'Bị từ chối' },
};

const CaseApproval: React.FC = () => {
  const [formRequests, setFormRequests] = useState<FormRequest[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<FormRequest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('0');
  const [allFormRequests, setAllFormRequests] = useState<FormRequest[]>([]);
  const [expiration, setExpiration] = useState<string | null>(null);
  const [expirationError, setExpirationError] = useState<string | null>(null);

  const fetchFormRequests = async (status: number) => {
    try {
      setLoadingTable(true);
      setError(null);
      const res = await axiosInstance.get(`/api/FormRequest/get-all-form-requests`, {
        params: {
          sortBy: 'createdAt',
          isAcsending: true,
          pageNumber: 1,
          pageSize: 100,
          formStatus: status,
        },
      });
      setFormRequests(res.data.result || []);
    } catch (err) {
      setError(null);
      setFormRequests([]);
    } finally {
      setLoadingTable(false);
    }
  };

  const fetchAllFormRequests = async () => {
    try {
      const statuses = [0, 1, 2]; // 0: Pending, 1: Approved, 2: Rejected
      const requests = statuses.map(status =>
        axiosInstance.get(`/api/FormRequest/get-all-form-requests?sortBy=createdAt&isAcsending=true&pageNumber=1&pageSize=100&formStatus=${status}`)
      );

      const results = await Promise.allSettled(requests);

      const allRequests = results
        .filter(result => result.status === "fulfilled")
        .flatMap((result: any) => result.value.data.result || []);

      setAllFormRequests(allRequests);
    } catch (err) {
      console.error("Lỗi không mong muốn khi xử lý form requests:", err);
    }
  };

  useEffect(() => {
    fetchFormRequests(Number(activeTab)).finally(() => setInitialLoading(false));
  }, [activeTab]);

  useEffect(() => {
    fetchAllFormRequests();
  }, []);

  const handleViewDetails = async (record: FormRequest) => {
    setSelectedRequest({ ...record, imageUrls: [] });
    setDetailModalVisible(true);
    try {
      const res = await axiosInstance.get("/api/FormRequest/get-all-form-attachments", {
        params: { formRequestId: record.id },
      });
      const urls = res?.data?.result ?? [];
      setSelectedRequest(prev => prev ? { ...prev, imageUrls: urls } : null);
    } catch (err) {
      message.error('Không thể tải ảnh đính kèm.');
    }
  };

  const handleApprove = (record: FormRequest) => {
    if (record.title === 'Đơn xác nhận học sinh/sinh viên') {
      let localExpiration = expiration;
      setExpirationError(null);
      Modal.confirm({
        title: 'Nhập ngày hết hạn xác nhận học sinh/sinh viên',
        icon: <ExclamationCircleOutlined />,
        content: (
          <Input
            type="datetime-local"
            onChange={e => {
              localExpiration = e.target.value;
              setExpiration(localExpiration);
            }}
            placeholder="Chọn ngày hết hạn"
          />
        ),
        okText: 'Duyệt',
        cancelText: 'Hủy',
        onOk: async () => {
          if (!localExpiration) {
            setExpirationError('Vui lòng nhập ngày hết hạn!');
            message.error('Vui lòng nhập ngày hết hạn!');
            throw new Error('Empty expiration');
          }
          const original = [...formRequests];
          setFormRequests(formRequests.map(r => r.id === record.id ? { ...r, status: 1 } : r));
          try {
            setActionLoading(record.id);
            await axiosInstance.put(`/api/FormRequest/change-form-request-status/${record.id}`, {
              formStatus: 1,
              customerType: 1,
              expiration: dayjs(localExpiration).toISOString(),
              rejectionReason: '',
            });
            message.success('Đã duyệt đơn thành công!');
            fetchFormRequests(Number(activeTab));
            fetchAllFormRequests();
          } catch {
            message.error('Lỗi khi duyệt đơn. Đang hoàn tác...');
            setFormRequests(original);
          } finally {
            setActionLoading(null);
            setExpiration(null);
          }
        }
      });
      return;
    }
    confirm({
      title: 'Xác nhận duyệt đơn',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn duyệt đơn "${record.title}"?`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        const original = [...formRequests];
        setFormRequests(formRequests.map(r => r.id === record.id ? { ...r, status: 1 } : r));
        try {
          setActionLoading(record.id);
          await axiosInstance.put(`/api/FormRequest/change-form-request-status/${record.id}`, { formStatus: 1 });
          message.success('Đã duyệt đơn thành công!');
          fetchFormRequests(Number(activeTab));
          fetchAllFormRequests();
        } catch {
          message.error('Lỗi khi duyệt đơn. Đang hoàn tác...');
          setFormRequests(original);
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleReject = (record: FormRequest) => {
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
          throw new Error('Empty reason');
        }
        const original = [...formRequests];
        setFormRequests(formRequests.map(r => r.id === record.id ? { ...r, status: 2, rejectionReason: reason } : r));
        try {
          setActionLoading(record.id);
          await axiosInstance.put(`/api/FormRequest/change-form-request-status/${record.id}`, {
            formStatus: 2,
            rejectionReason: reason,
          });
          message.success('Đã từ chối đơn thành công!');
          fetchFormRequests(Number(activeTab));
          fetchAllFormRequests();
        } catch {
          message.error('Lỗi khi từ chối đơn. Đang hoàn tác...');
          setFormRequests(original);
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      align: 'center' as const
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'formRequestType',
      render: (type: number) => (
        <Tag color="blue">{formRequestTypeMap[type] || type}</Tag>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      render: (title: string) => <Text strong>{title}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: number) => {
        const config = statusConfigMap[status];
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      },
      width: 120,
      align: 'center' as const
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      width: 130
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 240,
      align: 'center' as const,
      render: (record: FormRequest) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>Chi tiết</Button>
        </div>
      )
    },
  ];

  const getSorted = (status: number) =>
    [...formRequests].filter(r => r.status === status).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const getStats = (data: FormRequest[]) => ({
    total: data.length,
    pending: data.filter(r => r.status === 0).length,
    approved: data.filter(r => r.status === 1).length,
    rejected: data.filter(r => r.status === 2).length,
  });

  const stats = getStats(allFormRequests);

  if (initialLoading) return <Spin tip="Đang tải dữ liệu..." className="w-full mt-10" />;

  if (error) return <Alert type="error" message={error} showIcon />;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <Title level={2}>Quản lý các trường hợp đặc biệt</Title>
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

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {[0, 1, 2].map(status => (
            <TabPane key={status.toString()} tab={statusConfigMap[status].text}>
              <Table
                columns={columns}
                dataSource={formRequests}
                loading={loadingTable}
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
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Modal
        open={detailModalVisible}
        title="Chi tiết trường hợp đặc biệt"
        onCancel={() => setDetailModalVisible(false)}
        footer={selectedRequest?.status === 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              icon={<CheckOutlined />}
              type="primary"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              loading={actionLoading === selectedRequest.id}
              onClick={() => handleApprove(selectedRequest)}
            >
              Chấp nhận
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              loading={actionLoading === selectedRequest.id}
              onClick={() => handleReject(selectedRequest)}
            >
              Từ chối
            </Button>
          </div>
        )}
        width={800}
      >
        {selectedRequest && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tiêu đề"><Text strong>{selectedRequest.title}</Text></Descriptions.Item>
            <Descriptions.Item label="Loại yêu cầu">
              <Tag color="blue">{formRequestTypeMap[selectedRequest.formRequestType]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung">{selectedRequest.content}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusConfigMap[selectedRequest.status].color} icon={statusConfigMap[selectedRequest.status].icon}>
                {statusConfigMap[selectedRequest.status].text}
              </Tag>
            </Descriptions.Item>
            {selectedRequest.imageUrls && selectedRequest.imageUrls.length > 0 && (
              <Descriptions.Item label="Ảnh đính kèm">
                <Image.PreviewGroup>
                  <div className="flex flex-wrap gap-4">
                    {selectedRequest.imageUrls.map((url, index) => (
                      <Image
                        key={index}
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        width={120}
                        height={120}
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            {/* {selectedRequest.reviewerId && (
              <Descriptions.Item label="Người duyệt">{selectedRequest.reviewerId}</Descriptions.Item>
            )} */}
            {selectedRequest.rejectionReason && (
              <Descriptions.Item label="Lý do từ chối">{selectedRequest.rejectionReason}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CaseApproval;
