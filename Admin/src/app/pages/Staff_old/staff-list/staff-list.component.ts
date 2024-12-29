import { Component, QueryList, ViewChildren } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { staff } from 'src/app/core/models/staff.models';
import { StaffService } from '../../../core/services/staff.service';
import { AdvancedSortableDirective } from './advanced-sortable.directive';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-staff-list',
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss']
})
export class StaffListComponent {


  // Breadcrumb data
  breadCrumbItems: Array<{}>;

  // staff data
  staffData: staff[] = [];
  filteredstaff$: BehaviorSubject<staff[]> = new BehaviorSubject<staff[]>([]); // Filtered getStaffs for table display
  totalStaffs: number = 0;
  selectedStaff: Partial<staff> = {};
  isEditModalOpen: boolean = false;

  // Search and pagination controls
  searchTerm: string = '';
  pageSize: number = 10;
  page: number = 1;
  hideme: boolean[] = [];

  isActive: boolean = false;
  statusMessage: string = '';


  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;

  constructor(private StaffService: StaffService, private router: Router) {
    this.filteredstaff$ = new BehaviorSubject<staff[]>([]);
  }


  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Staff Table', active: true }];
    this.fetchstaffs();
  }



  fetchstaffs(): void {
    this.StaffService.getStaffs().subscribe((response: any) => {
      this.staffData = response.staff;
      this.filteredstaff$.next(this.staffData);
      console.log(this.staffData);
    });
  }

  updateFilteredStaffs() {
    const filteredData = this.staffData.filter((staff) =>
      this.searchTerm
        ? staff.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        staff.fname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        staff.lname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        staff.email.includes(this.searchTerm)
        : true
    );

    this.filteredstaff$.next(filteredData);

  }


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
    let sortedStaffs = [...this.staffData];

    if (this.sortColumn) {
      sortedStaffs = sortedStaffs.sort((a, b) => {
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
      sortedStaffs = sortedStaffs.filter(staff => staff.fname.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    this.filteredstaff$.next(sortedStaffs);  // Update the BehaviorSubject with sorted and filtered data

  }


  //  * Handle pagination change
  onPageChange(newPage: number) {
    if (newPage > 0 && newPage <= Math.ceil(this.totalStaffs / this.pageSize)) {
      this.page = newPage;
    }
  }

  viewDetails(id: string): void {
    this.router.navigate(['staff/view/', id]);
  }


  handleStatusChange(staff: staff, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const newStatus: 'active' | 'inactive' = checkbox.checked ? 'active' : 'inactive'; // Explicit type added

    if (newStatus === 'inactive') {
      // Show confirmation for deactivation
      Swal.fire({
        title: 'Are you sure?',
        text: `This ${staff.username} will be deactivated!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, deactivate it!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.toggleStaffStatus(staff, newStatus);
          setTimeout(() => {
            Swal.close();
          }, 1500);
        } else {
          checkbox.checked = true; // Revert back if canceled
        }
      });
    } else {
      // Directly activate the clinic
      this.toggleStaffStatus(staff, newStatus);
    }
  }

  // Toggle clinic status with API call
  toggleStaffStatus(staff: staff, newStatus: 'active' | 'inactive') { // Explicit type for newStatus
    this.StaffService.toggleStaffStatus(staff.id, newStatus).subscribe({
      next: (response: { message: string }) => {
        staff.status = newStatus; // Update status locally
        if (newStatus === 'active') {
          Swal.fire('Activated!', `${staff.username} has been activated.`, 'success');
          setTimeout(() => {
            Swal.close(); // Close the Swal after 1000ms
          }, 1500);
        } else {
          Swal.fire('Deactivated!', `${staff.username} has been deactivated.`, 'success');
          setTimeout(() => {
            Swal.close(); // Close the Swal after 1000ms
          }, 1500);
        }
      },
      error: (err) => {
        console.error('Error updating status:', err);
        Swal.fire('Error', 'Something went wrong while updating the status.', 'error');
        staff.status = staff.status === 'active' ? 'inactive' : 'active'; // Revert in case of error
      },
    });
  }


}
