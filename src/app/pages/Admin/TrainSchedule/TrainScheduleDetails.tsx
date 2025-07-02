import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Typography, message, Space, Button, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { TrainScheduleApi } from '../../../../api/trainSchedule/TrainScheduleApi';
import type { GetTrainScheduleDTO } from '../../../../api/trainSchedule/TrainScheduleInterface';
import { TrainScheduleType, TrainScheduleStatus } from '../../../../api/trainSchedule/TrainScheduleInterface';

const { Title, Text } = Typography;

const TrainScheduleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [schedule, setSchedule] = useState<GetTrainScheduleDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchScheduleDetails = async () => {
            if (!id) {
                setError('Train Schedule ID is missing.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await TrainScheduleApi.getTrainScheduleById(id);
                if (response.isSuccess && response.result) {
                    setSchedule(response.result);
                } else {
                    setError(response.message || 'Failed to fetch train schedule details.');
                    message.error(response.message || 'Failed to fetch train schedule details.');
                }
            } catch (err) {
                setError('An error occurred while fetching details.');
                message.error('An error occurred while fetching details.');
                console.error('Error fetching train schedule details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchScheduleDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spin size="large" tip="Loading train schedule details..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full text-red-600">
                <Text type="danger">{error}</Text>
            </div>
        );
    }

    if (!schedule) {
        return (
            <div className="flex justify-center items-center h-full">
                <Text>No train schedule found.</Text>
            </div>
        );
    }

    const statusColors = {
        [TrainScheduleStatus.Normal]: 'success',
        [TrainScheduleStatus.Cancelled]: 'error',
        [TrainScheduleStatus.OutOfService]: 'warning'
    };
    const statusText = {
        [TrainScheduleStatus.Normal]: 'Bình thường',
        [TrainScheduleStatus.Cancelled]: 'Bị hủy',
        [TrainScheduleStatus.OutOfService]: 'Không đón khách'
    };

    return (
        <div className="min-h-full flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-3xl">
                <Button
                    type="default"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin/train-schedule')}
                    className="mb-4"
                >
                    Quay lại danh sách
                </Button>
                <Card className="max-w-3xl mx-auto shadow-lg">
                    <Title level={3} className="text-center mb-6">Thông Tin Chi Tiết Lịch Tàu</Title>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <Text strong>Tuyến Metro:</Text>
                            <p>{schedule.metroLineName}</p>
                        </div>
                        <div>
                            <Text strong>Ga:</Text>
                            <p>{schedule.stationName}</p>
                        </div>
                        <div>
                            <Text strong>Thời Gian Bắt Đầu:</Text>
                            {/* Assuming time is in "HH:mm:ss" format from the backend */}
                            <p>{dayjs().hour(parseInt(schedule.startTime.split(':')[0])).minute(parseInt(schedule.startTime.split(':')[1])).format('HH:mm')}</p>
                        </div>
                        <div>
                            <Text strong>Hướng:</Text>
                            <p>
                                <Tag color={schedule.direction === TrainScheduleType.Forward ? 'blue' : 'green'}>
                                    {schedule.direction === TrainScheduleType.Forward ? 'Hướng xuôi' : 'Hướng ngược'}
                                </Tag>
                            </p>
                        </div>
                        <div>
                            <Text strong>Trạng Thái:</Text>
                            <p>
                                <Tag color={statusColors[schedule.status]}>
                                    {statusText[schedule.status]}
                                </Tag>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TrainScheduleDetails;
