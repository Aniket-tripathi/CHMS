import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { first } from 'rxjs/operators';
import { UserProfileService } from '../../../core/services/user.service';
import { OwlOptions } from 'ngx-owl-carousel-o';

import { ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClinicService } from '../../../core/services/clinic.service';
import Swal from 'sweetalert2';
import { emailValidator, southAfricaPhoneValidator } from './email.validator';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  signupForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  successmsg: any = false;
  loading: boolean = false;
  clinicForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  emailConflictMessage = '';

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,
    private userService: UserProfileService,
    private fb: FormBuilder,
    private clinicService: ClinicService,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private spinner: NgxSpinnerService) {
    this.clinicForm = this.fb.group({
      clinicname: ['', [Validators.required]],
      cliniccode: ['', [Validators.required]],
      clinicEmail: ['', [Validators.required, Validators.email, emailValidator()]],
      clinicContactNo: ['', [Validators.required, southAfricaPhoneValidator()]],
      clinicLogo: [''],
      clinicRegionId: ['', [Validators.required]],
      ClinicWardId: ['', [Validators.required]],
      services: [''],
      clinicAddress: ['', [Validators.required]],
      comments: [''],
      clinicType: ['', [Validators.required]],
    });
  }


  // ngOnInit() {
  //   this.signupForm = this.formBuilder.group({
  //     username: ['', Validators.required],
  //     email: ['', [Validators.required, Validators.email]],
  //     password: ['', Validators.required],
  //   });
  // }


  carouselOption: OwlOptions = {
    items: 1,
    loop: false,
    margin: 0,
    nav: false,
    dots: true,
    responsive: {
      680: {
        items: 1
      },
    }
  }

  get f() {
    return this.clinicForm.controls;
  }
  onSubmit() {
    this.submitted = true;

    if (this.clinicForm.invalid || this.emailConflictMessage) {
      return;
    }

    this.loading = true;
    this.spinner.show();

    const formData = { ...this.clinicForm.value };

    this.clinicService.Clinicregistration(formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Clinic Registration Successful!',
          html: `
            <p>Your clinic has been successfully registered!</p>
            <p>The Super Admin will verify and activate it soon.</p>
            <p>You will receive an email with the URL to proceed with setting up your clinic.</p>
          `,
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-wide'
          },
          allowOutsideClick: false,
        }).then(() => {

          window.close();
        });

        this.clinicForm.reset();
        this.submitted = false;

        this.loading = false;
        this.spinner.hide();
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'An error occurred while registering the clinic. Please try again.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
        });

        this.loading = false;
        this.spinner.hide();

        console.error(err);
      }
    });
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
