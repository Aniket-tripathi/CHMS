export interface ward {
    wardId: number;
    wardName: string;
    wardClinicId: number;
    wardRegionId: number;
  
    wardStatus: string;
    wardDate: string;
    wardTime: string;
  }
  
  export interface WardResponse {
    wards: ward[];
  }
  