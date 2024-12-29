import { ChangeDetectorRef, Component, OnInit } from "@angular/core";

import { BsModalRef } from "ngx-bootstrap/modal";
import { Router } from '@angular/router';

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClinicService } from "../../../core/services/clinic.service";
import { map } from "rxjs";
import { PatientService } from '../../../core/services/patient.service';
import Swal from "sweetalert2";
import { ClinicResponse } from "src/app/core/models/clinic.models";

@Component({
  selector: "app-add-vital",
  templateUrl: "./add-vital.component.html",
  styleUrls: ["./add-vital.component.scss"],
})
export class AddVitalComponent implements OnInit {
  // Breadcrumb data
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;
  config: any = {
    backdrop: true,
    ignoreBackdropClick: true,
  };
  name: any;
  clinicData: any;
  totalClinics: any;
  visitList: { vid: number, visit_no: string }[] = [];
  fullnames: string;
  ptnid: string;
  mpi: any;
  age: any;
  outputText: string = '';
  badgeClass: string = '';
  outputresp: string = '';
  badgeresp: string = '';
  outputpulse: string = '';
  badgepulse: string = '';
  badgebloodp: string = '';
  outputbloodp: string = '';
  badgepeakflow: string = '';
  outputpeakflow: string = '';
  outputbloodg: string = '';
  badgebloodg: string = '';
  badgebodyw: string = '';
  outputbodyw: string = '';
  badgebodyh: string = '';
  outputbodyh: string = '';
  bmi: string = '';
  // gender: any;
  gender: string = '';
  // patientService: any;
  pregnancy: string = '';
  showWeekDiv: boolean = false;
  cid: any;
  checkrole: any;

  ngOnInit() {
    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    const userid = localuserData.user.user.id;
    const clinicid = localuserData.user.user.clinicId;
    const role = localuserData.user.user.role;
    const stafftype = localuserData.user.user.staffType;
    this.breadCrumbItems = [
      { label: "Clinical Services" },
      { label: "Add New Vitals", active: true },
    ];
    this.cid = clinicid;
    this.checkrole = role;
    if (role == "superadmin") {
      this.fetchClinics();
    } else {
      this.getvst(clinicid)
    }
  }

  vitalForm: FormGroup;
  submitted = false;
  successMessage = "";
  errorMessage = "";
  bodyTempStatus: string | null = null; // Store status message (Normal/Fever)
  respirationRateStatus: string | null = null;
  bpStatus: string | null = null;
  pulseRateStatus: string | null = null;
  bloodGlucoseStatus: string | null = null;
  bodyWeightStatus: string = "";
  patientHeightStatus: string = "";
  bmiStatus: string | null = null;
  peakFlowStatus: string | null = null;
  peakFlowValue: number | null = null;

  // Flag to control whether the form is visible or not
  isFormVisible = false;

  constructor(private fb: FormBuilder, private clinicService: ClinicService, private patientService: PatientService, private router: Router, private cdr: ChangeDetectorRef,) {
    this.vitalForm = this.fb.group({
      vitalclinic: ["", [Validators.required]],
      vitalvstid: ["", [Validators.required]],
      patient_id: ["", []],
      age: [this.age || "", []],
      temprature: ["", []],
      consultid: ["", []],
      respiration: ["", []],
      pulse: ["", []],
      bloodp: ["", []],
      peakflow: ["", []],
      bloodglucose: ["", []],
      weight: ["", []],
      height: ["", []],
      body_mass_index: ["", []],
      pregnancy: ["", []],
      weeks_of_pregnancy: ["", []],
      hb_test: ["", []],
      note: ["", []],
      masterpatientindex: [""],
      pname: [""],
      gender: [""],
      blood: [false],
      glucose: [false],
      urobilinogen: [false],
      leukocytes: [false],
      bilirubin: [false],
      protein: [false],
      nitrate: [false],
      ketones: [false],
      phlevel: [false],
      urinalysis: this.fb.group({
        blood: [false],
        bloodp: [false],
        glucose: [false],
        urobilinogen: [false],
        leukocytes: [false],
        bilirubin: [false],
        protein: [false],
        nitrate: [false],
        ketones: [false],
        phlevel: [false],
      })
    });
  }

  get f() {
    return this.vitalForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.vitalForm.invalid) {
      return;
    }

    const formData = { ...this.vitalForm.value };

    // Set the current date
    const currentDate = new Date();
    formData.adddate = currentDate.toISOString().split('T')[0];

