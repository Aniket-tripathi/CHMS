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
import { country, CountryResponse } from "../../../core/models/country.models";
import {
  provincenew,
  ProvinceResponse,
} from "../../../core/models/provincenew.models";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import Swal from "sweetalert2";
import { ApiService } from "../../../core/services/api.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-province",
  templateUrl: "./province.component.html",
  styleUrls: ["./province.component.scss"],
})
export class ProvinceComponent implements OnInit {
  provinceForm: FormGroup;
  editprovinceForm: FormGroup;

  // Breadcrumb data
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;

  name: any;
  countryData: country[] = [];

  submitted = false;
  errorMessage = "";

  // to get province data
  provinceData: provincenew[] = [];
  filteredProvince$: BehaviorSubject<provincenew[]> = new BehaviorSubject<
    provincenew[]
  >([]);
  totalProvince: number = 0;
  selectedProvince: Partial<provincenew> = {};
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
    this.provinceForm = this.fb.group({
      countryId: ["", Validators.required],
      provinceName: ["", Validators.required],
    });
    this.filteredProvince$ = new BehaviorSubject<provincenew[]>([]); // Ensure state is synced on load
  }

  get f() {
    return this.provinceForm.controls;
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
    this.fetchCountry();
    this.fetchProvince();
    this.applySorting();
    //  this.fetchTotalWardsCount();
  }

  // Open Edit Modal
  openEditModal(provincenew: provincenew) {
    this.selectedProvince = { ...provincenew };
    this.isEditModalOpen = true;
  }

  // Close Edit Modal
  closeEditModal() {
    this.isEditModalOpen = false;
  }

  /**
   * Open center modal
   * @param centerDataModal center modal data
   */
  centerModal(centerWardModal: any) {
    this.modalRef = this.modalService.show(centerWardModal);
  }

  fetchCountry() {
    this.ApiService.getCountry()
      .pipe(
        map((response: CountryResponse) => {
          console.log("API Response:", response);
          this.countryData = response.countrys;
          console.log("Country Data:", this.countryData);
        })
      )
      .subscribe({
        error: (err) => console.error("API Fetch Error:", err),
      });
  }

  //  * Fetch province and prepare data
  fetchProvince() {
    this.ApiService.getProvince()
      .pipe(
        map((response: ProvinceResponse) => {
          this.provinceData = response.provinces;
          this.hideme = Array(this.provinceData.length).fill(true);
          this.updateFilteredProvince();
        })
      )
      .subscribe();
  }

  //  Update filtered and paginated clinics based on search and pagination
  updateFilteredProvince() {
    const filteredData = this.provinceData.filter((provincenew) =>
      this.searchTerm
        ? provincenew.provinceName
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredProvince$.next(filteredData.slice(startIndex, endIndex));
  }

  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updateFilteredProvince();

    // Make sure that the API call sends the search term
    this.ApiService.getProvince().subscribe((response: ProvinceResponse) => {
      this.provinceData = response.provinces;
      this.hideme = Array(this.countryData.length).fill(true);
      this.updateFilteredProvince();
    });
  }

  //  * Handle pagination change
  onPageChange(newPage: number) {
    // if (newPage > 0 && newPage <= Math.ceil(this.totalRegions / this.pageSize)) {
    this.page = newPage;
    this.updateFilteredProvince();
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
    let sortedProvince = [...this.provinceData];

    if (this.sortColumn) {
      sortedProvince = sortedProvince.sort((a, b) => {
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
      sortedProvince = sortedProvince.filter((provincenew) =>
        provincenew.provinceName
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredProvince$.next(sortedProvince); // Update the BehaviorSubject with sorted and filtered data
  }

  //to save data
  onSubmit() {
    this.submitted = true;
    console.log("Form submitted:", this.submitted);
    if (this.provinceForm.invalid) {
      console.log("save for");

      return;
    }

    const formData = { ...this.provinceForm.value };

    this.ApiService.insertprovince(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.provinceForm.reset();
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
            this.provinceForm.reset();
            this.submitted = false;
            this.triggerCloseButton();
            this.fetchProvince();
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

  editProvince() {
    if (this.selectedProvince.countryId && this.selectedProvince.provinceName) {
      this.ApiService.updateProvince(
        this.selectedProvince.provinceId,
        this.selectedProvince
      ).subscribe({
        next: (response) => {
          console.log("Province updated:", response);
          this.fetchProvince();
          const closeButton = document.getElementById("closeEditModalButton");
          if (closeButton) {
            closeButton.click();
          }
          Swal.fire({
            icon: "success",
            position: "top-right",
            title: "Province Updated!",
            text: "Province details have been successfully updated.",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
          this.closeEditModal();
        },
        error: (err) => {
          console.error("Error updating Province:", err);
          Swal.fire(
            "Error",
            "Something went wrong while updating the Province.",
            "error"
          );
        },
      });
    }
  }

  deleteProvince(id: number): void {
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
      text: "Do you want to delete this province?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.ApiService.deleteProvince(id).subscribe({
          next: (response: any) => {
            if (response && response.success) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: response.message || "Province deleted successfully!",
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                this.fetchProvince();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: response.message || "Failed to delete province.",
              });
            }
          },
          error: (error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error.error?.message ||
                "An error occurred while deleting the province.",
            });
          },
        });
      }
    });
  }

  triggerCloseButton(): void {
    if (this.closeButton && this.closeButton.nativeElement) {
      this.closeButton.nativeElement.click(); // Simulate a button click
    }
  }
}
