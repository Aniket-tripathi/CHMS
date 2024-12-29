import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// import { clinic } from 'src/app/core/models/clinic.models';
import { visit, VisitResponse } from 'src/app/core/models/visit.models';
import { AdvancedSortableDirective, SortEvent } from '../../Patient/patient-list/advanced-sortable.directive';
import { VisitService } from 'src/app/core/services/visit.service';
import { DecimalPipe } from '@angular/common';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-visitor-list',
  templateUrl: './visitor-list.component.html',
  styleUrls: ['./visitor-list.component.scss']
})
export class VisitorListComponent implements OnInit {

  // Breadcrumb data
  breadCrumbItems: Array<{}>;

  // Clinic data
  visitData: visit[] = [];
  filteredVisits$: BehaviorSubject<visit[]>; // Filtered clinics for table display
  totalVisits: number = 0;

  // Search and pagination controls
  searchTerm: string = '';
  pageSize: number = 10;
  page: number = 1;
  hideme: boolean[] = [];

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;

  constructor(private visitService: VisitService) {
    this.filteredVisits$ = new BehaviorSubject<visit[]>([]);
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Visit Data Table', active: true }];
    this.fetchVisits();
  }


  //  * Fetch clinics and prepare data
  fetchVisits() {
    this.visitService.getVisits().pipe(
      map((response: VisitResponse) => {
        this.visitData = response.visits;
        this.totalVisits = this.visitData.length; // Update total clinics count
        this.hideme = Array(this.visitData.length).fill(true);
        this.updateFilteredVisits();
      })
    ).subscribe();
  }

  //  * Update filtered and paginated clinics based on search and pagination
  updateFilteredVisits() {
    const filteredData = this.visitData.filter((visit) =>
      this.searchTerm ? visit.visit_no.toLowerCase().includes(this.searchTerm.toLowerCase()) : true
    );

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Emit filtered data to BehaviorSubject
    this.filteredVisits$.next(filteredData.slice(startIndex, endIndex));
  }


  //  * Handle search term change
  onSearchChange() {
    this.page = 1; // Reset to first page when search term changes
    this.updateFilteredVisits();
  }


  //  * Handle pagination change
  onPageChange(newPage: number) {
    if (newPage > 0 && newPage <= Math.ceil(this.totalVisits / this.pageSize)) {
      this.page = newPage;
      this.updateFilteredVisits();
    }
  }


  //  * Toggle the visibility of clinic details
  //  * @param index Index of the clinic
  changeValue(index: number) {
    this.hideme[index] = !this.hideme[index];
  }

  //  * Handle sorting events
  //  * @param sortEvent Event from sortable directive
  onSort({ column, direction }: SortEvent) {
    this.visitData.sort((a, b) => {
      if (direction === 'asc') {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });
    this.updateFilteredVisits();
  }

}