    // Set the time in South Africa timezone
    const southAfricaTime = new Date(
      currentDate.toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })
    );

    // Add other static fields
    formData.vital_status = `Active`;
    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    const stype = localuserData.user.user.staffType;
    const roles = localuserData.user.user.role;
    const userid = localuserData.user.user.id;
    if (roles == 'superadmin') {
      formData.added_by = roles;
    } else {
      formData.added_by = stype;
    }
    formData.added_userid = userid;
    formData.consultid = 1;

    // Ensure the urinalysis object is correctly populated
    const urinalysis = formData.urinalysis;
    Object.keys(urinalysis).forEach(key => {
      if (urinalysis[key] === undefined) {
        urinalysis[key] = false; // Ensure undefined values are set to false
      }
    });

    // Send the formData to the backend
    this.patientService.addvital(formData).subscribe({
      next: () => {

        this.submitted = false;
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Vital Added Successfully!',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          // Navigate to the clinic list after Swal closes
          this.router.navigate(['/vital/list']);
        });
      },
      error: (err) => {
        this.errorMessage =
          "An error occurred while registering the vitals. Please try again.";
        console.error(err);
      },
    });
  }


  checkBodyTemp() {
    const bodyTemp = this.vitalForm.get("temprature")?.value;
    const age = this.vitalForm.get("age")?.value;

    // Optional: Check if values are valid before making the call
    if (!bodyTemp || !age) {
      alert('Please enter both body temperature and age.');
      this.badgeClass = '';
      this.outputText = '';
      return;
    }
    this.patientService.checkBodyTemp(bodyTemp.toString(), age.toString()).subscribe(
      (response: any) => {  // Use 'any' for response
        console.log('Vital details:', response);
        this.badgeClass = response?.bloodtvalidation?.badgeClass || 'bg-secondary';
        this.outputText = response?.bloodtvalidation?.outputText || 'No message available';
        // alert(this.outputText) 
      },
      (error) => {
        console.error('Error fetching Vital details:', error);
        alert('An error occurred while fetching the vital details. Please try again.');
      }
    );

  }

  checkrespiration() {
    const respirationRate = this.vitalForm.get("respiration")?.value;
    const age = this.vitalForm.get("age")?.value;

    // Optional: Check if values are valid before making the call
    if (!respirationRate || !age) {
      alert('Please enter both respirationRate and age.');
      this.badgeresp = '';
      this.outputresp = '';
      return;
    }
    this.patientService.respiration(respirationRate.toString(), age.toString()).subscribe(
      (response: any) => {  // Use 'any' for response
        console.log('Vital details:', response);
        this.badgeresp = response?.respirationValidation?.badgeresp || '';
        this.outputresp = response?.respirationValidation?.outputresp || '';
        // alert(this.outputText) 
      },
      (error) => {
        console.error('Error fetching Vital details:', error);
        alert('An error occurred while fetching the vital details. Please try again.');
      }
    );
  }

  checkbloodp(event: Event) {

    const bloodp = (event.target as HTMLInputElement).value;
    const age = this.vitalForm.get("age")?.value;

    // Optional: Check if values are valid before making the call
    if (!bloodp || !age) {
      alert('Please enter both Blood Pressure and age.');
      this.badgebloodp = '';
      this.outputbloodp = '';
      return;
    }
    this.patientService.bloodPressure(bloodp.toString(), age.toString()).subscribe(
      (response: any) => {  // Use 'any' for response
        console.log('Vital details:', response);
        this.badgebloodp = response?.bloodPressureValidation?.badgeBP || '';
        this.outputbloodp = response?.bloodPressureValidation?.outputBP || '';
        // alert(this.outputText) 
      },
      (error) => {
        console.error('Error fetching Vital details:', error);
        alert('An error occurred while fetching the vital details. Please try again.');
      }
    );
  }
  PeakFlow(event: Event) {

    const peakflow = (event.target as HTMLInputElement).value;

    if (!peakflow) {
      alert('Please enter peakflow.');
      this.badgepeakflow = '';
      this.outputpeakflow = '';
      return;
    }
    this.patientService.PeakFlow(peakflow.toString()).subscribe(
      (response: any) => {  // Use 'any' for response
        console.log('Vital details:', response);
        this.badgepeakflow = response?.peakflowValidation?.badgepeakflow || '';
        this.outputpeakflow = response?.peakflowValidation?.outputpeakflow || '';
        // alert(this.badgepeakflow) 
      },
      (error) => {
        console.error('Error fetching Vital details:', error);
        alert('An error occurred while fetching the vital details. Please try again.');
      }
    );
  }

  checkrpulseRate(event: Event): void {
    const pulseRate = (event.target as HTMLInputElement).value;
    // alert(pulseRate)
    const age = this.vitalForm.get("age")?.value;
    // alert(age)

    // Optional: Check if values are valid before making the call
    if (!pulseRate || !age) {
      alert('Please enter both pulseRate and age.');
      this.badgepulse = '';
      this.outputpulse = '';
      return;
    }
    this.patientService.pulserate(pulseRate.toString(), age.toString()).subscribe(
      (response: any) => {  // Use 'any' for response
        console.log('Vital details:', response);
        this.badgepulse = response?.pulseValidation?.badgepulse || '';
        this.outputpulse = response?.pulseValidation?.outputpulse || '';
        // alert(this.outputText) 
      },
      (error) => {
        console.error('Error fetching Vital details:', error);
        alert('An error occurred while fetching the vital details. Please try again.');
      }
    );
  }

  Bloodglucose(event: Event) {
    const bloodg = (event.target as HTMLInputElement).value;

    if (!bloodg) {
      alert('Please enter Blood Glucose.');
      this.badgebloodg = '';
      this.outputbloodg = '';
      return;
    }
    this.patientService.bloodGlucose(bloodg.toString()).subscribe(
      (response: any) => {  // Use 'any' for response
        console.log('Vital details:', response);
        this.badgebloodg = response?.bloodGlucoseValidation?.badgeBG || '';
        this.outputbloodg = response?.bloodGlucoseValidation?.outputBG || '';
        // alert(this.outputText) 
      },
      (error) => {
        console.error('Error fetching Vital details:', error);
        alert('An error occurred while fetching the vital details. Please try again.');
      }
    );
  }

  BodyWeight(event: Event) {
    const bodyweight = (event.target as HTMLInputElement).value;
    const age = this.vitalForm.get("age")?.value;

    if (!bodyweight || !age) {
      alert('Please enter Body Weight And Age.');
      this.badgebodyw = '';
      this.outputbodyw = '';
      return;
    }
    this.patientService.bodyWeight(bodyweight.toString(), age.toString()).subscribe(
      (response: any) => {
        console.log('Vital details:', response);
        this.badgebodyw = response?.weightValidation?.badgeBW || '';
        this.outputbodyw = response?.weightValidation?.outputBW || '';
        // alert(this.outputText) 
      },
      (error) => {
        console.error('Error fetching Vital details:', error);
        alert('An error occurred while fetching the vital details. Please try again.');
      }
    );
  }

  calculateBMI(event: Event) {
    const height = (event.target as HTMLInputElement).value;
    const weight = this.vitalForm.get("weight")?.value;
    const age = this.vitalForm.get("age")?.value;

    if (!height || !weight) {
      alert('Please enter Body Weight,Height .');
      this.badgebodyh = '';
      this.outputbodyh = '';
      return;
    }
    this.patientService.calculateBMI(height.toString(), weight.toString()).subscribe(
      (response: any) => {
        console.log('Vital details:', response);
        this.badgebodyh = response?.bmiValidation?.badgeBMI || '';
        this.outputbodyh = response?.bmiValidation?.outputBMI || '';
        this.bmi = response?.bmiValidation?.bmi || '';
        // alert(this.outputText) 
      },
      (error) => {
        console.error('Error fetching Vital details:', error);
        alert('An error occurred while fetching the vital details. Please try again.');
      }
    );
  }


  fetchClinics(): void {
    this.clinicService.getClinics().pipe(
      map((response: ClinicResponse) => response.clinics)
    ).subscribe({
      next: (clinics) => {
        this.clinicData = clinics;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching clinics:', err);
      }
    });
  }

  getvst(clinicId: string): void {

    const clinicIdNumber = Number(clinicId);

    if (!clinicId || isNaN(clinicIdNumber)) {
      console.log('No valid clinic selected');
      this.visitList = [];
    }

    this.patientService.getvst(clinicIdNumber).subscribe(
      (response) => {
        console.log('Visit details:', response);

        // Check if 'visits' exists and is an array
        if (Array.isArray(response.visits) && response.visits.length > 0) {
          this.visitList = response.visits.map((visit: any) => ({
            vid: visit.vid,
            visit_no: visit.visit_no,
          }));
        } else {
          this.visitList = []; // Set an empty list if no visits are found
        }
      },
      (error) => {
        console.error('Error fetching visit details:', error);
        this.visitList = []; // Handle the error by clearing the list
      }
    );
  }


  getcheck(event: Event): void {
    const pregnancyValue = (event.target as HTMLSelectElement).value;
    this.showWeekDiv = pregnancyValue === 'Pregnancy';
  }

  getvisitdetails(event: Event): void {
    const vstId = (event.target as HTMLSelectElement).value;
    const vstIdNumber = Number(vstId);
    if (!vstId || isNaN(vstIdNumber)) {
      console.log('No valid Visit selected');
      return;
    }

    this.patientService.getvisitdata(vstIdNumber).subscribe(
      (response) => {
        const flname = (response.visits as any)?.fullname;
        const ttle = (response.visits as any)?.title;
        const mpi = (response.visits as any)?.mpino;
        const agep = (response.visits as any)?.agep;
        const ptnid = (response.visits as any)?.patientregid;
        const gender = (response.visits as any)?.gender;

        if (flname && ttle) {
          this.fullnames = ttle + ' ' + flname;
          this.mpi = mpi;
          this.age = agep;
          this.gender = gender;
          this.vitalForm.patchValue({
            patient_id: ptnid,
            age: this.age,
            gender: this.gender,
          });
        } else {

        }
      },
      (error) => {
        console.error('Error fetching patient details:', error);
      }
    );
  }

}
