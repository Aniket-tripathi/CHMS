export interface visit {
    vid: number;
    visit_clinicid: string;
    visit_no: string;
    patient_id: string;
    hdccat: string;
    appointmentid: string;
    roomid: string;
    visit_date: string;
    visit_time: string;
    vststart: string;
    vstend: string;
    visit_type: string;
    referred_by: string;
    pcategory: string;
    status: string;
    age: string;
    emailv: string;
    authentication_note: string;
    visit_token_start: string;
    visit_token_end: string;
    prescordesp: string;
    hct: string;
    pres_note: string;
    visitstatus: string;
    added_by: string;
    added_userid: string;
}

export interface VisitResponse {
    visits: visit[];
}