import React, { useRef, useState, useEffect } from 'react';
import { Modal, Typography, Select, Spin, message, Radio } from 'antd';
import QRScanner from './QRScanner';
import type { Line, Station } from '../../../types/types';
import { getMetroLines, getStationsByMetroLine } from '../../../api/buyRouteTicket/buyRouteTicket';
import axiosInstance from '../../../settings/axiosInstance';

const { Paragraph } = Typography;
const { Option } = Select;

const TestQR: React.FC = () => {
  const [result, setResult] = useState('');
  const [processResult, setProcessResult] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const scannerRef = useRef<{ startScan: () => void } | null>(null);

  const [lines, setLines] = useState<Line[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [loadingLines, setLoadingLines] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);
  const [processType, setProcessType] = useState<'checkin' | 'checkout'>('checkin');

  useEffect(() => {
    const fetchLines = async () => {
      setLoadingLines(true);
      try {
        const data = await getMetroLines();
        setLines(data.result);
      } catch {
        message.error('Không thể tải danh sách tuyến.');
      } finally {
        setLoadingLines(false);
      }
    };
    fetchLines();
  }, []);

  const handleLineChange = async (lineId: string) => {
    setSelectedLine(lineId);
    setSelectedStation(null);
    setLoadingStations(true);
    try {
      const data = await getStationsByMetroLine(lineId);
      setStations(data.result);
    } catch {
      message.error('Không thể tải danh sách ga.');
    } finally {
      setLoadingStations(false);
    }
  };

  const handleStationChange = (stationId: string) => {
    const station = stations.find((s) => s.id === stationId) || null;
    setSelectedStation(station);
  };

  const handleScanSuccess = async (decodedText: string, stopScan: () => void) => {
    stopScan();
    setResult(decodedText);

    if (!selectedStation || !selectedLine) {
      message.warning("Vui lòng chọn tuyến và ga trước khi quét");
      return;
    }

    try {
      if (processType === "checkin") {
        const response = await axiosInstance.put(
          `/api/Ticket/check-in-ticket-process/${decodedText}/${selectedStation.id}`
        );
        setProcessResult(response.data.message || "Thành công");
      } else {
        const response = await axiosInstance.put(
          `/api/Ticket/check-out-ticket-process/${decodedText}/${selectedStation.id}`
        );
        setProcessResult(response.data.message || "Thành công");
      }
      
    } catch (error: any) {
      let errorMsg = "Không thể xử lý vé.";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setProcessResult(errorMsg);
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
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <div>
        <label className="block font-medium mb-1">Chọn tuyến metro:</label>
        {loadingLines ? (
          <Spin />
        ) : (
          <Select
            placeholder="Chọn tuyến"
            value={selectedLine || undefined}
            onChange={handleLineChange}
            className="w-full"
          >
            {lines.map((line) => (
              <Option key={line.id} value={line.id}>
                {line.metroName}
              </Option>
            ))}
          </Select>
        )}
      </div>

      {selectedLine && (
        <div>
          <label className="block font-medium mb-1">Chọn ga:</label>
          {loadingStations ? (
            <Spin />
          ) : (
            <Select
              placeholder="Chọn ga"
              value={selectedStation?.id}
              onChange={handleStationChange}
              className="w-full"
            >
              {stations.map((station) => (
                <Option key={station.id} value={station.id}>
                  {station.name}
                </Option>
              ))}
            </Select>
          )}
        </div>
      )}

      <div>
        <label className="block font-medium mb-1">Chọn loại xử lý:</label>
        <Radio.Group
          value={processType}
          onChange={(e) => setProcessType(e.target.value)}
          className="w-full"
        >
          <Radio.Button value="checkin">Check-in</Radio.Button>
          <Radio.Button value="checkout">Check-out</Radio.Button>
        </Radio.Group>
      </div>

      <QRScanner onScanSuccess={handleScanSuccess} scannerRef={scannerRef} />

      <Modal
        title="Kết quả xử lý vé"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleOk}
        okText="OK"
        cancelText="Đóng"
      >
        {processResult ? (
          <div className="space-y-2">
            <Paragraph>📄 Thông báo: {processResult}</Paragraph>
          </div>
        ) : (
          <Paragraph type="danger">Không có dữ liệu hoặc xảy ra lỗi!</Paragraph>
        )}
      </Modal>
    </div>
  );
};

export default TestQR;
