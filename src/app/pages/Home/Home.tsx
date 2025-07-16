import { useEffect, useState } from "react";
import { getWeather } from "../../../api/home/homeApi";
import { Card, Row, Col, Typography, Space, Statistic, Spin, Collapse } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, CarOutlined, TeamOutlined } from "@ant-design/icons";
import backgroundHcmCity from "../../assets/backgroundhcmcity.png";
import { MetroLineApi } from "../../../api/metroLine/MetroLineApi";
import { StationApi } from "../../../api/station/StationApi";
import { PromotionApi } from "../../../api/promotion/PromotionApi";
import metroMap from '../../assets/Metro Map.png';
import type { GetMetroLineDTO } from "../../../api/metroLine/MetroLineInterface";
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const { Title, Text } = Typography;
const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const CITY_NAME = "Ho Chi Minh";

const metroLineStatusList = [
  {
    code: "T1",
    name: "Tuyến Số 1",
    icon: "/stations/icon_t01.png",
    status: "Normal service",
    color: "#FFA500", // orange
  },
  {
    code: "T2",
    name: "Tuyến Số 2",
    icon: "/stations/icon_t02.png",
    status: "Normal service",
    color: "#FF3B30", // red
  },
  {
    code: "T3",
    name: "Tuyến Số 3",
    icon: "/stations/icon_t03.png",
    status: "Normal service",
    color: "#4A90E2", // blue
  },
  {
    code: "T4",
    name: "Tuyến Số 4",
    icon: "/stations/icon_t04.png",
    status: "Normal service",
    color: "#50E3C2", // teal
  },
  {
    code: "T5",
    name: "Tuyến Số 5",
    icon: "/stations/icon_t05.png",
    status: "Normal service",
    color: "#B8E986", // light green
  },
  {
    code: "T6",
    name: "Tuyến Số 6",
    icon: "/stations/icon_t06.png",
    status: "Normal service",
    color: "#BD10E0", // purple
  },
  {
    code: "T7",
    name: "Tuyến Số 7",
    icon: "/stations/icon_t07.png",
    status: "Normal service",
    color: "#7ED321", // green
  },
  {
    code: "T8",
    name: "Tuyến Số 8",
    icon: "/stations/icon_t08.png",
    status: "Normal service",
    color: "#A0522D", // brown
  },
];

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [temperature, setTemperature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    metroLines: 0,
    stations: 0,
    promotions: 0,
    operatingHours: "5:00 - 23:00"
  });

  // New state for fetched metro lines
  const [metroLines, setMetroLines] = useState<GetMetroLineDTO[]>([]); // Array of metro line objects
  const [currentMetroIndex, setCurrentMetroIndex] = useState(0);
  const [metroLinesLoading, setMetroLinesLoading] = useState(true);

  // Personalization: get username from localStorage
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    setUsername(localStorage.getItem('username'));
  }, []);

  const handleNextMetro = () => {
    if (metroLines.length > 0) {
      setCurrentMetroIndex((prev) => (prev + 1) % metroLines.length);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metroLinesRes, stationsRes, promotionsRes] = await Promise.all([
          MetroLineApi.getAllMetroLines(),
          StationApi.getAllStations(),
          PromotionApi.getAllPromotions({})
        ]);

        setStats({
          metroLines: metroLinesRes.result?.length || 0,
          stations: stationsRes.result?.length || 0,
          promotions: promotionsRes.result?.length || 0,
          operatingHours: "5:00 - 23:00"
        });

        // Set metro lines from API
        setMetroLines(metroLinesRes.result || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setMetroLinesLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    getWeather(CITY_NAME, API_KEY)
      .then((temp) => {
        setTemperature(temp);
      })
      .catch((err) => {
        console.error("Error fetching weather:", err);
      });
  }, []);

  const now = time.toLocaleTimeString();
  const today = time.toDateString();

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <div 
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundHcmCity})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
          <Title level={1} className="text-5xl font-bold text-center drop-shadow-md" style={{ color: 'white' }}>
            {username ? `Chào mừng, ${username}!` : 'Chào Mừng Đến Với HCMC Metro'}
          </Title>
          <Text className="mt-4 text-lg text-center bg-black/40 px-4 py-2 rounded-md inline-block" style={{ color: 'white' }}>
            {today} | {now}
          </Text>
          <div className="mt-2 text-white text-center">
            <EnvironmentOutlined className="mr-2" />
            <span>
              Nhiệt độ:{" "}
              {temperature !== null
                ? `${(temperature * 1).toFixed(1)}°C / ${(temperature * 1.8 + 32).toFixed(0)}°F`
                : "Loading..."}
            </span>
            <span className="ml-2">Thành phố Hồ Chí Minh</span>
          </div>
        </div>
      </div>

      {/* Metro Line Status Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-6 justify-center">
          {metroLineStatusList.map((line, idx) => (
            <div
              key={line.code}
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ minWidth: 150 }}
              tabIndex={0}
              aria-label={`Thông tin ${line.name}`}
              onKeyDown={e => { if (e.key === 'Enter') alert(`Bạn đã chọn ${line.name}`); }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ background: line.color }}
              >
                <img src={line.icon} alt={line.name} className="w-8 h-8" />
              </div>
              <div className="font-bold text-blue-700 text-base mb-1">{line.name}</div>
              <div className="text-green-500 text-2xl mb-1" aria-label="Trạng thái hoạt động">●</div>
              <div className="text-gray-900 text-sm">{line.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metro Map Section - Interactive */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-blue-700 font-bold text-3xl mb-4">Bản đồ HCMC Metro</h2>
          <div className="w-full max-w-2xl h-auto border border-blue-200 rounded overflow-hidden bg-gray-50">
            {/* Types for zoomIn, zoomOut, resetTransform are () => void */}
            <TransformWrapper
              initialScale={1}
              minScale={0.7}
              maxScale={3}
              doubleClick={{ disabled: true }}
            >
              {({ zoomIn, zoomOut, resetTransform }: { zoomIn: () => void; zoomOut: () => void; resetTransform: () => void }) => (
                <>
                  <div className="flex gap-2 mb-2 justify-end">
                    <button className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={zoomIn} aria-label="Phóng to">+</button>
                    <button className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={zoomOut} aria-label="Thu nhỏ">-</button>
                    <button className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={resetTransform} aria-label="Đặt lại">Reset</button>
                  </div>
                  <TransformComponent>
                    <img
                      src={metroMap}
                      alt="Bản đồ HCMC Metro"
                      className="w-full h-auto select-none"
                      style={{ objectFit: 'contain', pointerEvents: 'all' }}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>
          {/* Legend for highlighting lines (static for now) */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {metroLineStatusList.map((line) => (
              <div key={line.code} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full inline-block" style={{ background: line.color }}></span>
                <span className="text-gray-700 text-sm">{line.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 pb-8 bg-[#f7f4f0]">
        <div className="pt-8 pb-4">
          <h2 className="text-blue-700 font-bold text-4xl mb-4">Câu Hỏi Thường Gặp</h2>
          <Collapse
            accordion
            bordered={false}
            expandIconPosition="start"
            className="bg-transparent"
            style={{ background: "transparent" }}
            items={[
              {
                key: '1',
                label: <span className="text-lg font-medium">Lịch hoạt động tuyến Metro L1</span>,
                children: (
                  <div className="text-base text-gray-700 pl-2 pt-2">
                    Tuyến Metro số 1 (Bến Thành – Suối Tiên) hoạt động từ <b>5:00 sáng đến 23:00 tối</b> mỗi ngày. Tần suất tàu chạy dự kiến từ 5-10 phút/chuyến vào giờ cao điểm và 10-15 phút/chuyến vào giờ bình thường.
                  </div>
                ),
              },
              {
                key: '2',
                label: <span className="text-lg font-medium">Giá vé đi tàu ?</span>,
                children: (
                  <div className="text-base text-gray-700 pl-2 pt-2">
                    Giá vé dự kiến dao động từ <b>8.000đ đến 15.000đ/lượt</b> tùy theo cự ly di chuyển. Ngoài ra, có các loại vé ngày, vé tháng và ưu đãi cho học sinh, sinh viên, người cao tuổi.
                  </div>
                ),
              },
              {
                key: '3',
                label: <span className="text-lg font-medium">Ai được hỗ trợ 100% giá vé ?</span>,
                children: (
                  <div className="text-base text-gray-700 pl-2 pt-2">
                    Đối tượng được miễn 100% giá vé gồm: <b>trẻ em dưới 6 tuổi, người khuyết tật đặc biệt nặng, người có công với cách mạng, cán bộ lão thành cách mạng</b> và các trường hợp theo quy định của thành phố.
                  </div>
                ),
              },
              {
                key: '4',
                label: <span className="text-lg font-medium">Kích thước hành lý được phép mang lên tàu ?</span>,
                children: (
                  <div className="text-base text-gray-700 pl-2 pt-2">
                    Hành khách được mang theo hành lý cá nhân với kích thước tối đa <b>60cm x 40cm x 20cm</b> và tổng trọng lượng không quá <b>20kg</b>. Không được mang vật nuôi, hàng hóa nguy hiểm hoặc cồng kềnh lên tàu.
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Quick Info Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Về HCMC Metro">
              <p>
                HCMC Metro là hệ thống đường sắt nhanh nhất ở Thành phố Hồ Chí Minh, Việt Nam.
                Hệ thống được thiết kế để giảm thiểu tắc nghẽn giao thông và cung cấp một giải pháp vận tải hiện đại, hiệu quả cho các cư dân thành phố.
              </p>
              <p className="mt-4">
                Hiện đang vận hành {stats.metroLines} tuyến đường với {stats.stations} ga, hệ thống metro
                cung cấp một phương tiện di chuyển an toàn, tiện lợi và hiện đại cho người dân thành phố.
              </p>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Điều khoản sử dụng">
              <ul className="list-disc pl-5 text-gray-700 text-base">
                <li>Hành khách cần tuân thủ các quy định về an toàn và trật tự khi sử dụng dịch vụ Metro.</li>
                <li>Không mang theo vật nuôi, hàng hóa nguy hiểm hoặc cồng kềnh lên tàu.</li>
                <li>Giữ gìn vệ sinh chung, không xả rác bừa bãi trong khu vực nhà ga và trên tàu.</li>
                <li>Tuân thủ hướng dẫn của nhân viên Metro và các biển báo tại nhà ga.</li>
                <li>Vi phạm điều khoản có thể bị từ chối phục vụ hoặc xử lý theo quy định pháp luật.</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
