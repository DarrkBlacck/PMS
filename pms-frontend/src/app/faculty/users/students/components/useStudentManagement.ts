// students/components/useStudentManagement.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  Student, 
  StudentFormData
} from './types';
import {
  fetchStudentsAPI,
  addStudentAPI,
  updateStudentAPI,
  deleteStudentAPI
} from './API';

// Default form data
const DEFAULT_FORM_DATA: StudentFormData = {
  first_name: "",
  email: "",
  ph_no: "",
  adm_no: "",
  program: ""
};

export const useStudentManagement = () => {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [addFormData, setAddFormData] = useState<StudentFormData>(DEFAULT_FORM_DATA);
  const [editFormData, setEditFormData] = useState<StudentFormData>(DEFAULT_FORM_DATA);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Search state
  const [searchContent, setSearchContent] = useState("");

  // Fetch students data
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await fetchStudentsAPI();
      setStudents(data);
    } catch (err: unknown) {
      console.error("Error fetching students:", (err as Error).message);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Form handlers for add form
  const handleAddFormChange = useCallback((field: string, value: string) => {
    setAddFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Form handlers for edit form
  const handleEditFormChange = useCallback((field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Modal handlers
  const openAddModal = useCallback(() => {
    setAddFormData(DEFAULT_FORM_DATA);
    setIsAddModalOpen(true);
  }, []);

  const openEditModal = useCallback((student: Student) => {
    setCurrentStudent(student);
    setEditFormData({
      first_name: student.first_name,
      email: student.email,
      ph_no: student.ph_no,
      adm_no: student.adm_no,
      program: student.program
    });
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((student: Student) => {
    setCurrentStudent(student);
    setIsDeleteModalOpen(true);
  }, []);

  // CRUD operations
  const handleAdd = useCallback(async () => {
    setError("");
    
    // Validate form data
    if (!addFormData.first_name || !addFormData.email || !addFormData.ph_no || 
        !addFormData.adm_no || !addFormData.program) {
      setError("Please enter all required fields!");
      return;
    }
    
    setLoading(true);
    
    try {
      await addStudentAPI(addFormData);
      setIsAddModalOpen(false);
      setAddFormData(DEFAULT_FORM_DATA);
      fetchStudents();
    } catch (err: unknown) {
      setError((err as Error).message);
      console.error("Error adding student:", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [addFormData, fetchStudents]);

  const handleEdit = useCallback((student: Student) => {
    openEditModal(student);
  }, [openEditModal]);

  const handleUpdate = useCallback(async () => {
    if (!currentStudent?._id) return;
    
    setError("");
    
    // Validate form data
    if (!editFormData.first_name || !editFormData.email || !editFormData.ph_no || 
        !editFormData.adm_no || !editFormData.program) {
      setError("Please enter all required fields!");
      return;
    }
    
    setLoading(true);
    
    try {
      await updateStudentAPI(currentStudent._id, editFormData);
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err: unknown) {
      setError((err as Error).message);
      console.error("Error updating student:", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentStudent, editFormData, fetchStudents]);

  const handleDelete = useCallback(async () => {
    if (!currentStudent?._id) return;
    
    setLoading(true);
    setError("");
    
    try {
      await deleteStudentAPI(currentStudent._id);
      setIsDeleteModalOpen(false);
      fetchStudents();
    } catch (err: unknown) {
      setError((err as Error).message);
      console.error("Error deleting student:", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentStudent, fetchStudents]);

  return {
    // Data
    students,
    addFormData,
    editFormData,
    currentStudent,
    error,
    loading,
    searchContent,
    
    // Modal states
    isAddModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    
    // Setters
    setSearchContent,
    setIsAddModalOpen,
    setIsEditModalOpen,
    setIsDeleteModalOpen,
    
    // Handlers
    handleAddFormChange,
    handleEditFormChange,
    openAddModal,
    handleAdd,
    openEditModal,
    handleEdit,
    handleUpdate,
    openDeleteModal,
    handleDelete
  };
};