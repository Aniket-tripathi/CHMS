import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';

import { earningLineChart, salesAnalyticsDonutChart, ChatData } from './data';
import { ChartType, ChatMessage } from './saas.model';
import { ConfigService } from '../../../core/services/config.service';


@Component({
  selector: 'app-saas',
  templateUrl: './saas.component.html',
  styleUrls: ['./saas.component.scss']
})
/**
 * Saas-dashboard component
 */
export class SaasComponent implements OnInit, AfterViewInit {

  @ViewChild('scrollRef') scrollRef;

  // bread crumb items
  breadCrumbItems: Array<{}>;

  earningLineChart: ChartType;
  salesAnalyticsDonutChart: ChartType;
  ChatData: ChatMessage[];

  sassEarning: any;
  sassTopSelling: any;

  formData: UntypedFormGroup;

  // Form submit
  chatSubmit: boolean;
  localuserData: any;

  constructor(public formBuilder: UntypedFormBuilder, private configService: ConfigService) { }

  /**
   * Returns form
   */
  get form() {
    return this.formData.controls;
  }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Dashboards' }, { label: 'Dashboard', active: true }];

    this._fetchData();

    this.formData = this.formBuilder.group({
      message: ['', [Validators.required]],
    });

    this.configService.getConfig().subscribe(response => {
      this.sassEarning = response.sassEarning;
      this.sassTopSelling = response.sassTopSelling;

    });

    const sessionData = JSON.parse(sessionStorage.getItem('sessionUser'));
    if (sessionData) {
      console.log(sessionData.user);  // Access user data from session
    }

    const localuserData = JSON.parse(localStorage.getItem('currentUser'));

