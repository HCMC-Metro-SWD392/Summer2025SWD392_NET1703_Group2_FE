import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from 'antd';
import { QrcodeOutlined, StopOutlined } from '@ant-design/icons';

interface QRScannerProps {
  onScanSuccess: (decodedText: string, stopScan: () => void) => void;
  scannerRef: React.MutableRefObject<{ startScan: () => void } | null>;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, scannerRef }) => {
  const qrCodeRegionId = 'qr-reader';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);

  const startScan = async () => {
    const cameras = await Html5Qrcode.getCameras();
    const cameraId = cameras[0]?.id;
    if (!cameraId) return alert('Không tìm thấy camera');

    html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
    setScanning(true);

    html5QrCodeRef.current.start(
      cameraId,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        onScanSuccess(decodedText, stopScan);
      },
      (error) => {
        // optional error handler
      }
    );
  };

  const stopScan = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      html5QrCodeRef.current = null;
      setScanning(false);
    }
  };

  // expose startScan via ref
  useImperativeHandle(scannerRef, () => ({
    startScan
  }));

  useEffect(() => {
    return () => {
      stopScan(); // stop scan on unmount
    };
  }, []);

  return (
    <div className="scanner-container text-center px-4">
      <div
        id={qrCodeRegionId}
        style={{ width: '100%', maxWidth: 400, margin: 'auto' }}
        className="mx-auto my-4"
      />
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
