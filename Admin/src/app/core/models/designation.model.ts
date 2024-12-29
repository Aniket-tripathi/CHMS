export interface designation {
    id: number;
    clinic_id: string;
    designation: string;
    adddate: string;
    addtime: string;
}


export interface DesignationResponse {
    designations: designation[];
    // totaldesignations: number;
}