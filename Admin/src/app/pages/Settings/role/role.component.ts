import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
} from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { BehaviorSubject, Observable } from "rxjs";
import {
  AdvancedSortableDirective,
  SortEvent,
} from "./advanced-sortable.directive";

import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators, NgForm } from "@angular/forms";
import { ClinicService } from "../../../core/services/clinic.service";
import { clinic, ClinicResponse } from "../../../core/models/clinic.models";
import { role, RoleResponse } from "../../../core/models/role.model";

import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import Swal from "sweetalert2";
import { ApiService } from "../../../core/services/api.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-role",
  templateUrl: "./role.component.html",
  styleUrls: ["./role.component.scss", "./advancedtable.component.scss"],
})
export class RoleComponent implements OnInit {
  roleForm: FormGroup;
  editroleForm: FormGroup;
  isClinicNameDisabled: boolean = false;
  // Breadcrumb data
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;

  name: any;
  clinicData: clinic[] = [];

  submitted = false;
  errorMessage = "";

  // to get role data
  roleData: role[] = [];
  filteredRoles$: BehaviorSubject<role[]> = new BehaviorSubject<role[]>([]); // Filtered clinics for table display
  totalRoles: number = 0;
  selectedRole: Partial<role> = {};
  isEditModalOpen: boolean = false;
  @ViewChild("closeButton") closeButton: any; // Reference to the close button

  constructor(
    private modalService: BsModalService,
    private clinicService: ClinicService,
    private fb: FormBuilder,
    private http: HttpClient,
    private ApiService: ApiService,
    private router: Router
  ) {
    // Initialize the form group
    this.roleForm = this.fb.group({
      // roleType: ['common', Validators.required], // Default to 'common'
      // roleclinicid: [{ value: '', disabled: false }],
      roleclinicid: ["", Validators.required],
      rolename: ["", Validators.required],
    });
    // this.toggleClinicField();
    this.filteredRoles$ = new BehaviorSubject<role[]>([]); // Ensure state is synced on load
  }

  get f() {
    return this.roleForm.controls;
  }

  // Search and pagination controls
  searchTerm: string = "";
  pageSize: number = 10;
  page: number = 1;
  hideme: boolean[] = [];

  @ViewChildren(AdvancedSortableDirective)
  headers: QueryList<AdvancedSortableDirective>;

  ngOnInit() {
    this.breadCrumbItems = [
      { label: "Tables" },
      { label: "Role Data Table", active: true },
    ];
    this.fetchRoles();
    this.applySorting();
    this.fetchClinics();
    this.fetchTotalRolesCount();
  }

  // Open Edit Modal
  openEditModal(role: role) {
    this.selectedRole = { ...role };
    this.isEditModalOpen = true; // Clone clinic object
  }

  // Close Edit Modal
  closeEditModal() {
    this.isEditModalOpen = false;
  }

  // Update Clinic Data
  editRole() {
    if (this.selectedRole.roleid) {
      this.ApiService.updateRole(
        this.selectedRole.roleid,
        this.selectedRole
      ).subscribe({
        next: (response) => {
          console.log("Role updated:", response);
          this.fetchRoles(); // Refresh clinics list

          // Trigger the modal close button
          const closeButton = document.getElementById("closeEditModalButton");
          if (closeButton) {
            closeButton.click();
          }

          Swal.fire({
            icon: "success",
            position: "top-right",
            title: "Role Updated!",
            text: "Role details have been successfully updated.",
            showConfirmButton: false,
            timer: 1500, // Auto-close after 1000ms
            timerProgressBar: true, // Optional: Show timer progress bar
          });
          this.closeEditModal();
        },
        error: (err) => {
          console.error("Error updating role:", err);
          Swal.fire(
            "Error",
            "Something went wrong while updating the role.",
            "error"
          );
        },
      });
    }
  }

