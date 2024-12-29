import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// export function emailValidator(): ValidatorFn {
//     return (control: AbstractControl): ValidationErrors | null => {
//         const email = control.value;
//         // Email regex to validate the correct email format
//         const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//         const isValid = emailRegex.test(email);
//         return isValid ? null : { invalidEmail: { value: control.value } };
//     };
// }

export function emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const email = control.value;

        if (!email) {
            return null;
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValid = emailRegex.test(email);

        return isValid ? null : { invalidEmail: { value: control.value } };
    };
}



export function southAfricaPhoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        // Regular expression for South African phone numbers
        const saPhoneRegex = /^(?:\+27|0)(\d{9})$/;
        return saPhoneRegex.test(value) ? null : { invalidPhoneNumber: true };
    };
}