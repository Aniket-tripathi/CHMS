import { Component, QueryList, ViewChildren } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AdvancedSortableDirective } from './advanced-sortable.directive';
import { ApiService } from 'src/app/core/services/api.service';
import { audittrial } from 'src/app/core/models/audittrial.model';

@Component({
  selector: 'app-audittrial',
  templateUrl: './audittrial.component.html',
  styleUrls: ['./audittrial.component.scss']
})
export class AudittrialComponent {

  // Breadcrumb data
  breadCrumbItems: Array<{}>;

  searchTerm: string = '';
  pageSize: number = 10;
  page: number = 1;
  hideme: boolean[] = [];
  types: string;

  audittrialData: audittrial[] = [];
  filteredaudittrial$: BehaviorSubject<audittrial[]> = new BehaviorSubject<audittrial[]>([]);

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  totalaudittriaL: number;

  constructor(private ApiService: ApiService) {
    this.filteredaudittrial$ = new BehaviorSubject<audittrial[]>([]);
  }


  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Staff Table', active: true }];
    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    console.log(localuserData)
    const userid = localuserData.user.user.id;
    const clinicid = localuserData.user.user.clinicId;
    const staffrole = localuserData.user.user.role;
    const stafftype = localuserData.user.user.staffType;
    this.types = localuserData.user.user.staffType || 'Unknown';
    if (staffrole == "superadmin") {
      this.fetchaudittrial("superadmin", userid, clinicid);
    } else if (stafftype == "cadmin") {
      this.fetchaudittrial("cadmin", userid, clinicid);
    } else if (stafftype == "cstaff") {
      this.fetchaudittrial("cstaff", userid, clinicid);
    } else {
    }

  }

  fetchaudittrial(type: string, userid: string, clinicid: string): void {
    this.ApiService.getaudittrial(type, userid, clinicid).subscribe((response: any) => {
      this.audittrialData = response.data;
      this.filteredaudittrial$.next(this.audittrialData);
      console.log('sdvsdvvvvvvvv', this.audittrialData);
    });
  }

  updateFilteredStaffs() {
    const filteredData = this.audittrialData.filter((audittrial) =>
      this.searchTerm
        ? audittrial.message.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        audittrial.ipAddress.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        audittrial.platform.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        audittrial.userType.includes(this.searchTerm)
        : true
    );

    this.filteredaudittrial$.next(filteredData);

  }

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  // Sorting logic
  onSort(column: string): void {
    if (this.sortColumn === column) {

      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }


  applySorting(): void {
    let sortedStaffs = [...this.audittrialData];

    if (this.sortColumn) {
      sortedStaffs = sortedStaffs.sort((a, b) => {
        const valueA = a[this.sortColumn];
        const valueB = b[this.sortColumn];


        if (valueA < valueB) {
          return this.sortDirection === 'asc' ? -1 : 1;
        } else if (valueA > valueB) {
          return this.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    if (this.searchTerm) {
      sortedStaffs = sortedStaffs.filter(audittrial => audittrial.clinicId.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    this.filteredaudittrial$.next(sortedStaffs);

  }

  //  * Handle pagination change
  onPageChange(newPage: number) {
    if (newPage > 0 && newPage <= Math.ceil(this.totalaudittriaL / this.pageSize)) {
      this.page = newPage;
    }
  }

}
