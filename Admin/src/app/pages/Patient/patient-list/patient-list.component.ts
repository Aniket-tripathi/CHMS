import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClinicService } from '../../../core/services/clinic.service'; // Update the path
import { clinic, ClinicResponse } from '../../../core/models/clinic.models';
import { PatientService } from '../../../core/services/patient.service';
import { patient, PatientResponse } from '../../../core/models/patient.models';
import { AdvancedSortableDirective, SortEvent } from './advanced-sortable.directive';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss', './advancedtable.component.scss']
})
export class PatientListComponent implements OnInit {

  // Breadcrumb data
  breadCrumbItems: Array<{}>;
  clinicData: clinic[] = [];
  // Clinic data
  patientData: patient[] = [];
  filteredPatients$: BehaviorSubject<patient[]>;
  totalPatients: number = 0;

  // Search and pagination controls
  searchTerm: string = '';
  pageSize: number = 10;
  page: number = 1;
  hideme: boolean[] = [];

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  router: any;

  constructor(private patientService: PatientService) {
    this.filteredPatients$ = new BehaviorSubject<patient[]>([]);
  }

  ngOnInit() {
    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    console.log(localuserData)
    const userid = localuserData.user.user.id;
    const clinicid = localuserData.user.user.clinicId;
    const staffrole = localuserData.user.user.role;
    const stafftype = localuserData.user.user.staffType;
    if (staffrole == "superadmin") {
      this.fetchPatient("superadmin", userid, clinicid);
    } else if (stafftype == "cadmin") {
      this.fetchPatient("cadmin", userid, clinicid);
    } else if (stafftype == "cstaff") {
      this.fetchPatient("cstaff", userid, clinicid);
    } else {

    }

    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Patient Table', active: true }];

  }




  fetchPatient(type: string, userid: string, clinicid: string): void {
    this.patientService.getPatients(type, userid, clinicid).pipe(
      map((response: PatientResponse) => {
        this.patientData = response.patients;
        console.log(this.patientData);
        this.updatefilteredPatients();
      })
    ).subscribe();
  }




  //  * Update filtered and paginated clinics based on search and pagination
  updatefilteredPatients() {
    const filteredData = this.patientData.filter((patient) =>
      this.searchTerm ? patient.fullname.toLowerCase().includes(this.searchTerm.toLowerCase()) : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredPatients$.next(filteredData.slice(startIndex, endIndex));
  }


  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updatefilteredPatients();
  }


  //  * Handle pagination change
  onPageChange(newPage: number) {
    if (newPage > 0 && newPage <= Math.ceil(this.totalPatients / this.pageSize)) {
      this.page = newPage;
      this.updatefilteredPatients();
    }
  }


  //  * Toggle the visibility of clinic details
  //  * @param index Index of the clinic
  changeValue(index: number) {
    this.hideme[index] = !this.hideme[index];
  }

  //  * Handle sorting events
  //  * @param sortEvent Event from sortable directive
  onSort({ column, direction }: SortEvent) {
    this.patientData.sort((a, b) => {
      if (direction === 'asc') {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });
    this.updatefilteredPatients();
  }



}
