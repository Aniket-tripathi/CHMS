export interface region {
    regionId: number;
    regionName: string;
    regionClinicId: number;
  
    regionStatus: string;
    regionDate: string;
    regionTime: string;
  }
  
  export interface RegionResponse {
    regions: region[];
  }
  