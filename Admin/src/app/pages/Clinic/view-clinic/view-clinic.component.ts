import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClinicService } from '../../../core/services/clinic.service';
import { ApiService } from '../../../core/services/api.service';
import { clinic, ClinicResponse } from '../../../core/models/clinic.models';
import { AdvancedSortableDirective, SortEvent } from './advanced-sortable.directive';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-clinic',
  templateUrl: './view-clinic.component.html',
  styleUrls: ['./view-clinic.component.scss', './advancedtable.component.scss']
})
export class ViewClinicComponent implements OnInit {

  // Breadcrumb data
  breadCrumbItems: Array<{}>;

  // Clinic data
  clinicData: clinic[] = [];
  filteredClinics$: BehaviorSubject<clinic[]> = new BehaviorSubject<clinic[]>([]);
  totalClinics: number = 0;
  totalStaff: number = 0;
  totalPatient: number = 0;
  selectedClinic: Partial<clinic> = {};
  isEditModalOpen: boolean = false;

  // Search and pagination controls
  searchTerm: string = '';
  pageSize: number = 10;
  page: number = 1;
  hideme: boolean[] = [];

  isActive: boolean = false;
  statusMessage: string = '';
  role : string;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;


  constructor(private clinicService: ClinicService,
    private ApiService: ApiService
  ) {
    this.filteredClinics$ = new BehaviorSubject<clinic[]>([]);
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Clinic Table', active: true }];
    this.fetchClinics();
    this.applySorting();
    this.fetchTotalClinicsCount();
    this.fetchTotalStaffCount();
    this.fetchTotalPatientCount();

    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    console.log(localuserData)
     this.role = localuserData.user.user.role || 'Unknown';
  }


  //  * Fetch clinics and prepare data
  fetchClinics() {
    this.clinicService.getClinics().pipe(
      map((response: ClinicResponse) => {
        this.clinicData = response.clinics;
        this.hideme = Array(this.clinicData.length).fill(true);
        this.updateFilteredClinics();
      })
    ).subscribe();
  }


  // Open Edit Modal
  openEditModal(clinic: clinic) {
    this.selectedClinic = { ...clinic }; // Clone clinic object
    this.isEditModalOpen = true;
  }

  // Close Edit Modal
  closeEditModal() {
    this.isEditModalOpen = false;
  }

  // Update Clinic Data
  saveClinic() {
    if (this.selectedClinic.clinicid) {
      this.clinicService.updateClinic(this.selectedClinic.clinicid, this.selectedClinic).subscribe({
        next: (response) => {
          console.log('Clinic updated:', response);
          this.fetchClinics(); // Refresh clinics list

          // Trigger the modal close button
          const closeButton = document.getElementById('closeEditModalButton');
          if (closeButton) {
            closeButton.click();
          }


          Swal.fire({
            icon: 'success',
            position: 'top-right',
            title: 'Clinic Updated!',
            text: 'The clinic details have been successfully updated.',
            showConfirmButton: false,
            timer: 1500, // Auto-close after 1000ms
            timerProgressBar: true // Optional: Show timer progress bar
          });
          this.closeEditModal();
        },
        error: (err) => {
          console.error('Error updating clinic:', err);
          Swal.fire('Error', 'Something went wrong while updating the clinic.', 'error');
        }
      });
    }
  }


  //  Update filtered and paginated clinics based on search and pagination
  updateFilteredClinics() {
    const filteredData = this.clinicData.filter((clinic) =>
      this.searchTerm
        ? clinic.clinicname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        clinic.cliniccode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        clinic.clinicEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        clinic.clinicAddDate.includes(this.searchTerm)
        : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredClinics$.next(filteredData.slice(startIndex, endIndex));
  }


  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updateFilteredClinics();

    // Make sure that the API call sends the search term
    this.clinicService.getClinics(this.searchTerm).subscribe((response: ClinicResponse) => {
      this.clinicData = response.clinics;
      this.hideme = Array(this.clinicData.length).fill(true);
      this.updateFilteredClinics();
    });
  }



  //  * Handle pagination change
  onPageChange(newPage: number) {
    if (newPage > 0 && newPage <= Math.ceil(this.totalClinics / this.pageSize)) {
      this.page = newPage;
      this.updateFilteredClinics();
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
    let sortedClinics = [...this.clinicData];

    if (this.sortColumn) {
      sortedClinics = sortedClinics.sort((a, b) => {
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
      sortedClinics = sortedClinics.filter(clinic => clinic.clinicname.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    this.filteredClinics$.next(sortedClinics);  // Update the BehaviorSubject with sorted and filtered data

  }

  handleStatusChange(clinic: clinic, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const newStatus: 'active' | 'inactive' = checkbox.checked ? 'active' : 'inactive'; // Explicit type added

    if (newStatus === 'inactive') {
      // Show confirmation for deactivation
      Swal.fire({
        title: 'Are you sure?',
        text: `This ${clinic.clinicname} will be deactivated!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, deactivate it!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.toggleClinicStatus(clinic, newStatus);
          setTimeout(() => {
            Swal.close();
          }, 1500);
        } else {
          checkbox.checked = true; // Revert back if canceled
        }
      });
    } else {
      // Directly activate the clinic
      this.toggleClinicStatus(clinic, newStatus);

    }
  }

  // Toggle clinic status with API call
  toggleClinicStatus(clinic: clinic, newStatus: 'active' | 'inactive') { // Explicit type for newStatus
    this.clinicService.toggleClinicStatus(clinic.clinicid, newStatus).subscribe({
      next: (response: { message: string }) => {
        clinic.clinicStatus = newStatus; // Update status locally
        if (newStatus === 'active') {
          Swal.fire('Activated!', `${clinic.clinicname} has been activated.`, 'success');
          setTimeout(() => {
            Swal.close(); // Close the Swal after 1000ms
          }, 1500);
        } else {
          Swal.fire('Deactivated!', `${clinic.clinicname} has been deactivated.`, 'success');
          setTimeout(() => {
            Swal.close(); // Close the Swal after 1000ms
          }, 1500);
        }
      },
      error: (err) => {
        console.error('Error updating status:', err);
        Swal.fire('Error', 'Something went wrong while updating the status.', 'error');
        clinic.clinicStatus = clinic.clinicStatus === 'active' ? 'inactive' : 'active'; // Revert in case of error
      },
    });
  }

  // Fetch total clinics count from the backend
  fetchTotalClinicsCount(): void {
    this.clinicService.getTotalClinicsCount().subscribe({
      next: (response) => {
        this.totalClinics = response.totalClinics;
      },
      error: (error) => {
        console.error('Error fetching total clinics count:', error);
      },
    });
  }

  // Fetch total clinics count from the backend
  fetchTotalStaffCount(): void {
    this.ApiService.getTotalStaffCount().subscribe({
      next: (response) => {
        this.totalStaff = response.totalStaff;
      },
      error: (error) => {
        console.error('Error fetching total clinics count:', error);
      },
    });
  }
  // Fetch total clinics count from the backend
  fetchTotalPatientCount(): void {
    this.ApiService.getTotalPatientCount().subscribe({
      next: (response) => {
        this.totalPatient = response.totalPatient;
      },
      error: (error) => {
        console.error('Error fetching total getTotalPatientCount count:', error);
      },
    });
  }

}



