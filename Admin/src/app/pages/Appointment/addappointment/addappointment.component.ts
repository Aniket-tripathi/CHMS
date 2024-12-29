import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { clinic, ClinicResponse } from '../../../core/models/clinic.models';
import { ClinicService } from '../../../core/services/clinic.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { ApiService } from '../../../core/services/api.service';
import { PatientService } from '../../../core/services/patient.service';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';




// declare var bootstrap: any;

@Component({
  selector: 'app-addappointment',
  templateUrl: './addappointment.component.html',
  styleUrls: ['./addappointment.component.scss']
})
export class AddappointmentComponent implements OnInit {


  breadCrumbItems: Array<{}>;
  appointmentForm: FormGroup; // Form group for appointment form
  submitted = false; // Form submission state
  isRegistered = true; // Tracks if "Registered" patient type is selected
  clinicData: clinic[] = []; // Clinic data fetched from the API

  mpinoList: {}[] = [];
  minDate: string;
  errorMessage = '';


  availableSlots = [];  // Available slots for the selected clinic and date
  showSlotclinicWarning = false;  // To show the warning message
  showSlotdateWarning = false;  // To show the warning message
  clinicId: any;  // Store selected clinic ID
  appointment_date: any;
  apnt_clinicid: any;
  appointmentReasons: any[] = [];

  selectedReason: any = null;
  selectedIconIndexes: { [reasonId: string]: number[] } = {}; // To track selected (red) icons for each reason
  greenIconCounts: { [reasonId: string]: number } = {}; // To track green icon counts for each reason
  message: string = '';
  overallSelectedCount: number;
  selectedIconIndex: number;
  slotmessage: string;
  selectedClinicName: string;
  ptnmpino: string;
  selectedReasonname: any;
  cid: any;
  checkrole: any;








  constructor(private clinicService: ClinicService,
    private fb: FormBuilder,
    private http: HttpClient,
    private ApiService: ApiService,
    private router: Router,
    private patientService: PatientService,
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef) {

    this.appointmentForm = this.fb.group({
      patientType: ['', Validators.required],
      apnt_clinicid: ['', Validators.required],
      patient_mpi: ['', []], // Validators dynamically set
      patient_dob: ['', Validators.required],
      app_nationality: ['', []],
      patient_idno: ['', [Validators.maxLength(13), Validators.pattern(/^\d{13}$/)]], // Validators dynamically set
      appointment_date: ['', Validators.required],
      appointment_time: ['', Validators.required],
      gender: ['', Validators.required],
      apnt_type: ['', Validators.required],
      patient_name: ['', Validators.required],
      email: ['', Validators.required],
      mobileno: ['', Validators.required],
      notes: ['', []],
      apnt_reminder: ['', []],
      selected_ap_reasonid: ['', [Validators.required]],
      apnt_reason_name: ['', [Validators.required]],

      selected_cwhid: ['', []],
      selected_clinicsch_id: ['', []],
      app_passport: ['', []],
      
      // Validators dynamically set
    });

    
    // Set the minimum date to today in the format DD-MM-YYYY
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];



