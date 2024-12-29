import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthenticationService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { first } from 'rxjs/operators';
import { UserProfileService } from '../../../core/services/user.service';

import { ChangeDetectorRef, NgZone } from '@angular/core';
import { ClinicService } from '../../../core/services/clinic.service';
import { clinic, ClinicResponse } from '../../../core/models/clinic.models';
import { department } from 'src/app/core/models/department.model';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StaffService } from 'src/app/core/services/staff.service';
import { ApiService } from '../../../core/services/api.service';
import { emailValidator, southAfricaPhoneValidator } from './email.validator';
import Swal from 'sweetalert2';
import { designation } from 'src/app/core/models/designation.model';
import { role } from 'src/app/core/models/role.model';
import { province } from 'src/app/core/models/province.model';
import { district } from 'src/app/core/models/district.model';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-register2',
  templateUrl: './register2.component.html',
  styleUrls: ['./register2.component.scss']
})
export class Register2Component {

  signupForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  successmsg: any = false;
  loading: boolean = false;
  staffForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  emailConflictMessage = '';
  clinicData: clinic[] = [];
  departmentData: department[] = [];
  designationData: designation[] = [];
  rolesData: role[] = [];
  provinceData: province[] = [];
  districtData: district[] = [];


  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,
    private userService: UserProfileService,
    private fb: FormBuilder,
    private StaffService: StaffService,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private clinicService: ClinicService,
    private ApiService: ApiService,
    private http: HttpClient,
    private spinner: NgxSpinnerService
  ) {
    this.staffForm = this.fb.group({
      fname: ['', [Validators.required]],
      lname: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, emailValidator()]],
      password: ['', [Validators.required]],
      // clinicId: ['', [Validators.required]],
      roleid: ['', []],
      desgid: ['', []],
      deptId: ['', []],
      dob: ['', []],
      doj: ['', []],
      maritalstatus: ['', []],
      province: ['', []],
      district: ['', []],
      subdistrict: ['', []],
      qualification: ['', []],
      sancno: ['', []],
      hpcsano: ['', []],
      contactno: ['', [Validators.required, southAfricaPhoneValidator]],
      profileimg: ['', []],
      address: ['', [Validators.required]],
      level: ['', []],
      added_by: ['', []],
      employmentStatus: ['', []],
      staffType: ['cadmin', []]
    });
  }
  year: number = new Date().getFullYear();

  ngOnInit(): void {
    this.fetchClinics();
    this.fetchdepartment();
    this.fetchdesignation();
    this.fetchroles();
    this.fetchprovince();
    this.fetchdistrict();
  }


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
    return this.staffForm.controls;
  }
  onSave() {
    this.submitted = true;

    if (this.staffForm.invalid) {
      console.log("save for");

      return;
    }

    this.loading = true;
    this.spinner.show();

    const clinicId = this.route.snapshot.paramMap.get('cid');

    const formData = {
      ...this.staffForm.value,
      clinicId: clinicId
    };


    this.StaffService.StaffRegister(formData).subscribe({
      next: () => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Staff Is Added',
          html: `
          <p>Your Staff has been successfully registered!</p>
          <p>The Super Admin will verify and activate it soon.</p>
          <p>You will receive an email with the URL to proceed with login.</p>
        `,
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-wide'
          },
          allowOutsideClick: false,
        }).then(() => {
          window.close();
        });

        this.staffForm.reset();
        this.submitted = false;
        this.loading = false;
        this.spinner.hide();
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'An error occurred while registering the Staff. Please try again.';
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

  checkEmailAvailabilitystaff() {
    const email = this.staffForm.get('email')?.value;

    if (email) {
      this.StaffService.checkEmailAvailabilitystaff({ email: email }).subscribe({
        next: (response) => {
          this.zone.run(() => {
            this.emailConflictMessage = '';
          });
        },
        error: (err) => {
          this.zone.run(() => {
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


  fetchClinics(): void {
    const clinicId = this.route.snapshot.paramMap.get('cid');
    if (clinicId) {
      this.clinicService.getClinicById(clinicId).subscribe({
        next: (clinic) => {
          this.clinicData = [clinic];
        },
        error: (err) => {
          console.error('Error fetching clinic:', err);
          this.clinicData = [];
        }
      });
    }
  }


  fetchdepartment(): void {
    this.ApiService.getdepartment().subscribe((response: any) => {
      this.departmentData = response.departments;
      console.log(this.departmentData);
    });
  }

  fetchdesignation(): void {
    this.ApiService.getdesignations().subscribe((response: any) => {
      this.designationData = response.designations;
      console.log(this.designationData);
    });
  }

  fetchroles(): void {
    this.ApiService.getroles().subscribe((response: any) => {
      this.rolesData = response.roles;
      console.log(this.rolesData);
    });
  }

  fetchprovince(): void {
    this.ApiService.getprovince().subscribe((response: any) => {
      this.provinceData = response.province;
      console.log(this.provinceData);
    });
  }

  fetchdistrict(): void {
    this.ApiService.getdistrict().subscribe((response: any) => {
      this.districtData = response.district;
      console.log(this.districtData);
    });
  }

}
