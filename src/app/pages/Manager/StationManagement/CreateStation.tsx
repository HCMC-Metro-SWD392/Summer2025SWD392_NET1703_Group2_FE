import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ControllerRenderProps } from 'react-hook-form';
import { StationApi } from '../../../../api/station/StationApi';
import type { CreateStationDTO, GetStationDTO } from '../../../../api/station/StationInterface';

const CreateStation: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<CreateStationDTO>({
    defaultValues: {
      name: '',
      address: '',
      description: ''
    },
    mode: 'onBlur'
  });

  const onSubmit = async (data: CreateStationDTO) => {
    // Trim all fields before submission
    const trimmedData = {
      name: data.name.trim(),
      address: data.address.trim(),
      description: data.description.trim()
    };

    try {
      setLoading(true);
      const response = await StationApi.createStation(trimmedData);
      
      if (response.isSuccess) {
        message.success('Tạo trạm Metro thành công');
        navigate('/manager/station');
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi tạo trạm Metro');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tạo trạm Metro');
      console.error('Error creating station:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: ControllerRenderProps<CreateStationDTO, keyof CreateStationDTO>) => (
    <Input 
      {...field} 
      onChange={(e) => {
        // Prevent multiple consecutive spaces
        const value = e.target.value.replace(/\s+/g, ' ');
        field.onChange(value);
      }}
      onBlur={(e) => {
        // Trim on blur
        const value = e.target.value.trim();
        field.onChange(value);
      }}
    />
  );

  const renderTextArea = (field: ControllerRenderProps<CreateStationDTO, keyof CreateStationDTO>) => (
    <Input.TextArea 
      {...field} 
      rows={4}
      onChange={(e) => {
        // Prevent multiple consecutive spaces
        const value = e.target.value.replace(/\s+/g, ' ');
        field.onChange(value);
      }}
      onBlur={(e) => {
        // Trim on blur
        const value = e.target.value.trim();
        field.onChange(value);
      }}
    />
  );

  const validateNoOnlySpaces = (value: string) => {
    if (!value || value.trim().length === 0) {
      return 'Không được để trống';
    }
    return true;
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/manager/station')}
        >
          Quay lại
        </Button>
      </div>

      <Card title="Tạo Trạm Metro Mới" className="max-w-2xl mx-auto">
        <Form
          layout="vertical"
          onFinish={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <Form.Item
            label="Tên Trạm"
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
            required
          >
            <Controller
              name="name"
              control={control}
              rules={{
                required: 'Vui lòng nhập tên trạm',
                validate: validateNoOnlySpaces,
                minLength: {
                  value: 2,
                  message: 'Tên trạm phải có ít nhất 2 ký tự'
                },
                maxLength: {
                  value: 100,
                  message: 'Tên trạm không được vượt quá 100 ký tự'
                },
                pattern: {
                  value: /^[a-zA-Z0-9\s\u00C0-\u024F\u1E00-\u1EFF\u0400-\u04FF]+$/,
                  message: 'Tên trạm chỉ được chứa chữ cái, số và khoảng trắng'
                }
              }}
              render={({ field }) => renderField(field)}
            />
          </Form.Item>

          <Form.Item
            label="Địa Chỉ"
            validateStatus={errors.address ? 'error' : ''}
            help={errors.address?.message}
            required
          >
            <Controller
              name="address"
              control={control}
              rules={{
                required: 'Vui lòng nhập địa chỉ',
                validate: validateNoOnlySpaces,
                minLength: {
                  value: 5,
                  message: 'Địa chỉ phải có ít nhất 5 ký tự'
                },
                maxLength: {
                  value: 200,
                  message: 'Địa chỉ không được vượt quá 200 ký tự'
                }
              }}
              render={({ field }) => renderField(field)}
            />
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            validateStatus={errors.description ? 'error' : ''}
            help={errors.description?.message}
            required
          >
            <Controller
              name="description"
              control={control}
              rules={{
                required: 'Vui lòng nhập mô tả',
                validate: validateNoOnlySpaces,
                minLength: {
                  value: 10,
                  message: 'Mô tả phải có ít nhất 10 ký tự'
                },
                maxLength: {
                  value: 500,
                  message: 'Mô tả không được vượt quá 500 ký tự'
                }
              }}
              render={({ field }) => renderTextArea(field)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              Tạo Trạm
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateStation;
