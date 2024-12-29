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
import { ClinicService } from "../../../core/services/clinic.service";
import { clinic, ClinicResponse } from "../../../core/models/clinic.models";
import {
  AdvancedSortableDirective,
  SortEvent,
} from "./advanced-sortable.directive";
import {
  appointmentreason,
  AppointmentreasonResponse,
} from "../../../core/models/appointmentreason.model";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import Swal from "sweetalert2";
import { ApiService } from "../../../core/services/api.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-appointment-reason",
  templateUrl: "./appointment-reason.component.html",
  styleUrls: ["./appointment-reason.component.scss"],
})
export class AppointmentReasonComponent implements OnInit {
  appointmentreasonForm: FormGroup;
  editappointmentreasonForm: FormGroup;
  isClinicNameDisabled: boolean = false;

  // Breadcrumb data
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;

  name: any;
  clinicData: clinic[] = [];

  submitted = false;
  errorMessage = "";

  // to get  data
  appointmentreasonData: appointmentreason[] = [];
  filteredAppointmentreason$: BehaviorSubject<appointmentreason[]> =
    new BehaviorSubject<appointmentreason[]>([]); // Filtered clinics for table display
  totalAppointmentreason: number = 0;
  selectedAppointmentreason: Partial<appointmentreason> = {};
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
    {
      // Initialize the form group
      this.appointmentreasonForm = this.fb.group({
        ap_reason_name: ["", Validators.required],
        ap_reason_shortname: ["", Validators.required],
        ap_reason_desc: ["", Validators.required],
        ap_reason_dignscolor: ["", Validators.required],
        apr_clinic: ["", Validators.required],
      });
      // this.toggleClinicField();
      this.filteredAppointmentreason$ = new BehaviorSubject<
        appointmentreason[]
      >([]); // Ensure state is synced on load
    }
  }

  get f() {
    return this.appointmentreasonForm.controls;
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
    this.fetchClinics();
    this.fetchtAppointmentReasons();
    this.applySorting();
    //  this.fetchTotalWardsCount();
  }

  // Open Edit Modal
  openEditModal(appointmentreason: appointmentreason) {
    this.selectedAppointmentreason = { ...appointmentreason };
    this.isEditModalOpen = true; // Clone clinic object
  }

  // Close Edit Modal
  closeEditModal() {
    this.isEditModalOpen = false;
  }

  // Update Data
  editAppointmentreason() {
    if (this.selectedAppointmentreason.ap_reasonid) {
      this.ApiService.updateAppointmentReason(
        this.selectedAppointmentreason.ap_reasonid,
        this.selectedAppointmentreason
      ).subscribe({
        next: (response) => {
          console.log("Appointment Reason updated:", response);
          this.fetchtAppointmentReasons();
          // Trigger the modal close button
          const closeButton = document.getElementById("closeEditModalButton");
          if (closeButton) {
            closeButton.click();
          }
          Swal.fire({
            icon: "success",
            position: "top-right",
            title: "Appointment Reason Updated!",
            text: "Appointment Reason details have been successfully updated.",
            showConfirmButton: false,
            timer: 1500, // Auto-close after 1000ms
            timerProgressBar: true, // Optional: Show timer progress bar
          });
          this.closeEditModal();
        },
        error: (err) => {
          console.error("Error updating Appointment Reason:", err);
          Swal.fire(
            "Error",
            "Something went wrong while updating the Appointment Reason.",
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
  centerModal(centerAppointmentModal: any) {
    this.modalRef = this.modalService.show(centerAppointmentModal);
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

  fetchtAppointmentReasons() {
    this.ApiService.getAppointmentReasons()
      .pipe(
        map((response: AppointmentreasonResponse) => {
          this.appointmentreasonData = response.appointmentreasons;
          this.hideme = Array(this.appointmentreasonData.length).fill(true);
          this.updateFilteredAppointmentReasons();
        })
      )
      .subscribe();
  }

  //  Update filtered and paginated clinics based on search and pagination
  updateFilteredAppointmentReasons() {
    const filteredData = this.appointmentreasonData.filter(
      (appointmentReason) =>
        this.searchTerm
          ? appointmentReason.ap_reason_name
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase())
          : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredAppointmentreason$.next(
      filteredData.slice(startIndex, endIndex)
    );
  }

  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updateFilteredAppointmentReasons();

    // Make sure that the API call sends the search term
    this.ApiService.getAppointmentReasons().subscribe(
      (response: AppointmentreasonResponse) => {
        this.appointmentreasonData = response.appointmentreasons;
        this.hideme = Array(this.clinicData.length).fill(true);
        this.updateFilteredAppointmentReasons();
      }
    );
  }

  //  * Handle pagination change
  onPageChange(newPage: number) {
    // if (newPage > 0 && newPage <= Math.ceil(this.totalRegions / this.pageSize)) {
    this.page = newPage;
    this.updateFilteredAppointmentReasons();
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
    let sortedAppointmentReasons = [...this.appointmentreasonData];

    if (this.sortColumn) {
      sortedAppointmentReasons = sortedAppointmentReasons.sort((a, b) => {
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
      sortedAppointmentReasons = sortedAppointmentReasons.filter(
        (appointmentReason) =>
          appointmentReason.ap_reason_name
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredAppointmentreason$.next(sortedAppointmentReasons); // Update the BehaviorSubject with sorted and filtered data
  }

  onSubmit() {
    this.submitted = true;
    console.log("Form submitted:", this.submitted);
    if (this.appointmentreasonForm.invalid) {
      console.log("save for");

      return;
    }

    const formData = { ...this.appointmentreasonForm.value };

    this.ApiService.insertAppointmentReason(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.appointmentreasonForm.reset();
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
            this.appointmentreasonForm.reset();
            this.submitted = false;
            this.triggerCloseButton();
            this.fetchtAppointmentReasons();
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

  deleteAppointmentReason(id: number): void {
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
      text: "Do you want to delete this apointment reason?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.ApiService.deleteAppointmentReason(id).subscribe({
          next: (response: any) => {
            if (response && response.success) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title:
                  response.message ||
                  "Appointment Reason deleted successfully!",
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                this.fetchtAppointmentReasons();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text:
                  response.message || "Failed to delete appointment reason.",
              });
            }
          },
          error: (error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error.error?.message ||
                "An error occurred while deleting the appointment reason.",
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
