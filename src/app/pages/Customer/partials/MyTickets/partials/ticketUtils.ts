export const getStatusColor = (status: string): string => {
  switch (status) {
    case "unused":
      return "blue";
    case "active":
      return "green";
    case "used":
      return "gray";
    default:
      return "default";
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "unused":
      return "Chưa sử dụng";
    case "active":
      return "Đang sử dụng";
    case "used":
      return "Đã sử dụng";
    default:
      return "Không xác định";
  }
};


