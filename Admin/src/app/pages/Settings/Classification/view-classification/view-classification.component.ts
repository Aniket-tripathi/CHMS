import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; 
import { ApiService } from '../../../../core/services/api.service';
import { classificationResponse } from '../../../../core/models/classification.models';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-view-classification',
  templateUrl: './view-classification.component.html',
  styleUrls: ['./view-classification.component.scss'],
})


export class ViewClassificationComponent implements OnInit {
  classificationData: classificationResponse = {} as classificationResponse;
  kinDetail: any = [];

  constructor(
    private ApiService: ApiService, // Inject ApiService correctly
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const clsid = +this.route.snapshot.url[2].path; 
    this.getclassificationDetails(clsid);
  }

  getclassificationDetails(clsid: number) {
    this.ApiService.viewclassificationbyId(clsid)
      .pipe(
        map((response: classificationResponse) => {
          this.classificationData = response;
          console.log('API Response:', response);
        })
      )
      .subscribe();
  }
}
