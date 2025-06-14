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

  // API call to fetch ticket by serial number
  const fetchTicketBySerial = async (serial: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/api/Ticket/get-ticket/${serial}`);
      if (response.data.result) {
        return {
          id: response.data.result.id,
          eventName: response.data.result.eventName,
          customerName: response.data.result.customerName,
          status: response.data.result.status,
          purchaseDate: response.data.result.purchaseDate,
          serialNumber: response.data.result.serialNumber
        };
      }
      return null;
    } catch (error) {
      message.error('Không tìm thấy vé với mã số này');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // API call to update ticket status
  const updateTicketStatus = async (ticketId: string, newStatus: number) => {
    setLoading(true);
    try {
      await axiosInstance.post(`/api/Ticket/change-ticket-route-status/${ticketId}`, { status: newStatus });
      message.success('Cập nhật trạng thái vé thành công');
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    } catch (error) {
      message.error('Không thể cập nhật trạng thái vé');
    } finally {
      setLoading(false);
    }
  };

  const handleSerialSearch = async () => {
    if (!serialNumber.trim()) {
      message.warning('Vui lòng nhập mã số vé');
      return;
    }

    const ticket = await fetchTicketBySerial(serialNumber);
    if (ticket) {
      setSelectedTicket(ticket);
    } else {
      setSelectedTicket(null);
    }
  };

  // Add keyboard event handler for Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSerialSearch();
    }
  };

  const handleStatusChange = async (newStatus: number) => {
    if (!selectedTicket) return;
    await updateTicketStatus(selectedTicket.id, newStatus);
  };

  const handleQRScan = () => {
    // TODO: Implement QR code scanning functionality
    message.info('Chức năng quét mã QR sẽ được triển khai sau');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card title="Chỉnh sửa trạng thái vé" className="shadow-lg">
        <Space direction="vertical" size="large" className="w-full">
          {/* Search Section */}
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

          {/* Ticket Information */}
          {selectedTicket && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Thông tin vé</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Mã số vé</p>
                  <p className="font-medium">{selectedTicket.serialNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Sự kiện</p>
                  <p className="font-medium">{selectedTicket.eventName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Khách hàng</p>
                  <p className="font-medium">{selectedTicket.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ngày mua</p>
                  <p className="font-medium">{selectedTicket.purchaseDate}</p>
                </div>
              </div>

              {/* Status Update Section */}
              <div className="mt-4">
                <p className="text-gray-600 mb-2">Trạng thái hiện tại</p>
                <Select
                  value={selectedTicket.status}
                  onChange={handleStatusChange}
                  options={TICKET_STATUSES}
                  className="w-full"
                  loading={loading}
                />
              </div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default AdjustTicket;
