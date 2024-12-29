import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { Login2Component } from './login2/login2.component';

import { SignupComponent } from './signup/signup.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { Register2Component } from './register2/register2.component';
import { Recoverpwd2Component } from './recoverpwd2/recoverpwd2.component';
import { DisplayScreenComponent } from 'src/app/pages/displayAdministration/display-screen/display-screen.component';

const routes: Routes = [
    {
        path: 'login/admin',
        component: LoginComponent
    },
    {
        path: 'register/clinic',
        component: SignupComponent
    },
    {
        path: 'register/staff/:cid',
        component: Register2Component
    },
    {
        path: 'reset-password',
        component: PasswordresetComponent
    },
    {
        path: 'recoverpwd-2',
        component: Recoverpwd2Component
    },
    {
        path: 'login',
        component: Login2Component
    },
    {
        path: 'display/screen/:id',
        component: DisplayScreenComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
