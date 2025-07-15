import { useEffect, useState } from "react";
import { getWeather } from "../../../api/home/homeApi";
import { Card, Row, Col, Typography, Space, Statistic, Spin } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, CarOutlined, TeamOutlined } from "@ant-design/icons";
import backgroundHcmCity from "../../assets/backgroundhcmcity.png";
import { MetroLineApi } from "../../../api/metroLine/MetroLineApi";
import { StationApi } from "../../../api/station/StationApi";
import { PromotionApi } from "../../../api/promotion/PromotionApi";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;
const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const CITY_NAME = "Ho Chi Minh";

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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
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
    <div className="min-h-[calc(100vh-120px)] bg-gray-100">
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
            Chào Mừng Đến Với HCMC Metro
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

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Số tuyến đường"
                  value={stats.metroLines}
                  prefix={<CarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Số ga"
                  value={stats.stations}
                  prefix={<EnvironmentOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Khuyến mãi đang áp dụng"
                  value={stats.promotions}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Giờ hoạt động"
                  value={stats.operatingHours}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
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
            <Card title="Liên kết nhanh">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Link to="/tickets/buy-route" className="text-blue-600 hover:text-blue-800">
                  • Mua vé
                </Link>
                <Link to="/metro-line" className="text-blue-600 hover:text-blue-800">
                  • Xem tuyến đường
                </Link>
                <Link to="/schedule" className="text-blue-600 hover:text-blue-800">
                  • Xem lịch trình
                </Link>
                <Link to="/contact" className="text-blue-600 hover:text-blue-800">
                  • Thông tin liên hệ
                </Link>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
