import React, { useState, useEffect, useRef } from 'react';
import {
  Input,
  Button,
  Select,
  message,
  Card,
  Space,
  Spin,
} from 'antd';
import {
  QrcodeOutlined,
  SearchOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import axiosInstance from '../../../../settings/axiosInstance';
import dayjs from 'dayjs';

const TICKET_STATUSES = [
  { value: 0, label: 'Chưa sử dụng' },
  { value: 1, label: 'Đang sử dụng' },
  { value: 2, label: 'Đã sử dụng' },
];

const AdjustTicket: React.FC = () => {
  const [serialNumber, setSerialNumber] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<number | null>(null);

  const [stationInfo, setStationInfo] = useState<{ name: string; id: string } | null>(null);
  const [shiftTime, setShiftTime] = useState<{ start: string; end: string } | null>(null);
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const [countdownType, setCountdownType] = useState<'before' | 'working' | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);

  const formatTimeLeft = (seconds: number): string => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    const fetchTodaySchedule = async () => {
      setLoading(true);
      const today = dayjs().format('YYYY-MM-DDT00:00:00');
      try {
        const res = await axiosInstance.get('/api/StaffSchedule/schedules-by-staff', {
          params: { fromDate: today, toDate: today },
        });

        const schedules = res.data.result;
        if (!schedules || schedules.length === 0) {
          setStationInfo(null);
          setShiftTime(null);
          setCountdownText(null);
          setCountdownType(null);
          return;
        }

        const shift = schedules[0];
        const start = dayjs(`${shift.workingDate}T${shift.startTime}`);
        const end = dayjs(`${shift.workingDate}T${shift.endTime}`);

        setStationInfo({ id: shift.stationId, name: shift.stationName });
        setShiftTime({ start: shift.startTime, end: shift.endTime });

        const updateCountdown = () => {
          const now = dayjs();
          if (now.isBefore(start)) {
            setCountdownText(formatTimeLeft(start.diff(now, 'second')));
            setCountdownType('before');
          } else if (now.isBefore(end)) {
            setCountdownText(formatTimeLeft(end.diff(now, 'second')));
            setCountdownType('working');
          } else {
            setCountdownText(null);
            setCountdownType(null);
            clearInterval(intervalRef.current);
          }
        };

        updateCountdown();
        intervalRef.current = window.setInterval(updateCountdown, 1000);
      } catch (error) {
        message.error('Lỗi khi tải lịch làm việc.');
      } finally {
        setLoading(false);
      }
    };

    fetchTodaySchedule();

    return () => {
      if (intervalRef.current !== undefined) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleSerialSearch = async () => {
    if (!serialNumber.trim()) {
      message.warning('Vui lòng nhập mã số vé');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/Ticket/get-ticket/${serialNumber}`);
      if (response.data.result) {
        const data = response.data.result;
        const ticketData = {
          id: data.id,
          serial: data.ticketSerial,
          status: data.ticketRtStatus,
          serialNumber: data.serialNumber,
          fromStation: data.fromStation,
          toStation: data.toStation,
          price: data.price,
          ticketSerial: data.ticketSerial,
          startDate: data.startDate,
          endDate: data.endDate,
        };
        setSelectedTicket(ticketData);
        setId(data.id);
        setNewStatus(null);
        message.success('Tìm thấy thông tin vé');
      } else {
        setSelectedTicket(null);
        setId(null);
        setNewStatus(null);
        message.error('Không tìm thấy vé với mã số này');
      }
    } catch (error) {
      setSelectedTicket(null);
      setId(null);
      setNewStatus(null);
      message.error('Không tìm thấy vé với mã số này');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSerialSearch();
    }
  };

  const handleStatusChange = (value: number) => {
    setNewStatus(value);
    setSelectedTicket((prev: any) => ({
      ...prev,
      status: value,
    }));
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedTicket || newStatus === null || id === null) return;

    if (countdownType !== 'working') {
      message.warning('Chỉ có thể chỉnh sửa trạng thái trong giờ làm.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(`/api/Ticket/change-ticket-route-status/${id}`, {
        status: newStatus,
      });
      message.success('Cập nhật trạng thái vé thành công');
      setNewStatus(null);
    } catch (error) {
      message.error('Không thể cập nhật trạng thái vé');
      setSelectedTicket((prev: any) => ({
        ...prev,
        status: selectedTicket.status,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = () => {
    message.info('Chức năng quét mã QR sẽ được triển khai sau');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card title="Chỉnh sửa trạng thái vé" className="shadow-lg">
        <Space direction="vertical" size="large" className="w-full">
          {loading ? (
            <Spin />
          ) : stationInfo && shiftTime ? (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm space-y-2">
                <p className="flex items-center gap-2">
                  <HomeOutlined className="text-blue-500" />
                  Ga làm việc: <strong>{stationInfo.name}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-blue-500" />
                  Ca: <strong>{shiftTime.start} - {shiftTime.end}</strong>
                </p>
                {countdownType === 'before' && (
                  <p className="flex items-center gap-2 text-orange-600">
                    <HourglassOutlined /> Bắt đầu sau: <strong>{countdownText}</strong>
                  </p>
                )}
                {countdownType === 'working' && (
                  <p className="flex items-center gap-2 text-green-600">
                    <CheckCircleOutlined /> Thời gian làm việc còn lại: <strong>{countdownText}</strong>
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã số vé"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSerialSearch}
                  loading={loading}
                >
                  Tìm kiếm
                </Button>
                <Button icon={<QrcodeOutlined />} onClick={handleQRScan}>
                  Quét mã QR
                </Button>
              </div>

              {selectedTicket && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">Thông tin vé</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Ga đi</p>
                      <p className="font-medium">{selectedTicket.fromStation}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ga đến</p>
                      <p className="font-medium">{selectedTicket.toStation}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Giá vé</p>
                      <p className="font-medium">
                        {selectedTicket.price?.toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Mã serial</p>
                      <p className="font-medium">{selectedTicket.ticketSerial}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ngày bắt đầu</p>
                      <p className="font-medium">
                        {new Date(selectedTicket.startDate).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ngày kết thúc</p>
                      <p className="font-medium">
                        {new Date(selectedTicket.endDate).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-600 mb-2">Trạng thái hiện tại</p>
                    <div className="flex gap-2">
                      <Select
                        value={selectedTicket.status}
                        onChange={handleStatusChange}
                        options={TICKET_STATUSES}
                        className="flex-1"
                        loading={loading}
                      />
                      <Button
                        type="primary"
                        onClick={handleConfirmStatusChange}
                        loading={loading}
                        disabled={newStatus === null}
                      >
                        Xác nhận
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-red-500 text-sm flex gap-2 items-center">
              <CloseCircleOutlined />
              Không có ca làm hôm nay.
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default AdjustTicket;
