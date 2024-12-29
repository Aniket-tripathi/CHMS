import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { department } from '../models/department.model';
import { designation, DesignationResponse } from '../models/designation.model';
import { role, RoleResponse } from '../models/role.model';
import { province } from '../models/province.model';
import { district } from '../models/district.model';
import { scheduleResponse } from '../models/clinicschedule.model';
import { DepartmentResponse } from '../models/department.model';
import { region, RegionResponse } from '../models/region.models';
import { ward, WardResponse } from '../models/ward.model';
import { counter, CounterResponse } from '../models/counter.models';
import { Appointment, AppointmentResponse } from '../models/appointment.model';
import { audittrial } from '../models/audittrial.model';
import { appointmentreason, AppointmentreasonResponse } from '../models/appointmentreason.model';
import { level, LevelResponse } from '../models/level.models';
import { provincenew, ProvinceResponse } from '../models/provincenew.models';
import { CountryResponse } from '../models/country.models';
import { token, TokenResponse } from '../models/token.models';
import { classificationResponse } from '../models/classification.models';



@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  baseUrl = environment.firebaseConfig.apiKey;

  getprovince(query: string = ''): Observable<province[]> {
    return this.http.get<province[]>(this.baseUrl + 'province', { params: { query } });
  }

  getdistrict(query: string = ''): Observable<district[]> {
    return this.http.get<district[]>(this.baseUrl + 'district', { params: { query } });
  }


  // Role

  insertrole(_data: role) {
    return this.http.post(this.baseUrl + "insertrole", _data);
  }

  getroles(): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(this.baseUrl + "roles");
  }

  updateRole(roleId: number, roleData: any): Observable<any> {
    return this.http.put<any>(this.baseUrl + `role/${roleId}`, roleData);
  }

  deleterole(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}role/${id}`);
  }

  getTotalRolesCount(): Observable<{ totalRoles: number }> {
    return this.http.get<{ totalRoles: number }>(`${this.baseUrl}count`);
  }

  // Designations
  insertdesignation(_data: designation) {
    return this.http.post(this.baseUrl + "designation", _data);
  }

  getdesignations(): Observable<DesignationResponse> {
    return this.http.get<DesignationResponse>(this.baseUrl + "designations"); // Replace with your API endpoint
  }

  updateDesg(id: number, designationData: any): Observable<any> {
    return this.http.put<any>(
      this.baseUrl + `designation/${id}`,
      designationData
    );
  }

  deletedesignation(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}designation/${id}`);
  }

  getTotaldesignationsCount(): Observable<{ totaldesignations: number }> {
    return this.http.get<{ totaldesignations: number }>(`${this.baseUrl}count`);
  }

  // Department

  department(_data: department) {
    return this.http.post(this.baseUrl + "department", _data);
  }

  getd(): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(this.baseUrl + "department");
  }

  updateDept(id: number, departmentData: any): Observable<any> {
    return this.http.put<any>(
      this.baseUrl + `department/${id}`,
      departmentData
    );
  }

  deleteDept(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}department/${id}`);
  }


  // Region

  insertregion(_data: region) {
    return this.http.post(this.baseUrl + "insertregion", _data);
  }

  getregion(): Observable<RegionResponse> {
    return this.http.get<RegionResponse>(this.baseUrl + "region");
  }

  updateRegion(id: number, regionData: any): Observable<any> {
    return this.http.put<any>(this.baseUrl + `region/${id}`, regionData);
  }

  deleteRegion(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}region/${id}`);
  }

  getTotalRegionsCount(): Observable<{ totalRegions: number }> {
    return this.http.get<{ totalRegions: number }>(`${this.baseUrl}count`);
  }

  // Ward

  insertward(_data: ward) {
    return this.http.post(this.baseUrl + "insertward", _data);
  }

  getward(): Observable<WardResponse> {
    return this.http.get<WardResponse>(this.baseUrl + "ward");
  }

  updateWard(id: number, wardData: any): Observable<any> {
    return this.http.put<any>(this.baseUrl + `ward/${id}`, wardData);
  }

  deleteWard(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}ward/${id}`);
  }

  // Fetch total clinics count
  getTotalPatientCount(): Observable<{ totalPatient: number }> {
    return this.http.get<{ totalPatient: number }>(`${this.baseUrl}countpatient`);
  }

  // Fetch total clinics count
  getTotalStaffCount(): Observable<{ totalStaff: number }> {
    return this.http.get<{ totalStaff: number }>(`${this.baseUrl}countstaff`);
  }
  // Counter Api 
  getcounters(): Observable<CounterResponse> {
    return this.http.get<CounterResponse>(this.baseUrl + 'counter'); // Replace with your API endpoint
  }

  insertcounter(_data: counter) {
    return this.http.post(this.baseUrl + 'counter', _data);
  }

  classificationclinic(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}classificationclinic/${id}`);
  }


  // /insert clinic schedule
  insertschedule(_data: any) {
    return this.http.post(this.baseUrl + 'addschedule', _data);
  }


  //get schedules
  getschedules(type: string, userid: string, clinicid: string): Observable<scheduleResponse> {
    return this.http.get<scheduleResponse>(`${this.baseUrl}getschedule?type=${type}&userid=${userid}&clinicid=${clinicid}`);
  }



  //getScheduleById
  getScheduleById(id: number): Observable<scheduleResponse> {
    return this.http.get<scheduleResponse>(`${this.baseUrl}getschedule/${id}`);
  }



  //getScheduleBy  list by Id
  getSchedule_listById(cid: number, csid: number): Observable<scheduleResponse> {
    return this.http.get<scheduleResponse>(`${this.baseUrl}getschedulelist/${cid}/${csid}`);
  }


  // Fetch total schdule list count
  getTotalSchedulelistCount(cid: number, csid: number): Observable<{ totalSchedules: number }> {
    return this.http.get<{ totalSchedules: number }>(`${this.baseUrl}countschedulelist/${cid}/${csid}`);
  }



  // Method to get available slots based on clinic ID and date
  getAvailableSlots(clinicId: number, formattedDate: string): Observable<any> {
    const url = `${this.baseUrl}gettimeslot/${clinicId}/${formattedDate}`;
    return this.http.get<any>(url); // This returns the Observable of the response
  }



  // Method to get available slots based on clinic ID and date
  getScheduleReason(clinicId: number, formattedDate: string, cwhfrom: string, cwhto: string): Observable<any> {
    const url = `${this.baseUrl}getScheduleReason/${clinicId}/${formattedDate}/${cwhfrom}/${cwhto}`;
    return this.http.get<any>(url); // This returns the Observable of the response
  }





  //add APPOINTMENT 

  addappointment(_data: Appointment) {
    return this.http.post(this.baseUrl + 'addappointments', _data);
  }



  //get Appointment for clinics
  getAppointment(): Observable<AppointmentResponse> {
    return this.http.get<AppointmentResponse>(this.baseUrl + 'appointments'); // Replace with your API endpoint
  }


  // Fetch total clinics count
  getTotalAppointmentsCount(): Observable<{ totalAppointments: number }> {
    return this.http.get<{ totalAppointments: number }>(`${this.baseUrl}totalappointmentcount`);
  }

  // Appointment Reason

  insertAppointmentReason(_data: appointmentreason) {
    return this.http.post(this.baseUrl + "appointment-reasons", _data);
  }

  getAppointmentReasons(): Observable<AppointmentreasonResponse> {
    return this.http.get<AppointmentreasonResponse>(
      this.baseUrl + "appointment-reasons"
    );
  }

  updateAppointmentReason(
    id: number,
    appointmentreasonData: any
  ): Observable<any> {
    return this.http.put<any>(
      this.baseUrl + `appointment-reasons/${id}`,
      appointmentreasonData
    );
  }

  deleteAppointmentReason(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}appointment-reasons/${id}`);
  }

  insertAudittrial(_data: audittrial) {
    return this.http.post(this.baseUrl + 'audittrial', _data);
  }

  getAudittrialById(clinicId: number,): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}audittrial/${clinicId}`);
  }

  // getaudittrial(type: string, userid: string, clinicid: string): Observable<audittrial> {
  //   return this.http.get<audittrial>(this.baseUrl + 'audittrial');
  // }

  getaudittrial(type: string, userid: string, clinicid: string): Observable<audittrial[]> {
    const url = `${this.baseUrl}audittrial?type=${type}&userid=${userid}&clinicid=${clinicid}`;
    return this.http.get<audittrial[]>(url);
  }

  // Province

  insertprovince(_data: provincenew) {
    return this.http.post(this.baseUrl + "insertprovince", _data);
  }

  getProvince(): Observable<ProvinceResponse> {
    return this.http.get<ProvinceResponse>(this.baseUrl + "province");
  }

  updateProvince(id: number, provinceData: any): Observable<any> {
    return this.http.put<any>(this.baseUrl + `province/${id}`, provinceData);
  }

  deleteProvince(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}province/${id}`);
  }

  // Level

  insertlevel(_data: level) {
    return this.http.post(this.baseUrl + "insertlevel", _data);
  }

  getLevel(): Observable<LevelResponse> {
    return this.http.get<LevelResponse>(this.baseUrl + "level");
  }

  updateLevel(id: number, levelData: any): Observable<any> {
    return this.http.put<any>(this.baseUrl + `level/${id}`, levelData);
  }

  deleteLevel(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}level/${id}`);
  }

  // Country

  getCountry(): Observable<CountryResponse> {
    return this.http.get<CountryResponse>(this.baseUrl + "country");
  }

  // Token Api
  tokendata(type: string, clinicid: string): Observable<TokenResponse> {
    const url = `${this.baseUrl}token?type=${type}&clinicid=${clinicid}`;
    return this.http.get<TokenResponse>(url);
  }

  Tokenregistration(_data: token) {
    return this.http.post(this.baseUrl + 'token', _data);
  }

  getTokenById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}gettoken/${id}`);
  }

  completeToken(tokenid: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}completetoken/${tokenid}`, {});
  }

  // Classification Api
  insertclssifiction(_data: any) {
    return this.http.post(this.baseUrl + 'classification', _data);
    //  return  this.http.post<{name: string }>(`${this.baseUrl}classification`, _data);
  }

  getclassification() {
    return this.http.get(this.baseUrl + 'getclassification');
  }

  getstreambyClinicid(id: number): Observable<classificationResponse> {
    return this.http.get<classificationResponse>(`${this.baseUrl}getstreambyclinicId/${id}`);
  }
  updateclassification(clsid: number, data: any) {
    return this.http.put(`${this.baseUrl}updateclassification/${clsid}`, data);
  }

  deletclassification(clsid: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}deleteclassification/${clsid}`);
  }

  viewclassificationbyId(id: number): Observable<classificationResponse> {
    return this.http.get<classificationResponse>(`${this.baseUrl}classificationview/${id}`);
  }

}
