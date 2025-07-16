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

const EmailTemplatetList: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter) {
        params.filterOn = 'templateName';
        params.filterQuery = filter;
      }
      const res = await axiosInstance.get('/api/Email/get-all-email-template', { params });
      setTemplates(res.data.result || []);
    } catch (err: any) {
      message.error('Lỗi khi tải danh sách template email.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line
  }, []);

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

  const columns = [
    {
      title: 'Tên Template',
      dataIndex: 'templateName',
      key: 'templateName',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: EmailTemplate) => (
        <Space>
          <Button onClick={() => handleView(record)} size="small">Xem chi tiết</Button>
          <Button type="primary" onClick={() => handleEdit(record)} size="small">Chỉnh sửa</Button>
        </Space>
      ),
      align: 'right' as const,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 16 }}>Danh sách Email Template</Title>
      <form onSubmit={handleFilterSubmit} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          placeholder="Tìm kiếm theo tên template"
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
        />
      )}
      <Modal
        open={modalOpen}
        onCancel={handleClose}
        title="Chi tiết Email Template"
        footer={<Button onClick={handleClose}>Đóng</Button>}
        width={700}
      >
        {selected && (
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {Object.entries(selected).map(([key, value]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <Text strong>{key}</Text>
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
