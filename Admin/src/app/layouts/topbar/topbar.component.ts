import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { LanguageService } from '../../core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { jwtDecode } from 'jwt-decode';
import { ClinicService } from 'src/app/core/services/clinic.service';
import { DomSanitizer } from '@angular/platform-browser';
// import { User } from 'src/app/core/models/auth.models';




@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})

export class TopbarComponent implements OnInit {

  element: any;
  cookieValue: any;
  flagvalue: any;
  countryName: any;
  valueset: any;
  decodedToken: any;
  userFirstName: string = 'Admin';
  userData: any = null;
  // currentUser: User;
  authFakeService: any;
  localuserData: any;
  clinicLogoUrl: any;



  constructor(@Inject(DOCUMENT) private document: any, private router: Router, private authService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService,
    public languageService: LanguageService,
    public translate: TranslateService,
    private sanitizer: DomSanitizer,
    private clinicService: ClinicService,
    public _cookiesService: CookieService) {
  }

  openMobileMenu: boolean;

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  ngOnInit() {
    this.openMobileMenu = false;
    this.element = document.documentElement;
    // Subscribe to the currentUser observable
    //  this.authFakeService.currentUser.subscribe(user => {
    //   this.currentUser = user; // Get the current user
    // });

    const sessionData = JSON.parse(sessionStorage.getItem('sessionUser'));
    if (sessionData) {
      console.log(sessionData.user);  // Access user data from session
    }

    const localuserData = JSON.parse(localStorage.getItem('currentUser'));

    // Check if session data exists and assign it to the currentUser property
    if (sessionData && sessionData.user) {
      this.localuserData = sessionData.user;
      console.log(localuserData);
      console.log('local User data:', this.localuserData);
    }

    this.loadClinicLogo(localuserData.user.user.clinicLogo);

  }

  loadClinicLogo(filename: string) {
    if (filename) {
      this.clinicService.getClinicLogo(filename).subscribe(
        (blob) => {
          const objectURL = URL.createObjectURL(blob);
          this.clinicLogoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        },
        (error) => {
          console.error('Error loading clinic logo:', error);
          this.clinicLogoUrl = null; // Ensure fallback is displayed
        }
      );
    } else {
      console.warn('No logo filename provided.');
      this.clinicLogoUrl = null; // Fallback to CHMS
    }
  }


  getUserData() {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const parsedData = JSON.parse(currentUser);
        this.userData = parsedData?.user || null;

        // Extract the first name for display
        this.userFirstName = this.userData?.fname || 'Admin';
      } else {
        console.warn('No user data found in localStorage');
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      this.userData = null;
      this.userFirstName = 'Admin';
    }
  }


  decodeToken(token: string) {
    try {
      this.decodedToken = jwtDecode(token);
      console.log('Decoded Token:', this.decodedToken);

      // Adjust based on the payload structure
      this.userFirstName = this.decodedToken?.user?.fname || this.decodedToken?.fname || 'Admin';
      console.log('User First Name:', this.userFirstName);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.userFirstName = 'Admin';
    }
  }


  logout() {
    this.authFackservice.logout();
    this.router.navigate(['/login']);
  }


  /**
   * Toggles the right sidebar
   */
  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  /**
   * Logout the user
   */
  // logout() {
  //   if (environment.defaultauth === 'firebase') {
  //     this.authService.logout();
  //   } else {
  //     this.authFackservice.logout();
  //   }
  //   this.router.navigate(['/login']);
  // }

  /**
   * Fullscreen method
   */
  fullscreen() {
    document.body.classList.toggle('fullscreen-enable');
    if (
      !document.fullscreenElement && !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }
}
