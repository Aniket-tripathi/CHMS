import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { visit, VisitResponse } from '../models/visit.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitService {


  constructor(private http: HttpClient) { }

  baseUrl = environment.firebaseConfig.apiKey;

  Visitregistration(_data: visit) {
    return this.http.post(this.baseUrl + 'visit', _data);
  }
  getVisits(type: string, userid: string,clinicid: string): Observable<VisitResponse> {
    const url = `${this.baseUrl}visit?type=${type}&userid=${userid}&clinicid=${clinicid}`;
     return this.http.get<VisitResponse>(url);
  }

  getVisitById(id: number): Observable<VisitResponse> {
    return this.http.get<VisitResponse>(`${this.baseUrl}visit/${id}`);
  }
}
