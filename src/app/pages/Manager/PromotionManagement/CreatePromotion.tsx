import React, { useState } from 'react';
import { Form, Input, Button, Card, DatePicker, Select, InputNumber, message } from 'antd';
import { SaveOutlined, RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { PromotionApi } from '../../../../api/promotion/PromotionApi';
import type { CreatePromotionDTO } from '../../../../api/promotion/PromotionInterface';
import { PromotionType } from '../../../../api/promotion/PromotionInterface';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface PromotionFormData {
  code: string;
  description: string;
  promotionType: PromotionType;
  percentage?: number | null;
  fixedAmount?: number | null;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

const CreatePromotion: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: PromotionFormData) => {
    try {
      setLoading(true);
      
      const promotionData: CreatePromotionDTO = {
        code: values.code,
        description: values.description,
        promotionType: values.promotionType === PromotionType.Percentage ? 0 : 1,
        percentage: values.promotionType === PromotionType.Percentage ? values.percentage : null,
        fixedAmount: values.promotionType === PromotionType.FixedAmount ? values.fixedAmount : null,
        startDate: values.dateRange[0].toDate(),
        endDate: values.dateRange[1].toDate()
      };

      const response = await PromotionApi.createPromotion(promotionData);
      
      if (response.isSuccess) {
        message.success('Promotion created successfully!');
        navigate('/manager/promotion');
      } else {
        message.error(response.message || 'Failed to create promotion');
      }
    } catch (error) {
      message.error('Failed to create promotion');
      console.error('Error creating promotion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionTypeChange = (value: PromotionType) => {
    // Reset the discount value when changing promotion type
    if (value === PromotionType.Percentage) {
      form.setFieldsValue({
        percentage: undefined,
        fixedAmount: null
      });
    } else {
      form.setFieldsValue({
        percentage: null,
        fixedAmount: undefined
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card title="Tạo Khuyến Mãi Mới" className="shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            promotionType: PromotionType.Percentage
          }}
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Mã Khuyến Mãi"
              name="code"
              rules={[
                { required: true, message: 'Hãy nhập mã khuyến mãi' },
                { min: 1, message: 'Mã khuyến mãi không được để trống' },
                { whitespace: true, message: 'Mã khuyến mãi không được để trống' }
              ]}
            >
              <Input placeholder="Nhập mã khuyến mãi" />
            </Form.Item>

            <Form.Item
              label="Loại Khuyến Mãi"
              name="promotionType"
              rules={[{ required: true, message: 'Vui lòng chọn loại khuyến mãi' }]}
            >
              <Select onChange={handlePromotionTypeChange}>
                <Select.Option value={PromotionType.Percentage}>Giảm Giá Theo Phần Trăm</Select.Option>
                <Select.Option value={PromotionType.FixedAmount}>Giảm Giá Cố Định</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Mô Tả"
            name="description"
          >
            <TextArea rows={4} placeholder="Nhập mô tả khuyến mãi (tùy chọn)" />
          </Form.Item>

          {/* Discount Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.promotionType !== currentValues.promotionType
              }
            >
              {({ getFieldValue }) => {
                const promotionType = getFieldValue('promotionType');
                return promotionType === PromotionType.Percentage ? (
                  <Form.Item
                    label="Phần Trăm Giảm Giá"
                    name="percentage"
                    rules={[
                      { required: true, message: 'Vui lòng nhập phần trăm giảm giá' },
                      { type: 'number', min: 0, max: 100, message: 'Phần trăm giảm giá phải nằm trong khoảng 0-100' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập phần trăm giảm giá"
                      addonAfter="%"
                      precision={2}
                    />
                  </Form.Item>
                ) : (
                  <Form.Item
                    label="Số Tiền Giảm Giá"
                    name="fixedAmount"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số tiền giảm giá' },
                      { type: 'number', min: 1, message: 'Số tiền giảm giá phải lớn hơn 0' },
                      { type: 'number', validator: (_, value) => {
                        if (value && !Number.isInteger(value)) {
                          return Promise.reject('Số tiền giảm giá phải là số nguyên');
                        }
                        return Promise.resolve();
                      }}
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập số tiền giảm giá"
                      addonBefore="$"
                      precision={0}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </div>

          {/* Date Range */}
          <Form.Item
            label="Thời Gian Áp Dụng"
            name="dateRange"
            rules={[
              { required: true, message: 'Vui lòng chọn thời gian áp dụng' },
              {
                validator: async (_, value) => {
                  if (!value || !value[0] || !value[1]) {
                    throw new Error('Ngày bắt đầu và ngày kết thúc là bắt buộc');
                  }
                  if (value[0].isAfter(value[1])) {
                    throw new Error('Ngày bắt đầu phải trước ngày kết thúc');
                  }
                  if (value[0].isBefore(dayjs())) {
                    throw new Error('Ngày bắt đầu không được trong quá khứ');
                  }
                }
              }
            ]}
          >
            <RangePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              icon={<RollbackOutlined />}
              onClick={() => navigate('/manager/promotion')}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Tạo Khuyến Mãi
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreatePromotion; 