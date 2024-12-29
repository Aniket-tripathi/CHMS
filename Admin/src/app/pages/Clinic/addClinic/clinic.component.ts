import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClinicService } from '../../../core/services/clinic.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { emailValidator, southAfricaPhoneValidator } from './email.validator';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-clinic',
  templateUrl: './clinic.component.html',
  styleUrls: ['./clinic.component.scss']
})
export class ClinicComponent implements OnInit {
  loading: boolean = false;
  clinicForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  emailConflictMessage = '';
  role: string;
  selectedFile: any;

  constructor(private fb: FormBuilder,
    private clinicService: ClinicService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private spinner: NgxSpinnerService
  ) {
    this.clinicForm = this.fb.group({
      clinicname: ['', [Validators.required]],
      cliniccode: ['', [Validators.required]],
      clinicEmail: ['', [Validators.required, Validators.email, emailValidator()]],
      clinicContactNo: ['', [Validators.required, southAfricaPhoneValidator()]],
      clinicLogo: ['', [Validators.required]],
      clinicRegionId: ['', [Validators.required]],
      ClinicWardId: ['', [Validators.required]],
      services: [''],
      clinicAddress: ['', [Validators.required]],
      comments: [''],
      clinicType: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    // console.log(localuserData)
     this.role = localuserData.user.user.role || 'Unknown';
  }

  get f() {
    return this.clinicForm.controls;
  }

  isPublicFacility(): boolean {
    const clinicType = this.clinicForm.get('clinicType')?.value;
    return clinicType === 'Public Clinic' || clinicType === 'Public Hospital';
  }

  onSubmit() {
    this.submitted = true;

    if (this.clinicForm.invalid || this.emailConflictMessage) {
      return;
    }

    this.loading = true;
    this.spinner.show();

    // const formData = { ...this.clinicForm.value };
      // const formData = { ...this.clinicForm.value };
      const formData = new FormData();
      Object.keys(this.clinicForm.value).forEach((key) => {
        formData.append(key, this.clinicForm.value[key]);
      });
  
      if (this.selectedFile) {
        formData.append('clinicLogo', this.selectedFile);
      }

    this.clinicService.Clinicregistration(formData).subscribe({
      next: () => {
        // Show SweetAlert
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Clinic Is Added',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          // Navigate to the clinic list after Swal closes
          this.router.navigate(['/clinic/list']);
        });

        // Reset form and variables
        this.clinicForm.reset();
        this.submitted = false;

        // Hide loading spinner
        this.loading = false;
        this.spinner.hide();
      },
      error: (err) => {
        // Check for specific error message from the backend
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'An error occurred while registering the clinic. Please try again.';
        }

        // Optionally, show SweetAlert for the error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
        });
        // Hide loading spinner
        this.loading = false;
        this.spinner.hide();

        console.error(err);
      }
    });
  }
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }



  checkEmailAvailability() {
    const email = this.clinicForm.get('clinicEmail')?.value;

    if (email) {
      this.clinicService.checkEmailAvailability({ clinicEmail: email }).subscribe({
        next: (response) => {
          this.zone.run(() => {  // Ensure the update happens inside Angular's zone
            this.emailConflictMessage = ''; // Reset the conflict message
          });
        },
        error: (err) => {
          this.zone.run(() => {  // Ensure the update happens inside Angular's zone
            if (err.error && err.error.message) {
              this.emailConflictMessage = err.error.message;
            } else {
              this.emailConflictMessage = 'This email is not available.';
            }
          });
        }
      });
    }
  }




}
