import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../settings/axiosInstance';
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
  Statistic
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

const { Title, Text } = Typography;
const { confirm } = Modal;

interface SpecialCase {
  id: string;
  caseType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  submittedAt: string;
  updatedAt: string;
  staffNotes?: string;
  attachments?: string[];
}

const CaseApproval: React.FC = () => {
  const [specialCases, setSpecialCases] = useState<SpecialCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<SpecialCase | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Mock data for development
  const mockData: SpecialCase[] = [
    {
      id: '1',
      caseType: 'REFUND_REQUEST',
      status: 'PENDING',
      title: 'Yêu cầu hoàn tiền vé đã mua',
      description: 'Khách hàng yêu cầu hoàn tiền vé đã mua do không thể sử dụng trong thời gian dự kiến.',
      customerName: 'Nguyễn Văn A',
      customerEmail: 'nguyenvana@email.com',
      customerPhone: '0123456789',
      submittedAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      staffNotes: '',
      attachments: ['receipt.pdf', 'ticket.jpg']
    },
    {
      id: '2',
      caseType: 'LOST_TICKET',
      status: 'PENDING',
      title: 'Báo mất vé Metro',
      description: 'Khách hàng báo mất vé Metro và yêu cầu cấp lại hoặc hoàn tiền.',
      customerName: 'Trần Thị B',
      customerEmail: 'tranthib@email.com',
      customerPhone: '0987654321',
      submittedAt: '2024-01-14T15:45:00Z',
      updatedAt: '2024-01-14T15:45:00Z',
      staffNotes: '',
      attachments: ['police_report.pdf']
    },
    {
      id: '3',
      caseType: 'TECHNICAL_ISSUE',
      status: 'APPROVED',
      title: 'Lỗi kỹ thuật khi sử dụng vé',
      description: 'Khách hàng gặp lỗi khi quét vé tại cổng soát vé.',
      customerName: 'Lê Văn C',
      customerEmail: 'levanc@email.com',
      customerPhone: '0555666777',
      submittedAt: '2024-01-13T09:20:00Z',
      updatedAt: '2024-01-13T14:30:00Z',
      staffNotes: 'Đã xác nhận lỗi từ hệ thống. Chấp nhận hoàn tiền.',
      attachments: ['error_screenshot.png', 'video.mp4']
    },
    {
      id: '4',
      caseType: 'REFUND_REQUEST',
      status: 'REJECTED',
      title: 'Yêu cầu hoàn tiền không hợp lệ',
      description: 'Khách hàng yêu cầu hoàn tiền sau khi đã sử dụng vé thành công.',
      customerName: 'Phạm Thị D',
      customerEmail: 'phamthid@email.com',
      customerPhone: '0333444555',
      submittedAt: '2024-01-12T11:15:00Z',
      updatedAt: '2024-01-12T16:45:00Z',
      staffNotes: 'Vé đã được sử dụng thành công. Không thể hoàn tiền theo quy định.',
      attachments: ['usage_log.pdf']
    }
  ];

  useEffect(() => {
    const fetchSpecialCases = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await axiosInstance.get('/api/SpecialCase/all');
        // setSpecialCases(response.data.result);
        
        // Using mock data for now
        setSpecialCases(mockData);
      } catch (err: any) {
        console.error('Error fetching special cases:', err);
        setError('Không thể tải danh sách các trường hợp đặc biệt.');
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialCases();
  }, []);

  const getCaseTypeLabel = (caseType: string) => {
    const typeMap: { [key: string]: string } = {
      'REFUND_REQUEST': 'Yêu cầu hoàn tiền',
      'LOST_TICKET': 'Báo mất vé',
      'TECHNICAL_ISSUE': 'Lỗi kỹ thuật',
      'COMPLAINT': 'Khiếu nại',
      'OTHER': 'Khác'
    };
    return typeMap[caseType] || caseType;
  };

  const getStatusConfig = (status: string) => {
    const config = {
      'PENDING': {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Chờ xử lý'
      },
      'APPROVED': {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Đã chấp nhận'
      },
      'REJECTED': {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: 'Đã từ chối'
      }
    };
    return config[status as keyof typeof config] || config.PENDING;
  };

  const handleViewDetails = (record: SpecialCase) => {
    setSelectedCase(record);
    setDetailModalVisible(true);
  };

  const handleApprove = (record: SpecialCase) => {
    confirm({
      title: 'Xác nhận chấp nhận',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn chấp nhận trường hợp "${record.title}"?`,
      okText: 'Chấp nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setActionLoading(record.id);
          // TODO: Replace with actual API call
          // await axiosInstance.put(`/api/SpecialCase/${record.id}/approve`);
          
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setSpecialCases(prev => 
            prev.map(case_ => 
              case_.id === record.id 
                ? { ...case_, status: 'APPROVED' as const, updatedAt: new Date().toISOString() }
                : case_
            )
          );
          message.success('Đã chấp nhận trường hợp thành công!');
        } catch (err) {
          message.error('Có lỗi xảy ra khi chấp nhận trường hợp.');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleReject = (record: SpecialCase) => {
    confirm({
      title: 'Xác nhận từ chối',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn từ chối trường hợp "${record.title}"?`,
      okText: 'Từ chối',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          setActionLoading(record.id);
          // TODO: Replace with actual API call
          // await axiosInstance.put(`/api/SpecialCase/${record.id}/reject`);
          
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setSpecialCases(prev => 
            prev.map(case_ => 
              case_.id === record.id 
                ? { ...case_, status: 'REJECTED' as const, updatedAt: new Date().toISOString() }
                : case_
            )
          );
          message.success('Đã từ chối trường hợp thành công!');
        } catch (err) {
          message.error('Có lỗi xảy ra khi từ chối trường hợp.');
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
      title: 'Loại case',
      dataIndex: 'caseType',
      key: 'caseType',
      width: 180,
      render: (caseType: string) => (
        <Tag color="blue" style={{ whiteSpace: 'normal', height: 'auto', lineHeight: '1.5' }}>
          {getCaseTypeLabel(caseType)}
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
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 240,
      align: 'center' as const,
      render: (record: SpecialCase) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                loading={actionLoading === record.id}
                onClick={() => handleApprove(record)}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Chấp nhận
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                loading={actionLoading === record.id}
                onClick={() => handleReject(record)}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const getStatistics = () => {
    const total = specialCases.length;
    const pending = specialCases.filter(c => c.status === 'PENDING').length;
    const approved = specialCases.filter(c => c.status === 'APPROVED').length;
    const rejected = specialCases.filter(c => c.status === 'REJECTED').length;

    return { total, pending, approved, rejected };
  };

  const stats = getStatistics();

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
              title="Chờ xử lý"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã chấp nhận"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã từ chối"
              value={stats.rejected}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Cases Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={specialCases}
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
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết trường hợp đặc biệt"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCase && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tiêu đề">
              <Text strong>{selectedCase.title}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Loại case">
              <Tag color="blue">{getCaseTypeLabel(selectedCase.caseType)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              <Text>{selectedCase.description}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              <div>
                <div><strong>Tên:</strong> {selectedCase.customerName}</div>
                <div><strong>Email:</strong> {selectedCase.customerEmail}</div>
                <div><strong>Số điện thoại:</strong> {selectedCase.customerPhone}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {(() => {
                const config = getStatusConfig(selectedCase.status);
                return (
                  <Tag color={config.color} icon={config.icon}>
                    {config.text}
                  </Tag>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedCase.submittedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {new Date(selectedCase.updatedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            {selectedCase.staffNotes && (
              <Descriptions.Item label="Ghi chú của nhân viên">
                <Text>{selectedCase.staffNotes}</Text>
              </Descriptions.Item>
            )}
            {selectedCase.attachments && selectedCase.attachments.length > 0 && (
              <Descriptions.Item label="Tệp đính kèm">
                <ul className="list-disc list-inside">
                  {selectedCase.attachments.map((file, index) => (
                    <li key={index} className="text-blue-600 cursor-pointer hover:underline">
                      {file}
                    </li>
                  ))}
                </ul>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CaseApproval;
