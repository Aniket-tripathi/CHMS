export interface appointmentreason {
  ap_reasonid: number;
  ap_reason_name: string;
  ap_reason_desc: string;
  ap_reason_shortname: string;

  ap_reason_dignscolor: string;
  apr_clinic: string;

  ap_reason_status: string;
  date: string;
  time: string;
}

export interface AppointmentreasonResponse {
  appointmentreasons: appointmentreason[];
}
