import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
} from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import {
  AdvancedSortableDirective,
  SortEvent,
} from "./advanced-sortable.directive";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClinicService } from "../../../core/services/clinic.service";
import { clinic, ClinicResponse } from "../../../core/models/clinic.models";
import { region, RegionResponse } from "../../../core/models/region.models";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import Swal from "sweetalert2";
import { ApiService } from "../../../core/services/api.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-region",
  templateUrl: "./region.component.html",
  styleUrls: ["./region.component.scss"],
})
export class RegionComponent implements OnInit {
  regionForm: FormGroup;
  editregionForm: FormGroup;
  isClinicNameDisabled: boolean = false;

  // Breadcrumb data
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;

  name: any;
  clinicData: clinic[] = [];

  submitted = false;
  errorMessage = "";

  // to get role data
  regionData: region[] = [];
  filteredRegions$: BehaviorSubject<region[]> = new BehaviorSubject<region[]>(
    []
  ); // Filtered clinics for table display
  totalRegions: number = 0;
  selectedRegion: Partial<region> = {};
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
    this.regionForm = this.fb.group({
      regionClinicId: ["", Validators.required],
      regionName: ["", Validators.required],
    });
    // this.toggleClinicField();
    this.filteredRegions$ = new BehaviorSubject<region[]>([]); // Ensure state is synced on load
  }

  get f() {
    return this.regionForm.controls;
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
    this.applySorting();
    this.fetchClinics();
    this.fetchTotalRolesCount();
  }

  // Open Edit Modal
  openEditModal(region: region) {
    this.selectedRegion = { ...region };
    this.isEditModalOpen = true; // Clone clinic object
  }

  // Close Edit Modal
  closeEditModal() {
    this.isEditModalOpen = false;
  }

  // Update Data
  editRegion() {
    if (this.selectedRegion.regionId) {
      this.ApiService.updateRegion(
        this.selectedRegion.regionId,
        this.selectedRegion
      ).subscribe({
        next: (response) => {
          console.log("Region updated:", response);
          this.fetchRegions();
          // Trigger the modal close button
          const closeButton = document.getElementById("closeEditModalButton");
          if (closeButton) {
            closeButton.click();
          }
          Swal.fire({
            icon: "success",
            position: "top-right",
            title: "Region Updated!",
            text: "Region details have been successfully updated.",
            showConfirmButton: false,
            timer: 1500, // Auto-close after 1000ms
            timerProgressBar: true, // Optional: Show timer progress bar
          });
          this.closeEditModal();
        },
        error: (err) => {
          console.error("Error updating Region:", err);
          Swal.fire(
            "Error",
            "Something went wrong while updating the Region.",
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
  centerModal(centerRegionModal: any) {
    this.modalRef = this.modalService.show(centerRegionModal);
  }

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

  //  * Fetch region and prepare data
  fetchRegions() {
    this.ApiService.getregion()
      .pipe(
        map((response: RegionResponse) => {
          this.regionData = response.regions;
          this.hideme = Array(this.regionData.length).fill(true);
          this.updateFilteredRegions();
        })
      )
      .subscribe();
  }

  //  Update filtered and paginated clinics based on search and pagination
  updateFilteredRegions() {
    const filteredData = this.regionData.filter((region) =>
      this.searchTerm
        ? region.regionName
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredRegions$.next(filteredData.slice(startIndex, endIndex));
  }

  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updateFilteredRegions();

    // Make sure that the API call sends the search term
    this.ApiService.getregion().subscribe((response: RegionResponse) => {
      this.regionData = response.regions;
      this.hideme = Array(this.clinicData.length).fill(true);
      this.updateFilteredRegions();
    });
  }

  //  * Handle pagination change
  onPageChange(newPage: number) {
    // if (newPage > 0 && newPage <= Math.ceil(this.totalRegions / this.pageSize)) {
    this.page = newPage;
    this.updateFilteredRegions();
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
    let sortedRegions = [...this.regionData];

    if (this.sortColumn) {
      sortedRegions = sortedRegions.sort((a, b) => {
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
      sortedRegions = sortedRegions.filter((region) =>
        region.regionName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredRegions$.next(sortedRegions); // Update the BehaviorSubject with sorted and filtered data
  }

  //  Fetch total clinics count from the backend
  fetchTotalRolesCount(): void {
    this.ApiService.getTotalRegionsCount().subscribe({
      next: (response) => {
        // this.totalRegions = response.totalRegions;
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
    if (this.regionForm.invalid) {
      console.log("save for");

      return;
    }

    const formData = { ...this.regionForm.value };

    this.ApiService.insertregion(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.regionForm.reset();
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
            this.regionForm.reset();
            this.submitted = false;
            this.triggerCloseButton();
            this.fetchRegions();
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

  deleteRegion(id: number): void {
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
      text: "Do you want to delete this region?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.ApiService.deleteRegion(id).subscribe({
          next: (response: any) => {
            if (response && response.success) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: response.message || "Region deleted successfully!",
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                // Refresh the regions list
                this.fetchRegions();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: response.message || "Failed to delete region.",
              });
            }
          },
          error: (error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error.error?.message ||
                "An error occurred while deleting the region.",
            });
          },
        });
      }
    });
  }
}
