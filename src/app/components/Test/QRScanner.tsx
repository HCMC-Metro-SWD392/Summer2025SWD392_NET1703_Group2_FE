import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Html5Qrcode, type CameraDevice } from 'html5-qrcode';
import { Button, Select } from 'antd';
import { QrcodeOutlined, StopOutlined } from '@ant-design/icons';

interface QRScannerProps {
  onScanSuccess: (decodedText: string, stopScan: () => void) => void;
  scannerRef: React.MutableRefObject<{ startScan: () => void } | null>;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, scannerRef }) => {
  const qrCodeRegionId = 'qr-reader';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const getAvailableCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      const backCam = devices.find((d) =>
        d.label.toLowerCase().includes('back')
      );
      setSelectedCameraId(backCam?.id || devices[0]?.id || null);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách camera:', error);
    }
  };

  const startScan = async () => {
    if (!selectedCameraId) {
      alert('Không tìm thấy camera');
      return;
    }

    html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
    setScanning(true);

    try {
      await html5QrCodeRef.current.start(
        selectedCameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScanSuccess(decodedText, stopScan);
        },
        (error) => {
          // Ignore scan errors
        }
      );
    } catch (err) {
      console.error('Lỗi khi bắt đầu quét:', err);
      stopScan();
    }
  };

  const stopScan = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      html5QrCodeRef.current = null;
      setScanning(false);
    }
  };

  useImperativeHandle(scannerRef, () => ({ startScan }));

  useEffect(() => {
    getAvailableCameras();
    return () => {
      stopScan(); // cleanup
    };
  }, []);

  return (
    <div className="scanner-container text-center px-4">
      <div
        id={qrCodeRegionId}
        style={{ width: '100%', maxWidth: 400, margin: 'auto' }}
        className="mx-auto my-4"
      />
      <div className="flex justify-center gap-4 mt-4">
        <Select
          value={selectedCameraId || undefined}
          onChange={setSelectedCameraId}
          style={{ width: 250 }}
          disabled={scanning}
          options={cameras.map((cam) => ({
            label: cam.label || `Camera ${cam.id}`,
            value: cam.id,
          }))}
          placeholder="Chọn camera"
        />
      </div>
      <div className="flex justify-center gap-4 mt-6">
        {!scanning ? (
          <Button
            type="primary"
            icon={<QrcodeOutlined />}
            size="large"
            className="rounded-xl shadow-md px-6 py-2"
            onClick={startScan}
          >
            Bắt đầu quét
          </Button>
        ) : (
          <Button
            danger
            icon={<StopOutlined />}
            size="large"
            className="rounded-xl shadow-md px-6 py-2"
            onClick={stopScan}
          >
            Dừng quét
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
