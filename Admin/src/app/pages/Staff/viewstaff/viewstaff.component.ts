import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { StaffService } from 'src/app/core/services/staff.service';

@Component({
  selector: 'app-viewstaff',
  templateUrl: './viewstaff.component.html',
  styleUrls: ['./viewstaff.component.scss']
})
export class ViewstaffComponent implements OnInit {
  staffData: any;

  constructor(
    private staffService: StaffService,
    private route: ActivatedRoute
  ) { }
  ngOnInit() {
    const sid = +this.route.snapshot.url[2].path;
    // alert(sid)
    this.getStaffDetails(sid);
  }

  getStaffDetails(id: number): void {
    this.staffService.getStaffById(id).pipe(
      map((response: { message: string }) => {
        this.staffData = response;
      })
    ).subscribe();
  }


}
