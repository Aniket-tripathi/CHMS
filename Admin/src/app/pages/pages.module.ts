import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { NgApexchartsModule } from 'ng-apexcharts';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SimplebarAngularModule } from 'simplebar-angular';
import { LightboxModule } from 'ngx-lightbox';

import { WidgetModule } from '../shared/widget/widget.module';
import { UIModule } from '../shared/ui/ui.module';

// Emoji Picker
import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { PagesRoutingModule } from './pages-routing.module';

import { DashboardsModule } from './dashboards/dashboards.module';

import { UtilityModule } from './utility/utility.module';
import { UiModule } from './ui/ui.module';
import { FormModule } from './form/form.module';
import { TablesModule } from './tables/tables.module';
import { IconsModule } from './icons/icons.module';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ViewAppointmentComponent } from './Appointment/view-appointment/view-appointment.component';
import { TokenComponent } from './token/token.component';
import { DisplayComponent } from './displayAdministration/display/display.component';
import { DisplayScreenComponent } from './displayAdministration/display-screen/display-screen.component';
// import { TokenPharmacyComponent } from './Token/token-pharmacy/token-pharmacy.component';
import { AddPatientComponent } from './Patient/add-patient/add-patient.component';
import { PatientListComponent } from './Patient/patient-list/patient-list.component';
import { AddVisitorsComponent } from './Visitors/add-visitors/add-visitors.component';
import { VisitorListComponent } from './Visitors/visitor-list/visitor-list.component';
import { AddVitalComponent } from './Vital/add-vital/add-vital.component';
import { VitalListComponent } from './Vital/vital-list/vital-list.component';
import { OutPatientComponent } from './PatientCare/out-patient/out-patient.component';
import { AddStaffComponent } from './Staff/add-staff/add-staff.component';
import { StaffListComponent } from './Staff/staff-list/staff-list.component';
import { AppointmentReasonComponent } from './Reason/appointment-reason/appointment-reason.component';
import { StreamsComponent } from './StreamAllocation/streams/streams.component';
import { StreamClassificationComponent } from './StreamAllocation/stream-classification/stream-classification.component';
import { RoleComponent } from './Settings/role/role.component';
import { DepartmentComponent } from './Settings/department/department.component';
import { DesignationComponent } from './Settings/designation/designation.component';
import { RegionComponent } from './Settings/region/region.component';
import { WardComponent } from './Settings/ward/ward.component';
import { AssignMenuComponent } from './Settings/assign-menu/assign-menu.component';
import { DisplayPharmacyComponent } from './displayPharmacy/display-pharmacy/display-pharmacy.component';
import { DisplayPharmacyScreenComponent } from './displayPharmacy/display-pharmacy-screen/display-pharmacy-screen.component';
import { ClinicSheduleComponent } from './Clinic/clinic-shedule/clinic-shedule.component';
import { ViewstaffComponent } from './Staff/viewstaff/viewstaff.component';
// import { UsersClinicComponent } from './clinic/users-clinic/users-clinic.component';
import { CounterComponent } from './counter/counter.component';
import { AddappointmentComponent } from './Appointment/addappointment/addappointment.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { AudittrialComponent } from './audittrial/audittrial.component';
import { CalendarComponent } from './calendar/calendar.component';
import { EditScheduleComponent } from './Clinic/edit-schedule/edit-schedule.component';


@NgModule({
  // declarations: [CalendarComponent, ChatComponent, FilemanagerComponent],
  declarations: [
    ViewAppointmentComponent, TokenComponent, DisplayComponent, AddPatientComponent, PatientListComponent, AddVisitorsComponent, VisitorListComponent, AddVitalComponent, VitalListComponent, OutPatientComponent, AddStaffComponent, StaffListComponent, AppointmentReasonComponent, StreamsComponent, StreamClassificationComponent, RoleComponent, DepartmentComponent, DesignationComponent, RegionComponent, WardComponent, AssignMenuComponent, DisplayPharmacyComponent, DisplayPharmacyScreenComponent, ClinicSheduleComponent, ViewstaffComponent, CounterComponent, AddappointmentComponent, AudittrialComponent, EditScheduleComponent, CalendarComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PagesRoutingModule,
    // NgApexchartsModule,
    ReactiveFormsModule,
    DashboardsModule,
    // CryptoModule,
    // EcommerceModule,
    // EmailModule,
    // InvoicesModule,
    HttpClientModule,
    // ProjectsModule,
    UIModule,
    // TasksModule,
    // ContactsModule,
    // BlogModule,
    UtilityModule,
    UiModule,
    FormModule,
    TablesModule,
    IconsModule,
    // ChartModule,
    WidgetModule,
    // MapsModule,
    FullCalendarModule,
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    SimplebarAngularModule,
    LightboxModule,
    PickerModule,
    NgStepperModule,
    CdkStepperModule,
  ],
})
export class PagesModule { }
