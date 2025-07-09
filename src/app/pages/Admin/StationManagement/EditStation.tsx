import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Spin, Switch } from 'antd';
import React, { useEffect, useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { StationApi } from '../../../../api/station/StationApi';
import type { UpdateStationDTO } from '../../../../api/station/StationInterface';

const EditStation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialIsActive, setInitialIsActive] = useState<boolean | null>(null);
  const { control, handleSubmit, reset, getValues, formState: { errors, isDirty, dirtyFields } } = useForm<UpdateStationDTO & { isActive: boolean }>({
    mode: 'onBlur'
  });

  useEffect(() => {
    fetchStation();
  }, [id]);

  const fetchStation = async () => {
    if (!id) return;
    try {
      setInitialLoading(true);
      const response = await StationApi.getStationById(id);
      if (response.isSuccess && response.result) {
        const station = response.result;
        reset({
          name: station.name,
          address: station.address || undefined,
          description: station.description || undefined,
          isActive: station.isActive
        });
        setInitialIsActive(station.isActive);
      } else {
        message.error(response.message || 'Không thể tải thông tin trạm');
        navigate('/admin/station');
      }
    } catch (error) {
      message.error('Không thể tải thông tin trạm');
      console.error('Error fetching station:', error);
      navigate('/admin/station');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: UpdateStationDTO & { isActive: boolean }) => {
    if (!id) return;
    let updated = false;
    try {
      setLoading(true);
      // Cập nhật thông tin station nếu có thay đổi
      const changedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (key !== 'isActive' && value !== undefined) {
          acc[key as keyof UpdateStationDTO] = value;
        }
        return acc;
      }, {} as UpdateStationDTO);
      if (Object.keys(changedData).length > 0) {
        const response = await StationApi.updateStation(id, changedData);
        if (!response.isSuccess) {
          message.error(response.message || 'Có lỗi xảy ra khi cập nhật trạm Metro');
          return;
        }
        updated = true;
      }
      // Cập nhật trạng thái hoạt động nếu có thay đổi
      if (typeof initialIsActive === 'boolean' && data.isActive !== initialIsActive) {
        const response = await StationApi.setIsActive(id, data.isActive);
        if (!response.isSuccess) {
          message.error(response.message || 'Có lỗi xảy ra khi cập nhật trạng thái hoạt động');
          return;
        }
        updated = true;
      }
      if (updated) {
        message.success('Cập nhật trạm Metro thành công');
        navigate('/admin/station');
      } else {
        message.info('Không có thay đổi nào được thực hiện');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật trạm Metro');
      console.error('Error updating station:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sửa lại generic cho renderField và renderTextArea để chỉ dùng cho các trường string
  const renderField = (field: ControllerRenderProps<UpdateStationDTO, keyof UpdateStationDTO>) => (
    <Input {...field} />
  );

  const renderTextArea = (field: ControllerRenderProps<UpdateStationDTO, keyof UpdateStationDTO>) => (
    <Input.TextArea {...field} rows={4} />
  );

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin/station')}
          >
            Quay lại
          </Button>
        </div>

        <Card title="Chỉnh Sửa Trạm Metro" className="w-full">
          <Form
            layout="vertical"
            onFinish={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <Form.Item label="Trạng thái hoạt động">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Ngừng hoạt động"
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label="Tên Trạm"
              validateStatus={errors.name ? 'error' : ''}
              help={errors.name?.message}
            >
              <Controller
                name="name"
                control={control}
                rules={{
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
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item
              label="Địa Chỉ"
              validateStatus={errors.address ? 'error' : ''}
              help={errors.address?.message}
            >
              <Controller
                name="address"
                control={control}
                rules={{
                  minLength: {
                    value: 5,
                    message: 'Địa chỉ phải có ít nhất 5 ký tự'
                  },
                  maxLength: {
                    value: 200,
                    message: 'Địa chỉ không được vượt quá 200 ký tự'
                  }
                }}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item
              label="Mô Tả"
              validateStatus={errors.description ? 'error' : ''}
              help={errors.description?.message}
            >
              <Controller
                name="description"
                control={control}
                rules={{
                  minLength: {
                    value: 10,
                    message: 'Mô tả phải có ít nhất 10 ký tự'
                  },
                  maxLength: {
                    value: 500,
                    message: 'Mô tả không được vượt quá 500 ký tự'
                  }
                }}
                render={({ field }) => <Input.TextArea {...field} rows={4} />}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!isDirty}
                className="w-full"
              >
                Cập Nhật
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default EditStation;
