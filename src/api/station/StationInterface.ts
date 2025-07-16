export interface CreateStationDTO {
    name: string;      
    address: string;   
    description: string; 
}

export interface UpdateStationDTO {
    name?: string;     
    address?: string;  
    description?: string; 
}

export interface GetStationDTO {
    id: string;        
    name: string;      
    address?: string;  
    description?: string; 
    isActive: boolean;
}

export interface Station extends GetStationDTO {
    createdAt: string;
    updatedAt: string;
    ticketRoutesAsFirstStation: any[];
    ticketRoutesAsLastStation: any[];
    checkInProcesses: any[];
    checkOutProcesses: any[];
    startStations: any[];
    endStations: any[];
    strainSchedules: any[];
    metroLineStations: any[];
}

export interface ResponseDTO<T = any> {
    isSuccess: boolean;
    statusCode: number;
    message: string;
    result?: T;
}