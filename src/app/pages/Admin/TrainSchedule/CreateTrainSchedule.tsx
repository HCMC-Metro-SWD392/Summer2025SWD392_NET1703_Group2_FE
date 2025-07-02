import React, { useState, useEffect } from 'react';
import { Form, Select, Button, message, Space, Card, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TrainScheduleApi } from '../../../../api/trainSchedule/TrainScheduleApi';
import { MetroLineApi } from '../../../../api/metroLine/MetroLineApi';
import type { GetMetroLineDTO } from '../../../../api/metroLine/MetroLineInterface';

const { Option } = Select;

const CreateTrainSchedule: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [metroLines, setMetroLines] = useState<GetMetroLineDTO[]>([]);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);

    useEffect(() => {
        const fetchMetroLines = async () => {
            try {
                const response = await MetroLineApi.getAllMetroLines();
                if (response.isSuccess && response.result) {
                    setMetroLines(response.result);
                } else {
                    message.error(response.message || 'Không thể tải danh sách tuyến metro.');
                }
            } catch (error) {
                message.error('Đã xảy ra lỗi khi tải danh sách tuyến metro.');
                console.error('Error fetching metro lines:', error);
            }
        };

        fetchMetroLines();
    }, []);

    const handleSubmit = async (values: { metroLineId: string }) => {
        setConfirmModalVisible(true);
    };

    const handleConfirm = async () => {
        const values = form.getFieldsValue();
        setLoading(true);
        try {
            const response = await TrainScheduleApi.createTrainSchedule(values.metroLineId);

            if (response.isSuccess) {
                message.success('Lịch tàu đã được tạo thành công!');
                navigate('/admin/train-schedule');
            } else {
                // Handle specific error cases
                if (response.statusCode === 400) {
                    message.error('Thông tin tuyến metro không hợp lệ.');
                } else if (response.statusCode === 404) {
                    message.error('Không tìm thấy tuyến metro.');
                } else {
                    message.error(response.message || 'Không thể tạo lịch tàu.');
                }
            }
        } catch (error) {
            message.error('Đã xảy ra lỗi khi tạo lịch tàu. Vui lòng thử lại sau.');
            console.error('Error creating train schedule:', error);
        } finally {
            setLoading(false);
            setConfirmModalVisible(false);
        }
    };

    return (
        <div className="min-h-full flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-xl">
                <Card title="Tạo Lịch Tàu Mới" className="p-6 bg-white rounded-lg shadow-md">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            label="Tuyến Metro"
                            name="metroLineId"
                            rules={[{ required: true, message: 'Vui lòng chọn tuyến metro!' }]}
                        >
                            <Select placeholder="Chọn tuyến metro">
                                {metroLines.map(line => (
                                    <Option key={line.id} value={line.id}>{line.metroName}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Tạo Lịch Tàu
                                </Button>
                                <Button onClick={() => navigate('/admin/train-schedule')} disabled={loading}>
                                    Hủy
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>
            </div>

            <Modal
                title="Xác nhận tạo lịch tàu"
                open={confirmModalVisible}
                onOk={handleConfirm}
                onCancel={() => setConfirmModalVisible(false)}
                okText="Xác nhận"
                cancelText="Hủy"
                confirmLoading={loading}
            >
                <p>Bạn có chắc chắn muốn tạo lịch tàu mới cho tuyến metro này? Hành động này sẽ xóa lịch tàu hiện tại và tạo lịch mới.</p>
            </Modal>
        </div>
    );
};

export default CreateTrainSchedule;
