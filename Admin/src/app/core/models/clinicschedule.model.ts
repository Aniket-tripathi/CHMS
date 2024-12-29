export interface schedule {
    from_to_date: any;
    month: any;
    clinicname?:string;
    clinicid: number;
    type: string;
    clinic_sch_dt: string;
    time: string;
    date: string;
   
   
    

    timeSlots: {
        timeFrom: string;
        timeTo: string;
        reasons: { 
          appreasonId: number; 
          appreasonName: string; 
          appointmentCount: string 
        }[];
      }[];

}


export interface scheduleResponse {
    schedules: schedule[];
    totalSchedules: number;
    
}