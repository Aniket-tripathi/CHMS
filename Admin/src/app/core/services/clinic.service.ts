import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { clinic, ClinicResponse } from '../models/clinic.models';
import { Observable } from 'rxjs';
import { TokenResponse } from '../models/token.models';
import { CounterResponse } from '../models/counter.models';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  getTotalPatientCount() {
    throw new Error('Method not implemented.');
  }

  constructor(private http: HttpClient) { }

  baseUrl = environment.firebaseConfig.apiKey;

  Clinicregistration(clinicData: any) {
    return this.http.post(this.baseUrl + 'clinic', clinicData);
  }


  getClinics(query: string = ''): Observable<ClinicResponse> {
    return this.http.get<ClinicResponse>(this.baseUrl + 'clinic', { params: { query } });
  }

  // Get the clinic logo
  getClinicLogo(filename: string): Observable<Blob> {
    const logoUrl = `${this.baseUrl}clinicLogo/${filename}`;
    return this.http.get(logoUrl, { responseType: 'blob' });
  }

  getClinicById(clinicId: string): Observable<clinic> {
    return this.http.get<clinic>(`${this.baseUrl}clinic/${clinicId}`);
  }

  // Toggle clinic status
  toggleClinicStatus(clinicid: number, newStatus: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}clinic/${clinicid}/status`, { clinicStatus: newStatus });
  }

  // Update clinic details
  updateClinic(clinicid: number, clinicData: Partial<clinic>) {
    return this.http.put(`${this.baseUrl}clinic/${clinicid}`, clinicData);
  }

  // Check email availability
  checkEmailAvailability(emailData: { clinicEmail: string }): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'check-email', emailData);
  }

  // Fetch total clinics count
  getTotalClinicsCount(): Observable<{ totalClinics: number }> {
    return this.http.get<{ totalClinics: number }>(`${this.baseUrl}count`);
  }


  getCliniccounter(query: string = ''): Observable<ClinicResponse> {
    return this.http.get<ClinicResponse>(this.baseUrl + 'getCliniccounter', { params: { query } });
  }

  getCliniccounterbyId(id: number): Observable<ClinicResponse> {
    return this.http.get<ClinicResponse>(`${this.baseUrl}getCliniccounterbyId/${id}`);
  }

  getCounterByclinic(id: number): Observable<CounterResponse> {
    return this.http.get<CounterResponse>(`${this.baseUrl}counterbyclinic/${id}`);
  }

  getWaitingToken(id: number): Observable<TokenResponse> {
    return this.http.get<TokenResponse>(`${this.baseUrl}waitingtoken/${id}`);
  }

  getPharmacycounter(query: string = ''): Observable<ClinicResponse> {
    return this.http.get<ClinicResponse>(this.baseUrl + 'getPharmacycounter', { params: { query } });
  }
}
