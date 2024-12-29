import { EventInput } from '@fullcalendar/core';
import { Appointment } from 'src/app/core/models/appointment.model';


 // Assuming you have an appointment model imported

let eventGuid = 0;
export function createEventId() {
    return String(eventGuid++);
}

const category = [
    {
        name: 'Danger',
        value: 'bg-danger'
    },
    {
        name: 'Success',
        value: 'bg-success'
    },
    {
        name: 'Primary',
        value: 'bg-primary'
    },
    {
        name: 'Info',
        value: 'bg-info'
    },
    {
        name: 'Dark',
        value: 'bg-dark'
    },
    {
        name: 'Warning',
        value: 'bg-warning'
    },
];
// Assuming `appointments` is an array of Appointment objects that you will fetch dynamically
// You can fetch this data from your backend or pass it as a prop
export function mapAppointmentsToCalendarEvents(appointments: Appointment[]): EventInput[] {
  return appointments.map(appointment => {
    const [day, month, year] = appointment.appointment_date.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    const [startHour, startMinute] = appointment.appointment_time.split('-')[0].split(':').map(Number);
    startDate.setHours(startHour, startMinute, 0, 0);

    if (isNaN(startDate.getTime())) {
      console.error(`Invalid start date for appointment: ${appointment.appointment_date} ${appointment.appointment_time}`);
      return null; // Skip this event if the date is invalid
    }

    let endDate = startDate;
    if (appointment.apnt_end_time) {
      const [endHour, endMinute] = appointment.apnt_end_time.split(':').map(Number);
      endDate = new Date(startDate);
      endDate.setHours(endHour, endMinute, 0, 0);
    }

    const startFormatted = startDate.toISOString();
    const endFormatted = endDate.toISOString();

    // Determine className dynamically based on appointment status
    let className = '';
    switch (appointment.appointment_status) {
      case 'Approved':
        className = 'bg-success text-white';
        break;
      case 'Pending':
        className = 'bg-warning text-dark';
        break;
      case 'Cancelled':
        className = 'bg-danger text-white';
        break;
      default:
        className = 'bg-secondary text-white'; // Default style for unknown statuses
    }

    console.log(`Mapped Event: ${startFormatted} to ${endFormatted}`);

    return {
      id: appointment.appointment_id.toString(),
      title: appointment.mpino || appointment.patient_idno || appointment.app_passport,
      start: startFormatted,
      end: endFormatted,
      patientname:appointment.patient_name,
      aptime:appointment.appointment_time,
      apreason:appointment.ap_reason_shortname,
      description: appointment.appointment_status,
      className, // Use the dynamically assigned class
    };
  }).filter(event => event !== null); // Filter out invalid events
}

  
  
  
  
  
  
  

// Example of how to use this function to map appointments to calendar events
// const calendarEvents: EventInput[] = mapAppointmentsToCalendarEvents(Appointments);  // `appointments` is your dynamic data

export { category };
