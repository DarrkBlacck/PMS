// students/components/API.ts
import { Student, StudentFormData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch all students
 */
export const fetchStudentsAPI = async (): Promise<Student[]> => {
  const response = await fetch(`${API_BASE_URL}/student/get`, {
    method: "GET",
  });
  
  if (!response.ok) {
    throw new Error(`Server returned with an error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Add a new student
 */
export const addStudentAPI = async (studentData: StudentFormData): Promise<Student> => {
  const response = await fetch(`${API_BASE_URL}/student/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentData),
  });
  
  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.detail || `Failed to add student: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Update an existing student
 */
export const updateStudentAPI = async (studentId: string, studentData: StudentFormData): Promise<Student> => {
  const response = await fetch(`${API_BASE_URL}/student/update/${studentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentData),
  });
  
  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.detail || `Failed to update student: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Delete a student
 */
export const deleteStudentAPI = async (studentId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/student/delete/${studentId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete student: ${response.status}`);
  }
  
  return await response.json();
};