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
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface FareRule {
  id: string;
  minDistance: number;
  maxDistance: number;
  fare: number;
}

const FareRuleManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fareRules, setFareRules] = useState<FareRule[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<FareRule | null>(null);

  // Fetch fare rules
  useEffect(() => {
    fetchFareRules();
  }, []);

  const fetchFareRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fare-rules');
      if (!response.ok) {
        throw new Error('Failed to fetch fare rules');
      }
      const data = await response.json();
      setFareRules(data);
    } catch (error) {
      message.error('Failed to fetch fare rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const url = editingRule 
        ? `/api/fare-rules/${editingRule.id}`
        : '/api/fare-rules';
      
      const method = editingRule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingRule ? 'update' : 'create'} fare rule`);
      }

      message.success(`Fare rule ${editingRule ? 'updated' : 'created'} successfully`);
      setIsModalVisible(false);
      form.resetFields();
      setEditingRule(null);
      fetchFareRules();
    } catch (error) {
      message.error(`Failed to ${editingRule ? 'update' : 'create'} fare rule`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fare-rules/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete fare rule');
      }

      message.success('Fare rule deleted successfully');
      fetchFareRules();
    } catch (error) {
      message.error('Failed to delete fare rule');
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

  const columns: ColumnsType<FareRule> = [
    {
      title: 'Distance Range (km)',
      key: 'distance',
      render: (_, record) => `${record.minDistance} - ${record.maxDistance}`,
      sorter: (a, b) => a.minDistance - b.minDistance,
    },
    {
      title: 'Fare (VND)',
      dataIndex: 'fare',
      key: 'fare',
      render: (fare: number) => fare.toLocaleString('vi-VN'),
      sorter: (a, b) => a.fare - b.fare,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete fare rule"
            description="Are you sure you want to delete this fare rule?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={2}>Fare Rules Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
        >
          Add New Rule
        </Button>
      </Space>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={fareRules}
            rowKey="id"
            pagination={false}
          />
        </Spin>
      </Card>

      <Modal
        title={editingRule ? 'Edit Fare Rule' : 'Add New Fare Rule'}
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
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="minDistance"
                label="Minimum Distance (km)"
                rules={[
                  { required: true, message: 'Please enter minimum distance' },
                  { type: 'number', min: 0, message: 'Distance must be greater than or equal to 0' }
                ]}
                dependencies={['maxDistance']}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter minimum distance"
                  min={0}
                  step={0.1}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="maxDistance"
                label="Maximum Distance (km)"
                rules={[
                  { required: true, message: 'Please enter maximum distance' },
                  { type: 'number', min: 0, message: 'Distance must be greater than or equal to 0' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || !getFieldValue('minDistance') || value > getFieldValue('minDistance')) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Maximum distance must be greater than minimum distance'));
                    },
                  }),
                ]}
                dependencies={['minDistance']}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter maximum distance"
                  min={0}
                  step={0.1}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="fare"
                label="Fare (VND)"
                rules={[
                  { required: true, message: 'Please enter fare' },
                  { type: 'number', min: 0, message: 'Fare must be greater than or equal to 0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter fare"
                  min={0}
                  addonBefore="₫"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRule ? 'Update Rule' : 'Add Rule'}
              </Button>
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingRule(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default FareRuleManagement; 