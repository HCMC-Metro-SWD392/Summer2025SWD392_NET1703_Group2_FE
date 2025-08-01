export enum TrainScheduleType {
    Forward = 0,  // tàu đi hướng xuôi
    Backward = 1  // tàu đi hướng ngược
}

export enum TrainScheduleStatus {
    Normal = 0,        // Bình thường
    Cancelled = 1,     // Bị hủy
    OutOfService = 2   // Tàu quay về bến không đón khách
}

export interface CreateTrainScheduleDTO {
    metroLineId: string;
    travelTimeBetweenStationsInSeconds: number;
    dwellTimeAtStationInSeconds: number;
    peakHourMorningStart: string; // 'HH:mm:ss'
    peakHourMorningEnd: string;   // 'HH:mm:ss'
    peakHourEveningStart: string; // 'HH:mm:ss'
    peakHourEveningEnd: string;   // 'HH:mm:ss'
    peakHourHeadwayInSeconds: number;
    offPeakHourHeadwayInSeconds: number;
}

export interface GetTrainScheduleDTO {
    id: string;
    metroLineId: string;
    metroLineName: string;
    stationId: string;
    stationName: string;
    startTime: string; // TimeSpan will be represented as string in ISO format
    direction: TrainScheduleType;
    status: TrainScheduleStatus;
}

export interface UpdateTrainScheduleDTO {
    id: string;
    metroLineId?: string;
    stationId?: string;
    startTime?: string; // TimeSpan will be represented as string in ISO format
    direction?: TrainScheduleType;
    status?: TrainScheduleStatus;
}

export interface GetTrainSchedulesByStationParams {
    stationId: string;
    direction?: TrainScheduleType;
}
