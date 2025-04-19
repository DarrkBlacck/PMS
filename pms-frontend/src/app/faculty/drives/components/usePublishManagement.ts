// hooks/usePublishManagement.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAllPerformancesAPI, fetchEligibleStudentsforJobAPI, fetchStudentsAPI } from './API'; // Assuming API functions are here or imported correctly
import { Job } from './types'; // Assuming types are defined/imported correctly
import { Performance, Student, StudentWithPerformance } from '@/app/students/components/types';

interface UsePublishManagementProps {
    isOpen: boolean;
    drive_id: string | null;
    jobs: Job[] | undefined; // Jobs for the current drive
}



export const usePublishManagement = ({ isOpen, drive_id, jobs = [] }: UsePublishManagementProps) => {
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [allStudents, setAllStudents] = useState<Student[]>([]); // For the "Add" dropdown
    const [allPerformancesMap, setAllPerformancesMap] = useState<Record<string, Performance>>({});

    // State for caching and modifications
    const [eligibleStudentsCache, setEligibleStudentsCache] = useState<Record<string, string[]>>({});
    const [modifiedEligibleStudents, setModifiedEligibleStudents] = useState<Record<string, string[]>>({});

    // State for loading/error handling
    const [jobLoadingStates, setJobLoadingStates] = useState<Record<string, boolean>>({});
    const [jobErrorStates, setJobErrorStates] = useState<Record<string, string | null>>({});
    const [isFetchingInitialData, setIsFetchingInitialData] = useState(false); // Combined loading for students + performances
    const [initialDataError, setInitialDataError] = useState<string | null>(null); // Combined error for students + performances

    // --- Helper: Reset State ---
    const resetState = useCallback(() => {
        setActiveJobId(jobs.length > 0 ? jobs[0]._id : null);
        // Keep allStudents fetched unless drive_id changes significantly
        // setAllStudents([]); 
        setEligibleStudentsCache({});
        setModifiedEligibleStudents({});
        setJobLoadingStates({});
        setJobErrorStates({});
        setInitialDataError(null);
        // setIsFetchingInitialData(false); // Don't reset this unless refetching
    }, [jobs]);

    // --- Data Fetching ---

    // Fetch all students once when the modal opens or drive_id changes
    useEffect(() => {
        if (isOpen && drive_id) {
            const loadInitialData = async () => {
                setIsFetchingInitialData(true);
                setInitialDataError(null);
                setAllStudents([]);
                setAllPerformancesMap({});
                resetState(); // Reset job-specific caches/states
                try {
                    // Fetch students and performances concurrently
                    const [studentsResponse, performancesResponse] = await Promise.all([
                        fetchStudentsAPI(),
                        fetchAllPerformancesAPI() // Fetch all performances
                    ]);

                    setAllStudents(studentsResponse || []);

                    // Create the performance map from the fetched list
                    const perfMap: Record<string, Performance> = {};
                    (performancesResponse || []).forEach((perf) => {
                        if (perf && perf.student_id) {
                            perfMap[perf.student_id] = perf;
                        }
                    });
                    setAllPerformancesMap(perfMap);

                } catch (error) {
                    console.error("Error fetching initial modal data (students/performances):", error);
                    setInitialDataError(`Failed to load initial data: ${(error as Error).message}`);
                } finally {
                    setIsFetchingInitialData(false);
                }
            };
            loadInitialData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, drive_id]); // Rerun only when modal opens or drive changes
     // Set initial active job ID when jobs load
     useEffect(() => {
        if (isOpen && !isFetchingInitialData && jobs.length > 0 && !activeJobId) {
            setActiveJobId(jobs[0]._id);
        }
    }, [isOpen, isFetchingInitialData, jobs, activeJobId]);


    // Fetch eligible student IDs for the active job (if not cached/modified)
    const handleFetchEligibleStudents = useCallback(async (job_id: string) => {
        if (!job_id || eligibleStudentsCache[job_id] || jobLoadingStates[job_id]) {
            return; 
        }
        setJobLoadingStates(prev => ({ ...prev, [job_id]: true }));
        setJobErrorStates(prev => ({ ...prev, [job_id]: null }));
        try {
            const response = await fetchEligibleStudentsforJobAPI(job_id);
            setEligibleStudentsCache(prev => ({ ...prev, [job_id]: response || [] }));
        } catch (err: unknown) {
            console.error(`Error fetching eligible students for job ${job_id}`, err);
            setJobErrorStates(prev => ({ ...prev, [job_id]: (err as Error).message || 'Failed to fetch' }));
        } finally {
            setJobLoadingStates(prev => ({ ...prev, [job_id]: false }));
        }
    }, [eligibleStudentsCache, jobLoadingStates]);

    // Trigger fetch eligible IDs when activeJobId changes and data isn't modified/cached
    useEffect(() => {
        // Ensure initial data is loaded before fetching eligible IDs
        if (activeJobId && !isFetchingInitialData && !modifiedEligibleStudents[activeJobId]) {
             handleFetchEligibleStudents(activeJobId);
        }
    }, [activeJobId, isFetchingInitialData, modifiedEligibleStudents, handleFetchEligibleStudents]);


    // --- State Derivation ---

    const currentDisplayedStudentIds = useMemo((): string[] => {
        if (!activeJobId) return [];
        return modifiedEligibleStudents[activeJobId] ?? eligibleStudentsCache[activeJobId] ?? [];
    }, [activeJobId, modifiedEligibleStudents, eligibleStudentsCache]);

    // Create a map of all students for efficient lookup (only needed once)
    const allStudentsMap = useMemo(() => {
        return new Map(allStudents.map(s => [s._id, s]));
    }, [allStudents]);

    // Derive Combined Student + Performance Data using the allPerformancesMap
    const currentDisplayedStudentsWithPerformance = useMemo((): StudentWithPerformance[] => {
        
        const combinedList: StudentWithPerformance[] = []; // Initialize an empty array of the correct final type

        currentDisplayedStudentIds.forEach(id => {
            const student = allStudentsMap.get(id);
            
            // Only proceed if the student basic info was found
            if (student) { 
                // Look up performance in the map fetched initially
                const performance : Performance | null = allPerformancesMap[id] || null; 
                
                // Create the combined object and push it to the list
                // This object matches the StudentWithPerformance interface
                combinedList.push({ student, performance }); 
            } 
            // If student is not found in allStudentsMap, we simply skip adding anything for this ID.
        });

        return combinedList; // Return the correctly typed list

    }, [currentDisplayedStudentIds, allStudentsMap, allPerformancesMap]); // Dependencies remain the same


     // Get students available to be added
     const availableToAddStudents = useMemo((): Student[] => {
        const currentIdsSet = new Set(currentDisplayedStudentIds);
        return allStudents.filter(s => !currentIdsSet.has(s._id));
    }, [allStudents, currentDisplayedStudentIds]);

    // --- Event Handlers ---
    const handleTabChange = useCallback((newJobId: string) => {
        setActiveJobId(newJobId);
        // Fetching eligible IDs is handled by the useEffect watching activeJobId
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
         // Ensure jobs is an array before iterating
         (jobs || []).forEach(job => {
             // Prioritize modified list, fall back to cache, then empty array
             finalMap[job._id] = modifiedEligibleStudents[job._id] ?? eligibleStudentsCache[job._id] ?? [];
         });
         return finalMap;
    }, [jobs, modifiedEligibleStudents, eligibleStudentsCache]);

    // --- Return Values ---
    return {
        activeJobId,
        handleTabChange,
        currentDisplayedStudentsWithPerformance, // Use this for the list
        availableToAddStudents, // For dropdown

        // Loading/Error for fetching eligible IDs for the *current* job tab
        isLoadingCurrentJobEligibleIds: activeJobId ? (jobLoadingStates[activeJobId] ?? false) : false,
        errorCurrentJobEligibleIds: activeJobId ? (jobErrorStates[activeJobId] ?? null) : null,

        handleAddStudent,
        handleRemoveStudent,

        // Loading/Error states for the initial data load (students + all performances)
        isFetchingInitialData,
        initialDataError,

        getFinalStudentMap,
    };
};