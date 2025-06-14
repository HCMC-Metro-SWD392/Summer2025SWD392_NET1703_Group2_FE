import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, TimePicker, message, Space, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { TrainScheduleApi } from '../../../../api/trainSchedule/TrainScheduleApi';
import type { CreateTrainScheduleDTO } from '../../../../api/trainSchedule/TrainScheduleInterface';
import { TrainScheduleType } from '../../../../api/trainSchedule/TrainScheduleInterface';
import { MetroLineApi } from '../../../../api/metroLine/MetroLineApi';
import type { GetMetroLineDTO } from '../../../../api/metroLine/MetroLineInterface';
import { StationApi } from '../../../../api/station/StationApi';
import type { Station } from '../../../../api/station/StationInterface';

const { Option } = Select;

const CreateTrainSchedule: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [metroLines, setMetroLines] = useState<GetMetroLineDTO[]>([]);
    const [stations, setStations] = useState<Station[]>([]);

    useEffect(() => {
        const fetchMetroLines = async () => {
            try {
                const response = await MetroLineApi.getAllMetroLines();
                if (response.isSuccess && response.result) {
                    setMetroLines(response.result);
                } else {
                    message.error(response.message || 'Failed to fetch metro lines.');
                }
            } catch (error) {
                message.error('An error occurred while fetching metro lines.');
                console.error('Error fetching metro lines:', error);
            }
        };

        const fetchStations = async () => {
            try {
                const response = await StationApi.getAllStations();
                if (response.isSuccess && response.result) {
                    setStations(response.result);
                } else {
                    message.error(response.message || 'Failed to fetch stations.');
                }
            } catch (error) {
                message.error('An error occurred while fetching stations.');
                console.error('Error fetching stations:', error);
            }
        };

        fetchMetroLines();
        fetchStations();
    }, []);

    const onFinish = async (values: {
        metroLineId: string;
        stationId: string;
        startTime: Dayjs;
        direction: TrainScheduleType;
    }) => {
        setLoading(true);
        try {
            const response = await TrainScheduleApi.createTrainSchedule(values.metroLineId);

            if (response.isSuccess) {
                message.success('Train Schedule created successfully!');
                navigate('/manager/train-schedule');
            } else {
                message.error(response.message || 'Failed to create train schedule.');
            }
        } catch (error) {
            message.error('An error occurred while creating the train schedule.');
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
                        onFinish={onFinish}
                        initialValues={{
                            direction: TrainScheduleType.Forward, // Default direction
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

                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Tạo Lịch Tàu
                                </Button>
                                <Button onClick={() => navigate('/manager/train-schedule')} disabled={loading}>
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
