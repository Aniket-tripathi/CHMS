import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { ClinicService } from '../../../core/services/clinic.service';
import { clinic, ClinicResponse } from '../../../core/models/clinic.models';
import { department } from 'src/app/core/models/department.model';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffService } from 'src/app/core/services/staff.service';
import { ApiService } from '../../../core/services/api.service';
import { emailValidator, southAfricaPhoneValidator } from '../../Clinic/addClinic/email.validator';
import Swal from 'sweetalert2';
import { designation } from 'src/app/core/models/designation.model';
import { role } from 'src/app/core/models/role.model';
import { province } from 'src/app/core/models/province.model';
import { district } from 'src/app/core/models/district.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-add-staff',
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.scss']
})
export class AddStaffComponent {
  loading: boolean = false;
  staffForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  emailConflictMessage = '';
  clinicData: clinic[] = [];
  departmentData: department[] = [];
  designationData: designation[] = [];
  rolesData: role[] = [];
  provinceData: province[] = [];
  districtData: district[] = [];


  ngOnInit(): void {
    this.fetchClinics();
    this.fetchdepartment();
    this.fetchdesignation();
    this.fetchroles();
    this.fetchprovince();
    this.fetchdistrict();
  }

  constructor(private fb: FormBuilder,
    private StaffService: StaffService,
    private router: Router,
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
      clinicId: ['', [Validators.required]],
      roleid: ['', [Validators.required]],
      desgid: ['', [Validators.required]],
      deptId: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      doj: ['', []],
      maritalstatus: ['', []],
      province: ['', []], //
      district: ['', []],//
      subdistrict: ['', []],//
      qualification: ['', []],
      sancno: ['', []],
      hpcsano: ['', []],
      contactno: ['', [Validators.required, southAfricaPhoneValidator]],
      profileimg: ['', []],
      address: ['', [Validators.required]],
      level: ['', []],//
      added_by: ['', []],
      employmentStatus: ['', []],
      staffType: ['cstaff', []]
    });
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

    const formData = { ...this.staffForm.value };

    this.StaffService.StaffRegister(formData).subscribe({
      next: () => {
        // Show SweetAlert
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Staff Is Added',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          // Navigate to the clinic list after Swal closes
          this.router.navigate(['/staff/list']);
        });

        // Reset form and variables
        this.staffForm.reset();
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
          this.errorMessage = 'An error occurred while registering the Staff. Please try again.';
        }
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
    this.clinicService.getClinics().pipe(
      map((response: ClinicResponse) => {
        this.clinicData = response.clinics;
      })
    ).subscribe();
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
