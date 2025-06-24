import type { GetStationDTO } from '../station/StationInterface';

export interface CreateMetroLineDTO {
    metroLineNumber: number;   
    metroName?: string;        
    startStationId: string;     
    endStationId: string;       
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
    metroLineNumber: number;    
    metroName?: string;         
    startStation?: GetStationDTO; 
    endStation?: GetStationDTO;   
    metroLineStations: GetMetroLineStationDTO[]; 
}

export interface ResponseDTO<T = any> {
    isSuccess: boolean;
    statusCode: number;
    message: string;
    result?: T;
}

export type MetroLineStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

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
