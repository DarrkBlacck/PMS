import { useState, useEffect } from "react";
import { applyToJobAPI, downloadResumeAPI, fetchStudentByIdAPI, fetchStudentPerformanceAPI, updateStudentAPI, prefillGoogleFormAPI } from "./API";
import { 
  fetchDrivesAPI, 
  fetchDriveDetailsAPI,
  fetchCompaniesAPI, 
  fetchCompaniesByDriveAPI,
  fetchJobsByDriveAPI,
  fetchRequirementsByJobAPI,
  fetchJobsByDriveCompanyAPI,
  getStudentApplicationsAPI,
  createResumeAPI, 
  getResumeAPI, 
  getStudentResumesAPI, 
  updateResumeAPI, 
  deleteResumeAPI 
} from './API';
import useCurrentUser from "@/app/hooks/useUser";


import { Student, Performance, Drive, Company, Job, Requirement, JobApplication, Resume, PrefillData } from "./types";


export const useStudentManagement = () => {
  const [user_id, setUserId] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState(null);
  const [studentForm, setStudentForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    alt_email: "",
    ph_no: "",
    alt_ph: "",
    address: "",
    city: "",
    state: "",
    district: "",
  })

  const [performanceForm, setPerformanceForm] = useState({

    skills: [] as string[],
    current_status: "",
    linkedin_url: "",

  });

  const [drives, setDrives] = useState<Drive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const [driveLoading, setDriveLoading] = useState(true);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveCompanies, setDriveCompanies] = useState<Company[]>([]);
  const [driveCompanyIds, setDriveCompanyIds] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);


  const { user, userloading } = useCurrentUser();
  
  useEffect(() => {
    console.log('Student Management State:', {
      userLoading: userloading,
      userId: user?._id,
      studentId: student?._id,
      currentUserId: user_id
    });
  }, [userloading, user, student, user_id]);

  useEffect(() => {
    if (!userloading && user?._id) {
      console.log('User loaded, setting userId:', user._id);
      setUserId(user._id);
    }
  }, [userloading, user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user_id) {
        console.log('No user_id available yet');
        return;
      }

      try {
        console.log('Fetching student data for:', user_id);
        setLoading(true);
        const response = await fetchStudentByIdAPI(user_id);
        if (!response) {
          throw new Error('No student data received');
        }
        console.log('Student data fetched:', response._id);
        setStudent(response);
        await handleFetchPerformance(response._id);
      } catch (error) {
        console.error('Error fetching student:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user_id]);

  useEffect(() => {
    if (student) {
      setStudentForm({
        first_name: (student as Student).first_name || "",
        middle_name: (student as Student).middle_name || "",
        last_name: (student as Student).last_name || "",
        email: (student as Student).email || "",
        alt_email: (student as Student).alt_email || "",
        ph_no: (student as Student).ph_no || "",
        alt_ph: (student as Student).alt_ph || "",
        address: (student as Student).address || "",
        city: (student as Student).city || "",
        state: (student as Student).state || "",
        district: (student as Student).district || "",
      });
    }
  }, [student]);

  useEffect(() => {
    if (performance) {
      setPerformanceForm({
        skills: (performance as Performance).skills || [],
        current_status: (performance as Performance).current_status || "",
        linkedin_url: (performance as Performance).linkedin_url || "",
      });
    }
  }, [performance]);

  

  const handleStudentFormChange = (field:string, value:any) => {
    setStudentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePerformanceFormChange = (field:string, value:any) => {
    setPerformanceForm(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handlefetchStudent = async (userid: any) => {
    if (!userid) {
      console.error('handlefetchStudent called without userid');
      return;
    }
  
    console.log('Fetching student for userid:', userid);
    try {
      setLoading(true);
      const response = await fetchStudentByIdAPI(userid);
      if (!response) {
        throw new Error('No student data received');
      }
      console.log('Student fetched successfully:', response._id);
      setStudent(response);
      await handleFetchPerformance(response._id);
    } catch (error) {
      console.error('Error in fetching student data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

const handleFetchPerformance = async (student_id: any) => {
  setPerformanceLoading(true);
  setPerformanceError(null);
  try {
      const response = await fetchStudentPerformanceAPI(student_id);
      setPerformance(response);
  } catch (error: any) {
      setPerformanceError(error.message);
      console.error(`Error in fetching student performance: ${error}`);
  } finally {
      setPerformanceLoading(false);
  }
};

const handleFetchDrives = async () => {
  setDriveLoading(true);
  setDriveError(null);
  try {
    const data = await fetchDrivesAPI();
    setDrives(data);
  } catch (err) {
    setDriveError('Failed to load drives');
    console.error('Error fetching drives:', err);
  } finally {
    setDriveLoading(false);
  }
};

const handleViewDriveDetails = async (driveId: string) => {
  try {
    setDriveLoading(true);
    
    // 1. Fetch drive details
    const driveDetails = await fetchDriveDetailsAPI(driveId);
    
    // 2. Fetch jobs for this drive
    const jobsList = await fetchJobsByDriveAPI(driveId);
    
    // 3. Fetch student's applications if logged in
    let studentApps: JobApplication[] = [];
    if ((student as Student)?._id) {
      studentApps = await getStudentApplicationsAPI((student as Student)._id);
    }
    
    // 4. Fetch requirements and mark applied jobs
    const jobsWithRequirements = await Promise.all(
      jobsList.map(async (job: Job) => {
        if (!job._id) throw new Error('Job ID is undefined');
        const requirements = await fetchRequirementsByJobAPI(job._id);
        return {
          ...job,
          requirement: requirements[0],
          hasApplied: studentApps.some(app => app.job_id === job._id)
        };
      })
    );
    
    const completedriveDetails = {
      ...driveDetails,
      jobs: jobsWithRequirements
    };
    
    setSelectedDrive(completedriveDetails);
    
  } catch (err) {
    console.error('Error fetching drive details:', err);
    setDriveError('Failed to load drive details');
  } finally {
    setDriveLoading(false);
  }
};

const handleApplyToJob = async (jobId: string, driveId: string, companyId: string, resumeFile: File) => {
  console.log('handleApplyToJob called with:', {
    jobId,
    driveId,
    companyId,
    resumeFileName: resumeFile?.name
  });

  if (!student || !(student as Student)._id) {
    console.error('No student ID found');
    setError('No student ID found');
    return;
  }

  if (!resumeFile) {
    console.error('No resume file selected');
    setError('Please select a resume file');
    return;
  }

  try {
    setDriveLoading(true);
    console.log('Calling applyToJobAPI...');
    await applyToJobAPI(
      jobId, 
      (student as Student)._id,
      driveId,
      companyId,
      resumeFile
    );
    
    console.log('Application successful, resetting state...');
    setResumeFile(null);
    
    await handleFetchApplications((student as Student)._id);
    if (selectedDrive?._id) {
      await handleViewDriveDetails(selectedDrive._id);
    }
  } catch (err) {
    console.error('Error applying to job:', err);
    setError('Failed to apply to job');
  } finally {
    setDriveLoading(false);
  }
};

const handleCloseDriveDetails = () => {
  setSelectedDrive(null);
};

useEffect(() => {
  handleFetchDrives();
}, []);

const handleEditStudent = async (student: Student) => {
  try {
    const updateData = {
      first_name: studentForm.first_name || student.first_name,
      middle_name: studentForm.middle_name || student.middle_name,
      last_name: studentForm.last_name || student.last_name,
      address: studentForm.address || student.address,
      city: studentForm.city || student.city,
      state: studentForm.state || student.state,
      district: studentForm.district || student.district,
      email: studentForm.email || student.email,
      alt_email: studentForm.alt_email || student.alt_email,
      ph_no: studentForm.ph_no || student.ph_no,
      alt_ph: studentForm.alt_ph || student.alt_ph,
    };
    
    const response = await updateStudentAPI(student._id, updateData);
    setStudent(response);
  } catch (error) {
    console.error(`Error in updating student name: ${error}`);
    setError(error);
  }
};


const handleFileUpload = async (
  files: FileList, 
  type: string, 
  studentId: string,
  onProgress?: (progress: number) => void
) => {
  try {
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    
    formData.append('type', type);
    formData.append('student_id', studentId);

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            onProgress(progress);
          }
        };
      }

      xhr.onload = async () => {
        if (xhr.status === 200) {
          // Refresh student performance data after upload
        await handleFetchPerformance(studentId);
          resolve(xhr.response);
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error'));
      };

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_BASE_URL}/student-performance/upload-documents`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

const handleDeleteDocument = async (filepath: string, type: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student-performance/documents`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filepath,
        type,
        student_id: (student as Student)._id
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }

    // Refresh performance data after deletion
    await handleFetchPerformance((student as Student)._id);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

const fetchCompaniesByDrive = async (driveId: string) => {
  try {
    const companyIds = await fetchCompaniesByDriveAPI(driveId);
    setDriveCompanyIds(companyIds);
    
    const companies = await fetchCompaniesAPI();
    const filteredCompanies = companies.filter((company: Company) => 
      companyIds.includes(company._id)
    );
    setDriveCompanies(filteredCompanies);
    
    return filteredCompanies;
  } catch (error) {
    console.error('Error fetching companies for drive:', error);
    setError('Failed to load companies');
    return [];
  }
};

const fetchJobsByDrive = async (driveId: string) => {
  try {
    // First get all companies for this drive
    const companyIds = await fetchCompaniesByDriveAPI(driveId);
    setDriveCompanyIds(companyIds);
    
    // Then fetch jobs for each company in this drive
    const allJobs = [];
    for (const companyId of companyIds) {
      const driveCompanyJobs = await fetchJobsByDriveCompanyAPI(driveId, companyId);
      allJobs.push(...driveCompanyJobs);
    }
    
    setJobs(allJobs);
    return allJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    setError('Failed to load jobs');
    return [];
  }
};

const fetchRequirementsByJob = async (jobId: string) => {
  try {
    const requirementsData = await fetchRequirementsByJobAPI(jobId);
    setRequirements(requirementsData);
    return requirementsData;
  } catch (error) {
    console.error('Error fetching requirements:', error);
    setError('Failed to load requirements');
    return [];
  }
};

const handleCompanySelect = async (companyId: string) => {
  try {
    if (!selectedDrive?._id) return;
    
    const company = driveCompanies.find(c => c._id === companyId);
    setSelectedCompany(company || null);
    
    // Fetch jobs specific to this company in the current drive
    const companyJobs = await fetchJobsByDriveCompanyAPI(selectedDrive._id, companyId);
    setJobs(companyJobs);
    
    // Clear previous requirements
    setRequirements([]);
    
    // If there are jobs, fetch requirements for the first job
    if (companyJobs.length > 0) {
      const jobRequirements = await fetchRequirementsByJobAPI(companyJobs[0]._id);
      setRequirements(jobRequirements);
    }
  } catch (error) {
    console.error('Error selecting company:', error);
    setError('Failed to load company details');
  }
};

const handleFetchApplications = async (studentId: string) => {
  try {
    const apps = await getStudentApplicationsAPI(studentId);
    setApplications(apps);
  } catch (err) {
    console.error('Error fetching applications:', err);
    setError('Failed to load applications');
  }
};

const handleResumeFileChange = (file: File | null) => {
  console.log('Resume file changed:', file?.name);
  setResumeFile(file);
};

const handleCreateResume = async (resumeData: Resume) => {
  setResumeLoading(true);
  setResumeError(null);
  try {
    const response = await createResumeAPI(resumeData, (student as Student)._id);
    await handleFetchStudentResumes((student as Student)._id);
    return response;
  } catch (err) {
    setResumeError('Failed to create resume');
    throw err;
  } finally {
    setResumeLoading(false);
  }
};

const handleFetchStudentResumes = async (studentId: string) => {
  setResumeLoading(true);
  setResumeError(null);
  try {
    const resumes = await getStudentResumesAPI(studentId);
    setResumes(resumes || []); // Ensure we set an empty array if no resumes
    return resumes || [];
  } catch (err) {
    setResumeError('Failed to fetch resumes');
    console.error('Error fetching resumes:', err);
    return []; // Return empty array on error
  } finally {
    setResumeLoading(false);
  }
};

const handleUpdateResume = async (resumeId: string, updateData: Partial<Resume>) => {
  setResumeLoading(true);
  setResumeError(null);
  try {
    const updatedResume = await updateResumeAPI(resumeId, updateData);
    await handleFetchStudentResumes((student as Student)._id);
    return updatedResume;
  } catch (err) {
    setResumeError('Failed to update resume');
    throw err;
  } finally {
    setResumeLoading(false);
  }
};

const handleDeleteResume = async (resumeId: string) => {
  setResumeLoading(true);
  setResumeError(null);
  try {
    await deleteResumeAPI(resumeId);
    await handleFetchStudentResumes((student as Student)._id);
  } catch (err) {
    setResumeError('Failed to delete resume');
    throw err;
  } finally {
    setResumeLoading(false);
  }
};

const handleFetchResumeById = async (resumeId: string) => {
  setResumeLoading(true);
  setResumeError(null);
  try {
    const resume = await getResumeAPI(resumeId);
    setSelectedResume(resume);
    return resume;
  } catch (err) {
    setResumeError('Failed to fetch resume');
    console.error('Error fetching resume:', err);
    throw err;
  } finally {
    setResumeLoading(false);
  }
};

const handleDownloadResume = async (resumeId: string, fileName: string) => {
  try {
    const blob = await downloadResumeAPI(resumeId);
    
    // Create and trigger download
    const url = window.URL.createObjectURL(
      new Blob([blob], { type: 'application/pdf' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error in handleDownloadResume:', error);
    throw new Error('Failed to download resume. Please try again.');
  }
};

const handleFormPrefill = async (formUrl: string) => {
  if (!student || !performance) {
      console.error('Missing student or performance data');
      return formUrl;
  }

  try {
      setLoading(true);
      const prefillData: PrefillData = {
          fullName: `${student.first_name} ${student.last_name}`,
          firstname: student.first_name,
          lastname: student.last_name,
          email: student.email,
          phoneNumber: student.ph_no,
          department: student.program,
          registerNumber: student.reg_no,
          address: student.address,
          city: student.city,
          state: student.state,
          district: student.district,
          alt_email: student.alt_email,
          alt_ph: student.alt_ph
      };

      const prefilledUrl = await prefillGoogleFormAPI(formUrl, prefillData);
      return prefilledUrl;
  } catch (error) {
      console.error('Error prefilling form:', error);
      return formUrl; // Fallback to original URL
  } finally {
      setLoading(false);
  }
};

const handleApplyClick = async (formLink: string) => {
  try {
    setLoading(true);
    const prefilledUrl = await handleFormPrefill(formLink);
    window.open(prefilledUrl, '_blank', 'noopener,noreferrer');
    return prefilledUrl;
  } catch (error) {
    console.error('Error handling form prefill:', error);
    // Fallback to original form URL
    window.open(formLink, '_blank', 'noopener,noreferrer');
    return formLink;
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if ((student as Student)?._id) {
    handleFetchStudentResumes((student as Student)._id);
  }
}, [student]);

useEffect(() => {
        console.log(performance);
    }, [performance]);

  return {
    student, setStudent,
    studentForm,
    setStudentForm,
    performanceForm,
    setPerformanceForm,
    handlefetchStudent,
    loading, setLoading,
    error, setError,
    performance, setPerformance,
    performanceLoading,
    performanceError,
    handleFetchPerformance,
    handleEditStudent,
    handleStudentFormChange,
    handlePerformanceFormChange,
    handleFileUpload,
    handleDeleteDocument,
    drives,
    selectedDrive,
    driveLoading,
    driveError,
    handleFetchDrives,
    handleViewDriveDetails,
    handleApplyToJob,
    handleCloseDriveDetails,
    driveCompanies,
    jobs,
    requirements,
    selectedCompany,
    setSelectedCompany,
    selectedJob,
    setSelectedJob,
    fetchCompaniesByDrive,
    fetchJobsByDrive,
    fetchRequirementsByJob,
    handleCompanySelect,
    applications,
    handleFetchApplications,
    resumeFile,
    handleResumeFileChange,
    resumes,
    selectedResume,
    resumeLoading,
    resumeError,
    handleCreateResume,
    handleFetchStudentResumes,
    handleUpdateResume,
    handleDeleteResume,
    setSelectedResume,
    handleFetchResumeById,
    handleDownloadResume,
    handleFormPrefill,
    handleApplyClick,
  };

}
