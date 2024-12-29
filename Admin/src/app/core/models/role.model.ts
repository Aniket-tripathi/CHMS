export interface role {
    roleid: number;
    rolename: string;
    roleclinicid: number;

    rolestatus: string;
    roledate: string;
    roletime: string;
}


export interface RoleResponse {
    roles: role[];
}