export interface RevenueMonthDTO {
    result: number;
  }
  
  export interface RevenueYearDTO {
    result: number;
  }
  
  export interface RevenueOverTimeDTO {
    result: number;
  }
  
  export interface ResponseDTO<T = any> {
    isSuccess: boolean;
    statusCode: number;
    message: string;
    result?: T;
  }