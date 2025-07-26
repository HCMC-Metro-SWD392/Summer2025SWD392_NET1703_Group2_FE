import React, { useState } from "react";
import {
  Card,
  Typography,
  Input,
  Upload,
  Button,
  message,
  Image,
  Select,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import axiosInstance from "../../../../../../settings/axiosInstance";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const { Title } = Typography;
const { Option } = Select;

const FORM_TITLES: Record<string, string> = {
  "0": "Đơn xác nhận học sinh/sinh viên",
  "1": "Đơn xác nhận người cao tuổi",
  "2": "Đơn xác nhận trường hợp đặc biệt khác",
};

const SpecialCaseRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);
  const [fileListRaw, setFileListRaw] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [formType, setFormType] = useState<string | undefined>();

  const uploadAllFiles = async () => {
    const uploadedKeys: string[] = [];

    for (const file of fileListRaw) {
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

        uploadedKeys.push(objectKey);
      } catch (err) {
        console.error("Upload failed", err);
        throw new Error("Tải lên thất bại: " + file.name);
      }
    }

    return uploadedKeys;
  };

  const handleSubmit = async () => {
    if (!formType || !title.trim()) {
      return message.warning("Vui lòng chọn trường hợp để có tiêu đề đơn.");
    }

    if (fileListRaw.length === 0) {
      return message.warning("Vui lòng chọn ít nhất 1 file.");
    }

    setSubmitting(true);

    try {
      const uploadedKeys = await uploadAllFiles();

      const formData = new FormData();
      formData.append("Title", title);
      formData.append("Content", content);
      formData.append("FormRequestType", formType);
      const token = localStorage.getItem("accessToken");
      const decoded: any = jwtDecode(token || "");
      const role = decoded["CustomerType"];
      formData.append("CustomerType", role === "Student" ? "1" : "0");
      uploadedKeys.forEach((key) => {
        formData.append("AttachmentKeys", key);
      });

      await axiosInstance.post("/api/FormRequest/create-form-request", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/services/submit-success");
      setTitle("");
      setContent("");
      setFormType(undefined);
      setFileList([]);
      setFileListRaw([]);
    } catch (error) {
      console.error("Lỗi gửi form:", error);

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Gửi đơn thất bại!");
      }
    } finally {
      setSubmitting(false);
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

  const handleTypeChange = (value: string) => {
    setFormType(value);
    setTitle(FORM_TITLES[value]);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f0f8ff] flex items-center justify-center px-4 py-12">
      <Card className="max-w-3xl w-full rounded-2xl shadow-lg p-6">
        <Title level={3} className="text-center mb-6">
          Đơn Xét Duyệt Trường Hợp Đặc Biệt
        </Title>

        <div className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">
              Trường hợp đặc biệt <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Chọn trường hợp"
              value={formType}
              onChange={handleTypeChange}
              disabled={submitting}
              className="w-full"
            >
              <Option value="0">Học sinh/Sinh viên</Option>
              {/* <Option value="1">Người cao tuổi</Option> */}
              {/* <Option value="2">Trường hợp đặc biệt khác</Option> */}
            </Select>
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <Input value={title} disabled />
          </div>

          <div>
            <label className="block mb-1 font-medium">Nội dung</label>
            <Input.TextArea
              rows={5}
              placeholder="Nhập nội dung đơn (tuỳ chọn)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Tải lên giấy tờ xác nhận <span className="text-red-500">*</span>
            </label>
            <Upload
              accept=".pdf,.jpg,.jpeg,.png"
              beforeUpload={(file) => {
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

                setFileListRaw((prev) => [...prev, file]);
                setFileList((prev) => [
                  ...prev,
                  {
                    uid: file.uid,
                    name: file.name,
                    status: "done",
                    url: URL.createObjectURL(file),
                  },
                ]);
                return Upload.LIST_IGNORE;
              }}
              fileList={fileList}
              onRemove={(file) => {
                setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
                setFileListRaw((prev) =>
                  prev.filter((f) => f.name !== file.name)
                );
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
