export interface clinic {
    clinicid: number;
    clinicname: string;
    cliniccode: string;
    clinicEmail: string;
    clinicContactNo: string;
    clinicLogo: string;
    clinicRegionId: string;
    ClinicWardId: string;
    services: string;
    clinicAddress: string;
    comments: string;
    clinicStatus: 'active' | 'inactive';
    clinicAddDate: string;
    clinicType: string;
    clinicplan: string;
}

export interface ClinicResponse {
    clinics: clinic[];
    totalClinics: number;
}

export interface SearchResult {
    tables: clinic[];
    total: number;
}


