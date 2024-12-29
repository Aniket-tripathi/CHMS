import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { VisitResponse } from 'src/app/core/models/visit.models';
import { VisitService } from 'src/app/core/services/visit.service';

@Component({
  selector: 'app-view-visitors',
  templateUrl: './view-visitors.component.html',
  styleUrls: ['./view-visitors.component.scss']
}) 


export class ViewVisitorsComponent implements OnInit {
  patientData!: VisitResponse;
  kinDetail: any = [];
visit: any;
  visitData: VisitResponse;

  constructor(
    private visitService: VisitService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const visitId = +this.route.snapshot.url[2].path; 
    this.getVisitDetails(visitId);
  }

  getVisitDetails(id: number): void {
    this.visitService.getVisitById(id).pipe(
      map((response: VisitResponse) => {
        this.visitData = response;
        console.log('API Response:', response);
      })
    ).subscribe();
  }
  
  
  
}
