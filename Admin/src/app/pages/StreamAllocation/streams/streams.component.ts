
import { Component,  QueryList, ViewChild } from "@angular/core";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { ApiService } from '../../../core/services/api.service';

import { Router } from '@angular/router';

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { ClinicService } from '../../../core/services/clinic.service';
import { clinic, ClinicResponse } from '../../../core/models/clinic.models';
import { BehaviorSubject } from "rxjs";
import { classification } from 'src/app/core/models/classification.models' ;
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-streams',
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.scss']
})

export class  StreamsComponent {

  classification: FormGroup;
  editclassifctionForm : FormGroup ;
  modalRef?: BsModalRef; 
  name: any;
  submitted = false;
  isClinicNameDisabled: boolean = false;
  clinicData: clinic[] = [];
  classifications: any[] = [];
  errorMessage = '';
  isEditModalOpen: boolean = false;

  selectedFile: any;
  uploadedImageUrl: string | null = null;
  

  selectedclassification : Partial<classification> = {};
  filteredclassification$: BehaviorSubject<classification[]> = new BehaviorSubject<classification[]>([]);
  @ViewChild('closeButton') closeButton: any; 
  // Inject BsModalService in the constructor

  constructor( 

    private modalService: BsModalService,
    private apiService: ApiService,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient, 
    private clinicService: ClinicService,

  ) {

      // Initialize the validation
    this.classification = this.formBuilder.group({
      clinic_id: ['', Validators.required],
      classification: ['', Validators.required], 
      clfimg : ['', [Validators.required]],
      clfcolor : [''],
    });

  } 

    get f() {
    return this.classification.controls; 
    }

   // Method to open a centered modal
    centerModal(centerClassificationModal: any) {
    this.modalRef = this.modalService.show(centerClassificationModal);
    }

    ngOnInit(){ 
    this.fetchClinics();
    this.fetchclassification(); 

    }

     // dropdown 
     fetchClinics (): void {
     this.clinicService.getClinics().pipe(
      map((response: ClinicResponse) => {
        this.clinicData = response.clinics;

        console.log(this.clinicData);
      })
    ).subscribe();
     }

     baseUrl = environment.firebaseConfig.apiKey;

     //Form Insert
     onSubmit() {
   
const input = document.getElementById('image') as HTMLInputElement;

if (input.files && input.files.length > 0) {
  const file = input.files[0];
  
  // Prepare form data for upload
  const formData = new FormData();
  Object.keys(this.classification.value).forEach((key) => {
    formData.append(key, this.classification.value[key]);
  });
  if (this.selectedFile) {
    formData.append('clfimg', this.selectedFile);
  }
  // Call the API service to upload the image
  this.apiService.insertclssifiction(formData).subscribe({
    next: (response) => {
      console.log('inserted:', response);
      this.fetchclassification();
      const closeButton = document.getElementById('insertclosebtn');
      if (closeButton) {
        closeButton.click();
      }
      // Show success notification using Swal
      Swal.fire({
        icon: 'success',
        position: 'top-right',
        title: 'classification Inserted!',
        text: 'The classification details have been successfully inserted.',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true, 
      });
      // Ensure modal logic is properly handled
      this.closeEditModal();
    },
    error: (err) => {
      console.error('Error uploading image:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to upload the image. Please try again.',
      });
    },  
  });
}
}
 
onFileSelected(event: any): void {
  this.selectedFile = event.target.files[0];
}
    // Trigger the close button click event to close the modal
     triggerCloseButton(): void {
      if (this.closeButton) {
        this.closeButton.nativeElement.click();  // Trigger click event on the button
      }
     }
  
     fetchclassification() {
      this.apiService.getclassification().subscribe((response: any) => {
      this.classifications = response.classification; 
      // console.log(this.classifications);
     });
    } 
    // Open Edit Modal
     openEditModal(classification : classification) {
      this.selectedclassification = { ...classification };
      console.log( this.selectedclassification.classification);
      console.log( this.selectedclassification.clinic_id);

      this.isEditModalOpen = true; 

     }

     //close buttton 
     closeEditModal(){
      
     }


    // update modal
    onupdate() {
 
      if (this.selectedclassification.id) {
        // Make the API call to update the classification 

        this.apiService.updateclassification(this.selectedclassification.id, this.selectedclassification).subscribe({
          next: (response) => {
            console.log('Updated:', response);
            
            // Refresh the classifications list
            this.fetchclassification();
    
            // Trigger the modal close button if it exists
            const closeButton = document.getElementById('closeButton');
            if (closeButton) {
              closeButton.click();
            }
    
            // Show success notification using Swal
            Swal.fire({
              icon: 'success',
              position: 'top-right',
              title: 'classification Updated!',
              text: 'The classification details have been successfully updated.',
              showConfirmButton: false,
              timer: 1500, // Auto-close after 1500ms
              timerProgressBar: true, // Optional: Show timer progress bar
            });
    
            // Ensure modal logic is properly handled
            this.closeEditModal();
          },
          error: (err) => {
            console.error('Error updating :', err);
            // Show error notification
            Swal.fire('Error', 'Something went wrong while updating the classification.', 'error');
          },
        });
      }
    }

  // DELETE role
  deleteclassification(clsid: number) {
    if (!clsid) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid ID provided for deletion.",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this classification?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deletclassification(clsid).subscribe({
          next: (response: any) => {
            if (response && response.success) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: response.message || "classification deleted successfully!",
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                this.fetchclassification();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: response.message || "Failed to delete classification.",
              });
            }
          },
          error: (error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error.error?.message ||
                "An error occurred while deleting the classification.",
            });
          },
        });
      }
    });
  }
  
 
}

