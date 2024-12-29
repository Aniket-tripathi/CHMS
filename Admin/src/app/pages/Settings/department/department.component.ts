import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
} from "@angular/core";

import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

import { FormBuilder, FormGroup, Validators, NgForm } from "@angular/forms";
import {
  AdvancedSortableDirective,
  SortEvent,
} from "./advanced-sortable.directive";

import { ClinicService } from "../../../core/services/clinic.service";
import { clinic, ClinicResponse } from "../../../core/models/clinic.models";
import {
  department,
  DepartmentResponse,
} from "../../../core/models/department.model";

import { HttpClient } from "@angular/common/http";
import { map } from "rxjs";
import Swal from "sweetalert2";
import { ApiService } from "../../../core/services/api.service";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";

@Component({
  selector: "app-department",
  templateUrl: "./department.component.html",
  styleUrls: ["./department.component.scss"],
})
export class DepartmentComponent implements OnInit {
  departmentForm: FormGroup;
  editdepartmentForm: FormGroup;
  isClinicNameDisabled: boolean = false;
  // Breadcrumb data
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;

  name: any;
  clinicData: clinic[];

  submitted = false;
  errorMessage = "";

  departmentData: department[] = [];
  filteredDept$: BehaviorSubject<department[]> = new BehaviorSubject<
    department[]
  >([]);
  //totalRoles: number = 0;
  selectedDepartment: Partial<department> = {};
  isEditModalOpen: boolean = false;
  @ViewChild("closeButton") closeButton: any;

  constructor(
    private modalService: BsModalService,
    private clinicService: ClinicService,
    private fb: FormBuilder,
    private http: HttpClient,
    private ApiService: ApiService,
    private router: Router
  ) {
    // Initialize the form group
    this.departmentForm = this.fb.group({
      clinic_id: ["", Validators.required],
      deptname: ["", Validators.required],
      deptdesc: ["", Validators.required],
    });
    // this.toggleClinicField();
    this.filteredDept$ = new BehaviorSubject<department[]>([]); // Ensure state is synced on load
  }

  get f() {
    return this.departmentForm.controls;
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
    this.fetchDept();
    this.applySorting();
    this.fetchClinics();
    //this.fetchTotalRolesCount();
  }

  // Open Edit Modal
  openEditModal(department: department) {
    this.selectedDepartment = { ...department };
    this.isEditModalOpen = true; // Clone clinic object
  }

  // Close Edit Modal
  closeEditModal() {
    this.isEditModalOpen = false;
  }

  // Update Data
  editDepartment() {
    if (this.selectedDepartment.id) {
      this.ApiService.updateDept(
        this.selectedDepartment.id,
        this.selectedDepartment
      ).subscribe({
        next: (response) => {
          console.log("Department updated:", response);
          this.fetchDept(); // Refresh clinics list
          // Trigger the modal close button
          const closeButton = document.getElementById("closeEditModalButton");
          if (closeButton) {
            closeButton.click();
          }
          Swal.fire({
            icon: "success",
            position: "top-right",
            title: "Department Updated!",
            text: "Department details have been successfully updated.",
            showConfirmButton: false,
            timer: 1500, // Auto-close after 1000ms
            timerProgressBar: true, // Optional: Show timer progress bar
          });
          this.closeEditModal();
        },
        error: (err) => {
          console.error("Error updating department:", err);
          Swal.fire(
            "Error",
            "Something went wrong while updating the department.",
            "error"
          );
        },
      });
    }
  }

  /**
   * Open center modal
   * @param centerDataModal center modal data
   */
  centerModal(centerDepartmentModal: any) {
    this.modalRef = this.modalService.show(centerDepartmentModal);
  }

  fetchClinics(): void {
    this.clinicService
      .getClinics()
      .pipe(
        map((response: ClinicResponse) => {
          console.log(response); // Debug API response structure
          this.clinicData = response.clinics;
        })
      )
      .subscribe();
  }

  //  * Fetch dept and prepare data
  fetchDept() {
    this.ApiService.getd()
      .pipe(
        map((response: DepartmentResponse) => {
          this.departmentData = response.departments; // Handle empty or undefined depts
          console.log("Fetched departments:", this.departmentData);
          this.hideme = Array(this.departmentData.length).fill(true);
          this.updateFilteredDept();
        })
      )
      .subscribe();
  }

  //  Update filtered and paginated clinics based on search and pagination
  updateFilteredDept() {
    const filteredData = this.departmentData.filter((department) =>
      this.searchTerm
        ? department.deptname
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        : true
    );
    console.log("Filtered departments:", filteredData);

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredDept$.next(filteredData.slice(startIndex, endIndex));
  }

  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updateFilteredDept();

    // Make sure that the API call sends the search term
    this.ApiService.getd().subscribe((response: DepartmentResponse) => {
      this.departmentData = response.departments;
      this.hideme = Array(this.clinicData.length).fill(true);
      this.updateFilteredDept();
    });
  }

  //  * Handle pagination change
  onPageChange(newPage: number) {
    if (newPage > 0 && newPage <= Math.ceil(this.pageSize)) {
      this.page = newPage;
      this.updateFilteredDept();
    }
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
    let sortedRoles = [...this.departmentData];

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

    // // Apply search filter if any search term is present
    if (this.searchTerm) {
      sortedRoles = sortedRoles.filter((department) =>
        department.deptname
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredDept$.next(sortedRoles); // Update the BehaviorSubject with sorted and filtered data
  }

  //to save data
  onSubmit() {
    this.submitted = true;
    console.log("Form submitted:", this.submitted);
    if (this.departmentForm.invalid) {
      console.log("save for");

      return;
    }

    const formData = { ...this.departmentForm.value };

    this.ApiService.department(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.departmentForm.reset();
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
            this.departmentForm.reset();
            this.submitted = false;
            this.triggerCloseButton();
            this.fetchDept();
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

  // DELETE department

  deleteDept(id: number): void {
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
      text: "Do you want to delete this department?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.ApiService.deleteDept(id).subscribe({
          next: (response: any) => {
            if (response && response.success) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: response.message || "Department deleted successfully!",
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                this.fetchDept();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: response.message || "Failed to delete department.",
              });
            }
          },
          error: (error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error.error?.message ||
                "An error occurred while deleting the department.",
            });
          },
        });
      }
    });
  }
}
