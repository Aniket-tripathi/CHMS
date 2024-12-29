import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

import { OwlOptions } from 'ngx-owl-carousel-o';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login2',
  templateUrl: './login2.component.html',
  styleUrls: ['./login2.component.scss']
})
/**
 * Login-2 component
 */
export class Login2Component implements OnInit {

  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService) { }
  loginForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  returnUrl: string;
  isLoading: boolean = false;


  // set the currenr year
  year: number = new Date().getFullYear();

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
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

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */


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
  // onSubmit() {
  //   this.submitted = true;

  //   // stop here if form is invalid
  //   if (this.loginForm.invalid) {
  //     return;
  //   } else {
  //     if (environment.defaultauth === 'firebase') {
  //       this.authenticationService.login(this.f.email.value, this.f.password.value).then((res: any) => {
  //         this.router.navigate(['/dashboard']);
  //       })
  //         .catch(error => {
  //           this.error = error ? error : '';
  //         });
  //     } else {
  //       this.authFackservice.login(this.f.email.value, this.f.password.value)
  //         .pipe(first())
  //         .subscribe(
  //           data => {
  //             this.router.navigate(['/dashboard']);
  //           },
  //           error => {
  //             this.error = error ? error : '';
  //           });
  //     }
  //   }
  // }
}
