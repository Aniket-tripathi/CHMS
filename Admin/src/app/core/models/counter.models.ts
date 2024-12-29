export interface counter {
    id: string;
    clinic_id: string;
    stream_id: string;
    current_token: string;
    current_tokenid: string;
    current_token_status: string;
    countername: string;
    countertype: string;
    counterdesc: string;
    counterstatus: string;
    added_by: string;
    date: string;
    time: string;
   }
   
   
   export interface CounterResponse {
    counters: counter[];
   }