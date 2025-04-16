// students/components/types.ts

import { JSX } from "react";

export interface Student {
    _id: string;
    first_name: string;
    email: string;
    ph_no: string;
    adm_no: string;
    program: string;
  }
  
  export interface StudentFormData {
    first_name: string;
    email: string;
    ph_no: string;
    adm_no: string;
    program: string;
  }
  
  export interface GridColumnDef {
    field?: string;
    headerName: string;
    flex: number;
    width?: number;
    sortable?: boolean;
    filter?: boolean;
    cellRenderer?: (params: unknown) => JSX.Element;
  }