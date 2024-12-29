import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { patient, PatientResponse } from '../models/patient.models';
import { vital, VitalResponse } from '../models/vital.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient) { }

  baseUrl = environment.firebaseConfig.apiKey;

  Patientregistration(_data: patient) {
    return this.http.post(this.baseUrl + 'patient', _data);
  }

  addvital(_data: vital) {
    return this.http.post(this.baseUrl + 'addvital', _data);
  }

  getPatients(type: string, userid: string, clinicid: string): Observable<PatientResponse> {
    const url = `${this.baseUrl}patient?type=${type}&userid=${userid}&clinicid=${clinicid}`;
    return this.http.get<PatientResponse>(url);
  }


  getPatientById(id: number): Observable<PatientResponse> {
    return this.http.get<PatientResponse>(`${this.baseUrl}patient/${id}`);
  }

  getVitalById(id: number): Observable<VitalResponse> {
    return this.http.get<VitalResponse>(`${this.baseUrl}getvital/${id}`);
  }

  getVitals(type: string, userid: string, clinicid: string): Observable<VitalResponse> {
    const url = `${this.baseUrl}getvital?type=${type}&userid=${userid}&clinicid=${clinicid}`;
    return this.http.get<VitalResponse>(url);
  }

  getptndata(id: number): Observable<PatientResponse> {
    return this.http.get<PatientResponse>(`${this.baseUrl}vstpatient/${id}`);
  }

  getPtn(id: number): Observable<PatientResponse> {
    return this.http.get<PatientResponse>(`${this.baseUrl}patientbyclinic/${id}`);
  }

  getvst(id: number): Observable<PatientResponse> {
    return this.http.get<PatientResponse>(`${this.baseUrl}visitbyclinic/${id}`);
  }


  getvisitdata(id: number): Observable<PatientResponse> {
    return this.http.get<PatientResponse>(`${this.baseUrl}getvisitdata/${id}`);
  }


  getclassification(id: number): Observable<PatientResponse> {
    return this.http.get<PatientResponse>(`${this.baseUrl}classificationByClinic/${id}`);
  }



  getPatientDetails(clinicId: string, ptnMpi: string) {
    const url = `${this.baseUrl}patientsearch?clinicId=${clinicId}&ptnMpi=${ptnMpi}`;
    return this.http.get(url);
  }

  // Vital Api

  checkBodyTemp(bodyTemp: string, age: string) {
    const url = `${this.baseUrl}bodytemp?age=${age}&bodytemp=${bodyTemp}`;
    return this.http.get(url);
  }

  respiration(respirationRate: string, age: string) {
    const url = `${this.baseUrl}respiration?age=${age}&respirationRate=${respirationRate}`;
    return this.http.get(url);
  }

  bloodPressure(bloodp: string, age: string) {
    const url = `${this.baseUrl}bloodPressure?age=${age}&bloodp=${bloodp}`;
    return this.http.get(url);
  }

  bloodGlucose(bloodg: string) {
    const url = `${this.baseUrl}bloodGlucose?bloodg=${bloodg}`;
    return this.http.get(url);
  }

  PeakFlow(peakflow: string) {
    const url = `${this.baseUrl}PeakFlow?PeakFlow=${peakflow}`;
    return this.http.get(url);
  }


  pulserate(pulserate: string, age: string) {
    const url = `${this.baseUrl}pulserate?age=${age}&pulserate=${pulserate}`;
    return this.http.get(url);
  }

  bodyWeight(bodyweight: string, age: string) {
    const url = `${this.baseUrl}bodyWeight?age=${age}&weight=${bodyweight}`;
    return this.http.get(url);
  }

  calculateBMI(height: string, weight: string) {
    const url = `${this.baseUrl}calculateBMI?height=${height}&weight=${weight}`;
    return this.http.get(url);
  }

  checkcounter(clinicId: string) {
    const url = `${this.baseUrl}CheckCounterByClinic/${clinicId}`;
    return this.http.get(url);
  }


}
