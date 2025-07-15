import React, { useRef, useState, useEffect } from 'react';
import { Modal, Typography, Spin, message, Radio, Tag } from 'antd';
import QRScanner from './QRScanner';
import axiosInstance from '../../../settings/axiosInstance';
import dayjs from 'dayjs';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, HomeOutlined, HourglassOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

const TicketProcessingQR: React.FC = () => {
  const [result, setResult] = useState('');
  const [processResult, setProcessResult] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stationInfo, setStationInfo] = useState<{ name: string; id: string } | null>(null);
  const [shiftTime, setShiftTime] = useState<{ start: string; end: string } | null>(null);
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const [countdownType, setCountdownType] = useState<'before' | 'working' | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  const [processType, setProcessType] = useState<'checkin' | 'checkout'>('checkin');
  const processTypeRef = useRef<'checkin' | 'checkout'>('checkin');
  const scannerRef = useRef<{ startScan: () => void } | null>(null);

  const intervalRef = useRef<number | undefined>(undefined);

  const formatTimeLeft = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    const fetchTodaySchedule = async () => {
      setLoadingSchedule(true);
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
            const diff = start.diff(now, 'second');
            setCountdownText(formatTimeLeft(diff));
            setCountdownType('before');
          } else if (now.isAfter(start) && now.isBefore(end)) {
            const diff = end.diff(now, 'second');
            setCountdownText(formatTimeLeft(diff));
            setCountdownType('working');
          } else {
            setCountdownText(null);
            setCountdownType(null);
            window.clearInterval(intervalRef.current);
          }
        };

        updateCountdown();
        intervalRef.current = window.setInterval(updateCountdown, 1000);
      } catch (err) {
        message.error('Lỗi khi tải lịch làm việc.');
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchTodaySchedule();

    return () => {
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleProcessTypeChange = (value: 'checkin' | 'checkout') => {
    setProcessType(value);
    processTypeRef.current = value;
  };

  const handleScanSuccess = async (decodedText: string, stopScan: () => void) => {
    stopScan();
    setResult(decodedText);

    if (!stationInfo) {
      message.warning('Không tìm thấy ga làm việc hôm nay.');
      return;
    }

    try {
      const url =
        processTypeRef.current === 'checkin'
          ? '/api/Ticket/check-in-ticket-process'
          : '/api/Ticket/check-out-ticket-process';

      const res = await axiosInstance.put(url, {
        qrCode: decodedText,
        stationId: stationInfo.id,
      });
      setProcessResult(res.data.message || '✔️ Xử lý thành công');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || '❌ Không thể xử lý vé';
      setProcessResult(msg);
    } finally {
      setIsModalVisible(true);
    }
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setResult('');
    setProcessResult(null);
    scannerRef.current?.startScan();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xl space-y-6">
        {loadingSchedule ? (
          <Spin />
        ) : stationInfo ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm space-y-2">
            <p className="flex items-center gap-2">
              <HomeOutlined className="text-blue-500" />
              Ga làm việc: <strong>{stationInfo.name}</strong>
            </p>
            <p className="flex items-center gap-2">
              <ClockCircleOutlined className="text-blue-500" />
              Ca: <strong>{shiftTime?.start} - {shiftTime?.end}</strong>
            </p>

            {countdownText && countdownType === 'before' && (
              <p className="flex items-center gap-2">
                <HourglassOutlined className="text-orange-500" />
                Bắt đầu sau: <Tag color="processing">{countdownText}</Tag>
              </p>
            )}

            {countdownText && countdownType === 'working' && (
              <p className="flex items-center gap-2 text-green-500">
                <CheckCircleOutlined /> Thời gian làm việc còn lại: <strong>{countdownText}</strong>
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center text-red-500 text-sm gap-2">
            <CloseCircleOutlined className="text-red-500" />
            Không có ca làm hôm nay.
          </div>
        )}

        

        {countdownType === 'working' ? (
            <>
            <div>
          <label className="block font-medium mb-1">Chọn loại xử lý:</label>
          <Radio.Group
            value={processType}
            onChange={(e) => handleProcessTypeChange(e.target.value)}
            className="w-full"
            disabled={countdownType !== 'working'}
          >
            <Radio.Button value="checkin">Check-in</Radio.Button>
            <Radio.Button value="checkout">Check-out</Radio.Button>
          </Radio.Group>
        </div>

        <div className="border rounded-xl p-4 bg-gray-100">
          <QRScanner onScanSuccess={handleScanSuccess} scannerRef={scannerRef} />
        </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-4">
              🕒 Vui lòng đợi đến giờ làm để bắt đầu quét vé.
            </div>
          )}

        

        <Modal
          title="Kết quả xử lý vé"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleOk}
          okText="OK"
          cancelText="Đóng"
        >
          <Paragraph>{processResult}</Paragraph>
        </Modal>
      </div>
    </div>
  );
};

export default TicketProcessingQR;
