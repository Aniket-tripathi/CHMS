import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/auth.models';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthfakeauthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();

    }

    baseUrl = environment.firebaseConfig.apiKey;


    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<User>(this.baseUrl + `login`, { email, password })
            .pipe(map(user => {
                if (user && user.token) {
                    const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
                    const sessionData = {
                        user,
                        expiryTime  // Set the expiry time for the session
                    };

                    // Store session data in sessionStorage
                    sessionStorage.setItem('sessionUser', JSON.stringify(sessionData));

                    // Store user data in localStorage
                    const userData = { user };
                    localStorage.setItem('currentUser', JSON.stringify(userData));

                    // Update current user subject
                    this.currentUserSubject.next(user);
                }
                return user;
            }));
    }

    // login(email: string, password: string) {
    //     return this.http.post<User>(this.baseUrl + `login`, { email, password })
    //         .pipe(map(user => {
    //             if (user && user.token) {
    //                 const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hour from now
    //                 const sessionData = {
    //                     user,
    //                     expiryTime
    //                 };
    //                 localStorage.setItem('currentUser', JSON.stringify(sessionData));
    //                 this.currentUserSubject.next(user);
    //             }
    //             return user;
    //         }));
    // }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    isSessionValid(): boolean {
        const sessionData = JSON.parse(sessionStorage.getItem('sessionUser'));
        if (sessionData && sessionData.expiryTime) {
            return Date.now() < sessionData.expiryTime;
        }
        return false;
    }

}