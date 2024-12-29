import { Component, OnInit, ViewChildren, QueryList, ViewChild } from "@angular/core";
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdvancedSortableDirective, SortEvent } from './advanced-sortable.directive';
import { ClinicService } from '../../../core/services/clinic.service';
import { clinic, ClinicResponse } from '../../../core/models/clinic.models';
import { schedule, scheduleResponse } from '../../../core/models/clinicschedule.model';




import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { map } from 'rxjs/operators';
import { ApiResponse } from "src/app/core/models/ApiResponse.model";
  // Correct relative path



@Component({
  selector: 'app-clinic-shedule',
  templateUrl: './clinic-shedule.component.html',
  styleUrls: ['./clinic-shedule.component.scss', './advancedtable.component.scss']
})
export class ClinicSheduleComponent implements OnInit {
  scheduleForm: FormGroup;
  submitted = false;
  clinicData: clinic[] = [];
  sessionclinicname:any;
 
  minMonth: string;

  // Declare the filteredSchedule$ as a class property
  filteredSchedule$: BehaviorSubject<schedule[]> = new BehaviorSubject<schedule[]>([]); //filter api

  // Search and pagination controls
  searchTerm: string = "";
  pageSize: number = 10;
  page: number = 1;
  hideme: boolean[] = [];

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  cid: any;
  checkrole: any;
  localuserData: any;
  userid: any;
  clinicid: any;
  role: any;
  stafftype: any;


  ngOnInit(): void {
   
    this.localuserData = JSON.parse(localStorage.getItem('currentUser'));
    this.userid = this.localuserData.user.user.id;
    
    this.clinicid = this.localuserData.user.user.clinicId;
    this.sessionclinicname = this.localuserData.user.user.clinicname;
   

   this.role = this.localuserData.user.user.role;
    this.stafftype = this.localuserData.user.user.staffType?this.localuserData.user.user.staffType:this.localuserData.user.user.role;
    
    this.cid = this.clinicid;
    this.checkrole = this.role;
    

    if (this.role == "superadmin") {
      this.fetchClinics();
      
    } else {
      this.scheduleForm.get('clinicid').setValue(this.cid);

    }


   
    if (this.role == "superadmin") {
      this.fetchSchedule("superadmin", this.userid, this.clinicid);
    } else if (this.stafftype == "cadmin") {
      this.fetchSchedule("cadmin", this.userid, this.clinicid);
      // alert(this.userid);
    } else if (this.stafftype == "cstaff") {
      this.fetchSchedule("cstaff", this.userid, this.clinicid);
    } else {

    }
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clinicService: ClinicService,
    private ApiService: ApiService
  ) {
    this.scheduleForm = this.fb.group({
      month: ['', [Validators.required]],
      clinicid: ['', [Validators.required]],
      apsolts: ['', [Validators.required]],
    });

     // Calculate the minimum month dynamically
     const today = new Date();
     const year = today.getFullYear();
     const month = today.getMonth() + 1; // Months are 0-based
     this.minMonth = `${year}-${month < 10 ? '0' + month : month}`;
  }

  get f() {
    return this.scheduleForm.controls;
  }

  onSave() {
    this.submitted = true;

    if (this.scheduleForm.invalid) {
      console.log("save for");
      return;
    }

    const formData = { ...this.scheduleForm.value };

   
    

    if(this.role == 'superadmin'){
      formData.added_by = this.role;
    }else{
      formData.added_by = this.stafftype;
    }
    formData.added_userid = this.userid;

    this.ApiService.insertschedule(formData).subscribe({
      next: (response: ApiResponse) => {
        if (response && response.success) {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: response.message, // Use the message from the API
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            
            this.fetchSchedule(this.stafftype, this.userid, this.clinicid); // Reload the schedule after successful insertion
            this.scheduleForm.reset(); // Reset form after successful insertion
            this.submitted = false; // Reset form submission state
          });
        }
      },
      error: (err) => {
        console.log('Error response:', err); // Log the entire error response for inspection
    
        let errorMessage = err;
    
        // Check if the error response has the message directly
        if (err.status === 400 && err.error && err.error.message) {
          errorMessage = err.error.message; // Extract the specific error message from the backend
        } else if (err.status === 400 && !err.error.message) {
          // If no message is found in the error object, fallback to default message
          errorMessage = err;
        } else if (err.status === 500) {
          // Handle server error
          errorMessage = 'err.';
        }
    
        // Show the error message in a Swal alert
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage, // Show the extracted error message from the API
        });
    
        // Log the error message in the console to inspect it
        console.error('API Error:', err.error.message); // Log the actual message for debugging
      }
    });
    
    
    
    
    
    
    
    
    
    
  }

  fetchClinics(): void {
    this.clinicService.getClinics().pipe(
      map((response: ClinicResponse) => {
        this.clinicData = response.clinics;
      })
    ).subscribe();
  }

  scheduleData: schedule[] = [];
  totalRoles: number = 0;
  selectedSchedule: Partial<schedule> = {};




  //  * Fetch roles and prepare data
  fetchSchedule(_stafftype,_userid,_clinicid) {
    // alert(this.userid);
    this.ApiService.getschedules(this.stafftype,this.userid,this.clinicid).pipe(
      map((response: scheduleResponse) => {
        this.scheduleData = response.schedules;
        this.hideme = Array(this.scheduleData.length).fill(true);
        this.updateFilteredSchedule();
      })
    ).subscribe();
  }


  // Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updateFilteredSchedule();

    this.ApiService.getschedules(this.stafftype, this.userid,this.clinicid).subscribe((response: scheduleResponse) => {
      this.scheduleData = response.schedules;
      this.hideme = Array(this.scheduleData.length).fill(true);
      this.updateFilteredSchedule();
    });
  }

  // Handle pagination change
  onPageChange(newPage: number) {
    if (newPage > 0 && newPage <= Math.ceil(this.totalRoles / this.pageSize)) {
      this.page = newPage;
      this.updateFilteredSchedule();
    }
  }

  // Toggle the visibility of clinic details
  changeValue(index: number) {
    this.hideme[index] = !this.hideme[index];
  }

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Sorting logic
  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc'; // Default to ascending order for new column
    }
    this.applySorting();  // Apply sorting after column selection
  }

  // Apply sorting and emit the sorted clinics array
  applySorting(): void {
    let sortedSchedule = [...this.scheduleData];

    if (this.sortColumn) {
      sortedSchedule = sortedSchedule.sort((a, b) => {
        const valueA = a[this.sortColumn];
        const valueB = b[this.sortColumn];

        // Compare by clinicId (or other columns as required)
        if (valueA < valueB) {
          return this.sortDirection === 'asc' ? -1 : 1;
        } else if (valueA > valueB) {
          return this.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    if (this.searchTerm) {
      sortedSchedule = sortedSchedule.filter((schedule) => 
        schedule.clinic_sch_dt.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        schedule.month.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        schedule.clinicname.toLowerCase().includes(this.searchTerm.toLowerCase())||
        schedule.from_to_date.toLowerCase().includes(this.searchTerm.toLowerCase())
        
      );
    }

    this.filteredSchedule$.next(sortedSchedule);  // Update the BehaviorSubject with sorted and filtered data
  }

  // Update filtered and paginated clinics based on search and pagination
  updateFilteredSchedule() {
    const filteredData = this.scheduleData.filter((schedule) =>
      this.searchTerm
        ? schedule.clinic_sch_dt.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          schedule.clinicname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          schedule.month.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          schedule.from_to_date.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true
    );
    

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredSchedule$.next(filteredData.slice(startIndex, endIndex));
  }
}

