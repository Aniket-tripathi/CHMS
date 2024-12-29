import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { VitalResponse } from '../../../core/models/vital.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-vital-view',
  templateUrl: './vital-view.component.html',
  styleUrls: ['./vital-view.component.scss']
})
export class VitalViewComponent implements OnInit {
  vitalData!: VitalResponse; // Holds the fetched vital data
  badgebodyh: string = 'd-none'; // Default badge class for temperature validation
  outputbodyh: string = ''; // Default output text for temperature validation
  outputpulse: string;
  badgepulse: string;
  badgeBP: string;
  outputBP: string;
  badgeBW: string;
  outputBW: string;
  badgeBMI: any;
  outputBMI: any;
  outputpeakflow: string;
  badgepeakflow: string;
  outputresp: string;
  badgeresp: string;
badgeBG: string;
outputBG: string;

  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const vitalid = +this.route.snapshot.url[2].path; // Extract vital ID from the URL
    this.getVitalDetails(vitalid); // Fetch vital details
  }

  // Fetch vital details by ID and validate temperature
  getVitalDetails(id: number): void {
    this.patientService.getVitalById(id).pipe(
      map((response: VitalResponse) => {
        this.vitalData = response;
        this.validateTemperature();
        this.validatePulseRate();
        this.validateBloodPressure();
        this.validateBloodGlucose();
        this.validateBodyWeight();
        this.validateBMI();
        this.validatePeakFlow();
        this.validateRespirationRate();
      })
    ).subscribe();
  }

  // Validate temperature and assign badge class/output text
  validateTemperature(): void {
    const age = Number(this.vitalData.vitals[0]?.agep);
    const temperature = Number(this.vitalData.vitals[0]?.temprature);
    if (age > 5 && temperature > 37.7) {
      this.badgebodyh = 'bg-danger';
      this.outputbodyh = 'Fever';
    } else if (age > 5 && temperature <= 37.7) {
      this.badgebodyh = 'bg-success';
      this.outputbodyh = 'Normal';
    } else if (age === 1 && temperature === 36.5) {
      this.badgebodyh = 'bg-success';
      this.outputbodyh = 'Normal';
    } else if (age <= 5 && temperature > 37.7) {
      this.badgebodyh = 'bg-danger';
      this.outputbodyh = 'Fever';
    } else if (age <= 5 && temperature >= 35.5 && temperature <= 37.5) {
      this.badgebodyh = 'bg-success';
      this.outputbodyh = 'Normal';
    } else {
      this.badgebodyh = '';
      this.outputbodyh = '';
    }
  }

  validatePulseRate(): void {
    const age = Number(this.vitalData.vitals[0]?.agep); 
    const ageInMonths = age * 12;
    const pulseRate = Number(this.vitalData.vitals[0]?.pulse); 

    if (pulseRate !== 0 && !isNaN(pulseRate)) { // Ensure pulseRate is valid
      if (ageInMonths >= 0 && ageInMonths <= 2 && pulseRate >= 70 && pulseRate <= 180) {
        this.badgepulse = "bg-success";
        this.outputpulse = "Normal - Pulse Rate";
      } else if (ageInMonths > 2 && ageInMonths <= 60 && pulseRate >= 80 && pulseRate <= 130) {
        this.badgepulse = "bg-success";
        this.outputpulse = "Normal - Pulse Rate";
      } else if (ageInMonths > 11 && ageInMonths < 36 && pulseRate >= 80 && pulseRate <= 130) {
        this.badgepulse = "bg-success";
        this.outputpulse = "Normal - Pulse Rate";
      } else if (ageInMonths >= 36 && ageInMonths < 72 && pulseRate >= 80 && pulseRate <= 120) {
        this.badgepulse = "bg-success";
        this.outputpulse = "Normal - Pulse Rate";
      } else if (ageInMonths >= 72 && ageInMonths < 132 && pulseRate >= 70 && pulseRate <= 110) {
        this.badgepulse = "bg-success";
        this.outputpulse = "Normal - Pulse Rate";
      } else if (ageInMonths >= 132 && ageInMonths < 180 && pulseRate >= 60 && pulseRate <= 105) {
        this.badgepulse = "bg-success";
        this.outputpulse = "Normal - Pulse Rate";
      } else if (ageInMonths >= 180 && pulseRate >= 50 && pulseRate <= 119) {
        this.badgepulse = "bg-success";
        this.outputpulse = "Normal - Pulse Rate";
      } else {
        this.badgepulse = "bg-danger";
        this.outputpulse = "Intervention Is Required - Pulse Rate";
      }
    } else {
      this.badgepulse = "d-none";
      this.outputpulse = "(Empty)";
    }
  }

 

  validateBloodGlucose(): void {
    const bloodGlucose = this.vitalData.vitals[0]?.bloodglucose;
    let badgeBG = "d-none";
    let outputBG = "(Empty)";

    if (bloodGlucose) {
      const glucoseLevel = parseFloat(bloodGlucose);

      if (isNaN(glucoseLevel)) {
        badgeBG = "d-none";
        outputBG = "Invalid glucose level. Please provide a valid numeric value.";
      } else {
        if (glucoseLevel >= 7.0 && glucoseLevel < 11.1) {
          badgeBG = "bg-success";
          outputBG = "Random Blood Glucose - Normal BG";
        } else if (glucoseLevel < 7.0 && glucoseLevel >= 4) {
          badgeBG = "bg-success";
          outputBG = "Fasting Blood Glucose - Normal BG";
        } else if (glucoseLevel < 4) {
          badgeBG = "bg-danger";
          outputBG = "Hypoglycemia – Intervention required - BG";
        } else if (glucoseLevel >= 11.1) {
          badgeBG = "bg-danger";
          outputBG = "Hyperglycemia – Intervention required - BG";
        } else {
          badgeBG = "bg-danger";
          outputBG = "Invalid glucose level.";
        }
      }
    } else {
      badgeBG = "d-none";
      outputBG = "(Empty)";
    }

    this.badgeBG = badgeBG;
    this.outputBG = outputBG;
  }

  validateBloodPressure(): void {
    const age = Number(this.vitalData.vitals[0]?.agep);
    const bloodPressure = this.vitalData.vitals[0]?.bloodp;
    if (bloodPressure) {
      const [systolic, diastolic] = bloodPressure.split('/').map(Number);

      if (!isNaN(systolic) && !isNaN(diastolic)) {
        if (age >= 18) {
          if (systolic < 130 && diastolic < 85) {
            this.badgeBP = "bg-success";
            this.outputBP = "Keep up the good work and stick with heart-healthy habits - BP";
          } else if (
            (systolic >= 130 && systolic <= 139) ||
            (diastolic >= 85 && diastolic < 89)
          ) {
            this.badgeBP = "bg-warning";
            this.outputBP = "Make lifestyle changes to lower - BP";
          } else if (
            (systolic >= 140 && systolic <= 160) ||
            (diastolic >= 90 && diastolic <= 100)
          ) {
            this.badgeBP = "bg-primary";
            this.outputBP = "Consult your doctor for better BP management.";
          } else if (
            (systolic >= 160 && systolic <= 179) ||
            (diastolic >= 100 && diastolic < 109)
          ) {
            this.badgeBP = "bg-danger";
            this.outputBP = "See a doctor or GP as soon as possible - BP";
          } else if (systolic > 179 || diastolic > 109) {
            this.badgeBP = "bg-danger";
            this.outputBP = "Requires emergency medical attention. Go to a hospital - BP";
          } else {
            this.badgeBP = "bg-danger";
            this.outputBP = "Invalid blood pressure values.";
          }
        } else {
          this.badgeBP = "bg-danger";
          this.outputBP = "Age must be 18 or above for validation.";
        }
      } else {
        this.badgeBP = "bg-danger";
        this.outputBP = "Invalid blood pressure format. Please use systolic/diastolic (e.g., 120/80).";
      }
    } else {
      this.badgeBP = "d-none";
      this.outputBP = "(Empty)";
    }
    // alert(this.outputBP)
  }

  validateBodyWeight(): void {
    const age = Number(this.vitalData.vitals[0]?.agep);
    const weight = this.vitalData.vitals[0]?.weight; // Get weight

    let outputBW = "(Empty)";
    let badgeBW = "d-none";

    if (age && weight) {
      const ageInMonths = age * 12;
      const bodyWeight = parseFloat(weight);
// alert(ageInMonths)
      if (isNaN(ageInMonths) || isNaN(bodyWeight)) {
        outputBW = "Invalid input. Please provide valid numeric values.";
        badgeBW = "d-none";
      } else if (ageInMonths <= 36) {
        // Logic for children (age < 36 months)
        if (ageInMonths < 24) {
          if (bodyWeight < 7.8) {
            outputBW = "Underweight";
            badgeBW = "bg-success";
          } else if (bodyWeight >= 7.8 && bodyWeight <= 10) {
            outputBW = "Healthy weight";
            badgeBW = "bg-primary";
          } else if (bodyWeight > 10 && bodyWeight <= 11.5) {
            outputBW = "Overweight";
            badgeBW = "bg-warning";
          } else if (bodyWeight > 11.5) {
            outputBW = "Obese";
            badgeBW = "bg-danger";
          }
        } else if (ageInMonths >= 24 && ageInMonths < 36) {
          if (bodyWeight < 9.7) {
            outputBW = "Underweight";
            badgeBW = "bg-success";
          } else if (bodyWeight >= 9.7 && bodyWeight <= 13) {
            outputBW = "Healthy weight";
            badgeBW = "bg-primary";
          } else if (bodyWeight > 13 && bodyWeight <= 15) {
            outputBW = "Overweight";
            badgeBW = "bg-warning";
          } else if (bodyWeight > 15) {
            outputBW = "Obese";
            badgeBW = "bg-danger";
          }
        }
    } else {
      outputBW = "(Empty)";
      badgeBW = "d-none";
    }

    // Set the result to the component properties
    this.outputBW = outputBW;
    this.badgeBW = badgeBW;
  }
  }

  validateBMI(): void {
    const height = this.vitalData.vitals[0]?.height;
    const weight = this.vitalData.vitals[0]?.weight;

    let outputBMI = "(Empty)";
    let badgeBMI = "d-none";

    if (height && weight) {
      const heightInMeters = Number(height) / 100;
      const weightInKg = Number(weight);

      if (isNaN(heightInMeters) || isNaN(weightInKg)) {
        outputBMI = "Invalid input. Please provide valid numeric values.";
        badgeBMI = "d-none";
      } else {
        const bmi = weightInKg / (heightInMeters * heightInMeters);
        const bmiFixed = parseFloat(bmi.toFixed(2));

        if (bmiFixed < 16.0) {
          outputBMI = "Severely Underweight – Intervention is required, and refer to Dietician";
          badgeBMI = "bg-danger";
        } else if (bmiFixed >= 16.0 && bmiFixed <= 16.9) {
          outputBMI = "Moderately Underweight – Intervention is required, and refer to Dietician";
          badgeBMI = "bg-danger";
        } else if (bmiFixed >= 17.0 && bmiFixed <= 18.4) {
          outputBMI = "Mildly Underweight – Intervention is required, and refer to Dietician";
          badgeBMI = "bg-warning";
        } else if (bmiFixed >= 18.5 && bmiFixed <= 25) {
          outputBMI = "Normal";
          badgeBMI = "bg-success";
        } else if (bmiFixed >= 25.0 && bmiFixed <= 29.9) {
          outputBMI = "Overweight – Intervention is required, and refer to Dietician";
          badgeBMI = "bg-warning";
        } else if (bmiFixed >= 30.0) {
          outputBMI = "Obese – Intervention is required, and refer to Dietician";
          badgeBMI = "bg-danger";
        }
      }
    } else {
      outputBMI = "(Empty)";
      badgeBMI = "d-none";
    }

    this.outputBMI = outputBMI;
    this.badgeBMI = badgeBMI;
  }

  validatePeakFlow(): void {
    const peakFlow = Number(this.vitalData.vitals[0]?.peakflow);
  
    let outputpeakflow = "(Empty)"; 
    let badgepeakflow = "d-none"; 
  
    if (peakFlow > 0 && peakFlow < 6) {
      outputpeakflow = "Severe - Peak Flow";
      badgepeakflow = "bg-danger";
    } else if (peakFlow >= 6 && peakFlow < 12) {
      outputpeakflow = "Medium - Peak Flow";
      badgepeakflow = "bg-warning";
    } else if (peakFlow >= 12 && peakFlow < 16) {
      outputpeakflow = "Normal - Peak Flow";
      badgepeakflow = "bg-success";
    } else {
      outputpeakflow = "Invalid peak flow value.";
      badgepeakflow = "bg-danger";
    }

    this.outputpeakflow = outputpeakflow;
    this.badgepeakflow = badgepeakflow;
  }

  validateRespirationRate(): void {
    const age = Number(this.vitalData.vitals[0]?.agep); 
    const ageInMonths = age * 12;
    const respirationRates = Number(this.vitalData.vitals[0]?.respiration);
// alert(respirationRates)
    let badgeresp = "d-none";
    let outputresp = "(Empty)";
  
    if (ageInMonths >= 0 && ageInMonths <= 2) {
      if (respirationRates >= 30 && respirationRates <= 60) {
        badgeresp = "bg-success";
        outputresp = "Normal - Respiration Rate";
      } else {
        badgeresp = "bg-danger";
        outputresp = "Abnormal - Respiration Rate";
      }
    } else if (ageInMonths > 2 && ageInMonths <= 60) {
      if (respirationRates >= 12 && respirationRates <= 50) {
        badgeresp = "bg-success";
        outputresp = "Normal - Respiration Rate";
      } else if (ageInMonths > 2 && ageInMonths < 12 && respirationRates > 50) {
        badgeresp = "bg-danger";
        outputresp = "Having fast breathing - Respiration Rate";
      } else if (ageInMonths >= 12 && ageInMonths < 60 && respirationRates > 40) {
        badgeresp = "bg-danger";
        outputresp = "Having fast breathing - Respiration Rate";
      } else {
        badgeresp = "bg-danger";
        outputresp = "Abnormal - Respiration Rate";
      }
    } else if (ageInMonths >= 60 && ageInMonths < 120) {
      if (respirationRates >= 15 && respirationRates <= 27) {
        badgeresp = "bg-success";
        outputresp = "Normal - Respiration Rate";
      } else {
        badgeresp = "bg-danger";
        outputresp = "Abnormal - Respiration Rate";
      }
    } else if (ageInMonths >= 120) {
      if (respirationRates >= 12 && respirationRates <= 20) {
        badgeresp = "bg-success";
        outputresp = "Normal - Respiration Rate";
      } else {
        badgeresp = "bg-danger";
        outputresp = "Abnormal - Respiration Rate";
      }
    }
  
    this.badgeresp = badgeresp;
    this.outputresp = outputresp;
  }
  
  

  





}