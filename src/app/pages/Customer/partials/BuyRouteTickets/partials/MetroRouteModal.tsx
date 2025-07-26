import React, { useState, type JSX } from "react";
import { Modal, Typography, Tabs, Tag } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TabPane } = Tabs;

interface Station {
  stationId: string;
  stationName: string;
}

interface MetroLine {
  id: string;
  metroName: string;
  stations: Station[];
  status: number; // 0: bình thường, 1: lỗi, 2: delay
}

interface MetroRouteModalProps {
  open: boolean;
  onClose: () => void;
  data: MetroLine[];
}

export const MetroRouteModal: React.FC<MetroRouteModalProps> = ({
  open,
  onClose,
  data,
}) => {
  const [tabKey, setTabKey] = useState("compact");

  const stationMap = new Map<string, { name: string; lines: Set<string> }>();

  data.forEach((line) => {
    line.stations.forEach((station) => {
      if (!stationMap.has(station.stationId)) {
        stationMap.set(station.stationId, {
          name: station.stationName,
          lines: new Set([line.id]),
        });
      } else {
        stationMap.get(station.stationId)!.lines.add(line.id);
      }
    });
  });

  const isIntersection = (stationId: string) =>
    stationMap.get(stationId)?.lines.size! > 1;

  const getLineStyle = (status: number) => {
    switch (status) {
      case 1: // lỗi
        return {
          background: "#fff1f0",
          border: "2px dashed #ff4d4f",
          boxShadow: "0 0 6px #ffa39e",
          textColor: "#cf1322",
        };
      case 2: // delay
        return {
          background: "#fffbe6",
          border: "2px dashed #faad14",
          boxShadow: "0 0 6px #ffe58f",
          textColor: "#ad6800",
        };
      default: // bình thường
        return {
          background: "#f0f2f5",
          border: "1px solid #d9d9d9",
          boxShadow: undefined,
          textColor: "#555",
        };
    }
  };

  const renderStations = (isCompact: boolean) => {
    const fullList = data.flatMap((line) =>
      line.stations.map((station) => ({ station, line }))
    );

    return fullList.reduce<JSX.Element[]>((acc, { station, line }, idx, arr) => {
      const { stationId } = station;
      const info = stationMap.get(stationId);
      if (!info) return acc;

      const prev = arr[idx - 1];
      const isFirst = idx === 0;
      const isLast = idx === fullList.length - 1;
      const intersection = isIntersection(stationId);
      const statusStyle = getLineStyle(line.status);

      const shouldRenderStation =
        !isCompact || isFirst || isLast || intersection;

      if (acc.length > 0 && shouldRenderStation) {
        acc.push(
          <ArrowRightOutlined
            key={`arrow-${stationId}-${idx}`}
            style={{ fontSize: 14, color: "#999" }}
          />
        );
      }

      // Chuyển tuyến
      if (
        prev &&
        prev.station.stationId === stationId &&
        prev.line.id !== line.id
      ) {
        acc.push(
          <div
            key={`transfer-${stationId}-${idx}`}
            style={{
              width: 120,
              height: 80,
              padding: 8,
              background: "#52c41a",
              borderRadius: 8,
              textAlign: "center",
              border: "2px dashed #237804",
              boxShadow: "0 0 6px #b7eb8f",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#fff",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              Chuyển sang tuyến:
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#fff",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {line.metroName}
            </div>
          </div>
        );

        acc.push(
          <ArrowRightOutlined
            key={`arrow2-${stationId}-${idx}`}
            style={{ fontSize: 14, color: "#999" }}
          />
        );
      }

      if (shouldRenderStation) {
        acc.push(
          <div
            key={`${stationId}-${idx}`}
            style={{
              width: 120,
              height: 80,
              padding: 6,
              background: intersection ? "#f6ffed" : statusStyle.background,
              borderRadius: 8,
              textAlign: "center",
              border: intersection
                ? "2px dashed #52c41a"
                : statusStyle.border,
              boxShadow: intersection
                ? "0 0 4px #b7eb8f"
                : statusStyle.boxShadow,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text strong style={{ fontSize: 13, color: statusStyle.textColor }}>
              {info.name}
            </Text>
            <div style={{ marginTop: 4, fontSize: 11, color: statusStyle.textColor }}>
              {line.metroName}
            </div>
          </div>
        );
      }

      return acc;
    }, []);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Xem Đường Đi"
      width={1000}
      centered
    >
      <Tabs activeKey={tabKey} onChange={(key) => setTabKey(key)}>
        <TabPane tab="Tóm gọn" key="compact">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            {renderStations(true)}
          </div>
        </TabPane>
        <TabPane tab="Đầy đủ" key="full">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            {renderStations(false)}
          </div>
        </TabPane>
      </Tabs>

      {/* Chú thích */}
      <div style={{ marginTop: 24 }}>
        <Text strong>Chú thích:</Text>
        <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
          <Tag color="default">Tuyến bình thường</Tag>
          <Tag color="warning">Tuyến bị trễ</Tag>
          <Tag color="error">Tuyến bị lỗi</Tag>
        </div>
      </div>
    </Modal>
  );
};
