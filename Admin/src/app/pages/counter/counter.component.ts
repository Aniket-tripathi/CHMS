import { Component, OnInit, ViewChildren, QueryList, ViewChild } from "@angular/core";
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdvancedSortableDirective, SortEvent } from './advanced-sortable.directive';


import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators, NgForm } from "@angular/forms";
import { ClinicService } from '../../core/services/clinic.service';
import { clinic, ClinicResponse } from '../../core/models/clinic.models';
import { counter, CounterResponse } from '../../core/models/counter.models';
import { classification, classificationResponse } from '../../core/models/classification.models';

import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})

export class CounterComponent implements OnInit {
  counterForm: FormGroup;
  isClinicNameDisabled: boolean = false;
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;
  name: any;
  clinicData: clinic[] = [];
  submitted = false;
  errorMessage = '';
  selectedCounterType: string = '';
  counterData: counter[] = [];
  filteredCounters$: BehaviorSubject<counter[]> = new BehaviorSubject<counter[]>([]);
  totalCounters: number = 0;
  selectedCounter: Partial<counter> = {};
  @ViewChild('closeButton') closeButton: any;
  centerCounterModal: any;
  classificationData: classification[];


  constructor(private modalService: BsModalService,
    private clinicService: ClinicService,
    private fb: FormBuilder,
    private http: HttpClient,
    private ApiService: ApiService,
    private router: Router,
  ) {
    // Initialize the form group
    this.counterForm = this.fb.group({
      clinic_id: ['', Validators.required],
      countername: ['', Validators.required],
      countertype: ['', Validators.required],
      stream_id: [null, Validators.required],
      current_token: ['', []],
      current_tokenid: [null, []],
      current_token_status: ['', []],
      counterdesc: ['', []],
      counterstatus: ['', []],
      added_by: ['', []],
      date: ['', []],
      time: ['', []],
    });
    // this.toggleClinicField();
    this.filteredCounters$ = new BehaviorSubject<counter[]>([]);
  }


  get f() {
    return this.counterForm.controls;
  }





  // Search and pagination controls
  searchTerm: string = "";
  pageSize: number = 10;
  page: number = 1;
  hideme: boolean[] = [];



  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;







  ngOnInit() {
    this.counterForm.get('stream_id')?.clearValidators();
    this.breadCrumbItems = [
      { label: "Tables" },
      { label: "Role Table", active: true },
    ];
    this.fetchCounter();
    this.applySorting();
    this.fetchClinics();
    this.updateFilteredCounters();
  }

  togglecheck(event: Event): void {
    const selectvalue = (event.target as HTMLInputElement).value;
    if (selectvalue == 'Clinic') {
      this.counterForm.get('stream_id')?.setValidators([Validators.required]);
    } else {
      this.counterForm.get('stream_id')?.clearValidators();
    }
  }
  getclassfy(): void {
    const clinicid = this.counterForm.get("clinic_id")?.value;
    this.ApiService.classificationclinic(clinicid).pipe(
      map((response: classificationResponse) => {
        this.classificationData = response.classifications;
      })
    ).subscribe();

  }
  /**
   * Open center modal
   * @param centerDataModal center modal data
   */
  centerModal(centerCounterModal: any) {
    this.modalRef = this.modalService.show(centerCounterModal);
  }



  fetchClinics(): void {
    this.clinicService.getClinics().pipe(
      map((response: ClinicResponse) => {
        this.clinicData = response.clinics;
      })
    ).subscribe();
  }


  //  * Fetch roles and prepare data
  fetchCounter() {
    this.ApiService.getcounters().pipe(
      map((response: CounterResponse) => {
        this.counterData = response.counters;
        this.hideme = Array(this.counterData.length).fill(true);
        this.updateFilteredCounters();
      })
    ).subscribe();
  }




  //  Update filtered and paginated clinics based on search and pagination
  updateFilteredCounters() {
    const filteredData = this.counterData.filter((counters) =>
      this.searchTerm
        ? counters.countername.toLowerCase().includes(this.searchTerm.toLowerCase()) : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredCounters$.next(filteredData.slice(startIndex, endIndex));
  }





  //  * Handle pagination change
  onPageChange(newPage: number) {
    if (newPage > 0 && newPage <= Math.ceil(this.totalCounters / this.pageSize)) {
      this.page = newPage;
      this.updateFilteredCounters();
    }
  }


  //  * Toggle the visibility of clinic details
  //  * @param index Index of the clinic
  changeValue(index: number) {
    this.hideme[index] = !this.hideme[index];
  }

  //  * Handle sorting events
  //  * @param sortEvent Event from sortable directive
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  // Sorting logic
  onSort(column: string): void {
    if (this.sortColumn === column) {
      // Toggle sort direction if the same column is clicked
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc'; // Default to ascending order for new column
    }
    this.applySorting();  // Apply sorting after column selection
  }

  // Apply sorting and emit the sorted clinics array
  applySorting(): void {
    let sortedCounters = [...this.counterData];

    if (this.sortColumn) {
      sortedCounters = sortedCounters.sort((a, b) => {
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

    // Apply search filter if any search term is present
    if (this.searchTerm) {
      sortedCounters = sortedCounters.filter(counter => counter.countername.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    this.filteredCounters$.next(sortedCounters);  // Update the BehaviorSubject with sorted and filtered data

  }



  //  Fetch total clinics count from the backend
  //  fetchTotalCountersCount(): void {
  //   this.ApiService.getTotalCountersCount().subscribe({
  //     next: (response) => {
  //       this.totalCounters = response.totalCounters;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching total clinics count:', error);
  //     },
  //   });
  // }



  //to save data 
  onSubmit() {
    this.submitted = true;
    console.log('Form submitted:', this.submitted);

    if (this.counterForm.invalid) {
      console.log("Invalid Error");
      return;
    }

    const formData = { ...this.counterForm.value };

    this.ApiService.insertcounter(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.counterForm.reset();
          this.submitted = false;
          this.triggerCloseButton();
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: response.message, // Use the message from the backend
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.fetchCounter();
          });
        } else {
          // Handle error response
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message || 'An unexpected error occurred.',
          });
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'A counter already exists for this Clinic under this Stream. Please check your input and try again.';

        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: this.errorMessage,
        });
      }

    });
  }

  triggerCloseButton(): void {
    if (this.closeButton) {
      this.closeButton.nativeElement.click();
    }
  }

}

