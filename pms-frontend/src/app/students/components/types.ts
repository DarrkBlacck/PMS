export interface Requirement {
  _id?: string;
  job: string;
  experience_required: number;
  sslc_cgpa?: number;
  plustwo_cgpa?: number;
  degree_cgpa?: number;
  mca_cgpa?: number[];
  contract?: number;
  additional_criteria?: string;
  skills_required?: string[];
  preferred_qualifications?: string[];
  required_certifications?: string[];
  language_requirements?: string[];
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  job_type?: string;
  requirement?: Requirement;
  hasApplied?: boolean; // Add this field
  desc?: string;
  loc?: string;
  experience: number;
  salary?: number;
  salary_range?: [number, number];
  join_date?: string;
  last_date?: string;
  contact_person?: string;
  contact_email?: string;
  additional_instructions?: string;
  requirements?: Requirement;
  form_link?: string;
}

export interface Company {
  _id?: string;
  name: string;
  site?: string;
  branch: string;
  desc?: string;
  email?: string;
  ph_no?: string;
  avg_salary?: number;
  placed_students?: string[];
  jobs?: Job[];
}

export interface Drive {
  _id: string;
  title: string;
  desc?: string;
  location?: string;
  drive_date?: string;
  applied_students?: string[];
  stages?: string[];
  selected_students?: string[];
  send_to?: string[];
  created_at?: string;
  application_deadline?: string;
  additional_instructions?: string;
  companies?: Company[];
  jobs?: Job[];
  form_link?: string;
}


export interface Student {
  _id: string;
  user_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: Date;
  address: string;
  city: string;
  state: string;
  district: string;
  adm_no: string;
  reg_no: string;
  gender: string;
  email: string;
  alt_email: string;
  ph_no: string;
  alt_ph: string;
  join_date: string;
  end_date: Date;  
  program: string;
  status: string;
}

export interface FileInfo {
  filename: string;
  filepath: string;
}

export interface Performance {
  _id: string;
  student_id: string;
  semester: number;
  tenth_cgpa: number;
  twelfth_cgpa: number;
  degree_cgpa: number;
  mca_cgpa: number[];
  certification_files: FileInfo[]; // Updated to use FileInfo[]
  job_application_files: FileInfo[]; // Updated to use FileInfo[]
  skills: string[];
  current_status: string;
  year: number;
  mca_percentage: number;
  linkedin_url: string;
}

export interface JobApplication {
  _id?: string;
  student_id: string;
  job_id: string;
  status: string;
  applied_date?: Date;
  shortlisted_date?: Date;
  rejected_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// ...existing code...

export interface Education {
  start_time?: string;
  end_time?: string;
  institute: string;
  university: string;
  course: string;
  gpa?: number;
}

export interface Project {
  title: string;
  description: string;
  technologies?: string[];
  start_time?: string;
  end_time?: string;
  url?: string;
}

export interface WorkExperience {
  company: string;
  job_title: string;
  start_time?: string;
  end_time?: string;
  description?: string;
}

export interface Certificate {
  title: string;
  institute: string;
  url?: string;
  issued_date?: string;
}

export interface Resume {
  _id?: string;
  title: string;
  student_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  objective?: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  ph_no?: string;
  alt_ph?: string;
  email: string;
  alt_email?: string;
  achievements?: string[];
  skills?: string[];
  created_at?: string;
  updated_at?: string;
  education?: Education[];
  projects?: Project[];
  work_experience?: WorkExperience[];
  certificates?: Certificate[];
  linkedin_url?: string;
  github_url?: string;
}


export interface PrefillData {
  fullName: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  semester?: string;
  registerNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  district?: string;
  alt_email?: string;
  alt_ph?: string;
  join_date?: string;
  program?: string;
  status?: string;
  linkedin_url?: string;
  current_status?: string;
  tenth_cgpa?: number;
  twelfth_cgpa?: number;
  mca_cgpa?: number[];
  skills?: string[];
  mca_percentage?: number;
  certification_files?: FileInfo[];
  job_application_files?: FileInfo[];
}