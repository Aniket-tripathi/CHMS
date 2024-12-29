import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PatientService } from '../../../core/services/patient.service';
import { ClinicService } from '../../../core/services/clinic.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { clinic, ClinicResponse } from '../../../core/models/clinic.models';
import { patient, PatientResponse } from '../../../core/models/patient.models';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss'],
})
export class AddPatientComponent implements OnInit {
  // Insert Key
  patientForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  clinicData: Array<{ clinicid: number; clinicname: string }> = [];
  totalClinics: number = 0;
  mpiNo: string = '';
  code: string = '';
  classifications: any[] = [];
  age: number | string = '';
  dob: string = '';
  gender: string = '';
  medicalfund: string = '';
  medicalfundname: string = '';
  medicalfundno: string = '';
  pemployed: string = '';
  pnextofkin: string = '';
  iderror: string = '';
  Nationality: string = '';
  showIdNumberDiv: boolean = true;
  showpassportNumberDiv: boolean = false;
  showexpdtDiv: boolean = false;
  medfundDiv1: boolean = false;
  medfun: string = '';
  medfundDiv2: boolean = false;
  employdiv: boolean = false;
  checkempstatus: string = '';
  nextkeentatus: string = '';
  nextofkeendiv: boolean = false;
  // router: any;
  form: any;
  cid : string;
  checkrole : string;



 
  // Inject HttpClient and ClinicService into the constructor
  constructor(
    private clinicService: ClinicService,
    private http: HttpClient,
    private fb: FormBuilder,
    private patientService: PatientService,
    private router:Router,
  ) {
    this.patientForm = this.fb.group({
      clinicid: ['', [Validators.required]],
      patient_category: ['', [Validators.required]],
      mpino: ['', []],
      fileno: ['', [Validators.required]],
      classification: ['', []],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      nationality: ['', [Validators.required]],
      idnumber: ['', []],
      dob: ['', []],
      patientclassification: ['',[]],
      title: ['', [Validators.required]], 
      agep: ['', []],
      gender: ['', [Validators.required]],
      religion: ['', []],
      maritalstatus: ['', []],
      citizenship: ['', [Validators.required]],
      language: ['', [Validators.required]],
      race: ['', [Validators.required]],
      patientpno: ['', []],
      patientemail: ['', []],
      medicalfund: ['', []],
      medicalfundname: ['', []],
      medicalfundno: ['', []],
      bill_address: ['', []],
      bill_suburd: ['', []],
      bill_city: ['', []],
      bill_areacode: ['', []],
      bill_region: ['', []],
      bill_ward: ['', []],
      patientextra: ['', []],
      pemployed: ['', []],
      pnextofkin: ['', []],
      pempstatus: ['', []],
      pemployer: ['', []],
      pempaddress: ['', []],
      pempcountry: ['', []],
      pempprovince: ['', []],
      pempsuburb: ['', []],
      pempcity: ['', []],
      pempcode: ['', []],
      pempcontact: ['', []],
      pempemail: ['', []],
      kin_detail: this.fb.array([]),
    });
  }
  baseUrl = environment.firebaseConfig.apiKey;

  get kinDetail(): FormArray {
    return this.patientForm.get('kin_detail') as FormArray;
  }
  get f() {
    return this.patientForm.controls;
  }

