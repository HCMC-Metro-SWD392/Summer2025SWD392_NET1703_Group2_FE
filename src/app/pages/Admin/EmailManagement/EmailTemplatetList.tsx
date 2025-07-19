import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../settings/axiosInstance';
import { Button, Table, Input, Modal, Typography, Spin, Space, message } from 'antd';

interface EmailTemplate {
  id: string;
  templateName: string;
  subjectLine: string;
  bodyContent: string;
  senderName: string;
  category: string;
  preHeaderText: string;
  personalizationTags: string;
  footerContent: string;
  callToAction: string;
  language: string;
  recipientType: string;
  status: number;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

const { Title, Text } = Typography;

const LOCAL_KEY = 'admin_create_email_template_form';

const EmailTemplatetList: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const navigate = useNavigate();

  // Mapping for Vietnamese field labels
  const fieldLabels: Record<string, string> = {
    id: 'Mã mẫu',
    templateName: 'Tên mẫu',
    subjectLine: 'Tiêu đề',
    bodyContent: 'Nội dung',
    senderName: 'Người gửi',
    category: 'Danh mục',
    preHeaderText: 'Tiêu đề phụ',
    personalizationTags: 'Thẻ cá nhân hóa',
    footerContent: 'Chân trang',
    callToAction: 'Kêu gọi hành động',
    language: 'Ngôn ngữ',
    recipientType: 'Loại người nhận',
    status: 'Trạng thái',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật',
    createdBy: 'Người tạo',
    updatedBy: 'Người cập nhật',
  };

  const fetchTemplates = async (sorter?: any) => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter) {
        params.filterOn = 'templateName';
        params.filterQuery = filter;
      }
      if (sorter && sorter.field === 'createdAt') {
        params.sortBy = 'createdAt';
        params.isAscending = sorter.order === 'ascend';
      }
      const res = await axiosInstance.get('/api/Email/get-all-email-template', { params });
      setTemplates(res.data.result || []);
    } catch (err: any) {
      message.error('Lỗi khi tải danh sách mẫu email.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line
  }, []);

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSortOrder(sorter.order || null);
    fetchTemplates(sorter);
  };

  const handleView = (template: EmailTemplate) => {
    setSelected(template);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelected(null);
  };

  const handleEdit = (template: EmailTemplate) => {
    navigate(`/admin/email-management/update/${template.id}`, { state: template });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates();
  };

  const handleCreateNew = () => {
    localStorage.removeItem(LOCAL_KEY);
    navigate('/admin/create-email-template');
  };

  const columns = [
    {
      title: 'Tên mẫu email',
      dataIndex: 'templateName',
      key: 'templateName',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      sortOrder: sortOrder,
      render: (val: string) => val ? new Date(val).toLocaleString() : '',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: EmailTemplate) => (
        <Space>
          <Button type="default" size="small" onClick={() => handleView(record)}>
            Xem chi tiết
          </Button>
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>
            Chỉnh sửa
          </Button>
        </Space>
      ),
      align: 'right' as const,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Danh sách mẫu email</Title>
        <Button type="primary" onClick={handleCreateNew}>Tạo mới</Button>
      </div>
      <form onSubmit={handleFilterSubmit} style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Input
          placeholder="Tìm kiếm theo tên mẫu email"
          value={filter}
          onChange={handleFilterChange}
          style={{ width: 240 }}
        />
        <Button type="primary" htmlType="submit">Tìm kiếm</Button>
      </form>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={templates}
          columns={columns}
          rowKey="id"
          pagination={false}
          loading={loading}
          onChange={handleTableChange}
        />
      )}
      <Modal
        open={modalOpen}
        onCancel={handleClose}
        title="Chi tiết mẫu email"
        footer={<Button onClick={handleClose}>Đóng</Button>}
        width={700}
      >
        {selected && (
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {Object.entries(selected).map(([key, value]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <Text strong>{fieldLabels[key] || key}</Text>
                {key === 'bodyContent' ? (
                  <div
                    style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, marginTop: 4, background: '#fafbfc', overflowX: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: String(value) }}
                  />
                ) : (
                  <div style={{ wordBreak: 'break-all', color: '#555' }}>{String(value)}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmailTemplatetList;
