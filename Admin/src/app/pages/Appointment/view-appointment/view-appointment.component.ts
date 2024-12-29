import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Appointment, AppointmentResponse } from '../../../core/models/appointment.model';
import { AdvancedSortableDirective, SortEvent } from './advanced-sortable.directive';
import Swal from 'sweetalert2';
import { role,RoleResponse} from '../../../core/models/role.model';


@Component({
  selector: 'app-view-appointment',
  templateUrl: './view-appointment.component.html',
  styleUrls: ['./view-appointment.component.scss','./advancedtable.component.scss']
})
export class ViewAppointmentComponent  implements OnInit {

// Breadcrumb data
breadCrumbItems: Array<{}>;


  // Appointment  data
  appointmentData: Appointment[] = [];
  filteredAppointments$: BehaviorSubject<Appointment[]> = new BehaviorSubject<Appointment[]>([]); // Filtered Appointments for table display
  totalAppointments: number = 0;
  selectedAppointment: Partial<Appointment> = {};
  



    // Search and pagination controls
    searchTerm: string = '';
    pageSize: number = 10;
    page: number = 1;
    hideme: boolean[] = [];

    isActive: boolean = false;
    statusMessage: string = '';


      @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
    
      constructor(private ApiService: ApiService) {
        this.filteredAppointments$ = new BehaviorSubject<Appointment[]>([]);
      }
    
      ngOnInit() {
        this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Appointment Data Table', active: true }];
        this.fetchAppointments();
        this.applySorting();
        this.fetchTotalAppointmentsCount();
      }




        //  * Fetch Appointments and prepare data
        fetchAppointments() {
          this.ApiService.getAppointment().pipe(
            map((response: AppointmentResponse) => {
              this.appointmentData = response.Appointments;
              this.hideme = Array(this.appointmentData.length).fill(true);
              this.updateFilteredAppointments();
            })
          ).subscribe();
        }


        //  Update filtered and paginated clinics based on search and pagination
        updateFilteredAppointments() {
            const filteredData = this.appointmentData.filter((Appointment) =>
              this.searchTerm
                ? Appointment.patient_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                Appointment.appointment_no.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                Appointment.appointment_date.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                Appointment.appointment_time.toLowerCase().includes(this.searchTerm.toLowerCase()) ||

                Appointment.gender.includes(this.searchTerm)
                : true
            );
        
            const startIndex = (this.page - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
        
            // Emit filtered data to BehaviorSubject
            this.filteredAppointments$.next(filteredData.slice(startIndex, endIndex));
          }
        
        
          //  * Handle search term change
          onSearchChange() {
            this.page = 1; // Reset to first page when search term changes
            this.updateFilteredAppointments();
        
            // Make sure that the API call sends the search term
            this.ApiService.getAppointment().subscribe((response: AppointmentResponse) => {
              this.appointmentData = response.Appointments;
              this.hideme = Array(this.appointmentData.length).fill(true);
              this.updateFilteredAppointments();
            });
          }




            //  Fetch total clinics count from the backend
            fetchTotalAppointmentsCount(): void {
            this.ApiService.getTotalAppointmentsCount().subscribe({
              next: (response) => {
                this.totalAppointments = response.totalAppointments;
              },
              error: (error) => {
                console.error('Error fetching total clinics count:', error);
              },
            });
          }
        
        
        
          //  * Handle pagination change
          onPageChange(newPage: number) {
            if (newPage > 0 && newPage <= Math.ceil(this.totalAppointments / this.pageSize)) {
              this.page = newPage;
              this.updateFilteredAppointments();
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
            let sortedAppointments = [...this.appointmentData];
        
            if (this.sortColumn) {
              sortedAppointments = sortedAppointments.sort((a, b) => {
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
              sortedAppointments = sortedAppointments.filter(Appointment => Appointment.appointment_no.toLowerCase().includes(this.searchTerm.toLowerCase()));
            }
        
            this.filteredAppointments$.next(sortedAppointments);  // Update the BehaviorSubject with sorted and filtered data
        
          }

          // open Model to see partiuclar data 
          openViewModal(appointment: any): void {
            this.selectedAppointment = appointment;
          }
}
