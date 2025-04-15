// useDriveManagement.ts
'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchDriveByIdAPI, fetchCompaniesAPI, fetchCompaniesByDriveAPI, addDriveAPI, addCompanyAPI, updateCompanyAPI, addDriveCompanyAPI, addJobAPI, fetchJobsByDriveAPI, updateJobAPI, deleteJobAPI, deleteJobByDriveCompanyAPI, deleteJobByDriveAPI, deleteDriveAPI, deleteDriveCompanyByCompanyAPI, deleteDriveCompanyByDriveAPI, updateDriveAPI, addRequirementAPI, fetchRequirementsByJobAPI, updateRequirementAPI } from "./API";

export interface Drive {
    _id: string;
    title: string; //required
    desc?: string; //required
    location?: string; //required
    drive_date?: string | Date ; //required
    applied_students?: string[];
    stages?: string[]; //required
    selected_students?: string[];
    send_to?: string[];
    created_at?: string;
    application_deadline?: string | Date; //required
    additional_instructions?: string; //required
    form_link?: string;
}

export interface Company {
    _id: string;
    name: string; //required
    site?: string; //required
    branch: string; //required
    desc?: string; //required
    email?: string; //required
    ph_no?: string; //required
    avg_salary?: number;
    placed_students?: string[];
}

export interface Job {
    _id: string;
    company: string;
    drive: string;
    title: string; //required
    desc?: string; //required
    loc?: string; //required
    requirement?: string;
    experience: number; //required
    salary?: number; //required
    join_date: string | Date; //required
    last_date: string | Date; //required
    contact_person?: string; //required
    contact_email?: string; //required
    additional_instructions?: string; //required
    form_link?: string;
}

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

interface ProgressTracker {
    id: string;
    progress: number;
}

