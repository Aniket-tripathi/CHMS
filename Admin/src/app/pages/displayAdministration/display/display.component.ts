import { Component, OnInit } from '@angular/core';
import { ClinicService } from '../../../core/services/clinic.service';
import { ClinicResponse } from '../../../core/models/clinic.models'; // Adjust the path based on your project structure
import { Router } from '@angular/router';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {

  clinicsData: any[] = [];
  cid: any;
  checkrole: any;

  constructor(private clinicService: ClinicService, private router: Router) { }

  navigateToClinic(clinicId: string) {
    this.router.navigate(['/display/screen', clinicId]);
  }

  showAlert() {
    alert('No Counter Available');
  }
  ngOnInit() {
    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    const userid = localuserData.user.user.id;
    const clinicid = localuserData.user.user.clinicId;
    const role = localuserData.user.user.role;
    const stafftype = localuserData.user.user.staffType;
    this.cid = clinicid;
    this.checkrole = role;
    if (role != 'superadmin') {
      this.cid = clinicid;
      this.fetchClinicsbyClinic(this.cid);
    }else{
      this.fetchClinics();
      
    }
  }

  fetchClinics() {
    this.clinicService.getCliniccounter().subscribe((response: ClinicResponse) => {
      this.clinicsData = response.clinics;
    });
  }
  fetchClinicsbyClinic(cid: any) {
    this.clinicService.getCliniccounterbyId(this.cid).subscribe((response: ClinicResponse) => {
      this.clinicsData = response.clinics;  

    });
  }
}
