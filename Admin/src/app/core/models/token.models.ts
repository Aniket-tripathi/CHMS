export interface token {
    id: number;
    clinic_id: string;
    tokenno: string;
    token_registered: string;
    token_idnumber: string;
    token_pdob: string;
    patient_id: string;
    tokenstream: string;
    token_reason: string;
    tokenvip: string;
    tokentype: string;
    tokenstatus: string;
    tokendisplaystatus: string;
    added_by: string;
    tokenaddtime: string;
    tokenendtime: string;
    audiable: string;
    mobile: string;
    tokenconsultationstatus: string;
    emergency: string;
    tokenvisitstatus: string;
    token_pharmacy_status: string;
    dispense: string;
    adddate: string;
    addtime: string;
    added_userid: string;
}

export interface TokenResponse {
    tokens: token[];
}