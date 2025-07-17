import type { GetStationDTO } from '../station/StationInterface';

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

export interface UpdateMetroLineStationDTO {
    metroLineStationId : string;
    distanceFromStart: number;
    stationOrder: number;
}