  deleterole(id: number): void {
    if (!id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid ID provided for deletion.",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this role?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.ApiService.deleterole(id).subscribe({
          next: (response: any) => {
            if (response && response.success) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: response.message || "Role deleted successfully!",
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                this.fetchRoles();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: response.message || "Failed to delete role.",
              });
            }
          },
          error: (error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error.error?.message ||
                "An error occurred while deleting the role.",
            });
          },
        });
      }
    });
  }

  /**
   * Open center modal
   * @param centerDataModal center modal data
   */
  centerModal(centerRoleModal: any) {
    this.modalRef = this.modalService.show(centerRoleModal);
  }

  // Handle enabling/disabling of clinic dropdown
  // toggleClinicField(): void {
  //   const roleType = this.roleForm.get('roleType')?.value;
  //   // alert(roleType);
  //   if (roleType === 'common') {
  //     this.isClinicNameDisabled = true;
  //     this.roleForm.get('roleclinicid')?.disable(); // Disable the clinic name field
  //     this.roleForm.get('roleclinicid')?.reset(); // Clear its value
  //   } else {
  //     this.isClinicNameDisabled = false;
  //     this.roleForm.get('roleclinicid')?.enable(); // Enable the clinic name field
  //   }
  // }

  //fetch clinics data to display in modal

  fetchClinics(): void {
    this.clinicService
      .getClinics()
      .pipe(
        map((response: ClinicResponse) => {
          this.clinicData = response.clinics;
        })
      )
      .subscribe();
  }

  //  * Fetch roles and prepare data
  fetchRoles() {
    this.ApiService.getroles()
      .pipe(
        map((response: RoleResponse) => {
          this.roleData = response.roles;
          this.hideme = Array(this.roleData.length).fill(true);
          this.updateFilteredRoles();
        })
      )
      .subscribe();
  }

  //  Update filtered and paginated clinics based on search and pagination
  updateFilteredRoles() {
    const filteredData = this.roleData.filter((role) =>
      this.searchTerm
        ? role.rolename.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredRoles$.next(filteredData.slice(startIndex, endIndex));
  }

  //  * Handle search term change

  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updateFilteredRoles();

    // Make sure that the API call sends the search term
    this.ApiService.getroles().subscribe((response: RoleResponse) => {
      this.roleData = response.roles;
      this.hideme = Array(this.clinicData.length).fill(true);
      this.updateFilteredRoles();
    });
  }

  // //  * Handle pagination change
  // onPageChange(newPage: number) {
  //   if (newPage > 0 && newPage <= Math.ceil(this.totalRoles / this.pageSize)) {
  //     this.page = newPage;
  //     this.updateFilteredRoles();
  //   }
  // }

  //  * Handle pagination change
  onPageChange(newPage: number) {
    // if (newPage > 0 && newPage <= Math.ceil(this.totalRegions / this.pageSize)) {
    this.page = newPage;
    this.updateFilteredRoles();
    // }
  }

  //  * Toggle the visibility of clinic details
  //  * @param index Index of the clinic
  changeValue(index: number) {
    this.hideme[index] = !this.hideme[index];
  }

  //  * Handle sorting events
  //  * @param sortEvent Event from sortable directive
  sortColumn: string = "";
  sortDirection: "asc" | "desc" = "asc";
  // Sorting logic
  onSort(column: string): void {
    if (this.sortColumn === column) {
      // Toggle sort direction if the same column is clicked
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = column;
      this.sortDirection = "asc"; // Default to ascending order for new column
    }
    this.applySorting(); // Apply sorting after column selection
  }

  // Apply sorting and emit the sorted clinics array
  applySorting(): void {
    let sortedRoles = [...this.roleData];

    if (this.sortColumn) {
      sortedRoles = sortedRoles.sort((a, b) => {
        const valueA = a[this.sortColumn];
        const valueB = b[this.sortColumn];

        // Compare by clinicId (or other columns as required)
        if (valueA < valueB) {
          return this.sortDirection === "asc" ? -1 : 1;
        } else if (valueA > valueB) {
          return this.sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply search filter if any search term is present
    if (this.searchTerm) {
      sortedRoles = sortedRoles.filter((role) =>
        role.rolename.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredRoles$.next(sortedRoles); // Update the BehaviorSubject with sorted and filtered data
  }

  //  Fetch total clinics count from the backend
  fetchTotalRolesCount(): void {
    this.ApiService.getTotalRolesCount().subscribe({
      next: (response) => {
        this.totalRoles = response.totalRoles;
      },
      error: (error) => {
        console.error("Error fetching total clinics count:", error);
      },
    });
  }

  //to save data
  onSubmit() {
    this.submitted = true;
    console.log("Form submitted:", this.submitted);
    if (this.roleForm.invalid) {
      console.log("save for");

      return;
    }

    const formData = { ...this.roleForm.value };

    this.ApiService.insertrole(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.roleForm.reset();
          this.submitted = false;
          this.triggerCloseButton();
          $localize;
          // Check for success in the response
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: response.message, // Use the message from the backend
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            this.roleForm.reset();
            this.submitted = false;
            this.triggerCloseButton();
            this.fetchRoles();
          });
        } else {
          // Handle unexpected response structure
          this.errorMessage = "An unexpected error occurred. Please try again.";
          Swal.fire({
            icon: "error",
            title: "Error",
            text: this.errorMessage,
          });
        }
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message ||
          "An error occurred while registering the clinic. Please try again.";
        Swal.fire({
          icon: "error",
          title: "Error",
          text: this.errorMessage,
        });

        console.error(err);
      },
    });
  }

  // Trigger the close button click event to close the modal
  triggerCloseButton(): void {
    if (this.closeButton) {
      this.closeButton.nativeElement.click(); // Trigger click event on the button
    }
  }
}
