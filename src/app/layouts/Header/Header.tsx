import React from "react";
import logoImg from "../../assets/logo.png";
import { Button } from "antd";
import {
  GlobalOutlined,
  SearchOutlined,
  MenuOutlined,
} from "@ant-design/icons";

export default function Header() {
  return (
    <>
    <h1>Header</h1>
      {/* <header className="sticky top-0 z-50 flex flex-row
       items-center justify-between px-6 py-3 shadow-md bg-white">
        <a className="w-45">
          <img src={logoImg} alt="" />
        </a>
        <div>
        <div className="flex gap-3 bg-white">

      <div className="flex items-center gap-2 bg-gray-200 rounded-md px-3 py-2">
        <div className="w-4 h-4 border-4 border-green-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
        <div className="text-sm leading-tight">
          <div className="text-gray-600">Service Information</div>
          <div className="text-blue-800 font-semibold">Normal service</div>
        </div>
      </div>

      <Button
        type="default"
        icon={<GlobalOutlined />}
        className="flex flex-col items-center justify-center !px-3 !py-2 !h-auto border-blue-900 text-blue-900 hover:!bg-blue-900 hover:!text-white transition-colors"
      >
        <span className="text-xs">English</span>
      </Button>

      <Button
        type="default"
        icon={<SearchOutlined />}
        className="flex flex-col items-center justify-center !px-3 !py-2 !h-auto border-blue-900 text-blue-900 hover:!bg-blue-900 hover:!text-white transition-colors"
      >
        <span className="text-xs">Search</span>
      </Button>

 
      <Button
        type="default"
        icon={<MenuOutlined />}
        className="flex flex-col items-center justify-center !px-3 !py-2 !h-auto border-blue-900 text-blue-900 hover:!bg-blue-900 hover:!text-white transition-colors"
      >
        <span className="text-xs">Menu</span>
      </Button>
    </div>
        </div>


      </header> */}
    </>
  );
}
