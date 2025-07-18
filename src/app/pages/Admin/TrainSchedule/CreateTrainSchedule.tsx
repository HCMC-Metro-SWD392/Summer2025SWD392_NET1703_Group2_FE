import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, message, Space, Card, TimePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TrainScheduleApi } from '../../../../api/trainSchedule/TrainScheduleApi';
import { MetroLineApi } from '../../../../api/metroLine/MetroLineApi';
import type { GetMetroLineDTO } from '../../../../api/metroLine/MetroLineInterface';
import type { CreateTrainScheduleDTO } from '../../../../api/trainSchedule/TrainScheduleInterface';
import dayjs from 'dayjs';

const { Option } = Select;

const TIME_FORMAT = 'HH:mm:ss';

const CreateTrainSchedule: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [metroLines, setMetroLines] = useState<GetMetroLineDTO[]>([]);

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

    const handleSubmit = async (values: any) => {
        // Convert TimePicker values to string (HH:mm:ss)
        const payload: CreateTrainScheduleDTO = {
            ...values,
            peakHourMorningStart: values.peakHourMorningStart.format(TIME_FORMAT),
            peakHourMorningEnd: values.peakHourMorningEnd.format(TIME_FORMAT),
            peakHourEveningStart: values.peakHourEveningStart.format(TIME_FORMAT),
            peakHourEveningEnd: values.peakHourEveningEnd.format(TIME_FORMAT),
        };
        setLoading(true);
        try {
            const response = await TrainScheduleApi.createTrainSchedule(payload);
            if (response.isSuccess) {
                message.success('Lịch tàu đã được tạo thành công!');
                navigate('/admin/train-schedule');
            } else {
                if (response.statusCode === 400) {
                    message.error('Thông tin không hợp lệ.');
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
                        initialValues={{
                            travelTimeBetweenStationsInSeconds: 0,
                            dwellTimeAtStationInSeconds: 0,
                            peakHourMorningStart: dayjs('07:00:00', TIME_FORMAT),
                            peakHourMorningEnd: dayjs('09:00:00', TIME_FORMAT),
                            peakHourEveningStart: dayjs('17:00:00', TIME_FORMAT),
                            peakHourEveningEnd: dayjs('19:00:00', TIME_FORMAT),
                            peakHourHeadwayInSeconds: 0,
                            offPeakHourHeadwayInSeconds: 0
                        }}
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
                        <Form.Item
                            label="Thời gian di chuyển giữa các ga (giây)"
                            name="travelTimeBetweenStationsInSeconds"
                            rules={[{ required: true, type: 'number', min: 0, message: 'Vui lòng nhập số giây hợp lệ!' }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            label="Thời gian dừng tại ga (giây)"
                            name="dwellTimeAtStationInSeconds"
                            rules={[{ required: true, type: 'number', min: 0, message: 'Vui lòng nhập số giây hợp lệ!' }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            label="Giờ bắt đầu cao điểm sáng (hh:mm:ss)"
                            name="peakHourMorningStart"
                            rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu cao điểm sáng!' }]}
                        >
                            <TimePicker format={TIME_FORMAT} showNow={false} showSecond style={{ width: '100%' }} allowClear={false} />
                        </Form.Item>
                        <Form.Item
                            label="Giờ kết thúc cao điểm sáng (hh:mm:ss)"
                            name="peakHourMorningEnd"
                            rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc cao điểm sáng!' }]}
                        >
                            <TimePicker format={TIME_FORMAT} showNow={false} showSecond style={{ width: '100%' }} allowClear={false} />
                        </Form.Item>
                        <Form.Item
                            label="Giờ bắt đầu cao điểm tối (hh:mm:ss)"
                            name="peakHourEveningStart"
                            rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu cao điểm tối!' }]}
                        >
                            <TimePicker format={TIME_FORMAT} showNow={false} showSecond style={{ width: '100%' }} allowClear={false} />
                        </Form.Item>
                        <Form.Item
                            label="Giờ kết thúc cao điểm tối (hh:mm:ss)"
                            name="peakHourEveningEnd"
                            rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc cao điểm tối!' }]}
                        >
                            <TimePicker format={TIME_FORMAT} showNow={false} showSecond style={{ width: '100%' }} allowClear={false} />
                        </Form.Item>
                        <Form.Item
                            label="Tần suất chuyến trong giờ cao điểm (giây)"
                            name="peakHourHeadwayInSeconds"
                            rules={[{ required: true, type: 'number', min: 0, message: 'Vui lòng nhập số giây hợp lệ!' }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            label="Tần suất chuyến ngoài giờ cao điểm (giây)"
                            name="offPeakHourHeadwayInSeconds"
                            rules={[{ required: true, type: 'number', min: 0, message: 'Vui lòng nhập số giây hợp lệ!' }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
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
        </div>
    );
};

export default CreateTrainSchedule;
