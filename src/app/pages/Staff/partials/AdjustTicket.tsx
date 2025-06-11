import React, { useState } from 'react';
import { Input, Button, Select, message, Card, Space } from 'antd';
import { QrcodeOutlined, SearchOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../settings/axiosInstance';

// Ticket statuses
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

  const handleSerialSearch = async () => {
    if (!serialNumber.trim()) {
      message.warning('Vui lòng nhập mã số vé');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/Ticket/get-ticket/${serialNumber}`);
      if (response.data.result) {
        const ticketData = {
          id: response.data.result.id,
          serial: response.data.result.ticketSerial,
          status: response.data.result.ticketRtStatus,
          serialNumber: response.data.result.serialNumber,
          fromStation: response.data.result.fromStation,
          toStation: response.data.result.toStation,
          price: response.data.result.price,
          ticketSerial: response.data.result.ticketSerial,
          startDate: response.data.result.startDate,
          endDate: response.data.result.endDate
        };
        setSelectedTicket(ticketData);
        setId(response.data.result.id);
        setNewStatus(null); // Reset newStatus when searching for a new ticket
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
      status: value
    }));
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedTicket || newStatus === null || id === null) return;
    setLoading(true);
    try {
      const statusNumber = Number(newStatus);
      await axiosInstance.put(`/api/Ticket/change-ticket-route-status/${id}`, { status: statusNumber });
      message.success('Cập nhật trạng thái vé thành công');
      setNewStatus(null);
    } catch (error) {
      message.error('Không thể cập nhật trạng thái vé');
      setSelectedTicket((prev: any) => ({
        ...prev,
        status: selectedTicket.status
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
            <Button
              icon={<QrcodeOutlined />}
              onClick={handleQRScan}
            >
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
                  <p className="font-medium">{selectedTicket.price?.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <div>
                  <p className="text-gray-600">Mã serial</p>
                  <p className="font-medium">{selectedTicket.ticketSerial}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ngày bắt đầu</p>
                  <p className="font-medium">{new Date(selectedTicket.startDate).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ngày kết thúc</p>
                  <p className="font-medium">{new Date(selectedTicket.endDate).toLocaleString('vi-VN')}</p>
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
        </Space>
      </Card>
    </div>
  );
};

export default AdjustTicket;
