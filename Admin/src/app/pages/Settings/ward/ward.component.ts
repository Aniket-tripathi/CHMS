import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
} from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  AdvancedSortableDirective,
  SortEvent,
} from "./advanced-sortable.directive";
import { region, RegionResponse } from "../../../core/models/region.models";
import { ward, WardResponse } from "../../../core/models/ward.model";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import Swal from "sweetalert2";
import { ApiService } from "../../../core/services/api.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-ward",
  templateUrl: "./ward.component.html",
  styleUrls: ["./ward.component.scss"],
})
export class WardComponent implements OnInit {
  wardForm: FormGroup;
  editwardForm: FormGroup;
  isClinicNameDisabled: boolean = false;

  // Breadcrumb data
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;

  name: any;
  regionData: region[] = [];

  submitted = false;
  errorMessage = "";

  // to get ward data
  wardData: ward[] = [];
  filteredWards$: BehaviorSubject<ward[]> = new BehaviorSubject<ward[]>([]); // Filtered clinics for table display
  totalWards: number = 0;
  selectedWards: Partial<ward> = {};
  isEditModalOpen: boolean = false;
  @ViewChild("closeButton") closeButton: any; // Reference to the close button

  constructor(
    private modalService: BsModalService,
    private fb: FormBuilder,
    private http: HttpClient,
    private ApiService: ApiService,
    private router: Router
  ) {
    // Initialize the form group
    this.wardForm = this.fb.group({
      wardRegionId: ["", Validators.required],
      wardName: ["", Validators.required],
    });
    this.filteredWards$ = new BehaviorSubject<ward[]>([]); // Ensure state is synced on load
  }

  get f() {
    return this.wardForm.controls;
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
    this.fetchRegions();
    this.fetchWards();
    this.applySorting();
    //  this.fetchTotalWardsCount();
  }

  // Open Edit Modal
  openEditModal(ward: ward) {
    this.selectedWards = { ...ward };
    this.isEditModalOpen = true; // Clone clinic object
  }

  // Close Edit Modal
  closeEditModal() {
    this.isEditModalOpen = false;
  }

  // Update Data
  // editWard() {
  //   if (this.selectedWards.wardRegionId) {
  //     this.ApiService.updateWard(
  //       this.selectedWards.wardRegionId,
  //       this.selectedWards
  //     ).subscribe({
  //       next: (response) => {
  //         console.log("Ward updated:", response);
  //         this.fetchWards();
  //         // Trigger the modal close button
  //         const closeButton = document.getElementById("closeEditModalButton");
  //         if (closeButton) {
  //           closeButton.click();
  //         }
  //         Swal.fire({
  //           icon: "success",
  //           position: "top-right",
  //           title: "Ward Updated!",
  //           text: "Ward details have been successfully updated.",
  //           showConfirmButton: false,
  //           timer: 1500, // Auto-close after 1000ms
  //           timerProgressBar: true, // Optional: Show timer progress bar
  //         });
  //         this.closeEditModal();
  //       },
  //       error: (err) => {
  //         console.error("Error updating Ward:", err);
  //         Swal.fire(
  //           "Error",
  //           "Something went wrong while updating the Ward.",
  //           "error"
  //         );
  //       },
  //     });
  //   }
  // }

  editWard() {
    if (this.selectedWards.wardRegionId && this.selectedWards.wardName) {
      this.ApiService.updateWard(
        this.selectedWards.wardId, // Pass the wardId in the URL
        this.selectedWards // Send the updated ward data in the body
      ).subscribe({
        next: (response) => {
          console.log("Ward updated:", response);
          this.fetchWards(); // Refresh the list of wards
          // Close the modal after update
          const closeButton = document.getElementById("closeEditModalButton");
          if (closeButton) {
            closeButton.click();
          }
          Swal.fire({
            icon: "success",
            position: "top-right",
            title: "Ward Updated!",
            text: "Ward details have been successfully updated.",
            showConfirmButton: false,
            timer: 1500, // Auto-close after 1500ms
            timerProgressBar: true, // Optional: Show timer progress bar
          });
          this.closeEditModal();
        },
        error: (err) => {
          console.error("Error updating Ward:", err);
          Swal.fire(
            "Error",
            "Something went wrong while updating the Ward.",
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
  centerModal(centerWardModal: any) {
    this.modalRef = this.modalService.show(centerWardModal);
  }

  //  * Fetch region and prepare data
  fetchRegions() {
    this.ApiService.getregion()
      .pipe(
        map((response: RegionResponse) => {
          this.regionData = response.regions;
        })
      )
      .subscribe();
  }

  //  * Fetch region and prepare data
  fetchWards() {
    this.ApiService.getward()
      .pipe(
        map((response: WardResponse) => {
          this.wardData = response.wards;
          this.hideme = Array(this.wardData.length).fill(true);
          this.updateFilteredWards();
        })
      )
      .subscribe();
  }

  //  Update filtered and paginated clinics based on search and pagination
  updateFilteredWards() {
    const filteredData = this.wardData.filter((ward) =>
      this.searchTerm
        ? ward.wardName.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredWards$.next(filteredData.slice(startIndex, endIndex));
  }

  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updateFilteredWards();

    // Make sure that the API call sends the search term
    this.ApiService.getward().subscribe((response: WardResponse) => {
      this.wardData = response.wards;
      this.hideme = Array(this.regionData.length).fill(true);
      this.updateFilteredWards();
    });
  }

  //  * Handle pagination change
  // onPageChange(newPage: number) {
  //   if (newPage > 0 && newPage <= Math.ceil(this.pageSize)) {
  //     this.page = newPage;
  //     // this.updateFilteredClinics();
  //   }
  // }

  //  * Handle pagination change
  onPageChange(newPage: number) {
    // if (newPage > 0 && newPage <= Math.ceil(this.totalRegions / this.pageSize)) {
    this.page = newPage;
    this.updateFilteredWards();
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
    let sortedWards = [...this.wardData];

    if (this.sortColumn) {
      sortedWards = sortedWards.sort((a, b) => {
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
      sortedWards = sortedWards.filter((ward) =>
        ward.wardName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredWards$.next(sortedWards); // Update the BehaviorSubject with sorted and filtered data
  }

  //to save data
  onSubmit() {
    this.submitted = true;
    console.log("Form submitted:", this.submitted);
    if (this.wardForm.invalid) {
      console.log("save for");

      return;
    }

    const formData = { ...this.wardForm.value };

    this.ApiService.insertward(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.wardForm.reset();
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
            this.wardForm.reset();
            this.submitted = false;
            this.triggerCloseButton();
            this.fetchWards();
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

  triggerCloseButton(): void {
    if (this.closeButton && this.closeButton.nativeElement) {
      this.closeButton.nativeElement.click(); // Simulate a button click
    }
  }

  deleteWard(id: number): void {
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
      text: "Do you want to delete this ward?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.ApiService.deleteWard(id).subscribe({
          next: (response: any) => {
            if (response && response.success) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: response.message || "Ward deleted successfully!",
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                this.fetchWards();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: response.message || "Failed to delete ward.",
              });
            }
          },
          error: (error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error.error?.message ||
                "An error occurred while deleting the ward.",
            });
          },
        });
      }
    });
  }
}
