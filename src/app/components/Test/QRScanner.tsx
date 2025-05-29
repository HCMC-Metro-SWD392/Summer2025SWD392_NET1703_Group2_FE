// QRScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner: React.FC<{ onScanSuccess: (decodedText: string) => void }> = ({ onScanSuccess }) => {
  const qrCodeRegionId = 'qr-reader';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);

  const startScan = async () => {
    const cameraId = (await Html5Qrcode.getCameras())[0]?.id;
    if (!cameraId) return alert('Không tìm thấy camera');

    html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
    setScanning(true);

    html5QrCodeRef.current.start(
      cameraId,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        onScanSuccess(decodedText);
        stopScan();
      },
      (error) => {
        // console.log('Scan error:', error);
      }
    );
  };

  const stopScan = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  return (
    <div className="scanner-container">
      <div id={qrCodeRegionId} style={{ width: '100%', maxWidth: 400, margin: 'auto' }} />
      <div style={{ marginTop: 10 }}>
        {!scanning ? (
          <button onClick={startScan} className="btn">Bắt đầu quét</button>
        ) : (
          <button onClick={stopScan} className="btn btn-danger">Dừng quét</button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
