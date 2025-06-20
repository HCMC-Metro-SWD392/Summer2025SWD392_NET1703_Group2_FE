import React, { useState } from "react";
import {
  Card,
  Typography,
  Input,
  Upload,
  Button,
  message,
  Image,
  Radio,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import axiosInstance from "../../../../../../settings/axiosInstance";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const SpecialCaseRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);
  const [attachmentKeys, setAttachmentKeys] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [formType, setFormType] = useState<string | undefined>();

  const beforeUpload = async (file: File) => {
    const isValidType =
      file.type === "application/pdf" ||
      file.type === "image/jpeg" ||
      file.type === "image/png";

    if (!isValidType) {
      message.error("Chỉ hỗ trợ file PDF, JPG, PNG!");
      return Upload.LIST_IGNORE;
    }

    if (file.size / 1024 / 1024 >= 5) {
      message.error("File phải nhỏ hơn 5MB!");
      return Upload.LIST_IGNORE;
    }

    try {
      const res = await axiosInstance.post("/api/FormRequest/upload-file-url-form-request", {
        fileName: file.name,
        contentType: file.type,
      });

      const { url, objectKey } = res.data.result;

      await axios.put(url, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      setAttachmentKeys((prev) => [...prev, objectKey]);
      return true;
    } catch (err) {
      console.error("Upload failed", err);
      message.error("Tải lên thất bại");
      return Upload.LIST_IGNORE;
    }
  };

  const customRequest = async ({ file, onSuccess }: any) => {
    const passed = await beforeUpload(file);
    if (passed) {
      setFileList((prev) => [
        ...prev,
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: URL.createObjectURL(file),
        },
      ]);
      onSuccess("ok");
    }
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

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      return message.warning("Vui lòng nhập tiêu đề và nội dung.");
    }

    if (!formType) {
      return message.warning("Vui lòng chọn trường hợp đặc biệt.");
    }

    if (fileList.length === 0) {
      return message.warning("Vui lòng tải lên ít nhất 1 file.");
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("Title", title);
      formData.append("Content", content);
      formData.append("FormRequestType", formType ?? "0"); // hoặc 1, 2 tùy kiểu đơn
      attachmentKeys.forEach((key) => {
        formData.append("AttachmentKeys", key);
      });

      await axiosInstance.post("/api/FormRequest/create-form-request", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // message.success("Gửi đơn thành công!");
      navigate("/services/submit-success")
      setTitle("");
      setContent("");
      setFileList([]);
    } catch (error) {
      console.error("Lỗi gửi form:", error);
      message.error("Gửi đơn thất bại!");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f0f8ff] flex items-center justify-center px-4 py-12">
      <Card className="max-w-3xl w-full rounded-2xl shadow-lg p-6">
        <Title level={3} className="text-center mb-6">
          Đơn Xét Duyệt Trường Hợp Đặc Biệt
        </Title>

        {/* Chỉ giữ lại title và content */}
        <div className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập tiêu đề đơn"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <Input.TextArea
              rows={5}
              placeholder="Nhập nội dung đơn"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Trường hợp đặc biệt <span className="text-red-500">*</span>
            </label>
            <Radio.Group
              onChange={(e) => setFormType(e.target.value)}
              value={formType}
              disabled={submitting}
            >
              <Radio value="0">Học sinh/Sinh viên</Radio>
              <Radio value="1">Người cao tuổi</Radio>
              <Radio value="2">Trường hợp đặc biệt khác</Radio>
            </Radio.Group>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Tải lên giấy tờ xác nhận sinh viên <span className="text-red-500">*</span>
            </label>
            <Upload
              accept=".pdf,.jpg,.jpeg,.png"
              customRequest={customRequest}
              fileList={fileList}
              onRemove={(file) => {
                setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
                // Optional: remove corresponding objectKey too
              }}
              onPreview={handlePreview}
              listType="picture-card"
              maxCount={5}
              disabled={submitting}
            >
              {fileList.length >= 5 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
            <p className="text-gray-500 text-sm mt-1">
              Hỗ trợ file PDF, JPG, PNG. Tối đa 5MB.
            </p>
          </div>

          <div className="text-center mt-6">
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
      </Card>
    </div>
  );
};

export default SpecialCaseRequestForm;
