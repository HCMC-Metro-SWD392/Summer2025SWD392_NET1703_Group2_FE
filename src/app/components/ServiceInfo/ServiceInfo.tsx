import React from "react";
import { Collapse } from "antd";
import { CheckCircleFilled, CaretRightOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const ServiceInfo: React.FC = () => {
  return (
    <Collapse
      expandIconPosition="end"
      bordered={false}
      ghost
      expandIcon={({ isActive }) => (
        <CaretRightOutlined
          rotate={isActive ? 90 : 0}
          className="text-gray-500"
        />
      )}
      className="w-full max-w-lg"
    >
      <Panel
        key="1"
        header={
          <div className="inline-flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2">
            <CheckCircleFilled className="text-green-500 text-xl" />
            <div>
              <div className="text-gray-500 text-xs leading-none">
                Service Information
              </div>
              <div className="text-blue-800 font-semibold text-sm leading-none">
                Normal service
              </div>
            </div>
          </div>
        }
      >
        <div className="text-gray-700 text-sm px-2">
          Đây là thông tin chi tiết của dịch vụ bình thường. Bạn có thể hiển thị
          thêm các dữ liệu cần thiết ở đây.
        </div>
      </Panel>
    </Collapse>
  );
};

export default ServiceInfo;