    // Check if session data exists and assign it to the currentUser property
    if (sessionData && sessionData.user) {
      this.localuserData = sessionData.user;
      console.log(localuserData);
      console.log('local User data:', this.localuserData);
    }
  }

  /**
   * Save the message in chat
   */
  messageSave() {
    const message = this.formData.get('message').value;
    const currentDate = new Date();
    if (this.formData.valid && message) {
      // Message Push in Chat
      this.ChatData.push({
        align: 'right',
        name: 'Henry Wells',
        message,
        time: currentDate.getHours() + ':' + currentDate.getMinutes()
      });
      this.onListScroll();
      // Set Form Data Reset
      this.formData = this.formBuilder.group({
        message: null
      });
    }

    this.chatSubmit = true;
  }

  private _fetchData() {
    this.earningLineChart = earningLineChart;
    this.salesAnalyticsDonutChart = salesAnalyticsDonutChart;
    this.ChatData = ChatData;
  }

  ngAfterViewInit() {
    this.scrollRef.SimpleBar.getScrollElement().scrollTop = 500;
  }

  onListScroll() {
    if (this.scrollRef !== undefined) {
      setTimeout(() => {
        this.scrollRef.SimpleBar.getScrollElement().scrollTop =
          this.scrollRef.SimpleBar.getScrollElement().scrollHeight + 1500;
      }, 500);
    }
  }

  selectMonth(value) {
    let data = value.target.value
    switch (data) {
      case "january":
        this.sassEarning = [
          {
            name: "This month",
            amount: "1056",
            revenue: "0.6",
            time: "From previous period",
            month: "Last month",
            previousamount: "959",
            series: [
              {
                name: "series1",
                data: [22, 35, 20, 41, 51, 42, 49, 45, 58, 42, 75, 48],
              },
            ],
          },
        ];
        break;
      case "december":
        this.sassEarning = [
          {
            name: "This month",
            amount: "999",
            revenue: "0.1",
            time: "From previous period",
            month: "Last month",
            previousamount: "854",
            series: [
              {
                name: "series1",
                data: [22, 28, 31, 34, 40, 52, 29, 45, 68, 60, 47, 12],
              },
            ],
          },
        ];
        break;
      case "november":
        this.sassEarning = [
          {
            name: "This month",
            amount: "1200",
            revenue: "0.4",
            time: "From previous period",
            month: "Last month",
            previousamount: "1102",
            series: [
              {
                name: "series1",
                data: [28, 30, 48, 50, 47, 40, 35, 48, 56, 42, 65, 41],
              },
            ],
          },
        ];
        break;
      case "october":
        this.sassEarning = [
          {
            name: "This month",
            amount: "958",
            revenue: "0.4",
            time: "From previous period",
            month: "Last month",
            previousamount: "736",
            series: [
              {
                name: "series1",
                data: [28, 48, 39, 47, 48, 41, 28, 46, 25, 32, 24, 28],
              },
            ],
          },
        ];
        break;
    }
  }

  sellingProduct(event) {
    let month = event.target.value;
    switch (month) {
      case "january":
        this.sassTopSelling = [
          {
            title: "Cardiology",
            amount: "250 Patients",
            revenue: "12.5",
            list: [
              {
                name: "Dr. Smith",
                text: "Heart Surgery Specialist",
                sales: 41,
                chartVariant: "#34c38f"
              },
              {
                name: "Dr. Emily",
                text: "Non-invasive Treatments Expert",
                sales: 14,
                chartVariant: "#556ee6"
              },
              {
                name: "Dr. Brown",
                text: "Cardiovascular Specialist",
                sales: 85,
                chartVariant: "#f46a6a"
              },
            ],
          },
        ];
        break;
      case "december":
        this.sassTopSelling = [
          {
            title: "Neurology",
            amount: "180 Patients",
            revenue: "10.8",
            list: [
              {
                name: "Dr. John",
                text: "Neurosurgeon",
                sales: 37,
                chartVariant: "#556ee6"
              },
              {
                name: "Dr. Sara",
                text: "Brain Disorders Expert",
                sales: 72,
                chartVariant: "#f46a6a"
              },
              {
                name: "Dr. Lee",
                text: "Stroke Specialist",
                sales: 54,
                chartVariant: "#34c38f"
              },
            ],
          },
        ];
        break;
      case "november":
        this.sassTopSelling = [
          {
            title: "Orthopedics",
            amount: "320 Patients",
            revenue: "15.4",
            list: [
              {
                name: "Dr. Adams",
                text: "Bone Surgery Specialist",
                sales: 37,
                chartVariant: "#34c38f"
              },
              {
                name: "Dr. Wilson",
                text: "Joint Replacement Expert",
                sales: 42,
                chartVariant: "#556ee6"
              },
              {
                name: "Dr. Taylor",
                text: "Spine Surgery Specialist",
                sales: 63,
                chartVariant: "#f46a6a"
              },
            ],
          },
        ];
        break;
      case "october":
        this.sassTopSelling = [
          {
            title: "Pediatrics",
            amount: "400 Patients",
            revenue: "18.2",
            list: [
              {
                name: "Dr. Green",
                text: "Child Health Specialist",
                sales: 37,
                chartVariant: "#f46a6a"
              },
              {
                name: "Dr. White",
                text: "Vaccination Expert",
                sales: 72,
                chartVariant: "#556ee6"
              },
              {
                name: "Dr. Black",
                text: "Neonatal Care Specialist",
                sales: 54,
                chartVariant: "#34c38f"
              },
            ],
          },
        ];
        break;
      default:
        this.sassTopSelling = [
          {
            title: "General Medicine",
            amount: "500 Patients",
            revenue: "20.0",
            list: [
              {
                name: "Dr. Davis",
                text: "General Practitioner",
                sales: 37,
                chartVariant: "#556ee6"
              },
              {
                name: "Dr. Garcia",
                text: "Internal Medicine Specialist",
                sales: 72,
                chartVariant: "#34c38f"
              },
              {
                name: "Dr. Martinez",
                text: "Family Physician",
                sales: 54,
                chartVariant: "#f46a6a"
              },
            ],
          },
        ];
        break;
    }
  }


}
