// hooks/usePublishManagement.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchEligibleStudentsforJobAPI, fetchStudentsAPI } from './API'; // Assuming API functions are here or imported correctly
import { Job } from './types'; // Assuming types are defined/imported correctly
import { Student } from '@/app/students/components/types';

interface UsePublishManagementProps {
    isOpen: boolean;
    drive_id: string | null;
    jobs: Job[] | undefined; // Jobs for the current drive
}

export const usePublishManagement = ({ isOpen, drive_id, jobs = [] }: UsePublishManagementProps) => {
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [allStudents, setAllStudents] = useState<Student[]>([]); // For the "Add" dropdown

    // State for caching and modifications
    const [eligibleStudentsCache, setEligibleStudentsCache] = useState<Record<string, string[]>>({});
    const [modifiedEligibleStudents, setModifiedEligibleStudents] = useState<Record<string, string[]>>({});

    // State for loading/error handling
    const [jobLoadingStates, setJobLoadingStates] = useState<Record<string, boolean>>({});
    const [jobErrorStates, setJobErrorStates] = useState<Record<string, string | null>>({});
    const [isFetchingAllStudents, setIsFetchingAllStudents] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    // --- Helper: Reset State ---
    const resetState = useCallback(() => {
        setActiveJobId(jobs.length > 0 ? jobs[0]._id : null);
        // Keep allStudents fetched unless drive_id changes significantly
        // setAllStudents([]); 
        setEligibleStudentsCache({});
        setModifiedEligibleStudents({});
        setJobLoadingStates({});
        setJobErrorStates({});
        setGeneralError(null);
        // setIsFetchingAllStudents(false); // Don't reset this unless refetching
    }, [jobs]);

    // --- Data Fetching ---

    // Fetch all students once when the modal opens or drive_id changes
    useEffect(() => {
        if (isOpen && drive_id) {
            const loadAllStudents = async () => {
                setIsFetchingAllStudents(true);
                setGeneralError(null);
                try {
                    const students = await fetchStudentsAPI(); // Use the existing API call
                    setAllStudents(students || []);
                } catch (error) {
                    console.error("Error fetching all students:", error);
                    setGeneralError(`Failed to load student list: ${(error as Error).message}`);
                } finally {
                    setIsFetchingAllStudents(false);
                }
            };
            loadAllStudents();
        }
        // Reset internal state if drive_id changes while open, or when modal opens
        resetState();

    }, [isOpen, drive_id, resetState]); // Include resetState in dependencies

     // Set initial active job ID when jobs load
     useEffect(() => {
        if (isOpen && jobs.length > 0 && !activeJobId) {
            setActiveJobId(jobs[0]._id);
        }
    }, [isOpen, jobs, activeJobId]);


    // Fetch eligible students for the active job (if not cached/modified)
    const handleFetchEligibleStudents = useCallback(async (job_id: string) => {
        if (!job_id || eligibleStudentsCache[job_id] || jobLoadingStates[job_id]) {
            return; // Don't fetch if no job, already cached, or already loading
        }

        setJobLoadingStates(prev => ({ ...prev, [job_id]: true }));
        setJobErrorStates(prev => ({ ...prev, [job_id]: null }));
        setGeneralError(null);

        try {
            const response = await fetchEligibleStudentsforJobAPI(job_id);
            setEligibleStudentsCache(prev => ({ ...prev, [job_id]: response || [] }));
        } catch (err: unknown) {
            console.error(`Error fetching eligible students for job ${job_id}`, err);
            setJobErrorStates(prev => ({ ...prev, [job_id]: (err as Error).message || 'Failed to fetch' }));
        } finally {
            setJobLoadingStates(prev => ({ ...prev, [job_id]: false }));
        }
    }, [eligibleStudentsCache, jobLoadingStates]); // Dependencies

    // Trigger fetch when activeJobId changes and data isn't modified/cached
    useEffect(() => {
        if (activeJobId && !modifiedEligibleStudents[activeJobId]) {
             handleFetchEligibleStudents(activeJobId);
        }
    }, [activeJobId, modifiedEligibleStudents, handleFetchEligibleStudents]);


    // --- State Derivation (using useMemo for performance) ---

    // Get the list of student IDs to display (prioritizes modified list)
    const currentDisplayedStudentIds = useMemo((): string[] => {
        if (!activeJobId) return [];
        // Return modified list if it exists, otherwise the cached list, or empty array
        return modifiedEligibleStudents[activeJobId] ?? eligibleStudentsCache[activeJobId] ?? [];
    }, [activeJobId, modifiedEligibleStudents, eligibleStudentsCache]);

    // Create a map of all students for efficient lookup
    const allStudentsMap = useMemo(() => {
        return new Map(allStudents.map(s => [s._id, s]));
    }, [allStudents]);

    // Get full student objects for the displayed list
    const currentDisplayedStudents = useMemo((): Student[] => {
        return currentDisplayedStudentIds
            .map(id => allStudentsMap.get(id))
            .filter((s): s is Student => s !== undefined); // Type guard to filter out undefined
    }, [currentDisplayedStudentIds, allStudentsMap]);

     // Get students available to be added (all students minus those already in the current list)
     const availableToAddStudents = useMemo((): Student[] => {
        const currentIdsSet = new Set(currentDisplayedStudentIds);
        return allStudents.filter(s => !currentIdsSet.has(s._id));
    }, [allStudents, currentDisplayedStudentIds]);

    // --- Event Handlers ---

    const handleTabChange = useCallback((newJobId: string) => {
        setActiveJobId(newJobId);
        // Fetching is handled by the useEffect watching activeJobId
    }, []);

    const handleRemoveStudent = useCallback((studentIdToRemove: string) => {
        if (!activeJobId) return;
        // Ensure we start from the correct base list (modified or cached)
        const currentList = modifiedEligibleStudents[activeJobId] ?? eligibleStudentsCache[activeJobId] ?? [];
        const newList = currentList.filter(id => id !== studentIdToRemove);
        // Always update the modified list state when user interacts
        setModifiedEligibleStudents(prev => ({ ...prev, [activeJobId]: newList }));
    }, [activeJobId, modifiedEligibleStudents, eligibleStudentsCache]);

    const handleAddStudent = useCallback((studentIdToAdd: string) => {
        if (!activeJobId || !studentIdToAdd) return;
        // Ensure we start from the correct base list
        const currentList = modifiedEligibleStudents[activeJobId] ?? eligibleStudentsCache[activeJobId] ?? [];
        // Avoid adding duplicates
        if (!currentList.includes(studentIdToAdd)) {
            const newList = [...currentList, studentIdToAdd];
             // Always update the modified list state when user interacts
            setModifiedEligibleStudents(prev => ({ ...prev, [activeJobId]: newList }));
        }
    }, [activeJobId, modifiedEligibleStudents, eligibleStudentsCache]);

    // --- Data for Publishing ---

    // Function to get the final map of job_id -> student_id[]
    const getFinalStudentMap = useCallback((): Record<string, string[]> => {
         const finalMap: Record<string, string[]> = {};
         jobs.forEach(job => {
             // Prioritize modified list, fall back to cache, then empty array
             finalMap[job._id] = modifiedEligibleStudents[job._id] ?? eligibleStudentsCache[job._id] ?? [];
         });
         return finalMap;
    }, [jobs, modifiedEligibleStudents, eligibleStudentsCache]);

    // --- Return Values ---
    return {
        activeJobId,
        handleTabChange,

        // Data for the active tab's display
        currentDisplayedStudents,
        availableToAddStudents,
        isLoadingCurrentJob: activeJobId ? (jobLoadingStates[activeJobId] ?? false) : false,
        errorCurrentJob: activeJobId ? (jobErrorStates[activeJobId] ?? null) : null,

        // Handlers for modification
        handleAddStudent,
        handleRemoveStudent,

        // Loading/Error states for supporting elements
        isFetchingAllStudents,
        generalError, // For errors like failing to fetch all students

        // Function to get final data
        getFinalStudentMap,
    };
};