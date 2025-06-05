import React, { useState } from 'react';
import { Button, Modal, Form, Input, message, DatePicker, Select } from 'antd';
import axiosInstance from '../../../../settings/axiosInstance';
import dayjs from 'dayjs';

const { Option } = Select;

interface UpdateProfileButtonProps {
  onUpdate?: () => void; // callback để reload lại thông tin customer nếu cần
}

const UpdateProfileButton: React.FC<UpdateProfileButtonProps> = ({ onUpdate }) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const customerId = user.id;

  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      // Chuyển dateOfBirth về dạng string ISO nếu là dayjs object
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
      };
      const res = await axiosInstance.put(`/api/Customer/user/${customerId}`, payload);
      message.success('Profile updated successfully!');
      setVisible(false);
      // Cập nhật lại localStorage với thông tin mới
      localStorage.setItem('userInfo', JSON.stringify({ ...user, ...payload }));
      // Gọi callback để reload lại thông tin customer nếu có
      if (onUpdate) onUpdate();
    } catch (err: any) {
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
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
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
