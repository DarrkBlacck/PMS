// components/PublishDriveModal.tsx
import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
// Assuming Tabs, Tab, StudentList, AddStudentDropdown components exist and are imported
// import { Tabs, Tab } from './YourTabComponent'; 
// import StudentList from './StudentList'; 
// import AddStudentDropdown from './AddStudentDropdown'; 
import { usePublishManagement } from './usePublishManagement'; // Adjust path as needed
import { Job } from './types'; // Adjust path as needed
import { Student } from '@/app/students/components/types';

interface PublishDriveModalProps {
    isOpen: boolean;
    onClose: () => void;
    drive_id: string | null;
    driveName?: string;
    jobs: Job[] | undefined;
    // This function now receives the final map from the hook
    onPublishDrive: (finalMap: Record<string, string[]>) => Promise<void>; 
}

export default function PublishDriveModal({
    isOpen,
    onClose,
    drive_id,
    driveName = "Selected Drive",
    jobs = [], // Default to empty array
    onPublishDrive
}: PublishDriveModalProps) {

    const {
        activeJobId,
        handleTabChange,
        currentDisplayedStudents,
        availableToAddStudents,
        isLoadingCurrentJob,
        errorCurrentJob,
        handleAddStudent,
        handleRemoveStudent,
        isFetchingAllStudents,
        generalError,
        getFinalStudentMap,
    } = usePublishManagement({ isOpen, drive_id, jobs });

    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);

    const handlePublishClick = async () => {
         if (!drive_id) return;
         setIsPublishing(true);
         setPublishError(null);

         const finalMap = getFinalStudentMap();

         try {
             await onPublishDrive(finalMap); // Call the callback prop with the map
             onClose(); // Close modal on success
         } catch (error) {
             console.error("Error publishing drive:", error);
             setPublishError(`Failed to publish: ${(error as Error).message}`);
         } finally {
             setIsPublishing(false);
         }
    };

    // Close handler resets publishing error
    const handleClose = () => {
        setPublishError(null);
        onClose();
    }

    // --- Rendering Logic ---
    const renderActiveJobContent = () => {
        if (!activeJobId) {
             // Handle case where there are no jobs
             return jobs.length === 0 ? <p>No jobs defined for this drive.</p> : <p>Select a job tab.</p>;
        }
        if (isLoadingCurrentJob) return <p>Loading eligible students...</p>;
        if (errorCurrentJob) return <p className="text-red-600">Error loading students: {errorCurrentJob}</p>;
        if (generalError) return <p className="text-red-600">Error: {generalError}</p>

        return (
            <div>
                {/* Component to add students */}
                <AddStudentDropdown
                    students={availableToAddStudents}
                    onAddStudent={handleAddStudent}
                    isLoading={isFetchingAllStudents}
                />

                {/* Component to display the list and handle removals */}
                <StudentList
                    students={currentDisplayedStudents}
                    onRemoveStudent={handleRemoveStudent}
                />
            </div>
        );
    };

    return (
        // Added size="5xl" for potentially large lists/more space
        <Modal isOpen={isOpen} onClose={handleClose} size="5xl"> 
            <ModalContent>
                <ModalHeader>Publish Drive: {driveName}</ModalHeader>
                <ModalBody>
                    {jobs.length === 0 ? (
                         <p>No jobs found for this drive. Add jobs before publishing.</p>
                    ) : (
                        // Replace with actual Tab component implementation
                        <div className="tabs-container border border-gray-300 rounded"> 
                           <div className="tab-list flex border-b border-gray-300 bg-gray-100" role="tablist">
                                {jobs.map(job => (
                                    <button
                                        key={job._id}
                                        role="tab"
                                        aria-selected={activeJobId === job._id}
                                        onClick={() => handleTabChange(job._id)}
                                        // Example styling - adapt to your design system
                                        className={`px-4 py-2 border-b-2 focus:outline-none ${
                                            activeJobId === job._id 
                                            ? 'border-blue-500 text-blue-600 bg-white font-semibold' 
                                            : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-gray-300'
                                        }`}
                                    >
                                        {job.title}
                                    </button>
                                ))}
                            </div>
                           <div className="tab-panel p-4 bg-white">
                                {renderActiveJobContent()}
                           </div>
                        </div>
                    )}
                     {publishError && <p className="text-red-600 mt-4">Publishing Error: {publishError}</p>}
                </ModalBody>
                <ModalFooter>
                    <Button variant="shadow" onPress={handleClose} disabled={isPublishing}>
                        Cancel
                    </Button>
                    <Button 
                        color="primary"
                        onPress={handlePublishClick} 
                        disabled={isPublishing || jobs.length === 0 || !!generalError} // Disable if no jobs or critical error
                        // Add loading state if Button component supports it
                        // isLoading={isPublishing} 
                    >
                        {isPublishing ? "Publishing..." : "Approve and Publish"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}


interface StudentListProps {
    students: Student[];
    onRemoveStudent: (studentId: string) => void;
}
const StudentList: React.FC<StudentListProps> = ({ students, onRemoveStudent }) => (
    <ul className="list-none p-0 mt-4 max-h-60 overflow-y-auto border rounded"> {/* Added scroll */}
        {students.length === 0 && <li className="p-2 text-gray-500">No eligible students selected.</li>}
        {students.map((student, index) => (
            <li key={student._id} className={`flex justify-between items-center p-2 ${index < students.length - 1 ? 'border-b' : ''}`}>
                <span>{student.first_name} {student.last_name} <span className="text-xs text-gray-500">({student._id})</span></span>
                <Button 
                    size="sm" 
                    variant="light" 
                    color="danger" 
                    onPress={() => onRemoveStudent(student._id)}
                    className="ml-2" // Added margin
                >
                    Remove
                </Button>
            </li>
        ))}
    </ul>
);

interface AddStudentDropdownProps {
    students: Student[];
    onAddStudent: (studentId: string) => void;
    isLoading: boolean;
}
const AddStudentDropdown: React.FC<AddStudentDropdownProps> = ({ students, onAddStudent, isLoading }) => {
    const [selectedStudent, setSelectedStudent] = useState('');

    const handleAdd = () => {
        if (selectedStudent) {
            onAddStudent(selectedStudent);
            setSelectedStudent(''); // Reset dropdown
        }
    };

    return (
        <div className="flex gap-2 items-center mb-4">
            <select 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={isLoading || students.length === 0}
                className="border rounded p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500" // Added styling
            >
                <option value="">{isLoading ? "Loading students..." : students.length === 0 ? "No students available to add" : "Select student to add..."}</option>
                {students.map(student => (
                    <option key={student._id} value={student._id}>
                        {student.first_name} {student.last_name} ({student._id}) - {student.email}
                    </option>
                ))}
            </select>
            <Button onPress={handleAdd} disabled={!selectedStudent || isLoading} size="md"> {/* Adjusted size */}
                Add Student
            </Button>
        </div>
    );
};