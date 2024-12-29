import { ChangeDetectorRef, Component, OnInit } from "@angular/core";

import { BsModalRef } from "ngx-bootstrap/modal";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClinicService } from "../../../core/services/clinic.service";
import { VisitService } from "../../../core/services/visit.service";
import { PatientService } from '../../../core/services/patient.service';
import { map } from "rxjs";
import Swal from "sweetalert2";
import { Router } from '@angular/router';
import { PatientResponse } from "src/app/core/models/patient.models";
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: "app-add-visitors",
  templateUrl: "./add-visitors.component.html",
  styleUrls: ["./add-visitors.component.scss"],
})
export class AddVisitorsComponent implements OnInit {
  mpinoList: { patientregid: number, mpino: string }[] = [];
  classificationList: { id: number, classification: string }[] = [];
  patientDetails: any[] = [];
  patientResults: any[] = [];
  // router: any;
  searchTriggered: boolean = false;
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;
  config: any = {
    backdrop: true,
    ignoreBackdropClick: true,
  };
  name: any;
  clinicData: any;
  totalClinics: any;
  form: any;
  age: any;
  firstname: any;
  lastname: any;
  title: string;
  fullnames: any;
  email: any;
  contact: any;
  patientData: any;
  checkrole: string;
  cid: string;



  ngOnInit(): void {
    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    const userid = localuserData.user.user.id;
    const clinicid = localuserData.user.user.clinicId;
    const role = localuserData.user.user.role;
    const stafftype = localuserData.user.user.staffType;
    this.cid = clinicid;
    this.checkrole = role;
    if (role == "superadmin") {
      this.fetchClinics();
    } else {
      this.getptn(clinicid)
    }

    this.breadCrumbItems = [
      { label: "Register Patient" },
      { label: "Add New Visit", active: true },
    ];
    const ptnid = +this.route.snapshot.url[2].path;
    if (ptnid) {
      this.fetchptndata(ptnid);
    } else {
      console.log('new add')
    }
  }



  isLoading = false;

  fetchptndata(ptnid: number) {
    this.isLoading = true;
    this.patientService.getptndata(ptnid).pipe(
      map((response: PatientResponse) => {
        this.patientData = response.patients;
        if (this.patientData.patientregid && this.patientData.clinicid) {
          setTimeout(() => {
            this.visitorsForm.get('patient_id')?.setValue(this.patientData.patientregid, { emitEvent: true });
            const patientIdElement = document.getElementById('patient_id') as HTMLSelectElement;
            if (patientIdElement) {
              const event = new Event('change', { bubbles: true });
              patientIdElement.dispatchEvent(event);
            }
          }, 1800);

          setTimeout(() => {
            this.visitorsForm.get('visit_clinicid')?.setValue(this.patientData.clinicid, { emitEvent: true });
            const visitClinicIdElement = document.getElementById('visit_clinicid') as HTMLSelectElement;
            if (visitClinicIdElement) {
              const event = new Event('change', { bubbles: true });
              visitClinicIdElement.dispatchEvent(event);
            }
          }, 1000);

          setTimeout(() => {
            this.isLoading = false;
          }, 1900);
        } else {
          this.isLoading = false;
        }
      })
    ).subscribe();
  }
  getptndetails(event: Event): void {
    const clinicId = (document.querySelector('[formControlName="visit_clinicid"]') as HTMLInputElement).value;
    const ptnMpi = (event.target as HTMLSelectElement).value;

    if (!clinicId) {
      console.log('No clinic selected');
      return;
    }
    this.patientService.getPatientDetails(clinicId, ptnMpi).subscribe(
      (response) => {
        console.log('Patient details:', response);
      },
      (error) => {
        console.error('Error fetching patient details:', error);
      }
    );
  }

  getptn(clinicId: string): void {

    const clinicIdNumber = Number(clinicId);

    if (!clinicId || isNaN(clinicIdNumber)) {
      console.log('No valid clinic selected');
      return;
    }

    // Fetch patient details
    this.patientService.getPtn(clinicIdNumber).subscribe(
      (response) => {
        console.log('Patient details:', response);
        this.mpinoList = response.patients.map((patient: any) => ({
          patientregid: patient.patientregid,
          mpino: patient.mpino
        }));
      },
      (error) => {
        console.error('Error fetching patient details:', error);
        this.handleError(error, 'Fetching patient details failed.');
      }
    );

    // Fetch classification details
    this.patientService.getclassification(clinicIdNumber).subscribe(
      (response) => {
        console.log('Classification details:', response);
        this.classificationList = response.classifications.map((classification: any) => ({
          id: classification.id,
          classification: classification.classification
        }));
      },
      (error) => {
        console.error('Error fetching classification details:', error);
        this.handleError(error, 'Fetching classification details failed.');
      }
    );
  }

  handleError(error: any, customMessage: string): void {
    // This function will handle API errors
    const errorMessage = error?.error?.message || error?.message || customMessage;
    console.error('Detailed error:', error);

    // Display user-friendly error message
    // alert(errorMessage);
  }


