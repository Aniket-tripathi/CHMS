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
import { level, LevelResponse } from "../../../core/models/level.models";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import Swal from "sweetalert2";
import { ApiService } from "../../../core/services/api.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-level",
  templateUrl: "./level.component.html",
  styleUrls: ["./level.component.scss"],
})
export class LevelComponent implements OnInit {
  levelForm: FormGroup;
  editlevelForm: FormGroup;

  // Breadcrumb data
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;

  name: any;

  submitted = false;
  errorMessage = "";

  // to get level data
  levelData: level[] = [];
  filteredLevel$: BehaviorSubject<level[]> = new BehaviorSubject<level[]>([]);
  totalLevel: number = 0;
  selectedLevel: Partial<level> = {};
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
    this.levelForm = this.fb.group({
      levelName: ["", Validators.required],
    });
    this.filteredLevel$ = new BehaviorSubject<level[]>([]); // Ensure state is synced on load
  }

  get f() {
    return this.levelForm.controls;
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
    this.fetchLevel();
    this.applySorting();
  }

  // Open Edit Modal
  openEditModal(level: level) {
    this.selectedLevel = { ...level };
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

  //  * Fetch level and prepare data
  fetchLevel() {
    this.ApiService.getLevel()
      .pipe(
        map((response: LevelResponse) => {
          this.levelData = response.levels;
          this.hideme = Array(this.levelData.length).fill(true);
          this.updateFilteredLevel();
        })
      )
      .subscribe();
  }

  //  Update filtered and paginated clinics based on search and pagination
  updateFilteredLevel() {
    const filteredData = this.levelData.filter((level) =>
      this.searchTerm
        ? level.levelName.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredLevel$.next(filteredData.slice(startIndex, endIndex));
  }

  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updateFilteredLevel();

    // Make sure that the API call sends the search term
    this.ApiService.getLevel().subscribe((response: LevelResponse) => {
      this.levelData = response.levels;
      this.hideme = Array(this.levelData.length).fill(true);
      this.updateFilteredLevel();
    });
  }

  //  * Handle pagination change
  onPageChange(newPage: number) {
    // if (newPage > 0 && newPage <= Math.ceil(this.totalRegions / this.pageSize)) {
    this.page = newPage;
    this.updateFilteredLevel();
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
    let sortedlevel = [...this.levelData];

    if (this.sortColumn) {
      sortedlevel = sortedlevel.sort((a, b) => {
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
      sortedlevel = sortedlevel.filter((level) =>
        level.levelName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredLevel$.next(sortedlevel); // Update the BehaviorSubject with sorted and filtered data
  }

  //to save data
  onSubmit() {
    this.submitted = true;
    console.log("Form submitted:", this.submitted);
    if (this.levelForm.invalid) {
      console.log("save for");

      return;
    }

    const formData = { ...this.levelForm.value };

    this.ApiService.insertlevel(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.levelForm.reset();
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
            this.levelForm.reset();
            this.submitted = false;
            this.triggerCloseButton();
            this.fetchLevel();
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

  editLevel() {
    if (this.selectedLevel.levelName) {
      this.ApiService.updateLevel(
        this.selectedLevel.levelId,
        this.selectedLevel
      ).subscribe({
        next: (response) => {
          console.log("Level updated:", response);
          this.fetchLevel();
          const closeButton = document.getElementById("closeEditModalButton");
          if (closeButton) {
            closeButton.click();
          }
          Swal.fire({
            icon: "success",
            position: "top-right",
            title: "Level Updated!",
            text: "Level details have been successfully updated.",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
          this.closeEditModal();
        },
        error: (err) => {
          console.error("Error updating Level:", err);
          Swal.fire(
            "Error",
            "Something went wrong while updating the level.",
            "error"
          );
        },
      });
    }
  }

  deleteLevel(id: number): void {
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
      text: "Do you want to delete this level?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.ApiService.deleteLevel(id).subscribe({
          next: (response: any) => {
            if (response && response.success) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: response.message || "Level deleted successfully!",
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                this.fetchLevel();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: response.message || "Failed to delete level.",
              });
            }
          },
          error: (error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error.error?.message ||
                "An error occurred while deleting the level.",
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
