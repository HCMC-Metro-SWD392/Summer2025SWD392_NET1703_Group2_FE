import React from "react";
import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";

const breadcrumbNameMap: Record<string, string> = {
  "/": "Trang chủ",
  "/services": "Dịch vụ",
  "/services/tickets": "Vé tàu",
  "/services/tickets/history": "Lịch sử đặt vé",
};

const DynamicBreadcrumb = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split("/").filter((i) => i);

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    return (
      <Breadcrumb.Item key={url}>
        <Link to={url}>{breadcrumbNameMap[url]}</Link>
      </Breadcrumb.Item>
    );
  });

  return <Breadcrumb>{[<Breadcrumb.Item key="/">Trang chủ</Breadcrumb.Item>, ...extraBreadcrumbItems]}</Breadcrumb>;
};

export default DynamicBreadcrumb;
