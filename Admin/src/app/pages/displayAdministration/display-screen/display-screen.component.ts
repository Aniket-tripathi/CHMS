import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClinicService } from '../../../core/services/clinic.service';
import { CounterResponse } from '../../../core/models/counter.models'
import { map } from 'rxjs';
import { TokenResponse } from 'src/app/core/models/token.models';

@Component({
  selector: 'app-display-screen',
  templateUrl: './display-screen.component.html',
  styleUrls: ['./display-screen.component.scss']
})
export class DisplayScreenComponent implements OnInit {
  counterData: any[] = [];
  tokenData: any[] = [];
  constructor(
    private route: ActivatedRoute, private clinicService: ClinicService,private router: Router
  ) { }
  ngOnInit() {
    const cid = +this.route.snapshot.url[2].path;
    this.getCounterDetails(cid);
    this.getWaitingToken(cid);
  }
  getCounterDetails(id: number): void {
    this.clinicService.getCounterByclinic(id).pipe(
      map((response: CounterResponse) => {
        this.counterData = response.counters; 
        console.log('API Response:', response);
      })
    ).subscribe();
  }

  getWaitingToken(id: number): void {
    this.clinicService.getWaitingToken(id).pipe(
      map((response: TokenResponse) => {
        this.tokenData = response.tokens; 
        console.log('API Response:', response);
      })
    ).subscribe();
  }

  getrefresh()
  {
    const cid = +this.route.snapshot.url[2].path;
    this.getCounterDetails(cid);
    this.getWaitingToken(cid);
  }
  
}
