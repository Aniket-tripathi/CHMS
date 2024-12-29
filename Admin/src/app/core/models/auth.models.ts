export interface User {
    id: number;
    email: string;
    fname?: string;
    lname?: string;
    token?: string;
    type: 'superadmin' | 'staff';
    username?: string;
    clinicid?: number;
    staffType?: string;
    roleid?: number;
}


// export class User {
//     id: number;
//     username: string;
//     password: string;
//     fname?: string;
//     lname?: string;
//     token?: string;
//     email: string;
// }

