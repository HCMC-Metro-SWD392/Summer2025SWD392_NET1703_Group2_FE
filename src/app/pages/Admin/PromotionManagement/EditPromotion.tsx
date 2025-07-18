import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, DatePicker, Select, InputNumber, message, Spin, Popconfirm } from 'antd';
import { SaveOutlined, RollbackOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { PromotionApi } from '../../../../api/promotion/PromotionApi';
import type { GetPromotionDTO, UpdatePromotionDTO } from '../../../../api/promotion/PromotionInterface';
import { PromotionType } from '../../../../api/promotion/PromotionInterface';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface PromotionFormData {
  id: string;
  code: string;
  description?: string | null;
  promotionType: PromotionType | number;
  percentage?: number | string | null;
  fixedAmount?: number | string | null;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

const EditPromotion: React.FC = () => {
  const [form] = Form.useForm<PromotionFormData>();
  const [loading, setLoading] = useState(false);
  const [fetchingPromotion, setFetchingPromotion] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const promotionType = Form.useWatch('promotionType', form);

  useEffect(() => {
    if (promotionType === PromotionType.Percentage) {
      form.setFieldsValue({ fixedAmount: null });
    } else if (promotionType === PromotionType.FixedAmount) {
      form.setFieldsValue({ percentage: null });
    }
  }, [promotionType, form]);

  useEffect(() => {
    const fetchPromotionDetails = async () => {
      if (!id) {
        message.error('Promotion ID is missing.');
        setFetchingPromotion(false);
        return;
      }
      try {
        setFetchingPromotion(true);
        const response = await PromotionApi.getPromotionById(id);
        if (response.isSuccess && response.result) {
          const promotion = response.result;
          form.setFieldsValue({
            id: promotion.id,
            code: promotion.code,
            description: promotion.description,
            promotionType: typeof promotion.promotionType === 'number' 
              ? (promotion.promotionType === 0 ? PromotionType.Percentage : PromotionType.FixedAmount)
              : promotion.promotionType,
            percentage: promotion.percentage,
            fixedAmount: promotion.fixedAmount,
            dateRange: [dayjs(promotion.startDate), dayjs(promotion.endDate)]
          });
        } else {
          message.error(response.message || 'Failed to fetch promotion details');
          navigate('/manager/promotion');
        }
      } catch (error) {
        message.error('Failed to fetch promotion details');
        console.error('Error fetching promotion:', error);
        navigate('/manager/promotion');
      } finally {
        setFetchingPromotion(false);
      }
    };

    fetchPromotionDetails();
  }, [id, form, navigate]);

  const onFinish = async (values: PromotionFormData) => {
    try {
      setLoading(true);

      if (values.promotionType === PromotionType.Percentage) {
        values.fixedAmount = null;
      } else {
        values.percentage = null;
      }

      const promotionData: UpdatePromotionDTO = {
        id: values.id,
        code: form.getFieldValue('code'),
        description: values.description,
        promotionType: typeof values.promotionType === 'number' ? values.promotionType : (values.promotionType === PromotionType.Percentage ? 0 : 1),
        percentage: values.percentage,
        fixedAmount: values.fixedAmount,
        startDate: values.dateRange[0].toDate(),
        endDate: values.dateRange[1].toDate()
      };

      const response = await PromotionApi.updatePromotion(promotionData);

      if (response.isSuccess) {
        message.success('Promotion updated successfully!');
        navigate('/manager/promotion');
      } else {
        message.error(response.message || 'Failed to update promotion');
      }
    } catch (error) {
      message.error('Failed to update promotion');
      console.error('Error updating promotion:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await PromotionApi.deletePromotion(id);
      if (response.isSuccess) {
        message.success('Xóa khuyến mãi thành công');
        navigate('/manager/promotion');
      } else {
        message.error(response.message || 'Xóa khuyến mãi thất bại');
      }
    } catch (error) {
      message.error('Xóa khuyến mãi thất bại');
      console.error('Error deleting promotion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPromotion) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" tip="Loading promotion details..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card title="Chỉnh Sửa Khuyến Mãi" className="shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            promotionType: PromotionType.Percentage // Default value, will be overridden by fetched data
          }}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Mã Khuyến Mãi"
              name="code"
            >
              <Input disabled placeholder="Mã khuyến mãi" />
            </Form.Item>

            <Form.Item
              label="Loại Khuyến Mãi"
              name="promotionType"
              rules={[{ required: true, message: 'Vui lòng chọn loại khuyến mãi' }]}
            >
              <Select>
                <Select.Option value={PromotionType.Percentage}>Giảm Giá Theo Phần Trăm</Select.Option>
                <Select.Option value={PromotionType.FixedAmount}>Giảm Giá Cố Định</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={4} placeholder="Enter promotion description (optional)" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Discount Percentage"
              name="percentage"
              rules={[
                { required: promotionType === PromotionType.Percentage, message: 'Please enter discount percentage' },
                { type: 'number', min: 0, max: 100, message: 'Percentage must be between 0 and 100' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter percentage"
                addonAfter="%"
                precision={2}
                disabled={promotionType !== PromotionType.Percentage}
              />
            </Form.Item>

            <Form.Item
              label="Fixed Amount"
              name="fixedAmount"
              rules={[
                { required: promotionType === PromotionType.FixedAmount, message: 'Please enter fixed amount' },
                { type: 'number', min: 1, message: 'Amount must be greater than 0' },
                { type: 'number', validator: (_, value) => {
                  if (value && !Number.isInteger(value)) {
                    return Promise.reject('Amount must be a whole number');
                  }
                  return Promise.resolve();
                }}
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter fixed amount"
                addonBefore="$"
                precision={0}
                disabled={promotionType !== PromotionType.FixedAmount}
              />
            </Form.Item>
          </div>

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

          <div className="flex justify-end gap-4 mt-6">
            <Button
              icon={<RollbackOutlined />}
              onClick={() => navigate('/manager/promotion')}
            >
              Hủy
            </Button>
            <Popconfirm
              title="Bạn có chắc muốn xóa khuyến mãi này?"
              onConfirm={onDelete}
              okText="Xóa"
              cancelText="Hủy"
              disabled={loading}
            >
              <Button danger loading={loading}>
                Xóa
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Lưu
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EditPromotion;
