import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, message, DatePicker, Select } from 'antd';
import axiosInstance from '../../../../../settings/axiosInstance';
import dayjs from 'dayjs';
import { CalendarOutlined } from '@ant-design/icons';

const { Option } = Select;

interface UpdateProfileButtonProps {
  onUpdate?: () => void;
}

const UpdateProfileButton: React.FC<UpdateProfileButtonProps> = ({ onUpdate }) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // const [fetchedCustomerId, setFetchedCustomerId] = useState<string | null>(null);

  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userId = user.id;

  useEffect(() => {
    // const fetchCustomerId = async () => {
    //   try {
    //     console.log('Fetching customer with userId:', userId);
    //     const response = await axiosInstance.get(`/api/Customer/user/${userId}`);
    //     console.log('API Response:', response.data);
    //     setFetchedCustomerId(response.data.result.id);
    //   } catch (err: any) {
    //     console.error('Error details:', {
    //       status: err.response?.status,
    //       data: err.response?.data,
    //       url: err.config?.url
    //     });
    //     message.error('Failed to fetch customer information: ' + (err.response?.data?.message || err.message));
    //   }
    // };

    // if (userId) {
    //   fetchCustomerId();
    // }
  }, [userId]);

  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);

  const handleFinish = async (values: any) => {
    if (!userId) {
      message.error('User ID not found');
      return;
    }

    setLoading(true);
    try {
      console.log('Current user data:', user);
      console.log('Form values:', values);

      // Format date to match backend format
      const formattedDate = values.dateOfBirth 
        ? dayjs(values.dateOfBirth).format('YYYY-MM-DD')
        : user.dateOfBirth;

      const payload = {
        fullName: values.fullName || user.fullName,
        address: values.address || user.address,
        sex: values.sex || user.sex,
        dateOfBirth: formattedDate,
        email: values.email || user.email,
        phoneNumber: values.phoneNumber || user.phoneNumber,
        identityId: values.identityId || user.identityId,
        customerType: user.customerType ?? 0
      };

      console.log('Updating customer with ID:', userId);
      console.log('Update payload:', payload);

      const updateUrl = `/api/User/${userId}`;
      console.log('Update URL:', updateUrl);

      const res = await axiosInstance.put(updateUrl, payload);
      
      if (res.data && res.data.result) {
        console.log('Update successful. Response:', res.data.result);
        message.success('Profile updated successfully!');
        setVisible(false);
        
        // Update localStorage with new data but preserve userId
        const updatedUser = { 
          ...user,  // Giữ lại userId và các thông tin cũ
          fullName: res.data.result.fullName,
          email: res.data.result.email,
          phoneNumber: res.data.result.phoneNumber,
          address: res.data.result.address,
          dateOfBirth: res.data.result.dateOfBirth,
          identityId: res.data.result.identityId,
          sex: res.data.result.sex
        };
        console.log('Updating localStorage with:', updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        
        if (onUpdate) {
          console.log('Calling onUpdate callback');
          onUpdate();
        }

        // Reload page after successful update
        window.location.reload();
      } else {
        console.error('Invalid response format:', res.data);
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Update error:', {
        status: err.response?.status,
        message: err.message,
        url: err.config?.url,
        payload: err.config?.data
      });
      message.error('Update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={handleOpen} style={{ marginTop: 16 }}>
        Update Profile
      </Button>
      <Modal
        title="Update Profile"
        open={visible}
        onCancel={handleClose}
        onOk={() => form.submit()}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : undefined,
            identityId: user.identityId,
            sex: user.sex,
          }}
        >
          <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: 'Please enter your name' }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Phone Number" name="phoneNumber"> 
            <Input />
          </Form.Item>
          <Form.Item label="Address" name="address"> 
            <Input />
          </Form.Item>
          <Form.Item label="Date of Birth" name="dateOfBirth">
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD" 
              suffixIcon={<CalendarOutlined />} 
            />
          </Form.Item>
          <Form.Item label="Identity ID" name="identityId">
            <Input />
          </Form.Item>
          <Form.Item label="Sex" name="sex">
            <Select>
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateProfileButton;
