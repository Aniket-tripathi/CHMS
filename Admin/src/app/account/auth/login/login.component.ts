import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  returnUrl: string;
  isLoading: boolean = false;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }


  // onSubmit() {
  //   this.submitted = true;

  //   if (this.loginForm.invalid) {
  //     return;
  //   }

  //   this.authFackservice.login(this.f.email.value, this.f.password.value)
  //     .pipe(first())
  //     .subscribe(
  //       data => {
  //         if (data && data.token) {
  //           const expiryTime = Date.now() + 3600 * 1000; // 1 hour in milliseconds
  //           const sessionData = { token: data.token, expiryTime, };
  //           sessionStorage.setItem('sessionUser', JSON.stringify(sessionData));

  //           setTimeout(() => this.logout(), 3600 * 1000);

  //           if (data.type === 'superadmin') {
  //             this.router.navigate(['/dashboard']);
  //           } else if (data.type === 'staff') {
  //             this.router.navigate(['/dashboard']);
  //           } else {
  //             this.error = 'Unknown user type';
  //           }
  //         } else {
  //           this.error = 'Login failed';
  //         }
  //       },
  //       error => {
  //         this.error = error || 'Login failed';
  //       }
  //     );
  // }
  // onSubmit() {
  //   this.submitted = true;

  //   if (this.loginForm.invalid) {
  //     return;
  //   }

  //   this.authFackservice.login(this.f.email.value, this.f.password.value)
  //     .pipe(first())
  //     .subscribe(
  //       data => {
  //         if (data && data.token) {
  //           const expiryTime = Date.now() + 3600 * 1000; // 1 hour in milliseconds
  //           const sessionData = { token: data.token, expiryTime };

  //           // Store session data in sessionStorage
  //           sessionStorage.setItem('sessionUser', JSON.stringify(sessionData));

  //           // Log session data to check if it's stored
  //           console.log('Session data stored in sessionStorage:', sessionStorage.getItem('sessionUser'));

  //           setTimeout(() => this.logout(), 3600 * 1000); // Auto logout after 1 hour

  //           if (data.type === 'superadmin') {
  //             this.router.navigate(['/dashboard']);
  //           } else if (data.type === 'staff') {
  //             this.router.navigate(['/dashboard']);
  //           } else {
  //             this.error = 'Unknown user type';
  //           }
  //         } else {
  //           this.error = 'Login failed';
  //         }
  //       },
  //       error => {
  //         this.error = error || 'Login failed';
  //       }
  //     );
  // }
  onSubmit() {
    this.submitted = true;
    this.isLoading = true; // Show loader
    console.log("Form submitted, isLoading:", this.isLoading);

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      this.isLoading = false; // Hide loader
      console.log("Form is invalid, isLoading:", this.isLoading);
      return;
    } else {
      if (environment.defaultauth === 'firebase') {
        this.authenticationService.login(this.f.email.value, this.f.password.value).then((res: any) => {
          this.router.navigate(['/dashboard']);
        })
          .catch(error => {
            this.error = error ? error : '';
            this.isLoading = false; // Hide loader
          });
      } else {
        this.authFackservice.login(this.f.email.value, this.f.password.value)
          .pipe(first())
          .subscribe(
            data => {
              this.router.navigate(['/dashboard']);
            },
            error => {
              this.error = error ? error : '';
              this.isLoading = false; // Hide loader
            });
      }
    }
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

  isSessionValid(): boolean {
    const sessionData = JSON.parse(sessionStorage.getItem('sessionUser'));
    if (sessionData && sessionData.expiryTime) {
      return Date.now() < sessionData.expiryTime;
    }
    return false;
  }

  logout() {
    sessionStorage.removeItem('sessionUser');
    this.router.navigate(['/login']);
  }


  // onSubmit() {
  //   this.submitted = true;

  //   if (this.loginForm.invalid) {
  //     return;
  //   }

  //   this.authFackservice.login(this.f.email.value, this.f.password.value)
  //     .pipe(first())
  //     .subscribe(
  //       data => {
  //         if (data.type === 'superadmin') {
  //           this.router.navigate(['/dashboard']);
  //         } else if (data.type === 'staff') {
  //           this.router.navigate(['/dashboard']);
  //         } else {
  //           this.error = 'Unknown user type';
  //         }
  //       },
  //       error => {
  //         this.error = error || 'Login failed';
  //       }
  //     );
  // }


  // onSubmit() {
  //   this.submitted = true;

  //   // stop here if form is invalid
  //   if (this.loginForm.invalid) {
  //     return;
  //   } else {
  //     if (environment.defaultauth === 'firebase') {
  //       this.authenticationService.login(this.f.email.value, this.f.password.value).then((res: any) => {
  //         this.router.navigate(['/dashboards/saas']);
  //       })
  //         .catch(error => {
  //           this.error = error ? error : '';
  //         });
  //     } else {
  //       this.authFackservice.login(this.f.email.value, this.f.password.value)
  //         .pipe(first())
  //         .subscribe(
  //           data => {
  //             this.router.navigate(['/dashboards/saas']);
  //           },
  //           error => {
  //             this.error = error ? error : '';
  //           });
  //     }
  //   }
  // }
}
