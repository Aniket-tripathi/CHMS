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
import {
  designation,
  DesignationResponse,
} from "../../../core/models/designation.model";

import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import Swal from "sweetalert2";
import { ApiService } from "../../../core/services/api.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-designation",
  templateUrl: "./designation.component.html",
  styleUrls: ["./designation.component.scss"],
})
export class DesignationComponent implements OnInit {
  designationForm: FormGroup;
  editdesignationForm: FormGroup;
  isClinicNameDisabled: boolean = false;
  // Breadcrumb data
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;

  name: any;
  clinicData: clinic[] = [];

  submitted = false;
  errorMessage = "";

  // to get designation data
  designationData: designation[] = [];
  filteredDesignations$: BehaviorSubject<designation[]> = new BehaviorSubject<
    designation[]
  >([]);
  totaldesignations: number = 0;
  selectedDesignation: Partial<designation> = {};
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
    this.designationForm = this.fb.group({
      clinic_id: ["", Validators.required],
      designation: ["", Validators.required],
    });
    // this.toggleClinicField();
    this.filteredDesignations$ = new BehaviorSubject<designation[]>([]); // Ensure state is synced on load
  }

  get f() {
    return this.designationForm.controls;
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
      { label: "Designation Data Table", active: true },
    ];
    this.fetchDesignations();
    this.applySorting();
    this.fetchClinics();
    // this.fetchTotaldesignationsCount();
  }

  // Open Edit Modal
  openEditModal(designation: designation) {
    this.selectedDesignation = { ...designation };
    this.isEditModalOpen = true; // Clone clinic object
  }

  // Close Edit Modal
  closeEditModal() {
    this.isEditModalOpen = false;
  }

  // Update Data
  editDesignation() {
    if (this.selectedDesignation.id) {
      this.ApiService.updateDesg(
        this.selectedDesignation.id,
        this.selectedDesignation
      ).subscribe({
        next: (response) => {
          console.log("Designation updated:", response);
          this.fetchDesignations(); // Refresh clinics list
          // Trigger the modal close button
          const closeButton = document.getElementById("closeEditModalButton");
          if (closeButton) {
            closeButton.click();
          }
          Swal.fire({
            icon: "success",
            position: "top-right",
            title: "Designation Updated!",
            text: "Designation details have been successfully updated.",
            showConfirmButton: false,
            timer: 1500, // Auto-close after 1000ms
            timerProgressBar: true, // Optional: Show timer progress bar
          });
          this.closeEditModal();
        },
        error: (err) => {
          console.error("Error updating designation:", err);
          Swal.fire(
            "Error",
            "Something went wrong while updating the designation.",
            "error"
          );
        },
      });
    }
  }

  /**
   * Open center modal
   * @param centerDataModal center modal data
  //  */
  centerModal(centerdesignationModal: any) {
    this.modalRef = this.modalService.show(centerdesignationModal);
  }

  // Handle enabling/disabling of clinic dropdown
  // toggleClinicField(): void {
  //   const designationType = this.designationForm.get('designationType')?.value;
  //   // alert(designationType);
  //   if (designationType === 'common') {
  //     this.isClinicNameDisabled = true;
  //     this.designationForm.get('designationclinicid')?.disable(); // Disable the clinic name field
  //     this.designationForm.get('designationclinicid')?.reset(); // Clear its value
  //   } else {
  //     this.isClinicNameDisabled = false;
  //     this.designationForm.get('designationclinicid')?.enable(); // Enable the clinic name field
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

  //  * Fetch designations and prepare data
  fetchDesignations() {
    this.ApiService.getdesignations()
      .pipe(
        map((response: DesignationResponse) => {
          this.designationData = response.designations;
          this.hideme = Array(this.designationData.length).fill(true);
          this.updateFilteredDesignations();
        })
      )
      .subscribe();
  }

  //  Update filtered and paginated clinics based on search and pagination
  updateFilteredDesignations() {
    const filteredData = this.designationData.filter((designation) =>
      this.searchTerm
        ? designation.designation
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredDesignations$.next(filteredData.slice(startIndex, endIndex));
  }

  //  * Handle search term change

  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updateFilteredDesignations();

    // Make sure that the API call sends the search term
    this.ApiService.getdesignations().subscribe(
      (response: DesignationResponse) => {
        this.designationData = response.designations;
        this.hideme = Array(this.designationData.length).fill(true);
        this.updateFilteredDesignations();
      }
    );
  }

  // //  * Handle pagination change
  // onPageChange(newPage: number) {
  //   if (
  //     newPage > 0 &&
  //     newPage <= Math.ceil(this.totaldesignations / this.pageSize)
  //   ) {
  //     this.page = newPage;
  //     this.updateFilteredDesignations();
  //   }
  // }

  //  * Handle pagination change
  onPageChange(newPage: number) {
    // if (newPage > 0 && newPage <= Math.ceil(this.totalRegions / this.pageSize)) {
    this.page = newPage;
    this.updateFilteredDesignations();
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
    let sorteddesignations = [...this.designationData];

    if (this.sortColumn) {
      sorteddesignations = sorteddesignations.sort((a, b) => {
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
      sorteddesignations = sorteddesignations.filter((designation) =>
        designation.designation
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredDesignations$.next(sorteddesignations); // Update the BehaviorSubject with sorted and filtered data
  }

  //  Fetch total clinics count from the backend
  fetchTotaldesignationsCount(): void {
    this.ApiService.getTotaldesignationsCount().subscribe({
      next: (response) => {
        this.totaldesignations = response.totaldesignations;
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
    if (this.designationForm.invalid) {
      console.log("save for");

      return;
    }

    const formData = { ...this.designationForm.value };

    this.ApiService.insertdesignation(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.designationForm.reset();
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
            this.designationForm.reset();
            this.submitted = false;
            this.triggerCloseButton();
            this.fetchDesignations();
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

  deleteDesignation(id: number): void {
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
      text: "Do you want to delete this designation?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.ApiService.deletedesignation(id).subscribe({
          next: (response: any) => {
            if (response && response.success) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: response.message || "Designation deleted successfully!",
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                this.fetchDesignations();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: response.message || "Failed to delete designation.",
              });
            }
          },
          error: (error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error.error?.message ||
                "An error occurred while deleting the designation.",
            });
          },
        });
      }
    });
  }
}
