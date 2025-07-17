import type { GetStationDTO } from '../station/StationInterface';

export interface CreateMetroLineDTO {
    metroName?: string;        
    startStationId: string;     
    endStationId: string;
    startTime: string;
    endTime: string;
}

export interface CreateMetroLineStationDTO {
    metroLineId: string;        
    stationId: string;          
    distanceFromStart: number;  
    stationOder: number;       
}

export interface GetMetroLineStationDTO {
    id: string;                 
    distanceFromStart: number;  
    stationOrder: number;       
    station: GetStationDTO;     
}

export interface GetMetroLineDTO {
    id: string;                 
    metroLineNumber: string;    
    metroName?: string;         
    startStation?: GetStationDTO; 
    endStation?: GetStationDTO;   
    metroLineStations: GetMetroLineStationDTO[]; 
    status: MetroLineStatus;
}

export interface ResponseDTO<T = any> {
    isSuccess: boolean;
    statusCode: number;
    message: string;
    result?: T;
}

export enum MetroLineStatus {
    Normal = 0, // hoạt động bình thường
    Faulty = 1, // bị lỗi
    Delayed = 2, // bị chậm
}

export type MetroLineStationStatus = 'OPERATIONAL' | 'CLOSED' | 'MAINTENANCE';

export interface MetroLine extends GetMetroLineDTO {
    status: MetroLineStatus;
    createdAt: string;          
    updatedAt: string;          
}

export interface MetroLineStation extends GetMetroLineStationDTO {
    status: MetroLineStationStatus;
    createdAt: string;          
    updatedAt: string;          
}
