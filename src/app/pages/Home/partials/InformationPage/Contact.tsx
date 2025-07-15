import { Typography, Row, Col, Space, Divider } from "antd";

const { Title, Text, Paragraph } = Typography;

export default function Contact() {
  return (
    <div className="w-full min-h-screen bg-white py-10 px-0">
      {/* Lịch sử hình thành và phát triển Metro */}
      <div className="w-full bg-gradient-to-b from-blue-50 to-white py-10 px-0">
        <div className="max-w-5xl mx-auto px-4">
          <Title level={2} className="text-center mb-6">Câu chuyện hình thành & phát triển Metro TP.HCM</Title>
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6e/HCMCmetro.svg"
                alt="Metro HCMC construction"
                className="rounded-lg shadow-md w-full object-cover mb-4 md:mb-0"
                style={{ maxHeight: 260 }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Paragraph style={{ fontSize: 16, textAlign: 'justify' }}>
                Hệ thống Metro TP.HCM là dự án giao thông công cộng trọng điểm, đánh dấu bước ngoặt lớn trong phát triển hạ tầng đô thị của thành phố. Ý tưởng về metro đã được đề xuất từ năm 2001, với mục tiêu giải quyết tình trạng ùn tắc giao thông và ô nhiễm môi trường ngày càng nghiêm trọng.<br/><br/>
                Sau nhiều năm nghiên cứu, quy hoạch và huy động vốn đầu tư, tuyến Metro số 1 (Bến Thành – Suối Tiên) chính thức khởi công xây dựng vào năm 2012 và đã đi vào vận hành từ cuối năm 2024. Đây là tuyến metro đầu tiên tại Việt Nam, dài gần 20km, kết nối trung tâm Quận 1 với khu vực phía Đông thành phố, góp phần thay đổi diện mạo giao thông đô thị.<br/><br/>
                Không chỉ dừng lại ở tuyến số 1, TP.HCM còn quy hoạch tổng cộng 8 tuyến metro với tổng chiều dài hơn 225km, hướng tới xây dựng mạng lưới giao thông xanh, hiện đại, kết nối các quận nội thành và vùng lân cận. Dự án metro không chỉ mang ý nghĩa về mặt giao thông mà còn là biểu tượng cho sự phát triển bền vững, hội nhập quốc tế của thành phố năng động nhất Việt Nam.<br/><br/>
                HCMC Metro – Kết nối tương lai, nâng tầm cuộc sống!
              </Paragraph>
            </Col>
          </Row>
        </div>
      </div>
      <Divider className="my-12" />
      {/* Lời giới thiệu */}
      <div className="max-w-4xl mx-auto px-4 mb-10">
        <Title level={2} className="text-center mb-2">Liên hệ HCMC Metro</Title>
        <Paragraph className="text-center mb-4" style={{ fontSize: 16 }}>
          HCMC Metro luôn sẵn sàng lắng nghe ý kiến đóng góp, phản hồi và giải đáp mọi thắc mắc của quý khách hàng.<br/>
          Đội ngũ của chúng tôi cam kết mang đến trải nghiệm di chuyển hiện đại, an toàn và thuận tiện nhất cho cộng đồng thành phố Hồ Chí Minh.
        </Paragraph>
        <Paragraph className="text-center mb-8" style={{ color: '#1890ff', fontWeight: 500 }}>
          Đừng ngần ngại liên hệ với chúng tôi qua các thông tin dưới đây. HCMC Metro rất mong nhận được sự quan tâm và đồng hành của bạn trên mỗi hành trình!
        </Paragraph>
      </div>

      {/* Thông tin liên hệ + Bản đồ */}
      <div className="max-w-5xl mx-auto px-4 mb-12">
        <Row gutter={[48, 32]} align="top">
          <Col xs={24} md={13}>
            <section className="mb-8">
              <Title level={4} className="mb-2">Thông tin liên hệ</Title>
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                  <Text strong>Trụ sở chính:</Text>
                  <br />
                  <Text>Số 29 Lê Quý Đôn, Phường 7, Quận 3, TP. Hồ Chí Minh</Text>
                </div>
                <div>
                  <Text strong>Số điện thoại:</Text>
                  <br />
                  <Text>(028) 3930 4343</Text>
                </div>
                <div>
                  <Text strong>Email:</Text>
                  <br />
                  <Text>info@hcmc-metro.com</Text>
                </div>
                <div>
                  <Text strong>Giờ làm việc:</Text>
                  <br />
                  <Text>Thứ 2 - Thứ 6: 08:00 - 17:00</Text>
                  <br />
                  <Text>Thứ 7, Chủ nhật & Lễ: Nghỉ</Text>
                </div>
              </Space>
            </section>
          </Col>
          <Col xs={24} md={11}>
            <section className="mb-8">
              <Title level={4} className="mb-2">Bản đồ vị trí</Title>
              <div style={{ width: "100%", height: 250, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px #eee" }}>
                <iframe
                  title="Bản đồ HCMC Metro"
                  src="https://www.google.com/maps?q=29+L%C3%AA+Qu%C3%BD+%C4%90%C3%B4n,+Ph%C6%B0%E1%BB%9Dng+7,+Qu%E1%BA%ADn+3,+TP.+H%E1%BB%93+Ch%C3%AD+Minh&output=embed"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </section>
          </Col>
        </Row>
      </div>

      
      
    </div>
  );
}
