export interface vital {
 agep(agep: any): unknown;
 id: number;
 patient_id: string;
 vitalvstid: string;
 vitalclinic: string;
 consultid: string;
 height: string;
 temprature: string;
 temprature_unit: string;
 waist: string;
 bloodp: string;
 bpdia: string;
 bloodglucose: string;
 cholesterol: string;
 pulse: string;
 respiration: string;
 peakflow: string;
 weight: string;
 urinalysis: string;
 urinalysis_text: string;
 body_mass_index: string;
 head_circumference: string;
 muac: string;
 rhesus_factor: string;
 pregnancy: string;
 weeks_of_pregnancy: string;
 hb_test: string;
 note: string;
 status: string;
 allergies_have: string;
 vital_from: string;
 p_week: string;
 p_bump: string;
 vital_status: string;
 vital_tokenid: string;
 added_by: string;
 vitalstarttime: string;
 vitalendtime: string;
 adddate: string;
 addtime: string;
 added_userid: string;
}

export interface VitalResponse {
 vitals: vital[];
}