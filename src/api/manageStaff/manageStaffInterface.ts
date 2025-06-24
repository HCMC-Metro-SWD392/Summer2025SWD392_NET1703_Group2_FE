export interface ResponseDTO {
  statusCode: number;
  message: string;
  result?: any;
  isSuccess: boolean;
}

export interface SetStaffRoleRequest {
  email: string;
}

export interface StaffInfo {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address?: string;
  identityId?: string;
  sex: string;
  dateOfBirth?: string;
}

export interface StaffListResponse extends ResponseDTO {
  result: {
    items: StaffInfo[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface StaffDetailResponse extends ResponseDTO {
  result: StaffInfo;
}
