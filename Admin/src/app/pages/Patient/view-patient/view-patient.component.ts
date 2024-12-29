import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { PatientResponse } from '../../../core/models/patient.models';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-view-patient',
  templateUrl: './view-patient.component.html',
  styleUrls: ['./view-patient.component.scss']
})
export class ViewPatientComponent implements OnInit {
  patientData!: PatientResponse;
  kinDetail: any = [];

  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const patientId = +this.route.snapshot.url[2].path; // Ensure you're getting the patient ID from the route
    this.getPatientDetails(patientId);
  }

  getPatientDetails(id: number): void {
    this.patientService.getPatientById(id).pipe(
      map((response: PatientResponse) => {
        this.patientData = response;
        console.log('API Response:', response);
  
        if (Array.isArray(this.patientData.patients) && this.patientData.patients.length > 0) {
          const patient = this.patientData.patients[0];
          console.log('Kin Detail (Raw):', patient?.kin_detail);  // Log raw kin_detail before parsing
  
          if (patient?.kin_detail) {
            try {
              // Check if kin_detail is a valid JSON string and parse it
              this.kinDetail = JSON.parse(patient.kin_detail);
              console.log('Parsed Kin Detail:', this.kinDetail);
            } catch (error) {
              console.error('Error parsing kin_detail JSON:', error);
            }
          }
        }
      })
    ).subscribe();
  }
  
  
  
}
