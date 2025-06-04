import React, { useState } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import axiosInstance from '../../../../settings/axiosInstance';

const UpdateProfileButton: React.FC = () => {
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
      await axiosInstance.put(`/api/Customer/${customerId}`, values);
      message.success('Profile updated successfully!');
      setVisible(false);
      // Có thể gọi callback để reload lại thông tin nếu muốn
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
        </Form>
      </Modal>
    </>
  );
};

export default UpdateProfileButton;
