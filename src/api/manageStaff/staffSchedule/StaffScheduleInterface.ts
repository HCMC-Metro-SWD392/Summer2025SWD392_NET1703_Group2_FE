export enum StaffScheduleStatus
    {
        Normal = 0,  // Không có vấn đề xảy ra  
        OnLeave = 1,   // Nghỉ có phép  
        AbsentWithoutLeave = 2,  // Nghỉ không phép  
    }

export interface CreateStaffScheduleDTO { 
    staffId: string; 
    shiftId: string;
    workingDate: string;
    workingStationId: string;
}

export interface GetScheduleDTO
{
    id: string;
    staff: StaffInfoDto;
    shift: ShiftInfoDto;
    workingDate: string;
    workingStation: StationInfoDto;
    status: StaffScheduleStatus;
    shiftName: string;
    startTime: string;
    endTime: string;
}
export interface StaffInfoDto
{
    id: string;
    fullName: string;
}

export interface ShiftInfoDto
{
    id: string;
    shiftName: string;
}

export interface StationInfoDto
{
    id: string;
    name: string;
}

export interface ResponseDTO<T = any> {
    isSuccess: boolean;
    statusCode: number;
    message: string;
    result?: T;
    total?: number;  // Add total count for pagination
}

export interface UpdateShiftDTO {
    shiftName: string;
    startTime: string;
    endTime: string;
}