  getmpidetails(event: Event): void {
    const ptnId = (event.target as HTMLSelectElement).value; // ptnId is a string here
    const ptnIdNumber = Number(ptnId); // Convert to number

    if (!ptnId || isNaN(ptnIdNumber)) {
      console.log('No valid Mpi selected');
      return;
    }

    this.patientService.getPatientById(ptnIdNumber).subscribe(
      (response) => {
        // Access clinicname directly if patients is an object
        const flname = (response.patients as any)?.fullname;
        const ttle = (response.patients as any)?.title;
        const email = (response.patients as any)?.patientemail;
        const contact = (response.patients as any)?.patientpno;
        const agep = (response.patients as any)?.agep;

        if (flname && ttle) {
          this.fullnames = ttle + ' ' + flname;
          this.email = email;
          this.contact = contact;
          this.age = agep;
        } else {

        }
      },
      (error) => {
        console.error('Error fetching patient details:', error);
      }
    );
  }




  fetchClinics(): void {
    this.clinicService.getClinics().pipe(
      map((response) => response.clinics.map((clinic: any) => ({
        clinicid: clinic.clinicid,
        clinicname: clinic.clinicname
      })))
    ).subscribe({
      next: (mappedClinics) => {
        this.clinicData = mappedClinics;
        this.totalClinics = this.clinicData.length;

        // Trigger change detection
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching clinics:', err);
      }
    });
  }



  visitorsForm: FormGroup;
  submitted = false;
  successMessage = "";
  errorMessage = "";
  imagePreview: string | ArrayBuffer | null = null;

  // Flag to control whether the form is visible or not
  isFormVisible = false;

  constructor(private fb: FormBuilder, private clinicService: ClinicService, private patientService: PatientService, private visitService: VisitService, private cdr: ChangeDetectorRef,
    private router: Router, private route: ActivatedRoute,) {
    this.visitorsForm = this.fb.group({
      visit_clinicid: ['', [Validators.required]],
      visit_no: ["", []],
      patient_id: ['', [Validators.required]],
      hdccat: ['', [Validators.required]], // Set disabled here
      appointmentid: [,],
      roomid: ["",],
      visit_date: ["",],
      visit_time: [,],
      vststart: [,],
      vstend: [,],
      visit_type: [,],
      referred_by: [,],
      status: ["", []],
      age: ["",],
      emailv: ["",],
      authentication_note: ["",],
      visit_token_start: ["",],
      visit_token_end: ["",],
      prescordesp: ["",],
      hct: ["",],
      pres_note: ["",],
      visitstatus: ["",],
      added_by: ["",],
    });
  }

  get f() {
    return this.visitorsForm.controls;
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.visitorsForm.patchValue({ patientImage: file });
      this.visitorsForm.get("patientImage")?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.visitorsForm.invalid) {
      return;
    }

    const formData = { ...this.visitorsForm.value };
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
    this.visitService.Visitregistration(formData).subscribe({
      next: (response: any) => {
        const visitNo = response.visitData?.visit_no; // Safely access visit_no

        // Show the success message with copy functionality and OK button
        Swal.fire({
          title: 'Visit registered successfully!',
          html: `
            <p>Your visit number is: <strong id="visitNo">${visitNo}</strong></p>
            <button class="swal2-confirm swal2-styled" id="copyButton" style="background-color: #3085d6; color: white; margin-right: 10px;">
              <i class="fas fa-copy"></i> Copy to Clipboard
            </button>
          `,
          icon: 'success',
          showConfirmButton: true, // Show the OK button
          confirmButtonText: 'OK', // Text for the OK button
          didRender: () => {
            // Add a click event listener to the copy button
            const copyButton = document.getElementById('copyButton');
            copyButton?.addEventListener('click', () => {
              const visitNoElement = document.getElementById('visitNo');
              if (visitNoElement) {
                const range = document.createRange();
                range.selectNode(visitNoElement);
                window.getSelection()?.removeAllRanges();
                window.getSelection()?.addRange(range);

                try {
                  document.execCommand('copy');
                  Swal.fire({
                    icon: 'success',
                    title: 'Copied!',
                    text: 'Visit number copied to clipboard.',
                    timer: 1500,
                    showConfirmButton: false,
                  });
                } catch (err) {
                  console.error('Failed to copy visit number:', err);
                }

                window.getSelection()?.removeAllRanges();
              }
            });
          },
        });

        // Navigate after 2 seconds (optional, only if required)
        setTimeout(() => {
          this.router.navigate(['/visit/list']);
        }, 2000);

        this.successMessage = `Visit registered successfully! Your visit number is: ${visitNo}`;
        this.visitorsForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.errorMessage =
          "An error occurred while registering the visitors. Please try again.";
        console.error(err);
      },
    });
  }






  addNewAllocation() {
    this.isFormVisible = true;
    // Reset the form and clear any added data
    this.visitorsForm.reset(); // This will reset all the form fields

    // Optional: Set specific values to default if needed
    this.visitorsForm.patchValue({
      clinicName: "",
      masterpatientindex: "",
      totalvisit: "",
      hprs: "",
      token: "",
      patientcategory: "",
      patientImage: "",
      title: "",
      fname: "",
      lname: "",
      age: "",
      address: "",
      pEmail: "",
      pContactNo: "",
      streams: "",
      substreams: "",
      visittype: "",
      referredby: "",
      vitallocation: "",
    });

    // Additional logic (e.g., resetting any additional states or flags)
    this.submitted = false; // Reset submission state if needed
  }
}
