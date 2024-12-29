import { Component } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PatientResponse } from 'src/app/core/models/patient.models';
import { PatientService } from '../../../core/services/patient.service';

import { map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-demographic',
  templateUrl: './demographic.component.html',
  styleUrls: ['./demographic.component.scss']
})
export class DemographicComponent {
  patientData!: PatientResponse;


  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const patientId = +this.route.snapshot.url[2].path;
    this.getPatientDetails(patientId);
  }

  getPatientDetails(id: number): void {
    this.patientService.getPatientById(id).pipe(
      map((response: PatientResponse) => {
        this.patientData = response;
        console.log(this.patientData);

        if (this.patientData?.patients?.length) {
          const patient = this.patientData.patients[0];
        }
      })
    ).subscribe();
  }

  generatePDF() {
    const element = document.getElementById('pdf-content'); // The ID of the element you want to capture

    if (element) {
      html2canvas(element).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF();

        // Add the captured image (canvas) to the PDF
        doc.addImage(imgData, 'PNG', 0, 0, canvas.width / 5, canvas.height / 5);

        // Save the generated PDF
        doc.save('demographic.pdf');
      });
    }
  }
}
