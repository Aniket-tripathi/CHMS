import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// import { clinic } from 'src/app/core/models/clinic.models';
import { vital, VitalResponse } from 'src/app/core/models/vital.model';
import { AdvancedSortableDirective, SortEvent } from '../../Vital/vital-list/advanced-sortable.directive';
import { PatientService } from 'src/app/core/services/patient.service';
import { DecimalPipe } from '@angular/common';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-vital-list',
  templateUrl: './vital-list.component.html',
  styleUrls: ['./vital-list.component.scss', './advancedtable.component.scss']
})


export class VitalListComponent implements OnInit {

  // Breadcrumb data
  breadCrumbItems: Array<{}>;

  // Clinic data
  vitalData: vital[] = [];
  filteredVitals$: BehaviorSubject<vital[]>; // Filtered clinics for table display
  totalVitals: number = 0;

  // Search and pagination controls
  searchTerm: string = '';
  pageSize: number = 10;
  page: number = 1;
  hideme: boolean[] = [];

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;

  constructor(private patientService: PatientService) {
    this.filteredVitals$ = new BehaviorSubject<vital[]>([]);
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Vital Table', active: true }];
    
    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    console.log(localuserData)
    const userid = localuserData.user.user.id;
    const clinicid = localuserData.user.user.clinicId;
    const staffrole = localuserData.user.user.role;
    const stafftype = localuserData.user.user.staffType;
    if (staffrole == "superadmin") {
      this.fetchVitals("superadmin", userid, clinicid);
    } else if (stafftype == "cadmin") {
      this.fetchVitals("cadmin", userid, clinicid);
    } else if (stafftype == "cstaff") {
      this.fetchVitals("cstaff", userid, clinicid);
    } else {

    }
  }


  //  * Fetch clinics and prepare data
  fetchVitals(type: string, userid: string, clinicid: string) {
    this.patientService.getVitals(type, userid, clinicid).pipe(
      map((response: VitalResponse) => {
        this.vitalData = response.vitals;
        this.totalVitals = this.vitalData.length; 
        this.hideme = Array(this.vitalData.length).fill(true);
        this.updatefilteredVitals();
      })
    ).subscribe();
  }

  //  * Update filtered and paginated clinics based on search and pagination
  updatefilteredVitals() {
    const filteredData = this.vitalData.filter((vital) =>
      this.searchTerm ? vital.patient_id.toLowerCase().includes(this.searchTerm.toLowerCase()) : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredVitals$.next(filteredData.slice(startIndex, endIndex));
  }


  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updatefilteredVitals();
  }


  //  * Handle pagination change
  onPageChange(newPage: number) {
    if (newPage > 0 && newPage <= Math.ceil(this.totalVitals / this.pageSize)) {
      this.page = newPage;
      this.updatefilteredVitals();
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
    this.vitalData.sort((a, b) => {
      if (direction === 'asc') {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });
    this.updatefilteredVitals();
  }

}
