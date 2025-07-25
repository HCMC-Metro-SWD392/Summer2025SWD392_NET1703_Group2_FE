import React, { type JSX } from "react";
import { Modal, Typography } from "antd";
import { ArrowRightOutlined, RetweetOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Station {
    stationId: string;
    stationName: string;
}

interface MetroLine {
    id: string;
    metroName: string;
    stations: Station[];
    status: number;
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

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title="Xem Đường Đi"
            width={1000}
        >
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    alignItems: "center",
                }}
            >
                {data
                    .flatMap((line) =>
                        line.stations.map((station) => ({ station, line }))
                    )
                    .reduce<JSX.Element[]>((acc, { station, line }, idx, arr) => {
                        const { stationId } = station;
                        const info = stationMap.get(stationId);
                        if (!info) return acc;

                        const prev = arr[idx - 1];

                        // Arrow trước mỗi ga trừ ga đầu tiên
                        if (acc.length > 0) {
                            acc.push(
                                <ArrowRightOutlined
                                    key={`arrow-${stationId}-${idx}`}
                                    style={{ fontSize: 14, color: "#999" }}
                                />
                            );
                        }

                        // Nếu là ga trùng nhưng đổi tuyến → chèn dòng "chuyển tuyến"
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
      lineHeight: 1.3,
      textAlign: "center",
      maxWidth: "100%",
      whiteSpace: "normal",
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
      lineHeight: 1.2,
      maxWidth: "100%",
    }}
  >
    {line.metroName}
  </div>
</div>
                            );
                        }

                        // Ga hiển thị
                        const intersection = isIntersection(stationId);

                        acc.push(
                            <div
                                key={`${stationId}-${idx}`}
                                style={{
                                    width: 120,
                                    height: 80,
                                    padding: 6,
                                    background: "#f0f2f5",
                                    borderRadius: 8,
                                    textAlign: "center",
                                    border: intersection
                                        ? "2px dashed #52c41a"
                                        : "1px solid #d9d9d9",
                                    boxShadow: intersection ? "0 0 4px #b7eb8f" : undefined,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                }}
                            >
                                <Text strong style={{ fontSize: 13 }}>{info.name}</Text>

                                <div style={{ marginTop: 4, fontSize: 11, color: "#555" }}>
                                    {line.metroName}
                                </div>
                            </div>
                        );

                        return acc;
                    }, [])}
            </div>
        </Modal>
    );
};
