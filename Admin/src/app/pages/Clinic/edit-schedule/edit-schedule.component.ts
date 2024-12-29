import { Component, OnInit, ViewChildren, QueryList, ViewChild } from "@angular/core";
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdvancedSortableDirective, SortEvent } from './advanced-sortable.directive';
import { ClinicService } from '../../../core/services/clinic.service';
import { clinic, ClinicResponse } from '../../../core/models/clinic.models';
import { schedule, scheduleResponse } from '../../../core/models/clinicschedule.model';
import { ActivatedRoute } from '@angular/router';


import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-edit-schedule',
  templateUrl: './edit-schedule.component.html',
  styleUrls: ['./edit-schedule.component.scss','./advancedtable.component.scss']
})


export class EditScheduleComponent implements OnInit {
  editscheduleForm: FormGroup;
  submitted = false;
  clinicData: clinic[] = [];
  errorMessage = '';
  minMonth: string;

  // Declare the filteredSchedule$ as a class property
  filteredSchedule$: BehaviorSubject<schedule[]> = new BehaviorSubject<schedule[]>([]); //filter api

  // Search and pagination controls
  searchTerm: string = "";
  pageSize: number = 10;
  page: number = 1;
  hideme: boolean[] = [];
 

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  clinicscheduleid: number;
  clinic_id: number;
  totalschedulecount: number;
  counttotaldata: number;




   constructor(
    private fb: FormBuilder,
    private router: Router,
    private clinicService: ClinicService,
    private ApiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) {
    this.editscheduleForm = this.fb.group({
      month: ['', [Validators.required]],
      clinicid: ['', [Validators.required]],
      apsolts: ['', [Validators.required]],
      clinicname:['',[]],
    });

     // Calculate the minimum month dynamically
     const today = new Date();
     const year = today.getFullYear();
     const month = today.getMonth() + 1; // Months are 0-based
     this.minMonth = `${year}-${month < 10 ? '0' + month : month}`;
  }



  ngOnInit(): void {
    this.fetchClinics();
    // this.fetchSchedule();
   
      // Check if we are in edit mode
      this.activatedRoute.params.subscribe(params => {
        if (params['csid'] && params['clinicid']) {
          
          this.clinicscheduleid = +params['csid'];
          this.clinic_id = +params['clinicid'];
          this.loadScheduleDataByid(this.clinicscheduleid);
         

          if (this.clinic_id) {
            this.fetchlist_scheduleByid(this.clinic_id,this.clinicscheduleid);
            this.fetchTotalSchedulesCount();
          } else {
            console.error('Clinic ID is missing');
          }
        }
      });
  }



    // Load user data for editing
    loadScheduleDataByid(id: number): void {
      this.ApiService.getScheduleById(id).subscribe((data) => {
        this.editscheduleForm.patchValue(data.schedules);
        console.log(data.schedules[0].clinicname);
        // alert(data.schedules[0].clinicname);
        // this.editscheduleForm.get('clinicid').setValue(data.schedules[0].clinicname);
      });
     
    }
 


      // Load schedule list in table for display data by id
      fetchlist_scheduleByid(cid: number, csid: number): void {
        this.ApiService.getSchedule_listById(cid, csid)
          .pipe(
            map((response: scheduleResponse) => {
              if (response && response.schedules && response.schedules.length > 0) {
                this.scheduleData = response.schedules;
                this.counttotaldata=response.schedules.length;
                this.hideme = Array(this.scheduleData.length).fill(true);
                console.log(response.schedules.length);
                this.updateFilteredSchedule();
              } else {
                console.warn('No schedules found for the given clinic and schedule ID.');
                this.scheduleData = [];
              }
            })
          )
          .subscribe({
            next: () => console.log('Schedule list successfully fetched.'),
            error: (err) => console.error('Error fetching schedule list:', err),
          });
      }
      

  

  get f() {
    return this.editscheduleForm.controls;
  }

  onSave() {
    this.submitted = true;

    if (this.editscheduleForm.invalid) {
      console.log("save for");
      return;
    }

    const formData = { ...this.editscheduleForm.value };

    this.ApiService.insertschedule(formData).subscribe({
      next: () => {
        // Show SweetAlert
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Schedule Is Added',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          // Navigate to the clinic list after Swal closes
        });
        // this.fetchSchedule();

        // Reset form and variables
        this.editscheduleForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        // Check for specific error message from the backend
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'An error occurred while adding the clinic schedule. Please try again.';
        }

        // Optionally, show SweetAlert for the error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
        });

        console.error(err);
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
  totalSchedules: number = 0;
  selectedSchedule: Partial<schedule> = {};




  //  * Fetch roles and prepare data
  // fetchSchedule() {
  //   this.ApiService.getschedules().pipe(
  //     map((response: scheduleResponse) => {
  //       this.scheduleData = response.schedules;
  //       this.hideme = Array(this.scheduleData.length).fill(true);
  //       this.updateFilteredSchedule();
  //     })
  //   ).subscribe();
  // }


  // Handle search term change
  onSearchChange(): void {
  this.page = 1; // Reset pagination to the first page

  // Fetch updated schedule data based on the search term
  this.ApiService.getSchedule_listById(this.clinic_id, this.clinicscheduleid)
    .subscribe({
      next: (response: scheduleResponse) => {
        if (response && response.schedules) {
          this.scheduleData = response.schedules;
          
          this.hideme = Array(this.scheduleData.length).fill(true);
          this.updateFilteredSchedule();
        } else {
          console.warn('No matching schedules found.');
          this.scheduleData = [];
        }
      },
      error: (err) => console.error('Error during search:', err),
    });
}


  // Fetch total clinics count from the backend
  fetchTotalSchedulesCount(): void {
    // alert(this.clinic_id);
    // alert(this.clinicscheduleid);
    this.ApiService.getTotalSchedulelistCount(this.clinic_id,this.clinicscheduleid).subscribe({
      next: (response) => {
        this.totalSchedules = response.totalSchedules;
      },
      error: (error) => {
        console.error('Error fetching total Schedulelist count:', error);
      },
    });
  }


  // Handle pagination change
  onPageChange(newPage: number) {
    if (newPage > 0 && newPage <= Math.ceil(this.totalSchedules / this.pageSize)) {
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
      sortedSchedule = sortedSchedule.filter(schedule => schedule.date.toLowerCase().includes(this.searchTerm.toLowerCase()));

    }

    this.filteredSchedule$.next(sortedSchedule);  // Update the BehaviorSubject with sorted and filtered data
  }

  // Update filtered and paginated clinics based on search and pagination
  updateFilteredSchedule() {
    const filteredData = this.scheduleData.filter((schedule) =>
      this.searchTerm
        ? schedule.date.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true

        
    );

    
  
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
  
    // Emit filtered and paginated data
    this.filteredSchedule$.next(filteredData.slice(startIndex, endIndex));
  
    // Update totalSchedules for pagination info
    this.totalSchedules = filteredData.length;
  }



   // Handle appointment count change
  //  onAppointmentChange(event: any, scheduleDate: string, timeFrom: string, reasonId: number): void {
  //   const appointmentCount = event.target.value;

  //   // Update the backend with the new appointment count
  //   this.ApiService.updatenoofAppointment(scheduleDate, timeFrom, '', appointmentCount, reasonId)
  //     .subscribe(response => {
  //       console.log('Appointment count updated:', response);
  //     }, error => {
  //       console.error('Error updating appointment count:', error);
  //     });
  // }
  
}
