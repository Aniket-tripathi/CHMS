import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SaasComponent } from './dashboards/saas/saas.component';
import { ClinicComponent } from './Clinic/addClinic/clinic.component';
import { AddappointmentComponent } from './Appointment/addappointment/addappointment.component';
import { ViewAppointmentComponent } from './Appointment/view-appointment/view-appointment.component';
import { DisplayComponent } from './displayAdministration/display/display.component';
import { DisplayPharmacyComponent } from './displayPharmacy/display-pharmacy/display-pharmacy.component';
import { AddPatientComponent } from './Patient/add-patient/add-patient.component';
import { AddVisitorsComponent } from './Visitors/add-visitors/add-visitors.component';
import { AddVitalComponent } from './Vital/add-vital/add-vital.component';
import { OutPatientComponent } from './PatientCare/out-patient/out-patient.component';
import { ViewClinicComponent } from './Clinic/view-clinic/view-clinic.component';
import { ClinicSheduleComponent } from './Clinic/clinic-shedule/clinic-shedule.component';
import { AddStaffComponent } from './Staff/add-staff/add-staff.component';
import { StaffListComponent } from './Staff/staff-list/staff-list.component';
import { ViewstaffComponent } from './Staff/viewstaff/viewstaff.component';
import { AppointmentReasonComponent } from './Reason/appointment-reason/appointment-reason.component';
import { StreamsComponent } from './StreamAllocation/streams/streams.component';
import { StreamClassificationComponent } from './StreamAllocation/stream-classification/stream-classification.component';
// import { RoleComponent } from './Settings/role/role.component';
import { DepartmentComponent } from './Settings/department/department.component';
import { DesignationComponent } from './Settings/designation/designation.component';
import { RegionComponent } from './Settings/region/region.component';
import { WardComponent } from './Settings/ward/ward.component';
import { AssignMenuComponent } from './Settings/assign-menu/assign-menu.component';
import { PatientListComponent } from './Patient/patient-list/patient-list.component';
import { ViewPatientComponent } from './Patient/view-patient/view-patient.component';
import { DemographicComponent } from './Patient/demographic/demographic.component';
import { VisitorListComponent } from './Visitors/visitor-list/visitor-list.component';
import { ViewVisitorsComponent } from './Visitors/view-visitors/view-visitors.component';
import { VitalListComponent } from './Vital/vital-list/vital-list.component';
import { VitalViewComponent } from './Vital/vital-view/vital-view.component';
import { CounterComponent } from './counter/counter.component';
import { DisplayScreenComponent } from './displayAdministration/display-screen/display-screen.component';
import { RoleComponent } from './Settings/role/role.component';
import { AudittrialComponent } from './audittrial/audittrial.component';
import { ProvinceComponent } from './Settings/province/province.component';
import { LevelComponent } from './Settings/level/level.component';
import { EditScheduleComponent } from './Clinic/edit-schedule/edit-schedule.component';
import { CalendarComponent } from './calendar/calendar.component';
import { TokenComponent } from './token/token.component';
import { TokenPdfComponent } from './token-pdf/token-pdf.component';
import { ViewClassificationComponent } from './Settings/Classification/view-classification/view-classification.component';

const routes: Routes = [
  // { path: '', redirectTo: 'dashboard' },
  {
    path: "",
    component: SaasComponent
  },
  { path: 'dashboard', component: SaasComponent },

  { path: 'clinic/add', component: ClinicComponent },

  { path: 'clinic/list', component: ViewClinicComponent },

  { path: 'staff/add', component: AddStaffComponent },

  { path: 'staff/list', component: StaffListComponent },

  { path: 'staff/view/:id', component: ViewstaffComponent },

  { path: 'appointment-reason', component: AppointmentReasonComponent },

  { path: 'streams', component: StreamsComponent },

  { path: 'streams/classification', component: StreamClassificationComponent },

  { path: 'roles', component: RoleComponent },

  { path: 'counter', component: CounterComponent },

  { path: 'department', component: DepartmentComponent },

  { path: 'designation', component: DesignationComponent },

  { path: 'region', component: RegionComponent },

  { path: 'ward', component: WardComponent },

  { path: 'assign/menu', component: AssignMenuComponent },

  { path: 'token', component: TokenComponent },

  { path: 'tokenpdf/:id', component: TokenPdfComponent },

  { path: 'display-administration', component: DisplayComponent },

  { path: 'display/screen/:id', component: DisplayScreenComponent },

  { path: 'display-pharmacy', component: DisplayPharmacyComponent },

  { path: 'patient/add', component: AddPatientComponent },

  { path: 'patient/list', component: PatientListComponent },

  { path: 'patient/view/:id', component: ViewPatientComponent },

  { path: 'patient/Demogrphica/:id', component: DemographicComponent },

  { path: 'visit/add', component: AddVisitorsComponent },

  { path: 'visit/add/:id', component: AddVisitorsComponent },

  { path: 'visit/list', component: VisitorListComponent },

  { path: 'vital/add', component: AddVitalComponent },

  { path: 'vital/list', component: VitalListComponent },

  { path: 'vital/view/:id', component: VitalViewComponent },

  { path: 'visit/view/:id', component: ViewVisitorsComponent },

  { path: 'patientCare/outpatients', component: OutPatientComponent },

  { path: 'audittrial', component: AudittrialComponent },

  { path: "province", component: ProvinceComponent },

  { path: "level", component: LevelComponent },

  { path: 'clinic/schedule', component: ClinicSheduleComponent },


  { path: 'edit/schedule/:clinicid/:csid', component: EditScheduleComponent },

  { path: 'calendar', component: CalendarComponent },

  { path: 'addappointment', component: AddappointmentComponent },

  { path: 'appointment/list', component: ViewAppointmentComponent },

  { path: 'classification/view/:id', component: ViewClassificationComponent },


  { path: 'dashboards', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule) },

  { path: 'pages', loadChildren: () => import('./utility/utility.module').then(m => m.UtilityModule) },
  { path: 'ui', loadChildren: () => import('./ui/ui.module').then(m => m.UiModule) },
  { path: 'form', loadChildren: () => import('./form/form.module').then(m => m.FormModule) },
  { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule) },
  { path: 'icons', loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule) },
  // { path: 'charts', loadChildren: () => import('./chart/chart.module').then(m => m.ChartModule) },
  // { path: 'maps', loadChildren: () => import('./maps/maps.module').then(m => m.MapsModule) },
  // { path: 'jobs', loadChildren: () => import('./jobs/jobs.module').then(m => m.JobsModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
