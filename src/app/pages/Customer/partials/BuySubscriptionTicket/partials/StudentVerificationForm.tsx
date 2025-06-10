import React, { useState } from "react";
import {
  Card,
  Typography,
  Input,
  Select,
  Upload,
  Button,
  message,
  Image,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const schools = [
  "Đại học Bách Khoa",
  "Đại học Kinh tế",
  "Đại học Ngoại Thương",
  "Đại học Quốc gia",
];

const StudentVerificationForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState<string | undefined>(undefined);
  const [fileList, setFileList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const beforeUpload = (file: File) => {
    const isValidType =
      file.type === "application/pdf" ||
      file.type === "image/jpeg" ||
      file.type === "image/png";

    if (!isValidType) {
      message.error("Chỉ hỗ trợ file PDF, JPG, PNG!");
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("File phải nhỏ hơn 5MB!");
    }

    return isValidType && isLt5M;
  };

  const customRequest = ({ file, onSuccess }: any) => {
    const uid = file.uid;
    setFileList((prev) => [
      ...prev,
      {
        uid,
        name: file.name,
        status: "uploading",
        percent: 0,
        originFileObj: file,
      },
    ]);

    let percent = 0;
    const interval = setInterval(() => {
      percent += 25;
      setFileList((prevList) =>
        prevList.map((item) =>
          item.uid === uid ? { ...item, percent } : item
        )
      );

      if (percent >= 100) {
        clearInterval(interval);
        setFileList((prevList) =>
          prevList.map((item) =>
            item.uid === uid ? { ...item, status: "done", percent: 100 } : item
          )
        );
        onSuccess("ok");
      }
    }, 300);
  };

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as File);
        reader.onload = () => resolve(reader.result as string);
      });
    }

    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !school || fileList.length === 0) {
      return message.warning("Vui lòng điền đầy đủ thông tin và tải lên giấy tờ.");
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      message.success("Gửi đơn xác nhận thành công!");
      setName("");
      setEmail("");
      setSchool(undefined);
      setFileList([]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f0f8ff] flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full rounded-2xl shadow-lg p-6">
        <Title level={3} className="text-center mb-6">
          Đơn Xác Nhận Sinh Viên
        </Title>

        <div className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Chọn trường <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Chọn trường"
              value={school}
              onChange={(val) => setSchool(val)}
              disabled={submitting}
              className="w-full"
            >
              {schools.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Tải lên giấy tờ <span className="text-red-500">*</span>
            </label>
            <Upload
              accept=".pdf,.jpg,.jpeg,.png"
              beforeUpload={(file) =>
                beforeUpload(file) ? true : Upload.LIST_IGNORE
              }
              customRequest={customRequest}
              fileList={fileList}
              onRemove={(file) =>
                setFileList((prev) => prev.filter((f) => f.uid !== file.uid))
              }
              onPreview={handlePreview}
              listType="picture-card"
              maxCount={4}
              disabled={submitting}
            >
              {fileList.length >= 4 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
            <p className="text-gray-500 text-sm mt-1">
              Hỗ trợ file PDF, JPG, PNG. Dung lượng tối đa 5MB.
            </p>
          </div>

          <div className="text-center">
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
            >
              Gửi đơn
            </Button>
          </div>
        </div>
      </Card>

      {/* Image preview */}
      <Image
        wrapperStyle={{ display: "none" }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => setPreviewOpen(visible),
          afterOpenChange: (visible) => !visible && setPreviewImage(""),
        }}
        src={previewImage}
      />
    </div>
  );
};

export default StudentVerificationForm;
