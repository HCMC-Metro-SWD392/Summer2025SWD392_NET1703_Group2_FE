import React from "react";
import './FukutoshinLine.css';

interface Station {
  code: string;
  name: string;
}

const stations: Station[] = [
  { code: "t01", name: "Wakoshi" },
  { code: "t02", name: "Chikatetsu-narimasu" },
  { code: "t03", name: "Chikatetsu-akatsuka" },
  { code: "t04", name: "Heiwadai" },
  { code: "t05", name: "Hikawadai" },
  { code: "t06", name: "Kotake-mukaihara" },
  { code: "t07", name: "Senkawa" },
  { code: "t08", name: "Kanamecho" },
  { code: "t09", name: "Ikebukuro" },
  { code: "t10", name: "Zoshigaya" },
  { code: "t11", name: "Nishi-waseda" },
  { code: "t12", name: "Higashi-shinjuku" }
];

const FukutoshinLine: React.FC = () => {
  return (
    <div className="p-6 overflow-x-auto">
      <div className="relative w-max">
        {/* Thanh ngang */}
        <div className="absolute top-3.5 left-6 right-6 h-2 bg-[#3B82F6] -translate-y-1/2 z-0" />

        {/* Danh sách ga */}
        <ul className="flex flex-row space-x-5 relative z-10">
          {stations.map((station) => (
            <li key={station.code} className="flex flex-col items-center min-w-[60px]">
              {/* Nút hình tròn */}
              <div className="relative w-8 h-8">
                <img
                  src={`/stations/icon_${station.code}.png`}
                  alt={station.code}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Tên ga dọc */}
              <div className="mt-1 text-[12px] writing-vertical text-center">
                {station.name}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FukutoshinLine;
