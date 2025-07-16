import { useEffect, useState } from "react";
import { getWeather } from "../../../api/home/homeApi";
import { Card, Row, Col, Typography, Space, Statistic, Spin, Collapse } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, CarOutlined, TeamOutlined } from "@ant-design/icons";
import backgroundHcmCity from "../../assets/backgroundhcmcity.png";
import { MetroLineApi } from "../../../api/metroLine/MetroLineApi";
import { StationApi } from "../../../api/station/StationApi";
import { PromotionApi } from "../../../api/promotion/PromotionApi";
import metroMap from '../../assets/Metro Map.png';

const { Title, Text } = Typography;
const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const CITY_NAME = "Ho Chi Minh";

// Hardcoded metro line info
const metroLineInfos = [
  {
    name: "TUYẾN METRO SỐ 1",
    subtitle: "(Bến Thành - Suối Tiên)",
    description:
      "Tuyến metro số 1 (Bến Thành – Suối Tiên) của TP.HCM là tuyến metro đầu tiên của thành phố, dài khoảng 19,7 km, bao gồm 14 ga và một depot. Tuyến này sẽ kết nối các khu vực trung tâm như Bến Thành với các quận vùng ven như Thủ Đức và các khu vực đô thị phát triển, giúp giảm ùn tắc giao thông và tạo ra một phương tiện vận chuyển công cộng hiện đại, tiện lợi.",
  },
  {
    name: "TUYẾN METRO SỐ 2",
    subtitle: "(Bến Thành - Tham Lương)",
    description:
      "Tuyến metro số 2 (Bến Thành – Tham Lương) sẽ kết nối trung tâm thành phố với các khu vực phía Tây Bắc, góp phần giảm ùn tắc giao thông và thúc đẩy phát triển đô thị tại các quận lân cận.",
  },
  {
    name: "TUYẾN METRO SỐ 3",
    subtitle: "(Thạnh Xuân - Hiệp Phước)",
    description:
      "Tuyến metro số 3B (Thạnh Xuân – Hiệp Phước) là một trong những tuyến metro dự kiến phát triển tại TP.HCM, dài khoảng 23 km, đi qua nhiều quận như 12, Gò Vấp, Phú Nhuận, Quận 1, Quận 4, và Nhà Bè. Tuyến này bao gồm các ga ngầm và trên cao, với mục tiêu kết nối các khu dân cư phía Bắc thành phố (Thạnh Xuân) đến khu đô thị – cảng Hiệp Phước ở phía Nam. Tuyến metro số 3B sẽ góp phần tăng cường giao thông trục Bắc – Nam, giảm áp lực cho các tuyến đường chính như Nguyễn Thị Minh Khai, Trường Chinh, và Nguyễn Văn Linh.",
  },
  {
    name: "TUYẾN METRO SỐ 4",
    subtitle: "(Công viên Gia Định - Lăng Cha Cả)",
    description:
      "Tuyến metro số 4 (Công viên Gia Định – Khu đô thị Hiệp Phước) có tổng chiều dài khoảng 35,7 km, là một trong những tuyến dài nhất theo quy hoạch, bao gồm khoảng 32 ga và hai depot lớn. Tuyến đi qua các quận trung tâm như Gò Vấp, Phú Nhuận, Quận 3, Quận 1, Quận 4, Quận 7 và kết thúc tại Hiệp Phước (Nhà Bè). Với vai trò là trục xương sống theo hướng Bắc – Nam, tuyến metro số 4 kỳ vọng sẽ tạo đột phá trong kết nối đô thị và phục vụ nhu cầu đi lại cho hàng chục nghìn lượt hành khách mỗi ngày.",
  },
  {
    name: "TUYẾN METRO SỐ 5",
    subtitle: "(Cộng Hòa - Hiệp Bình)",
    description:
      "Tuyến metro số 5 (Cộng Hòa – Hiệp Bình Phước) là tuyến metro theo trục Đông – Tây, dài khoảng 23 km, kết nối từ nút giao Cộng Hòa – Trường Chinh (quận Tân Bình) đến Hiệp Bình Phước (TP Thủ Đức). Tuyến này đi qua nhiều khu vực dân cư đông đúc như Quận 10, Bình Thạnh và Thủ Đức. Khi hoàn thành, tuyến số 5 sẽ giúp phân luồng giao thông giữa nội đô và các khu công nghiệp phía Đông, đồng thời kết nối với các tuyến metro khác như số 1, 2 và 3B để tạo thành mạng lưới giao thông hiện đại và liên hoàn.",
  },
  {
    name: "TUYẾN METRO SỐ 6",
    subtitle: "(Bà Quẹo - Công viên Phú Lâm)",
    description:
      "Tuyến metro số 6 (Bà Quẹo – Công viên Phú Lâm) là tuyến metro ngầm dài khoảng 6,8 km, với 7 nhà ga. Tuyến này bắt đầu từ khu vực Bà Quẹo (gần đường Âu Cơ – Tân Bình), đi qua các trục đường lớn như Lũy Bán Bích và Tân Hòa Đông, và kết thúc tại vòng xoay Phú Lâm (Quận 6). Tuyến metro số 6 có vai trò kết nối khu vực phía Tây TP.HCM với trung tâm, góp phần giảm tải áp lực giao thông tại các tuyến đường huyết mạch, đặc biệt là tuyến xe buýt đông đúc số 69 và các trục Nguyễn Văn Luông, Hồng Bàng.",
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

  const [currentMetroIndex, setCurrentMetroIndex] = useState(0);
  const handleNextMetro = () => {
    setCurrentMetroIndex((prev) => (prev + 1) % metroLineInfos.length);
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

      {/* Metro Line Info Card Section */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div
          className="flex flex-col md:flex-row items-center bg-[#f7f4f0] border-2 border-blue-700 rounded-none p-8 gap-8"
          style={{ minHeight: 220 }}
        >
          <div className="flex-1 flex flex-col items-center md:items-start">
            <div className="text-blue-800 font-bold text-2xl md:text-3xl text-center md:text-left leading-tight">
              {metroLineInfos[currentMetroIndex].name}
            </div>
            <div className="text-blue-800 font-bold text-xl md:text-2xl mt-1 text-center md:text-left">
              {metroLineInfos[currentMetroIndex].subtitle}
            </div>
          </div>
          <div className="flex-[2] text-gray-800 text-base md:text-lg leading-relaxed">
            {metroLineInfos[currentMetroIndex].description}
          </div>
          <div className="flex items-center justify-center mt-6 md:mt-0">
            <button
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-full text-lg shadow transition-all duration-200"
              onClick={handleNextMetro}
            >
              Tuyến Tiếp Theo <span className="ml-2">&#8594;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metro Map Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h2 className="text-blue-700 font-bold text-3xl mb-4">Bản đồ HCMC Metro</h2>
          <img
            src={metroMap}
            alt="Bản đồ HCMC Metro"
            className="w-full max-w-2xl h-auto border border-blue-200 rounded"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 pb-8 bg-[#f7f4f0]">
        <div className="pt-8 pb-4">
          <h2 className="text-blue-700 font-bold text-4xl mb-4">Thông tin nhanh</h2>
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