    // Listen for changes in the ID number field
    this.appointmentForm.get('patient_idno')?.valueChanges.subscribe((idNumber) => {
      if (this.appointmentForm.get('app_nationality')?.value === 'South African') {
        this.validateIdNumber(idNumber);
      }
    });

  }




  // Function to set DOB from South African ID number
  // Function to validate the ID number
  validateIdNumber(idNumber: string): void {
    const idField = this.appointmentForm.get('patient_idno');
    const dobField = this.appointmentForm.get('patient_dob');

    if (idNumber.length === 13) {
      const year = parseInt(idNumber.substring(0, 2), 10);
      const month = parseInt(idNumber.substring(2, 4), 10) - 1; // JS months are 0-based
      const day = parseInt(idNumber.substring(4, 6), 10);

      // Determine full year based on the first two digits
      const fullYear = year > 23 ? 1900 + year : 2000 + year;

      // Create a date using UTC to avoid timezone issues
      const date = new Date(Date.UTC(fullYear, month, day));

      // Validate the date
      if (
        date.getUTCFullYear() === fullYear &&
        date.getUTCMonth() === month &&
        date.getUTCDate() === day
      ) {
        // Set the date in 'YYYY-MM-DD' format
        const formattedDate = `${date.getUTCFullYear()}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dobField?.setValue(formattedDate); // Set the validated DOB
        idField?.setErrors(null); // Clear any errors
      } else {
        dobField?.reset(); // Reset DOB if invalid
        idField?.setErrors({ invalidId: true }); // Set error on invalid ID
      }
    } else {
      dobField?.reset(); // Reset DOB for invalid ID length
      idField?.setErrors({ invalidId: true }); // Set error for invalid ID
    }
  }


  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Appointment' }, { label: 'Add', active: true }];
    this.fetchClinics();
    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    const userid = localuserData.user.user.id;
    const clinicid = localuserData.user.user.clinicId;
    const role = localuserData.user.user.role;
    const stafftype = localuserData.user.user.staffType;
    
    this.cid = clinicid;
    this.checkrole = role;


    if (role == "superadmin") {
      
    } else {
     
    }
    // Default selection for patientType
    this.appointmentForm.controls['patientType'].setValue('Registered');
    this.toggleFields();
    this.updateFieldValidations();

    // Watch for changes in 'patientType' and 'app_nationality'
    this.appointmentForm.get('patientType')?.valueChanges.subscribe(() => {
      this.updateFieldValidations();
    });
    this.appointmentForm.get('app_nationality')?.valueChanges.subscribe(() => {
      this.updateFieldValidations();
    });


    //PASSPORT VALIDATION
    this.updatePassportValidation();

    // Watch for changes in `app_nationality`
    this.appointmentForm.get('app_nationality')?.valueChanges.subscribe(() => {
      this.updatePassportValidation();
    });


  }



  updateFieldValidations(): void {
    const patientType = this.appointmentForm.get('patientType')?.value;
    const appNationality = this.appointmentForm.get('app_nationality')?.value;

    // Reset validators for all dynamic fields
    this.appointmentForm.get('patient_mpi')?.clearValidators();
    this.appointmentForm.get('patient_idno')?.clearValidators();
    this.appointmentForm.get('app_passport')?.clearValidators();

    if (patientType === 'Registered') {
      // Registered: `patient_mpi` is required
      this.appointmentForm.get('patient_mpi')?.setValidators([Validators.required]);
    } else if (patientType === 'Unregistered' && appNationality == 'South African') {
      // Unregistered: `patient_idno` is required
      this.appointmentForm.get('patient_idno')?.setValidators([
        Validators.required,
        Validators.maxLength(13),
        Validators.pattern(/^\d{13}$/)
      ]);

      // Unregistered and non-South African: `app_passport` is required
      if (appNationality !== 'South African') {
        this.appointmentForm.get('app_passport')?.setValidators([Validators.required]);
      }
    }

    // Update validity of the form controls
    this.appointmentForm.get('patient_mpi')?.updateValueAndValidity();
    this.appointmentForm.get('patient_idno')?.updateValueAndValidity();
    this.appointmentForm.get('app_passport')?.updateValueAndValidity();
  }



  updatePassportValidation(): void {
    const appNationality = this.appointmentForm.get('app_nationality')?.value;

    // Reset validators for the passport field
    this.appointmentForm.get('app_passport')?.clearValidators();

    if (appNationality === 'Non-South African') {
      // If nationality is Non-South African, passport is required
      this.appointmentForm.get('app_passport')?.setValidators([
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9]+$/) // Example: Alphanumeric
      ]);
    }

    // Update the validity of the passport field
    this.appointmentForm.get('app_passport')?.updateValueAndValidity();
  }

  toggleFields(): void {
    const patientType = this.appointmentForm.get('patientType')?.value;
    const nationality = this.appointmentForm.get('app_nationality')?.value;
    // alert(nationality);
    this.isRegistered = patientType === 'Registered'; // Check if "Registered"

    if (this.isRegistered) {
      // Reset fields unrelated to Registered patients
      this.appointmentForm.get('app_nationality')?.setValue('South African');
      this.appointmentForm.get('patient_idno')?.reset();
      this.appointmentForm.get('app_passport')?.reset();
      this.appointmentForm.get('patient_dob')?.reset();
    } else {

      this.appointmentForm.get('patient_name')?.reset();
      this.appointmentForm.get('email')?.reset();

      this.appointmentForm.get('mobileno')?.reset();
      this.appointmentForm.get('gender')?.reset();

      this.appointmentForm.get('patient_dob')?.reset();


    }
  }



  get f() {
    return this.appointmentForm.controls; // Shortcut for form controls
  }

  clearFields(): void {

    const nationality = this.appointmentForm.get('app_nationality')?.value;
    if (nationality === 'South African') {
      // Show ID Number, hide Passport
      this.appointmentForm.get('app_passport')?.reset();
    } else if (nationality === 'Non-South African') {
      // Show Passport, hide ID Number and DOB

      this.appointmentForm.get('patient_idno')?.reset();
      this.appointmentForm.get('patient_dob')?.reset();
    }
  }





  fetchClinics(): void {
    this.clinicService.getClinics().pipe(
      map((response: ClinicResponse) => {
        this.clinicData = response.clinics;
      })
    ).subscribe();
  }


  onClinicChangeAndGetptn(event: any) {
    // Call both functions
    this.onClinicChange(event);  // Handle clinic change logic
    this.getptn(event);          // Call getptn function for your specific logic
  }

  getptn(event: Event): void {
    const clinicId = (event.target as HTMLSelectElement).value;
    const clinicIdNumber = Number(clinicId);

    // Check if clinicId is selected and valid
    if (!clinicId || isNaN(clinicIdNumber)) {
      console.log('No valid clinic selected');
      this.mpinoList = [];  // Clear the list when no clinic is selected
      this.message = 'Please select a clinic to view patients.';  // Message when no clinic is selected
      return;
    }

    this.patientService.getPtn(clinicIdNumber).subscribe(
      (response) => {
        console.log('Patient details:', response);

        // If no patients are found for the selected clinic
        if (response.patients && response.patients.length > 0) {
          this.mpinoList = response.patients.map((patient: any) => ({
            patientregid: patient.patientregid,
            mpino: patient.mpino
          }));
          this.message = '';  // Clear message if patients are found
        } else {
          // If no patients are found for the selected clinic
          this.mpinoList = [];
          this.message = response.message || 'No patients found for the selected clinic.'; // Display the message from the response
          // Set the form fields to null if no patient is found
          this.appointmentForm.patchValue({
            patient_name: null,
            email: null,
            mobileno: null,
            gender: null,
            patient_dob: null
          });

        }
      },
      (error) => {
        // Handle any technical error (e.g., server or network issue)
        console.error('Error fetching patient details:', error);
        this.message = 'An error occurred while fetching patient details.';
      }
    );
  }




  // On clinic selection change to get time slot 
  onClinicChange(event: any) {
    this.clinicId = event.target.value;

    const selectElement = event.target as HTMLSelectElement;
    const selectedOptionText = selectElement.options[selectElement.selectedIndex].text;
    this.selectedClinicName = selectedOptionText; // Store selected clinic name

    if (this.clinicId && this.appointment_date) {
      this.getAvailableSlots(this.clinicId, this.appointment_date);
    }


  }



  // On appointment date selection change
  onDateChange() {
    this.appointment_date = this.appointmentForm.value.appointment_date;
    if (this.clinicId && this.appointment_date) {
      this.getAvailableSlots(this.clinicId, this.appointment_date);
    }
  }

  // API call to fetch available time slots
  getAvailableSlots(clinicId, appointment_date) {
    this.showSlotclinicWarning = false;
    this.showSlotdateWarning = false;
    // alert(this.appointment_date);

    const formattedDate = this.formatDateForApi(this.appointment_date);

    // Replace with your actual API endpoint
    this.ApiService.getAvailableSlots(clinicId, formattedDate).subscribe(
      (response: any) => {
        if (response.success) {
          this.availableSlots = response.data;
        } else {
          this.availableSlots = [];

        }
      },
      (error) => {
        console.error('Error fetching time slots:', error);
        this.availableSlots = [];
      }
    );
  }


  // Function to format the date in 'dd-MM-yyyy' format
  formatDateForApi(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`; // Adjust as per your backend's expected date format
  }






  // On focus of the appointmentSlot input
  onSlotFocus() {
    if (!this.clinicId) {
      // alert();
      this.showSlotclinicWarning = true;
    } else {
      this.showSlotclinicWarning = false;
    }
    if (!this.appointment_date) {
      this.showSlotdateWarning = true;
    } else {
      this.showSlotdateWarning = false;
    }
  }

  //on slot change get appointment reason
  onSlotChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      const [cwhfrom, cwhto] = selectedValue.split('-');
      console.log('Selected cwhfrom:', cwhfrom);
      console.log('Selected cwhto:', cwhto);

      const formattedDate = this.formatDateForApi(this.appointment_date);
      console.log('Formatted Date:', formattedDate);  // Add this log

      this.ApiService.getScheduleReason(this.clinicId, formattedDate, cwhfrom, cwhto).subscribe(
        (response: any) => {
          console.log('API Response:', response);  // Add this log to inspect the API response
          if (response.success) {
            // alert(response.data.workingHoursdiag);
            this.appointmentReasons = response.data.workingHoursdiag;
          } else {
            this.appointmentReasons = [];
          }
        },
        (error) => {
          console.error('Error fetching appointment reasons:', error);
          this.appointmentReasons = [];
        }
      );
    } else {
      console.log('No slot selected');
      this.appointmentReasons = [];
    }
  }




  //get patient details


  getmpidetails(event: Event): void {
    const ptnId = (event.target as HTMLSelectElement).value;
    const selectElement = event.target as HTMLSelectElement;
    const selectedOptionText = selectElement.options[selectElement.selectedIndex].text;
    this.ptnmpino = selectedOptionText;
    // ptnId is a string here
    const ptnIdNumber = Number(ptnId); // Convert to number

    if (!ptnId || isNaN(ptnIdNumber)) {
      console.log('No valid Mpi selected');
      return;
    }

    this.patientService.getPatientById(ptnIdNumber).subscribe(
      (response) => {
        const flname = (response.patients as any)?.fullname;
        const ttle = (response.patients as any)?.title;
        const email = (response.patients as any)?.patientemail;
        const contact = (response.patients as any)?.patientpno;
        const gender = (response.patients as any)?.gender;
        const dob = (response.patients as any)?.dob; // Assuming dob is in DD-MM-YYYY format
        const formattedDob = this.formatDateToISO(dob);
        // alert(dob);




        if (flname && ttle) {
          const patientName = `${ttle} ${flname}`;
          this.appointmentForm.patchValue({
            patient_name: patientName,
            email: email,
            mobileno: contact,
            gender: gender,
            patient_dob: formattedDob,
          });
        } else {
          console.error('Incomplete patient details');
        }
      },
      (error) => {
        console.error('Error fetching patient details:', error);
      }
    );
  }


  private formatDateToISO(date: string): string | null {
    if (!date) return null;

    const [day, month, year] = date.split('-');
    if (!day || !month || !year) return null;

    return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
  }




  // Method to handle the diagnosis click event
  onDiagnosisClick(reason: any) {
    if (this.selectedReason?.ap_reasonid === reason.ap_reasonid) {
      // Collapse if clicked again
      this.selectedReason = null;
      // Reset selected icon indexes (clear the previous selections)
      this.selectedIconIndexes[reason.ap_reasonid] = [];
    } else {
      // Set the new reason as selected
      this.selectedReason = reason;

      // Keep the previously selected icons red (based on the hidden values)
      if (this.selectedReason && this.selectedReason.ap_reasonid === reason.ap_reasonid) {
        this.selectedIconIndexes[reason.ap_reasonid] = this.selectedIconIndexes[reason.ap_reasonid] || [];
      }
    }

    // Update hidden fields for the new reason
    // this.updateHiddenFields(reason);
  }





  // Method to update hidden fields dynamically
  updateHiddenFields(selectedReason: any): void {
    // Update the hidden form values with the selected diagnosis reason
    this.appointmentForm.patchValue({
      selected_ap_reasonid: selectedReason?.ap_reasonid || '',
      apnt_reason_name:selectedReason?.ap_reason_name || '',
      selected_cwhid: selectedReason?.workingHours[0]?.cwhid || '',
      selected_clinicsch_id: selectedReason?.workingHours[0]?.clinic_sch_id || ''
    });

    // Reset all icons to green before marking the selected one red
    for (const reasonId in this.selectedIconIndexes) {
      if (this.selectedIconIndexes.hasOwnProperty(reasonId)) {
        this.selectedIconIndexes[reasonId] = [];  // Reset all previously selected icons to green
      }
    }

    // Mark the selected icon red for the new reason
    this.selectedIconIndexes[selectedReason?.ap_reasonid] = [this.selectedIconIndex];  // Store the current icon index for this reason

    // Ensure the icons remain red based on the selected icon state
    this.selectedIconIndexes[selectedReason?.ap_reasonid]?.forEach((index: number) => {
      const iconElement = document.querySelector(`#icon-${selectedReason.ap_reasonid}-${index}`);
      if (iconElement) {
        iconElement.classList.add('text-danger'); // Make sure it's red
      }
    });
  }






  /**
   * Change color or other logic when an icon is clicked.
   */


  // Method to handle the change in icon color
  changeColor(index: number, reason: any, noOfAppointments: number | undefined, _cwhid: any) {
    const reasonId = reason.ap_reasonid;

    // Initialize the reason if not already initialized
    if (!this.selectedIconIndexes[reasonId]) {
      this.selectedIconIndexes[reasonId] = [];
    }

    // If the icon is already red (selected), deselect it (i.e., turn it back to green)
    if (this.selectedIconIndexes[reasonId].includes(index)) {
      this.selectedIconIndexes[reasonId] = this.selectedIconIndexes[reasonId].filter((i) => i !== index);
    } else {
      // Reset all icons to green first (clear previous red selections)
      this.selectedIconIndexes[reasonId] = [];
      // Select the new icon (make it red)
      this.selectedIconIndexes[reasonId].push(index);
    }

    // Update the selected reason and display message
    this.selectedReason = reason;
    this.selectedReasonname = reason.ap_reason_name;

    this.selectedIconIndex = index;
    this.slotmessage = `You have Book ${this.selectedIconIndexes[reasonId].length} Slot in "${reason.ap_reason_name}"`;

    // Now, store the selected icon index in the hidden fields (form values)
    this.updateHiddenFields(reason);
  }






  getRedIconCount(reason: any): number {
    return this.selectedIconIndexes[reason.ap_reasonid]?.length || 0;
  }

  getGreenIconCount(reason: any): number {
    const totalIcons = reason.workingHours?.[0]?.noofappointment || 0;
    return totalIcons - this.getRedIconCount(reason);
  }



  getIconsArray(reason: any): any[] {
    // Return an array with as many elements as the value of 'noofappointment'
    const appointmentCount = Number(reason.workingHours[0]?.noofappointment) || 0;
    return new Array(appointmentCount); // Creates an array of the required length
  }

  // convert date format d-m-y 

  convertDateFormat(date: string): string {
    if (!date) return '';

    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // months are zero-indexed
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`;
  }



  onSubmit() {
    this.submitted = true;
    console.log("Form submitted!");

    if (this.appointmentForm.invalid) {
      console.log("Form is invalid!");

      // Iterate over form controls to find errors
      Object.keys(this.appointmentForm.controls).forEach((key) => {
        const controlErrors = this.appointmentForm.get(key)?.errors;
        if (controlErrors) {
          console.log(`Validation failed for: ${key}`, controlErrors);
          // You can add a custom error message display logic here if needed
        }
      });

      return;
    }

    this.cdr.detectChanges();
    console.log('Form submitted:', this.appointmentForm.value);

    const formData = { ...this.appointmentForm.value };

    // Format the patient_dob field
    if (formData.patient_dob) {
      formData.patient_dob = this.convertDateFormat(formData.patient_dob);
    }

    if (formData.appointment_date) {
      formData.appointment_date = this.convertDateFormat(formData.appointment_date);
    }

    this.ApiService.addappointment(formData).subscribe({
      next: () => {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Success',
          text: 'Appointment Add successfully!',
          showConfirmButton: false,
          timer: 1500
        });

        // Navigate after the timer
        setTimeout(() => {
          this.router.navigate(['/appointment/list']);
        }, 1500); // Match the timer duration

        this.appointmentForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while taking the Appointment. Please try again.';
        console.error(err);
      }
    });

  }


}


