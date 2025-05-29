// App.tsx
import React, { useState } from 'react';
import QRScanner from './QRScanner';

const TestQR: React.FC = () => {
  const [result, setResult] = useState('');

  const handleScanSuccess = (decodedText: string) => {
    setResult(decodedText);
    alert(decodedText)
  };

  return (
    <div>
      <h1>Quét mã QR với html5-qrcode</h1>
      <QRScanner onScanSuccess={handleScanSuccess} />
      {result && (
        <div>
          <h3>Kết quả:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default TestQR;
