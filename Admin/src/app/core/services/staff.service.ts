import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
// import { Observable } from 'rxjs';
import { staff } from '../models/staff.models'
import { ClinicResponse } from '../models/clinic.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(private http: HttpClient) { }

  baseUrl = environment.firebaseConfig.apiKey;

  StaffRegister(_data: staff) {
    return this.http.post(this.baseUrl + 'staff', _data);
  }

  getClinics(query: string = ''): Observable<ClinicResponse> {
    return this.http.get<ClinicResponse>(this.baseUrl + 'clinic', { params: { query } });
  }

  // getStaffs(query: string = '',): Observable<staff> {
  //   return this.http.get<staff>(this.baseUrl + 'staff', { params: { query } });
  // }

  getStaffs(type: string, userid: string, clinicid: string): Observable<staff[]> {
    const url = `${this.baseUrl}staff?type=${type}&userid=${userid}&clinicid=${clinicid}`;
    return this.http.get<staff[]>(url);
  }

  // Check email availability
  checkEmailAvailabilitystaff(emailData: { email: string }): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'staff-email', emailData);
  }


  // Toggle staff status
  toggleStaffStatus(staffid: number, newStatus: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}staff/${staffid}/status`, { status: newStatus });
  }

  getStaffById(staffid: number,): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}staff/${staffid}`);
  }


}