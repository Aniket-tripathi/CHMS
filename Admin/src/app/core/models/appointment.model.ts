export interface Appointment {
    ap_reason_shortname: any;
    appointment_id: number;
    clinic_wkh_id: number;
    apnt_clinicid: number;
    clinic_schd_id: number;
    appointment_no: string;
    patient_mpi: string;
    patient_idno: string;
    patient_dob: string;  // Format: YYYY-MM-DD
    app_nationality: string;
    app_passport:string;
    patient_name: string;
    gender: string;
    email: string;
    mobileno: string;
    staff_doctorid: number;
    appointment_date: string; // Format: YYYY-MM-DD
    appointment_time: string; // Format: HH:MM:SS
    notes: string;
    apt_reason_id: number;
    apnt_start_time: string; // Format: HH:MM:SS
    apnt_end_time: string; // Format: HH:MM:SS
    apnt_type: string;
    apnt_reminder: boolean;
    source: string;
    appointment_status: string;
    apnt_visitid: number;
    apnt_consultid: number;
    bookapnt_date: string; // Format: YYYY-MM-DD
    filestatus: string;
    filenote: string;
    patientstatus: string;
    patientnote: string;
    comments: string;
    added_by:string;
    added_userid:string;
    date: string; // Format: YYYY-MM-DD
    time: string;
    apnt_reason_name:string;
    clinicname?: string;
    ap_reason_name?:string;
    mpino?:string;
    id?:string;
    title?:string;
    start?:string;
    end?:string;
    aptime?:string;
    className?:string;  // Format: HH:MM:SS
  }

  export interface AppointmentResponse {
    Appointments: Appointment[];
    totalAppointments: number;
    appointmentData: Appointment[];

  }
  