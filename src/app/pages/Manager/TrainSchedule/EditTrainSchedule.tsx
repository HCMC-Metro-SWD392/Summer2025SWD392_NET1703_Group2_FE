import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, TimePicker, message, Spin, Typography, Space, Popconfirm, Card } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { TrainScheduleApi } from '../../../../api/trainSchedule/TrainScheduleApi';
import type { UpdateTrainScheduleDTO, GetTrainScheduleDTO } from '../../../../api/trainSchedule/TrainScheduleInterface';
import { TrainScheduleType, TrainScheduleStatus } from '../../../../api/trainSchedule/TrainScheduleInterface';
import { MetroLineApi } from '../../../../api/metroLine/MetroLineApi';
import type { GetMetroLineDTO } from '../../../../api/metroLine/MetroLineInterface';
import { StationApi } from '../../../../api/station/StationApi';
import type { Station } from '../../../../api/station/StationInterface';

const { Option } = Select;
const { Title } = Typography;

const EditTrainSchedule: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [metroLines, setMetroLines] = useState<GetMetroLineDTO[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [currentScheduleStatus, setCurrentScheduleStatus] = useState<TrainScheduleStatus | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!id) {
                message.error('Train Schedule ID is missing.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Fetch Metro Lines and Stations
                const [metroLinesResponse, stationsResponse, scheduleResponse] = await Promise.all([
                    MetroLineApi.getAllMetroLines(),
                    StationApi.getAllStations(),
                    TrainScheduleApi.getTrainScheduleById(id)
                ]);

                if (metroLinesResponse.isSuccess && metroLinesResponse.result) {
                    setMetroLines(metroLinesResponse.result);
                } else {
                    message.error(metroLinesResponse.message || 'Failed to fetch metro lines.');
                }

                if (stationsResponse.isSuccess && stationsResponse.result) {
                    setStations(stationsResponse.result);
                } else {
                    message.error(stationsResponse.message || 'Failed to fetch stations.');
                }

                if (scheduleResponse.isSuccess && scheduleResponse.result) {
                    const scheduleData = scheduleResponse.result;
                    setCurrentScheduleStatus(scheduleData.status);
                    form.setFieldsValue({
                        metroLineId: scheduleData.metroLineId,
                        stationId: scheduleData.stationId,
                        startTime: dayjs().hour(parseInt(scheduleData.startTime.split(':')[0])).minute(parseInt(scheduleData.startTime.split(':')[1])),
                        direction: scheduleData.direction,
                    });
                } else {
                    message.error(scheduleResponse.message || 'Failed to fetch train schedule details.');
                }
            } catch (error) {
                message.error('An error occurred while fetching initial data.');
                console.error('Error fetching initial data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, form]);

    const onFinish = async (values: {
        metroLineId?: string;
        stationId?: string;
        startTime?: Dayjs;
        direction?: TrainScheduleType;
    }) => {
        if (!id) {
            message.error('Cannot update: Train Schedule ID is missing.');
            return;
        }

        setSubmitting(true);
        try {
            const updatePayload: UpdateTrainScheduleDTO = {
                id: id,
                metroLineId: values.metroLineId,
                stationId: values.stationId,
                startTime: values.startTime ? values.startTime.format('HH:mm:ss') : undefined,
                direction: values.direction,
            };

            const response = await TrainScheduleApi.updateTrainSchedule(updatePayload);

            if (response.isSuccess) {
                message.success('Train Schedule updated successfully!');
                navigate(`/manager/train-schedule/${id}`);
            } else {
                message.error(response.message || 'Failed to update train schedule.');
            }
        } catch (error) {
            message.error('An error occurred while updating the train schedule.');
            console.error('Error updating train schedule:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const isFormDisabled = currentScheduleStatus === TrainScheduleStatus.Cancelled || currentScheduleStatus === TrainScheduleStatus.OutOfService;

    useEffect(() => {
        if (isFormDisabled) {
            message.warning('Không thể chỉnh sửa lịch tàu đã bị hủy hoặc không đón khách.');
        }
    }, [isFormDisabled]);

    const handleCancelSchedule = async () => {
        if (!id) {
            message.error('Cannot cancel: Train Schedule ID is missing.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await TrainScheduleApi.cancelTrainSchedule(id);

            if (response.isSuccess) {
                message.success('Train Schedule cancelled successfully!');
                navigate(`/manager/train-schedule`);
            } else {
                message.error(response.message || 'Failed to cancel train schedule.');
            }
        } catch (error) {
            message.error('An error occurred while cancelling the train schedule.');
            console.error('Error cancelling train schedule:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spin size="large" tip="Loading train schedule data..." />
            </div>
        );
    }

    return (
        <div className="min-h-full flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-xl">
                <Card title="Chỉnh Sửa Lịch Tàu" className="p-6 bg-white rounded-lg shadow-md">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        disabled={isFormDisabled}
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
                            label="Ga"
                            name="stationId"
                            rules={[{ required: true, message: 'Vui lòng chọn ga!' }]}
                        >
                            <Select placeholder="Chọn ga">
                                {stations.map(station => (
                                    <Option key={station.id} value={station.id}>{station.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Thời Gian Bắt Đầu"
                            name="startTime"
                            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
                        >
                            <TimePicker format="HH:mm" className="w-full" />
                        </Form.Item>

                        <Form.Item
                            label="Hướng"
                            name="direction"
                            rules={[{ required: true, message: 'Vui lòng chọn hướng!' }]}
                        >
                            <Select placeholder="Chọn hướng">
                                <Option value={TrainScheduleType.Forward}>Hướng xuôi</Option>
                                <Option value={TrainScheduleType.Backward}>Hướng ngược</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item className="flex justify-center">
                            <Space>
                                <Button type="primary" htmlType="submit" loading={submitting} disabled={isFormDisabled}>
                                    Cập Nhật Lịch Tàu
                                </Button>
                                <Button onClick={() => navigate(`/manager/train-schedule`)} disabled={submitting}>
                                    Hủy
                                </Button>
                                {currentScheduleStatus === TrainScheduleStatus.Normal && (
                                    <Popconfirm
                                        title="Xác nhận hủy lịch tàu"
                                        description="Bạn có chắc chắn muốn hủy lịch tàu này không?"
                                        onConfirm={handleCancelSchedule}
                                        okText="Có"
                                        cancelText="Không"
                                        disabled={submitting}
                                    >
                                        <Button type="primary" danger loading={submitting}>
                                            Hủy Lịch Tàu
                                        </Button>
                                    </Popconfirm>
                                )}
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default EditTrainSchedule;