  onSubmit() {
    this.submitted = true;
  
    if (this.patientForm.invalid) {
      this.errorMessage = 'Validation errors exist. Please correct them.';
      return;
    }
  
    const formData = {
      ...this.patientForm.value,
      kin_detail: JSON.stringify(this.patientForm.value.kin_detail),
    };
    if (formData.firstname && formData.lastname) {
      formData.fullname = `${formData.firstname} ${formData.lastname}`;
    }
    if (formData.dob) {
      const dob = new Date(formData.dob);
      const currentDate = new Date();
      let age = currentDate.getFullYear() - dob.getFullYear();
      const monthDifference = currentDate.getMonth() - dob.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < dob.getDate())) {
        age--;
      }
      formData.agep = age.toString();
    }
    const localuserData = JSON.parse(localStorage.getItem('currentUser'));
    const currentDate = new Date();
    formData.addate = currentDate.toISOString().split('T')[0];
    const southAfricaTime = new Date(
      currentDate.toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })
    );
    const hours = southAfricaTime.getHours().toString().padStart(2, '0');
    const minutes = southAfricaTime.getMinutes().toString().padStart(2, '0');
    const seconds = southAfricaTime.getSeconds().toString().padStart(2, '0');
    formData.addtime = `${hours}:${minutes}:${seconds}`;
    formData.status = `Active`;
    const stype = localuserData.user.user.staffType;
    const roles = localuserData.user.user.role;
    const userid = localuserData.user.user.id;
    if(roles == 'superadmin'){
      formData.added_by = roles;
    }else{
      formData.added_by = stype;
    }
    formData.added_userid = userid;
  
    this.patientService.Patientregistration(formData).subscribe({
      next: (response: any) => {
        const mpi = response.mpi;
        const id = response.id;
  
        Swal.fire({
          title: 'Patient registered successfully!',
          html: `
            <p>Your Mpi number is: <strong id="mpino">${mpi}</strong></p>
            <button class="swal2-confirm swal2-styled" id="copyButton" style="background-color: #3085d6; color: white; margin-right: 10px;">
              <i class="fas fa-copy"></i> Copy to Clipboard
            </button>
            <button class="swal2-confirm swal2-styled" id="addVisitButton" style="background-color: #28a745; color: white; margin-right: 10px;">
              Add Visit
            </button>
          `,
          icon: 'success',
          showConfirmButton: true,
          confirmButtonText: 'OK',
          didRender: () => {
            // Add click event listener for "Copy to Clipboard"
            const copyButton = document.getElementById('copyButton');
            copyButton?.addEventListener('click', () => {
              const mpinoElement = document.getElementById('mpino');
              if (mpinoElement) {
                const range = document.createRange();
                range.selectNode(mpinoElement);
                window.getSelection()?.removeAllRanges();
                window.getSelection()?.addRange(range);
  
                try {
                  document.execCommand('copy');
                  Swal.fire({
                    icon: 'success',
                    title: 'Copied!',
                    text: 'Mpi number copied to clipboard.',
                    timer: 1500,
                    showConfirmButton: false,
                  }).then(() => {
                    this.router.navigate(['/patient/list']);
                  });
                } catch (err) {
                  console.error('Failed to copy Mpi number:', err);
                }
  
                window.getSelection()?.removeAllRanges();
              }
            });
  
            // Add click event listener for "Add Visit"
            const addVisitButton = document.getElementById('addVisitButton');
            addVisitButton?.addEventListener('click', () => {
              Swal.close(); // Close the Swal modal
              this.router.navigate(['/visit/add/', id]); // Navigate to the Add Visit page
            });
          },
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/patient/list']);
          }
        });
  
        this.successMessage = `Patient registered successfully! Your Mpi number is: ${mpi}`;
        this.patientForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while registering the Patient. Please try again.';
        console.error(err);
      },
    });
  }
  
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
      this.getmpi(clinicid);
    }
    this.startWebcam();
  }

  // fetchClinics(): void {
  //   this.clinicService.getClinics().pipe(
  //     map((response) => response.clinics.map((clinic: any) => ({
  //       clinicid: clinic.clinicid,
  //       clinicname: clinic.clinicname
  //     })))
  //   ).subscribe({
  //     next: (mappedClinics) => {
  //       this.clinicData = mappedClinics;
  //       this.totalClinics = this.clinicData.length;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching clinics:', err);
  //     }
  //   });
  // }
  fetchClinics(): void {
    this.clinicService.getClinics().pipe(
      map((response: ClinicResponse) => {
        this.clinicData = response.clinics;
      })
    ).subscribe();
  }


  getmpi(clinicId: string): void {
    const selectedClinicId = clinicId;
    
    if (!selectedClinicId) {
      console.log('No clinic selected');
      return;
    }

    this.http.get<{ mpi: string, code: string, classifications: any[] }>(`${this.baseUrl}getmpino/${selectedClinicId}`)
      .subscribe(
        response => {
          console.log('Generated MPI:', response.mpi);
          console.log('Clinic Code:', response.code);
          console.log('Classifications:', response.classifications);

          this.mpiNo = response.mpi;
          this.code = response.code;
          this.classifications = response.classifications;
          const codeElement = document.getElementById('ccode') as HTMLElement;
          if (codeElement) {
            codeElement.innerHTML = this.code;
          }
        },
        error => {
          console.error('Error generating MPI:', error);
        }
      );
  }

  getAge(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (input) {
      const dob = new Date(input);
      const today = new Date();
      let calculatedAge = today.getFullYear() - dob.getFullYear();
      const monthDifference = today.getMonth() - dob.getMonth();
      const dayDifference = today.getDate() - dob.getDate();

      if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        calculatedAge--;
      }
      this.age = calculatedAge >= 0 ? calculatedAge : 'Invalid Date';
    } else {
      this.age = 'Invalid Date';
    }
  }

  getDob(event: Event): void {
    const idNumberInput = (event.target as HTMLInputElement).value.trim();

    // Validate ID number length and type
    if (idNumberInput.length !== 13 || isNaN(Number(idNumberInput))) {
      this.dob = '';
      this.gender = '';
      this.iderror = 'Invalid South African ID number';
      return; // Stop further execution
    }

    // Extract date components from ID number
    const year = idNumberInput.substring(0, 2);
    const month = idNumberInput.substring(2, 4);
    const day = idNumberInput.substring(4, 6);

    // Determine full year
    const fullYear = Number(year) > 22 ? `19${year}` : `20${year}`;
    const dob = `${fullYear}-${month}-${day}`;
    const date = new Date(dob);

    // Validate date correctness
    if (
      date.getFullYear() !== Number(fullYear) ||
      date.getMonth() + 1 !== Number(month) ||
      date.getDate() !== Number(day)
    ) {
      this.dob = '';
      this.gender = '';
      this.iderror = 'Invalid ID number';
      return; // Stop further execution
    }

    // Determine gender from ID number
    const genderCode = Number(idNumberInput.substring(6, 10));
    this.gender = genderCode >= 5000 ? 'Male' : 'Female';

    // Assign dob and clear error
    this.dob = dob;
    this.iderror = '';

    // this.getAge(event);
  }
  checknationality(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.Nationality = input;
    this.showIdNumberDiv = this.Nationality == 'south-african';
    this.showpassportNumberDiv = this.Nationality == 'Non-South African';
    this.showexpdtDiv = this.Nationality == 'Non-South African';
  }

  checkmedfund(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.medfun = input;
    this.medfundDiv1 = this.medfun == 'Yes';
    this.medfundDiv2 = this.medfun == 'Yes';
  }

  toggleEmp(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.checkempstatus = isChecked ? 'Yes' : 'No';
    this.employdiv = isChecked;
    this.form.get('pemployed')?.setValue(this.checkempstatus); // Update the form control value
  }


  checkemp(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.checkempstatus = input;
    this.employdiv = this.checkempstatus == 'Yes';
  }

  toggleNextOfKin(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.nextkeentatus = isChecked ? 'Yes' : 'No';
    this.nextofkeendiv = isChecked; // Show or hide next of kin section
    this.form.get('pnextofkin')?.setValue(this.nextkeentatus); // Update form control value
  }

  checknextkeen(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.nextkeentatus = input;
    // alert(this.nextkeentatus)
    this.nextofkeendiv = this.nextkeentatus == 'Yes';
  }
  nextOfKinSections = [
    { id: 1 }
  ];

  addNextOfKin() {
    const newId = this.nextOfKinSections.length + 1;
    this.nextOfKinSections.push({ id: newId });
    const nextOfKinGroup = this.fb.group({
      relationship: ['', Validators.required],
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      country: ['', Validators.required],
      province: ['', Validators.required],
      city: ['', Validators.required],
      sub_region: ['', Validators.required],
      address: ['', Validators.required],
      area_code: ['', Validators.required],
      contact_number: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
    this.kinDetail.push(nextOfKinGroup);
  }

  removeNextOfKin(index: number) {
    if (this.nextOfKinSections.length > 1) {
      this.nextOfKinSections.splice(index, 1);
      this.kinDetail.removeAt(index);
    }
  }


  hasDependants = false;
  dependants = [
    {
      name: '',
      surname: '',
      idNumber: '',
      age: null,
      relationship: '',
      dependantCode: '',
    },
  ];
  relationships = ['Parent', 'Sibling', 'Child', 'Spouse'];

  addRow() {
    this.dependants.push({
      name: '',
      surname: '',
      idNumber: '',
      age: null,
      relationship: '',
      dependantCode: '',
    });
  }

  removeRow(index: number) {
    this.dependants.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Signature Pad
  @ViewChild('signatureCanvas2') signatureCanvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX: number = 0;
  private lastY: number = 0;

  ngAfterViewInit() {
    const canvas = this.signatureCanvas.nativeElement;
    if (canvas) {
      this.ctx = canvas.getContext('2d');
      this.ctx.strokeStyle = '#000000';  // Color of the signature
      this.ctx.lineWidth = 2;            // Width of the signature line
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
    }
  }

  onMouseDown(event: MouseEvent) {
    this.isDrawing = true;
    this.lastX = event.offsetX;
    this.lastY = event.offsetY;
  }

  // Draw the signature
  onMouseMove(event: MouseEvent) {
    if (!this.isDrawing || !this.ctx) return; // Ensure ctx is defined

    const currentX = event.offsetX;
    const currentY = event.offsetY;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();

    this.lastX = currentX;
    this.lastY = currentY;
  }

  // Stop drawing
  onMouseUp() {
    this.isDrawing = false;
  }

  clearSignature() {
    const canvas = this.signatureCanvas.nativeElement;
    if (this.ctx && canvas) {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }



  saveSignature() {
    const canvas = this.signatureCanvas.nativeElement;
    if (canvas) {
      const uniqueFilename = `${Date.now()}.jpeg`;
      const dataURL = canvas.toDataURL('image/jpeg');
      const base64Image = dataURL.replace(/^data:image\/jpeg;base64,/, '');
      console.log('Signature saved:', uniqueFilename);
      this.http.post(`${this.baseUrl}saveSignature`, { image: base64Image, filename: uniqueFilename })
        .subscribe(response => {
          console.log('Image saved successfully:', response);
          const filenameInput = document.getElementById('signatureFilename') as HTMLInputElement;
          if (filenameInput) {
            filenameInput.value = uniqueFilename;
          }
          // Show the saved image
          const imgElement = new Image();
          imgElement.src = 'data:image/jpeg;base64,' + base64Image;
          document.body.appendChild(imgElement);
        }, error => {
          console.error('Error saving image:', error);
        });
    }
  }





  // FIle Selected
  selectedFiles: File[] = [];

  // Method to handle file selection
  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    this.selectedFiles = Array.from(files); // Convert FileList to an array
  }

  // Webcame

  @ViewChild('webcam') webcam: any;
  @ViewChild('capturedImagePreview') capturedImagePreview: any;
  @ViewChild('capturedImage') capturedImage: any;



  // Start the webcam and display the stream in the video element
  startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        // Set the webcam stream as the source for the video element
        this.webcam.nativeElement.srcObject = stream;
      })
      .catch((err) => {
        console.error("Error accessing webcam: ", err);
      });
  }

  captureImage() {
    const videoElement = this.webcam.nativeElement;
    const canvas = this.capturedImage.nativeElement;
    const ctx = canvas.getContext('2d');

    // Set the canvas size to match the video element
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw the current video frame on the canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a data URL (base64 encoded image)
    const dataUrl = canvas.toDataURL('image/png');

    // Set the captured image preview
    this.capturedImagePreview.nativeElement.src = dataUrl;
    this.capturedImagePreview.nativeElement.style.display = 'block';

    // Generate a filename based on the current timestamp
    const filename = `${Date.now()}.png`;

    // Upload the image to the server
    this.uploadImage(dataUrl, filename);
  }

  uploadImage(base64Image: string, filename: string) {
    this.http.post<{ uniqueFilename: string }>(`${this.baseUrl}saveWebcam`, {
      image: base64Image, filename
    })
      .subscribe(response => {
        console.log('Image saved successfully:', response);

        const filenameInput = document.getElementById('webcameFilename') as HTMLInputElement;
        if (filenameInput) {
          filenameInput.value = response.uniqueFilename;
        }
        const imgElement = new Image();
        imgElement.src = `uploads/webcam/${response.uniqueFilename}`;
        document.body.appendChild(imgElement);
      }, error => {
        console.error('Error saving image:', error);
      });
  }






}