export const useDriveManagement = () => {
    const router = useRouter(); // Add this line at the top with other hooks
    
    // Drive states
    const [drive, setDrive] = useState<Drive | undefined>();
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [location, setLocation] = useState("");
    const [drive_date, setDriveDate] = useState<Date | null>(null);
    const [stages, setStages] = useState<string[]>([""]); // Initialize with one empty level
    const [application_deadline, setApplicationDeadline] = useState<Date | null>(null);
    const [additional_instructions, setAdditionalInstructions] = useState("");
    const [driveform_link, setDriveFormLink] = useState("");

    // Company states
    const [all_companies, setCompanies] = useState<Company[]>([]);
    const [drive_companies, setDriveCompanies] = useState<Company[]>([]);
    const [companyName, setCompanyName] = useState("");
    const [companyDesc, setCompanyDesc] = useState("");
    const [branch, setBranch] = useState("");
    const [site, setSite] = useState("");
    const [email, setEmail] = useState("");
    const [ph_no, setPhNo] = useState("");
    const [avg_salary, setAvgSalary] = useState<number>(0);

    // Job states
    const [jobs, setJobs] = useState<Job[] | undefined>();
    const [jobTitle, setJobTitle] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [jobLocation, setJobLocation] = useState("");
    const [jobRequirement, setJobRequirement] = useState("");
    const [jobExperience, setJobExperience] = useState(0);
    const [jobSalary, setJobSalary] = useState(0);
    const [joinDate, setJoinDate] = useState<Date | null>(null);
    const [lastDate, setLastDate] = useState<Date | null>(null);
    const [contactPerson, setContactPerson] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [job_additional_instructions, setJobInstructions] = useState("");
    const [jobform_link, setJobFormLink] = useState("");

    // Requirement states
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [requirementDesc, setRequirementDesc] = useState("");
    const [requirement_id, setRequirementId] = useState("");
    
    // Additional requirement states
    const [sslcCgpa, setSslcCgpa] = useState(0);
    const [plustwoCgpa, setPlustwoCgpa] = useState(0);
    const [degreeCgpa, setDegreeCgpa] = useState(0);
    const [mcaCgpa, setMcaCgpa] = useState<number[]>([]);
    const [contract, setContract] = useState(0);
    const [additionalCriteria, setAdditionalCriteria] = useState("");
    const [skillsRequired, setSkillsRequired] = useState<string[]>([]);
    const [preferredQualifications, setPreferredQualifications] = useState<string[]>([]);
    const [requiredCertifications, setRequiredCertifications] = useState<string[]>([]);
    const [languageRequirements, setLanguageRequirements] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState("");

    // UI states
    const [selected, setSelected] = useState("general");
    const [disabled, setDisabled] = useState(["Companies", "Jobs"]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Action states
    const [actionStates, setActionStates] = useState({
        addingDrive: false,
        updatingDrive: false,
        deletingDrive: false,
        addingCompany: false,
        updatingCompany: false,
        deletingCompany: false,
        addingJob: false,
        updatingJob: false,
        deletingJob: false,
        addingRequirement: false,
        updatingRequirement: false,
        deletingRequirement: false
    });

    // Entity IDs
    const [drive_id, setDriveId] = useState("");
    const [drive_company_ids, setDriveCompanyIds] = useState<string[]>([]);
    const [company_id, setCompanyId] = useState("");
    const [job_id, setJobId] = useState("");

    // Progress states
    const [companyProgressList, setCompanyProgressList] = useState<ProgressTracker[]>([]);
    const [jobProgressList, setJobProgressList] = useState<ProgressTracker[]>([]);
    const [driveProgress, setDriveProgress] = useState(0);

    // Core fetch effects
    useEffect(() => {
        fetchCompanies();
    }, [drive_companies]);

    useEffect(() => {
        if (drive_id) {
            fetchCompaniesByDrive(drive_id);
            fetchJobsByDrive(drive_id);
        }
    }, [drive_id, drive_company_ids]);

    // Action effects
    useEffect(() => {
        const handleActions = async () => {
            try {
                setLoading(true);
                if (actionStates.addingDrive) await handleAddDrive();
                if (actionStates.updatingDrive && drive_id) await handleUpdateDrive(drive_id);
                if (actionStates.deletingDrive && drive_id) await handleDeleteDrive(drive_id);
                if (actionStates.addingCompany && drive_id) await handleAddCompany();
                if (actionStates.updatingCompany && company_id) await handleUpdateCompany(company_id);
                if (actionStates.deletingCompany && company_id) {
                    await handleDeleteJobsByDriveCompany(drive_id, company_id);
                    await handleDeleteDriveCompanyByCompany(company_id);
                    await fetchCompaniesByDrive(drive_id);
                }
                if (actionStates.addingJob && company_id) await handleAddJob(drive_id, company_id, jobTitle, jobExperience);
                if (actionStates.updatingJob && job_id) await handleUpdateJob(job_id, jobTitle, jobExperience);
                if (actionStates.deletingJob && job_id) await handleDeleteJob(job_id);
                if (actionStates.addingRequirement && job_id) await handleAddRequirement(job_id);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
                // Reset all action states
                setActionStates({
                    addingDrive: false,
                    updatingDrive: false,
                    deletingDrive: false,
                    addingCompany: false,
                    updatingCompany: false,
                    deletingCompany: false,
                    addingJob: false,
                    updatingJob: false,
                    deletingJob: false,
                    addingRequirement: false,
                    updatingRequirement: false,
                    deletingRequirement: false
                });
            }
        };

        if (Object.values(actionStates).some(state => state)) {
            handleActions();
        }
    }, [actionStates]);

    useEffect(() => {
        const driveData = {
            title,
            desc,
            location,
            drive_date: drive_date || undefined,
            stages,
            application_deadline: application_deadline || undefined,
            additional_instructions
        };
        setDriveProgress(calculateDriveProgress(driveData));
    }, [title, desc, location, drive_date, stages, application_deadline, additional_instructions]);

    useEffect(() => {
        if (drive_companies) {
            const progressList = drive_companies.map(company => ({
                id: company._id || '',
                progress: calculateCompanyProgress(company)
            }));
            setCompanyProgressList(progressList);
        }
    }, [drive_companies]);

    useEffect(() => {
        if (jobs) {
            const progressList = jobs.map(job => ({
                id: job._id || '',
                progress: calculateJobProgress(job)
            }));
            setJobProgressList(progressList);
        }
    }, [jobs]);

    const fetchCompanies = async () => {
        try {
            const data = await fetchCompaniesAPI();
            setCompanies(data);
        } catch (err: any) {
            console.error("Error fetching all_companies:", err.message);
            setError(err.message);
        }
    };

    const fetchCompaniesByDrive = async (driveId: string) => {
        try {
            await filterCompanies();
            const data = await fetchCompaniesByDriveAPI(driveId);
            if (JSON.stringify(data) !== JSON.stringify(drive_company_ids)) {
                setDriveCompanyIds(data);
            }
                        await filterCompanies();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const fetchJobsByDrive = async (driveId: string) => {
        try {
            const data = await fetchJobsByDriveAPI(driveId);
            setJobs(data);
            
            // For each job, fetch its requirements
            if (data && data.length > 0) {
                for (const job of data) {
                    await fetchRequirementsByJob(job._id);
                }
            }

            if (data) {
                const jobProgress = data.map((job: Job) => ({
                    id: job._id || '',
                    progress: calculateJobProgress(job)
                }));
                setJobProgressList(jobProgress);
            }
            return data;
        } catch (err: any) {
            console.error("Error fetching jobs by drive:", err.message);
            setError(err.message);
        }
    };

    const handleAddDrive = async () => {
        try {
            const driveData: Partial<Drive> = {
                title,
                ...(desc && { desc }),
                ...(location && { location }),
                ...(drive_date && { drive_date: drive_date.toISOString() }),
                ...(application_deadline && { application_deadline: application_deadline.toISOString() }),
                ...(additional_instructions && { additional_instructions }),
                ...(driveform_link && { form_link: driveform_link }), // Add this line
                ...(stages && { stages }),
            };
            const data = await addDriveAPI(driveData);
            console.log("The stages were", data.stages);
            setDrive(data.data);
            setDriveId(data.data._id);
              // Update all the form states with the updated drive data
              setTitle(data.title);
              setDesc(data.desc);
              setLocation(data.location);
              setDriveDate(data.drive_date ? new Date(data.drive_date) : null);
              setApplicationDeadline(data.application_deadline ? new Date(data.application_deadline) : null);
              setAdditionalInstructions(data.additional_instructions);
            setStages(data.data.stages || []);
            setSelected("Companies");
        } catch (err: any) {
            console.error("Error in handleAddDrive:", err);
            setError(err.message);
            throw err;
        }
    };

    const handleUpdateDrive = async (driveId: string) => {
        try {
            const driveData: Partial<Drive> = {
                ...(title && { title }),
                ...(desc && { desc }),
                ...(location && { location }),
                ...(drive_date && { drive_date: drive_date.toISOString() }),
                ...(application_deadline && { application_deadline }),
                ...(additional_instructions && { additional_instructions }),
                ...(driveform_link && { form_link: driveform_link }), // Add this line
                stages: stages,
            };
            const data = await updateDriveAPI(driveId, driveData);

            // Update all the form states with the updated drive data
            setTitle(data.data.title);
            setDesc(data.data.desc);
            setLocation(data.data.location);
            setDriveDate(data.data.drive_date ? new Date(data.data.drive_date) : null);
            setApplicationDeadline(data.data.application_deadline ? new Date(data.data.application_deadline) : null);
            setAdditionalInstructions(data.data.additional_instructions);
            setStages(data.data.stages || []);
            console.log("The stages were", data.stages);


            if(!jobs){
                setDisabled(["Jobs"]);
            }
            setSelected("Companies");
            return data;
        } catch (err: any) {
            console.error("Error in handleUpdateDrive:", err);
            setError(err.message);
            throw err;
        }
    };

    const handleDeleteDrive = async (driveId: string) => {
        try {
            await handleDeleteJobsByDrive(driveId);
            await handleDeleteCompaniesByDrive(driveId);
            const response = await deleteDriveAPI(driveId);
            
            // Reset all states
            setTitle("");
            setLocation("");
            setDisabled(["Companies","Jobs"]);
            setSelected("general");
            setDriveId("");
            setDesc("");
            setAdditionalInstructions("");
            setStages([]);
            setDriveDate(null);
            setApplicationDeadline(null);
            
            // Navigate to drives list page after successful deletion
            router.push("/faculty/drives");
            
            return response;
        } catch (err: any) {
            console.error("Error in handleDeleteDrive:", err);
            setError(err);
            throw error;
        }
    };

    const handleAddCompany = async () => {
        try {
            const companyData: Partial<Company> = {
                name: companyName,
                branch,
                desc,
                site,
                email,
                ph_no,
                avg_salary
            };
            const data = await addCompanyAPI(companyData);
            setCompanyId(data._id);
            
            // Update progress immediately after adding
            const newProgress = calculateCompanyProgress(data);
            setCompanyProgressList(prev => [...prev, { id: data._id, progress: newProgress }]);
            
            setCompanyName("");
            setBranch("");
            setDisabled([]);
            await handleAddDriveCompany(drive_id, data._id);
            await fetchCompaniesByDrive(drive_id);
            setSelected("Jobs");
        } catch (err: any) {
            console.error("Error in handleAddCompany:", err);
            setError(err.message);
            throw err;
        }
    };

    const handleAddDriveCompany = async (driveId: string, companyId: string) => {
        try {
            console.log('Attempting to add drive company:', {driveId, companyId});
            const data = await addDriveCompanyAPI(driveId, companyId);
            console.log('Drive company add response:', data);
            await fetchCompaniesByDrive(drive_id);
            await filterCompanies();
            return data;
        } catch (err: any) {
            console.error("Error in handleAddDriveCompany:", err);
            setError(err);
            throw err;
        }
    };

    const handleUpdateCompany = async (company_id: string) => {
        try {
            const currentCompany = drive_companies.find(company => company._id === company_id);
            if (!currentCompany) {
                throw new Error("Company not found");
            }

            const companyData: Partial<Company> = {
                name: companyName?.trim?.() || currentCompany.name,
                branch: branch?.trim?.() || currentCompany.branch,
                desc: desc?.trim?.() || currentCompany.desc,
                site: site?.trim?.() || currentCompany.site,
                email: email?.trim?.() || currentCompany.email,
                ph_no: ph_no?.trim?.() || currentCompany.ph_no,
            };

            const data = await updateCompanyAPI(company_id, companyData);
            await fetchCompaniesByDrive(drive_id);
            setCompanyName(data.data.name);
            setBranch(data.data.branch);
            setSite(data.data.site);
            setEmail(data.data.email);
            setPhNo(data.data.ph_no);
            setCompanyDesc(data.data.desc);
            setDisabled([]);
        } catch (err: any) {
            console.error("Error in handleUpdateCompany:", err);
            setError(err.message);
            throw err;
        }
    };

    const handleDeleteCompaniesByDrive = async (driveId: string) => {
        try {
            const data = await deleteDriveCompanyByDriveAPI(driveId);
            return data;
        } catch (err: any) {
            console.error("Error in handleDeleteCompaniesByDrive:", err);
            setError(err);
            throw err;
        }
    };

    const handleDeleteDriveCompanyByCompany = async (companyId: string) => {
        try {
            const data = await deleteDriveCompanyByCompanyAPI(companyId);
            return data;
        } catch (err: any) {
            console.error("Error in handleDeleteDriveCompanyByCompany:", err);
            setError(err);
            throw err;
        }
    };

const handleAddJob = async (driveId: string, companyId: string, jobTitle: string, jobExperience: number) => {
    try {
        const jobData: Partial<Job> = {
            company: companyId,
            drive: driveId,
            title: jobTitle,
            experience: jobExperience,
            desc: jobDesc,
            loc: jobLocation,
            requirement: jobRequirement,
            salary: jobSalary,
            ...(joinDate && { join_date: joinDate }),
            ...(lastDate && { last_date: lastDate }),
            contact_person: contactPerson,
            contact_email: contactEmail,
            form_link: jobform_link,  // Add this line
            additional_instructions: job_additional_instructions
        };

        const data = await addJobAPI(driveId, companyId, jobData);
        
        // Update progress immediately after adding
        const newProgress = calculateJobProgress(data);
        setJobProgressList(prev => [...prev, { id: data._id, progress: newProgress }]);
        
        await fetchJobsByDrive(driveId);
        

        setDisabled([]);
        return data;
    } catch (err:any) {
        console.error("Error in handleAddJob:", err);
        setError(err.message);
        throw err;
    }
};

const handleUpdateJob = async (jobId: string, jobTitle: string, jobExperience: number) => {
    try {
        const currentJob = jobs?.find(job => job._id === jobId);
        if (!currentJob) {
            throw new Error("Job not found");
        }

        const jobData: Partial<Job> = {
            title: jobTitle?.trim?.() === "" ? currentJob.title : jobTitle,
            experience: !jobExperience ? currentJob.experience : jobExperience,
            desc: jobDesc?.trim?.() === "" ? currentJob.desc : jobDesc,
            loc: jobLocation?.trim?.() === "" ? currentJob.loc : jobLocation,
            salary: jobSalary ? jobSalary : currentJob.salary,
            join_date: !joinDate ? currentJob.join_date : joinDate,
            last_date: !lastDate ? currentJob.last_date : lastDate,
            contact_person: contactPerson?.trim?.() === "" ? currentJob.contact_person : contactPerson,
            contact_email: contactEmail?.trim?.() === "" ? currentJob.contact_email : contactEmail,
            form_link: jobform_link?.trim?.() === "" ? currentJob.form_link : jobform_link, // Add this line
            additional_instructions: job_additional_instructions?.trim?.() === "" ? currentJob.additional_instructions : job_additional_instructions
        };

        const data = await updateJobAPI(jobId, jobData);
        await fetchJobsByDrive(drive_id);
        setJobTitle(data.title);
        setJobExperience(data.experience);
        setJobDesc(data.desc);
        setJobLocation(data.loc);
        setJobSalary(data.salary);
        setJoinDate(data.join_date);
        setLastDate(data.last_date);
        setContactPerson(data.contact_person);
        setContactEmail(data.contact_email);
        setJobInstructions(data.additional_instructions);
        setJobFormLink(data.form_link);
        setDisabled([]);
        return data;
    } catch (err: any) {
        console.error("Error in handleUpdateJob:", err);
        setError(err.message);
        throw err;
    }
};

const handleDeleteJob = async (jobId: string) => {
    try {
        const data = await deleteJobAPI(jobId);
        await fetchJobsByDrive(drive_id);
        setDisabled([]);
        return data;
    } catch (err: any) {
        console.error("Error in handleDeleteJob:", err);
        setError(err);
        throw err;
    }
};


const handleDeleteJobsByDrive = async (driveId: string) => {
    try {
        const data = await deleteJobByDriveAPI(driveId);
        return data;
    } catch (err:any) {
        console.error("Error in handleDeleteJobsByDrive:", err);
        setError(err);
        throw err;
    }
};

const handleDeleteJobsByDriveCompany = async (driveId: string, companyId: string) => {
    try {
        const data = await deleteJobByDriveCompanyAPI(driveId, companyId);
        return data;
    } catch (err:any) {
        console.error("Error in handleDeleteJobsByDriveCompany:", err);
        setError(err)
        throw err;
    }
};

const filterCompanies = async () => {
    if (!drive_company_ids || !all_companies) {
        return;
    }
    
    const value = all_companies.filter((company: Company) => {
    if (company._id && drive_company_ids.length > 0 && company._id.toString) {
        const stringId = company._id.toString();
        const hasMatch = drive_company_ids.includes(stringId);
        return hasMatch;
    }
    return company._id ? drive_company_ids.includes(company._id) : false;
    });
    setDriveCompanies(value);
};

const startAction = (actionName:any) => {
    setActionStates(prev => ({ ...prev, [actionName]: true }));
};

const fetchCompleteDrive = async (driveId: string) => {
    try {
        // Add loading state
        setLoading(true);
        // Fetch drive details
        const driveData = await fetchDriveByIdAPI(driveId);
        setDrive(driveData);
        setTitle(driveData.title);
        setLocation(driveData.location);
        setDesc(driveData.desc);
        setDriveDate(driveData.drive_date ? new Date(driveData.drive_date) : null);
        setApplicationDeadline(driveData.application_deadline ? new Date(driveData.application_deadline) : null);
        setAdditionalInstructions(driveData.additional_instructions);
        setStages(driveData.stages); // Initialize with fetched levels or one empty level
        // Initialize with fetched levels or one empty level
        
        // Calculate drive progress after fetching
        setDriveProgress(calculateDriveProgress(driveData));
        
        // Fetch companies
        const data = await fetchCompaniesAPI();
        setCompanies(data);
        
        const companiesData = await fetchCompaniesByDriveAPI(driveId);
        setDriveCompanyIds(data);
        
        await filterCompanies();
        
        // Calculate company progress after fetching companies
        if (drive_companies) {
            const companyProgress = drive_companies.map(company => ({
                id: company._id || '',
                progress: calculateCompanyProgress(company)
            }));
            setCompanyProgressList(companyProgress);
        }

        // Fetch jobs
        await fetchJobsByDrive(driveId);
        
        setDisabled([]);
    } catch (err:any) {
        console.error("Error in fetchCompleteDrive:", err);
        setError(err);
    } finally {
        setLoading(false);
    }
};

const calculateDriveProgress = (drive: Partial<Drive>): number => {
    const requiredFields = ['title'];
    const optionalFields = ['desc', 'location', 'drive_date', 'stages', 'application_deadline', 'additional_instructions', 'form_link']; // Add form_link
    
    let progress = 0;
    let totalWeight = requiredFields.length * 2 + optionalFields.length;

    requiredFields.forEach(field => {
        const value = drive[field as keyof Drive];
        if (value && String(value).trim() !== '') progress += 2;
    });

    optionalFields.forEach(field => {
        const value = drive[field as keyof Drive];
        if (value) {
            if (Array.isArray(value)) {
                // For arrays like stages, check if they have non-empty values
                if (value.some(item => item && String(item).trim() !== '')) progress += 1;
            } else if (value instanceof Date) {
                progress += 1;
            } else if (String(value).trim() !== '') {
                progress += 1;
            }
        }
    });
    
    console.log('Drive progress calculated:', progress, 'from drive:', drive);
    return Math.min(100, Math.round((progress / totalWeight) * 100));
};

const calculateCompanyProgress = (company: Company): number => {
    const requiredFields = ['name', 'branch'];
    const optionalFields = ['site', 'desc', 'email', 'ph_no'];
    
    let progress = 0;
    let totalWeight = requiredFields.length * 2 + optionalFields.length;

    requiredFields.forEach(field => {
        const value = company[field as keyof Company];
        if (value && String(value).trim() !== '') progress += 2;
    });

    optionalFields.forEach(field => {
        const value = company[field as keyof Company];
        if (value && String(value).trim() !== '') progress += 1;
    });
    
    console.log('Company progress calculated:', progress, 'for company:', company.name);
    return Math.min(100, Math.round((progress / totalWeight) * 100));
};

const calculateJobProgress = (job: Job): number => {
    const requiredFields = ['title', 'experience'];
    const optionalFields = ['desc', 'loc', 'salary', 'join_date', 'last_date', 'contact_person', 'contact_email', 'form_link']; // Add form_link
    
    let progress = 0;
    let totalWeight = requiredFields.length * 2 + optionalFields.length;

    requiredFields.forEach(field => {
        const value = job[field as keyof Job];
        if (value && (typeof value === 'number' || String(value).trim() !== '')) progress += 2;
    });

    optionalFields.forEach(field => {
        const value = job[field as keyof Job];
        if (value && (typeof value === 'number' || String(value).trim() !== '')) progress += 1;
    });
    
    console.log('Job progress calculated:', progress, 'for job:', job.title);
    return Math.min(100, Math.round((progress / totalWeight) * 100));
};

const handleAddRequirement = async (jobId: string) => {
    try {
        // Debug logging
        console.log('Starting handleAddRequirement for jobId:', jobId);
        console.log('Current requirements state:', requirements);
        
        const existingRequirement = requirements.find(req => req.job === jobId);
        console.log('Existing requirement found:', existingRequirement);
        
        const requirementData: Partial<Requirement> = {
            job: jobId,
            experience_required: jobExperience,
            sslc_cgpa: sslcCgpa,
            plustwo_cgpa: plustwoCgpa,
            degree_cgpa: degreeCgpa,
            mca_cgpa: mcaCgpa,
            contract: contract,
            additional_criteria: additionalCriteria,
            skills_required: skillsRequired,
            preferred_qualifications: preferredQualifications,
            required_certifications: requiredCertifications,
            language_requirements: languageRequirements
        };
        
        // Debug logging of payload
        console.log('Requirement data to be sent:', JSON.stringify(requirementData, null, 2));
        
        let data;
        if (existingRequirement && existingRequirement._id) {
            console.log('Updating existing requirement with ID:', existingRequirement._id);
            await handleUpdateRequirement(existingRequirement._id);
        } else {
            console.log('Creating new requirement');
            data = await addRequirementAPI(jobId, requirementData);
        }
        
        console.log('API Response:', data);
        setRequirementId(data._id || '');
        setSslcCgpa(data.sslc_cgpa || 0);
        setPlustwoCgpa(data.plustwo_cgpa || 0);
        setDegreeCgpa(data.degree_cgpa || 0);
        setMcaCgpa(data.mca_cgpa || []);
        setContract(data.contract || 0);
        setAdditionalCriteria(data.additional_criteria || "");
        setSkillsRequired(data.skills_required || []);
        setPreferredQualifications(data.preferred_qualifications || []);
        setRequiredCertifications(data.required_certifications || []);
        setLanguageRequirements(data.language_requirements || []);
        setRequirementDesc(data.requirement_desc || "");
        
        await fetchRequirementsByJob(jobId);
        return data;
    } catch (err: any) {
        console.error('Error in handleAddRequirement:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            stack: err.stack
        });
        setError(err.message);
        throw err;
    }
};

const handleUpdateRequirement = async (requirementId: string) => {
    try {
        console.log('Starting handleUpdateRequirement for requirementId:', requirementId);
        
        const currentRequirement = requirements.find(req => req._id === requirementId);
        console.log('Current requirement found:', currentRequirement);

        if (!currentRequirement) {
            throw new Error("Requirement not found");
        }

        // Create requirementData with all fields explicitly
        const requirementData: Partial<Requirement> = {
            job: currentRequirement.job,
            experience_required: Number(jobExperience) || 0,
            sslc_cgpa: Number(sslcCgpa) || 0,
            plustwo_cgpa: Number(plustwoCgpa) || 0,
            degree_cgpa: Number(degreeCgpa) || 0,
            mca_cgpa: mcaCgpa || [],
            contract: Number(contract) || 0,
            additional_criteria: additionalCriteria || '',
            skills_required: skillsRequired || [],
            preferred_qualifications: preferredQualifications || [],
            required_certifications: requiredCertifications || [],
            language_requirements: languageRequirements || []
        };

        // Debug logging of final payload
        console.log('Requirement update data to be sent:', JSON.stringify(requirementData, null, 2));

        // Make the API call and store response
        const response = await updateRequirementAPI(requirementId, requirementData);
        console.log('API Update Response:', response);

        if (!response) {
            throw new Error('No response from update API');
        }

        // Update local state with the response data
        setRequirementId(response._id);
        setSslcCgpa(response.sslc_cgpa);
        setPlustwoCgpa(response.plustwo_cgpa);
        setDegreeCgpa(response.degree_cgpa);
        setMcaCgpa(response.mca_cgpa || []);
        setContract(response.contract);
        setAdditionalCriteria(response.additional_criteria || '');
        setSkillsRequired(response.skills_required || []);
        setPreferredQualifications(response.preferred_qualifications || []);
        setRequiredCertifications(response.required_certifications || []);
        setLanguageRequirements(response.language_requirements || []);

        // Refresh requirements list
        await fetchRequirementsByJob(currentRequirement.job);
        
        return response;
    } catch (err: any) {
        console.error('Error in handleUpdateRequirement:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            stack: err.stack
        });
        setError(err.message);
        throw err;
    }
};

const fetchRequirementsByJob = async (jobId: string) => {
    try {
        const data = await fetchRequirementsByJobAPI(jobId);
        setRequirements(data);
        
        // If we have requirements data, set all the states with the first requirement
        if (data && data.length > 0) {
            const requirement = data[0];
            setJobExperience(requirement.experience_required || 0);
            setSslcCgpa(requirement.sslc_cgpa || 0);
            setPlustwoCgpa(requirement.plustwo_cgpa || 0);
            setDegreeCgpa(requirement.degree_cgpa || 0);
            setMcaCgpa(requirement.mca_cgpa || []);
            setContract(requirement.contract || 0);
            setAdditionalCriteria(requirement.additional_criteria || '');
            setSkillsRequired(requirement.skills_required || []);
            setPreferredQualifications(requirement.preferred_qualifications || []);
            setRequiredCertifications(requirement.required_certifications || []);
            setLanguageRequirements(requirement.language_requirements || []);
            setRequirementId(requirement._id || '');
        }
        
        return data;
    } catch (err: any) {
        console.error("Error fetching requirements:", err.message);
        setError(err.message);
    }
};

return {
    // Drive states
    drive, setDrive,
    title, setTitle,
    desc, setDesc,
    location, setLocation,
    drive_date, setDriveDate,
    stages, setStages,
    application_deadline, setApplicationDeadline,
    additional_instructions, setAdditionalInstructions,
    driveform_link, setDriveFormLink,

    // Company states
    drive_companies,
    all_companies,
    companyName, setCompanyName,
    companyDesc, setCompanyDesc,
    branch, setBranch,
    site, setSite,
    email, setEmail,
    ph_no, setPhNo,
    avg_salary, setAvgSalary,

    // Job states
    jobs, setJobs,
    jobTitle, setJobTitle,
    jobDesc, setJobDesc,
    jobLocation, setJobLocation,
    jobRequirement, setJobRequirement,
    jobExperience, setJobExperience,
    jobSalary, setJobSalary,
    joinDate, setJoinDate,
    lastDate, setLastDate,
    contactPerson, setContactPerson,
    contactEmail, setContactEmail,
    job_additional_instructions, setJobInstructions,
    jobform_link, setJobFormLink,

    // Requirement states and handlers
    requirements,
    requirementDesc, setRequirementDesc,
    requirement_id, setRequirementId,
    sslcCgpa, setSslcCgpa,
    plustwoCgpa, setPlustwoCgpa,
    degreeCgpa, setDegreeCgpa,
    mcaCgpa, setMcaCgpa,
    contract, setContract,
    additionalCriteria, setAdditionalCriteria,
    skillsRequired, setSkillsRequired,
    preferredQualifications, setPreferredQualifications,
    requiredCertifications, setRequiredCertifications,
    languageRequirements, setLanguageRequirements,
    skillInput, setSkillInput,
    
    // IDs
    drive_id, setDriveId,
    company_id, setCompanyId,
    job_id, setJobId,

    // UI states
    disabled,
    selected, setSelected,
    error,
    loading,

    // Action handlers
    startAddingDrive: () => startAction('addingDrive'),
    startUpdatingDrive: () => startAction('updatingDrive'),
    startDeletingDrive: () => startAction('deletingDrive'),
    startAddingCompany: () => startAction('addingCompany'),
    startUpdatingCompany: () => startAction('updatingCompany'),
    startDeletingCompany: () => startAction('deletingCompany'),
    startAddingJob: () => startAction('addingJob'),
    startUpdatingJob: () => startAction('updatingJob'),
    startDeletingJob: () => startAction('deletingJob'),
    startAddingRequirement: () => startAction('addingRequirement'),
    startUpdatingRequirement: () => startAction('updatingRequirement'),
    startDeletingRequirement: () => startAction('deletingRequirement'),
    
    // Fetch function
    fetchCompleteDrive,
    fetchRequirementsByJob,

    // Progress states
    driveProgress,
    companyProgressList,
    jobProgressList,
};

}