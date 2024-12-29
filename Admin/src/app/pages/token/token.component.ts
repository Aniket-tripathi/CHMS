import { Component, OnInit } from '@angular/core';
import { ClinicService } from '../../core/services/clinic.service';
import { clinic, ClinicResponse } from '../../core/models/clinic.models';
import { map } from 'rxjs';
import { PatientService } from '../../core/services/patient.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from "../../core/services/api.service";
import Swal from 'sweetalert2';
import { TokenResponse } from 'src/app/core/models/token.models';
import { jsPDF } from 'jspdf';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements OnInit {

  filteredData: any[] = [];
  tokenData: any[] = [];
  isLoading = true;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  searchQuery: string = '';
  message: string = '';
  color: string = '';
  button: string = '';
  checkstatus: string = 'Yes';
  clinicData: Array<{ clinicid: number; clinicname: string }> = [];
  classificationList: { id: number, classification: string }[] = [];
  cid: string;
  checkrole: string;
  mpinoList: { patientregid: number, mpino: string }[] = [];
  tokenForm: FormGroup;
  // fb: any;
  submitted: boolean;
  // router: any;
  successMessage: string;
  errorMessage: string;
  // cdr: any;

  constructor(
    private fb: FormBuilder,
    private clinicService: ClinicService,
    private patientService: PatientService,
    private apiservice: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) {
    this.tokenForm = this.fb.group({
      clinic_id: ['', [Validators.required]],
      tokenno: ['', []],
      token_registered: [true],
      token_idnumber: [null, [Validators.required]],
      token_pdob: ['', []],
      patient_id: [null, [Validators.required]],
      tokenstream: ['', [Validators.required]],
      token_reason: ['', [Validators.required]],
      tokenvip: ['', []],
      tokentype: ['', []],
      tokenstatus: ['', []],
      tokendisplaystatus: ['', []],
      added_by: ['', []],
      tokenaddtime: ['', []],
      tokenendtime: ['', []],
      audiable: ['', []],
      mobile: ['', []],
      tokenconsultationstatus: ['', []],
      emergency: ['', []],
      tokenvisitstatus: ['', []],
      token_pharmacy_status: ['', []],
      dispense: ['', []],
      adddate: ['', []],
      addtime: ['', []],
      added_userid: ['', []],
    });
  }

  get f() {
    return this.tokenForm.controls;
  }


  onSubmit() {
    
    if (this.color === 'red') {
      this.toastr.error('No Active Counter Found!', 'Error');
      return;
    }
    this.submitted = true;

    if (this.tokenForm.invalid) {
      return;
    }
    const formData = { ...this.tokenForm.value };
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
    // this.cdr.detectChanges();
    this.apiservice.Tokenregistration(formData).subscribe({
      next: (response: any) => {
        const tokenno = response.tokenNumber;
        Swal.fire({
          title: 'Token registered successfully!',
          html: `
                <p>Your Token number is: <strong id="tokenno">${tokenno}</strong></p>
                <button class="swal2-confirm swal2-styled" id="copyButton" style="background-color: #3085d6; color: white; margin-right: 10px;">
                  <i class="fas fa-copy"></i> Copy to Clipboard
                </button>
              `,
          icon: 'success',
          showConfirmButton: true,
          confirmButtonText: 'OK',
          didRender: () => {

            const copyButton = document.getElementById('copyButton');
            copyButton?.addEventListener('click', () => {
              const tokenNoElement = document.getElementById('tokenno');
              if (tokenNoElement) {
                const range = document.createRange();
                range.selectNode(tokenNoElement);
                window.getSelection()?.removeAllRanges();
                window.getSelection()?.addRange(range);

                try {
                  document.execCommand('copy');
                  Swal.fire({
                    icon: 'success',
                    title: 'Copied!',
                    text: 'Token number copied to clipboard.',
                    timer: 1500,
                    showConfirmButton: false,
                  });
                } catch (err) {
                  console.error('Failed to copy Token number:', err);
                }

                window.getSelection()?.removeAllRanges();
              }
            });
          },
        });

        // Navigate after 2 seconds (optional, only if required)
        setTimeout(() => {
          this.router.navigate(['/token']);
        }, 2000);

        this.successMessage = `Token registered successfully! Your Token number is: ${tokenno}`;
        this.tokenForm.reset();
        this.submitted = false;
        const localuserData = JSON.parse(localStorage.getItem('currentUser'));
        const clinicid = localuserData.user.user.clinicId;
        const role = localuserData.user.user.role;
        this.tokenlist(role, clinicid);
        if(role != 'superadmin'){
          this.tokenForm.get('clinic_id').setValue(this.cid);
        }
        this.tokenForm.get('token_registered')?.setValue(true);
    
      },
      error: (err) => {
        this.errorMessage =
          "An error occurred while registering the Token. Please try again.";
        console.error(err);
      },
    });
    this.tokenForm.get('clinic_id').setValue(this.cid);
  }

  ngOnInit(): void {
    const toggle = (document.querySelector('[formControlName="token_registered"]') as HTMLInputElement).value;
    if (toggle == "on") {
      this.tokenForm.get('patient_id')?.setValidators([Validators.required]);
    } else {
      alert('Off')
    }
    this.tokenForm.get('token_idnumber')?.clearValidators();
    this.filteredData = this.tokenData;
    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    const userid = localuserData.user.user.id;
    const clinicid = localuserData.user.user.clinicId;
    const role = localuserData.user.user.role;
    const stafftype = localuserData.user.user.staffType;
    // alert(clinicid)
    this.cid = clinicid;
    this.checkrole = role;
    if (role == "superadmin") {
      this.fetchClinics();
      this.tokenlist(role, clinicid);
    } else {
      this.tokenForm.get('clinic_id').setValue(this.cid);
      this.getptn(clinicid)
      this.tokenlist(role, clinicid);
    }
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.filteredData = this.tokenData.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.country.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredData = this.tokenData;
    }
    this.currentPage = 1;  // Reset to the first page after search
  }

  get paginatedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredData.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get totalPages() {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  get pageNumbers() {
    const total = this.totalPages;
    let pages = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }
  fetchClinics(): void {
    this.clinicService.getClinics().pipe(
      map((response: ClinicResponse) => {
        this.clinicData = response.clinics;
      })
    ).subscribe();
  }


  tokenlist(type: string, clinicid: string) {
    this.isLoading = true;
    this.apiservice.tokendata(type, clinicid).pipe(
      map((response: TokenResponse) => {
        this.tokenData = response.tokens;
      })
    ).subscribe(
      () => {
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching token data:', error);
        this.isLoading = false;
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

    this.patientService.checkcounter(clinicIdNumber.toString()).subscribe(
      (response: any) => {
        this.message = response.message;
        this.color = response.color;
        this.button = response.button;
        console.log('Response:', response);
      },
      (error) => {
        // Handle the error response
        console.error('Error occurred:', error);
      }
    );




  }
  handleError(error: any, customMessage: string): void {
    // This function will handle API errors
    const errorMessage = error?.error?.message || error?.message || customMessage;
    console.error('Detailed error:', error);
  }

  togglecheckreg(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.checkstatus = isChecked ? 'Yes' : 'No';
    if (isChecked) {
      this.tokenForm.get('patient_id')?.setValidators([Validators.required]);
      this.tokenForm.get('token_idnumber')?.clearValidators();
    } else {
      // alert('haa')
      this.tokenForm.get('patient_id')?.clearValidators();
      this.tokenForm.get('token_idnumber')?.setValidators([Validators.required]);
    }
    this.tokenForm.get('patient_id')?.updateValueAndValidity();
    this.tokenForm.get('token_idnumber')?.updateValueAndValidity();
  }


  callToken(tokenno: string) {
    const announcementAudio = new Audio('assets/audio/announcement_sound.mp3');
    const message = `Token Number ${tokenno}`;
    announcementAudio.play();
    announcementAudio.onended = () => {
      this.speak(message);
      this.showMessage(message);
    };
    this.toastr.success(message, 'success');
  }


  speak(message: string) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }



  showMessage(message: string) {
    // alert(message);
  }


  printToken(tokenno: string) {
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.location.href = this.router.serializeUrl(
        this.router.createUrlTree(['/tokenpdf', tokenno])
      );
    }
  }
  CompletedToken(tokenid) {
    const isConfirmed = confirm('Are you sure you have completed the token?');
    if (isConfirmed) {
      this.apiservice.completeToken(tokenid).subscribe({
        next: (response) => {
          console.log('Token updated:', response);
          const localuserData = JSON.parse(localStorage.getItem('currentUser'));
          const clinicid = localuserData.user.user.clinicId;
          const role = localuserData.user.user.role;
          this.tokenlist(role, clinicid);

        },
        error: (err) => {
          console.error('Error updating Completed Token:', err);
        }
      });
      this.toastr.success('Token marked as completed successfully!', 'Success');
    } else {
      this.toastr.warning('Token completion cancelled.', 'warning');
    }
  }



}
