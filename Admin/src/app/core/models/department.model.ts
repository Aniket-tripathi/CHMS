export interface department {
    id: number;
    clinic_id: string;
    deptname: string;
    deptdesc: string;
    status: string;
    adddate: string;
    addtime: string;
  }
  
  export interface DepartmentResponse { 
    departments: department[];
  }
  