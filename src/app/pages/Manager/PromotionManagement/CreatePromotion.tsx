import React, { useState } from 'react';
import { Form, Input, Button, Card, DatePicker, Select, InputNumber, Switch, message } from 'antd';
import { SaveOutlined, RollbackOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface PromotionFormData {
  name: string;
  description: string;
  type: string;
  discountType: string;
  discountValue: number;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  isActive: boolean;
  applicableTickets: string[];
  minimumPurchase: number;
  maxDiscount: number;
}

const CreatePromotion: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState('percentage');

  const onFinish = async (values: PromotionFormData) => {
    try {
      setLoading(true);
      // TODO: Add API call to save promotion
      console.log('Form values:', values);
      message.success('Promotion created successfully!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to create promotion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card title="Create New Promotion" className="shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isActive: true,
            discountType: 'percentage',
            type: 'single_ride',
          }}
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Promotion Name"
              name="name"
              rules={[{ required: true, message: 'Please enter promotion name' }]}
            >
              <Input placeholder="Enter promotion name" />
            </Form.Item>

            <Form.Item
              label="Promotion Type"
              name="type"
              rules={[{ required: true, message: 'Please select promotion type' }]}
            >
              <Select>
                <Select.Option value="single_ride">Single Ride Ticket</Select.Option>
                <Select.Option value="periodic">Periodic Ticket</Select.Option>
                <Select.Option value="holiday">Holiday Special</Select.Option>
                <Select.Option value="loyalty">Loyalty Reward</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter promotion description' }]}
          >
            <TextArea rows={4} placeholder="Enter promotion description" />
          </Form.Item>

          {/* Discount Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Discount Type"
              name="discountType"
              rules={[{ required: true, message: 'Please select discount type' }]}
            >
              <Select onChange={(value) => setDiscountType(value)}>
                <Select.Option value="percentage">Percentage</Select.Option>
                <Select.Option value="fixed">Fixed Amount</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Discount Value"
              name="discountValue"
              rules={[{ required: true, message: 'Please enter discount value' }]}
            >
              <InputNumber
                min={0}
                max={discountType === 'percentage' ? 100 : undefined}
                style={{ width: '100%' }}
                placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
              />
            </Form.Item>
          </div>

          {/* Date Range */}
          <Form.Item
            label="Promotion Period"
            name="dateRange"
            rules={[{ required: true, message: 'Please select promotion period' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Applicable Tickets"
              name="applicableTickets"
              rules={[{ required: true, message: 'Please select applicable tickets' }]}
            >
              <Select mode="multiple" placeholder="Select applicable tickets">
                <Select.Option value="metro_line_1">Metro Line 1</Select.Option>
                <Select.Option value="metro_line_2">Metro Line 2</Select.Option>
                <Select.Option value="metro_line_3">Metro Line 3</Select.Option>
                <Select.Option value="bus">Bus</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Minimum Purchase Amount"
              name="minimumPurchase"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Enter minimum purchase amount"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Maximum Discount Amount"
              name="maxDiscount"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Enter maximum discount amount"
              />
            </Form.Item>

            <Form.Item
              label="Active Status"
              name="isActive"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              icon={<RollbackOutlined />}
              onClick={() => form.resetFields()}
            >
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Create Promotion
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreatePromotion; 