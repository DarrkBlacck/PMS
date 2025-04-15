// src/hooks/useCompanyManagement.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify'; // Using toast for feedback
import { Company, CompanyInputData, getCompanies, addCompany, updateCompany, deleteCompany } from './API'; // Importing API functions

// Define the shape of the state managed by the hook
interface CompanyManagementState {
    companies: Company[];
    isLoading: boolean;
    error: string | null;
    isAddModalOpen: boolean;
    isEditModalOpen: boolean;
    isDeleteModalOpen: boolean;
    currentCompany: Company | null; // Company being edited or deleted
    formData: CompanyInputData; // For the add form
    editFormData: CompanyInputData; // For the edit form
    searchTerm: string;
}

// Initial state values
const initialFormData: CompanyInputData = {
    name: "", site: "", branch: "", desc: "", email: "", ph_no: "",
};

/**
 * Custom hook to manage company data, state, and interactions.
 * Handles fetching, adding, updating, deleting companies, and managing modal/form states.
 */
export const useCompanyManagement = () => {
    const [state, setState] = useState<CompanyManagementState>({
        companies: [],
        isLoading: false,
        error: null,
        isAddModalOpen: false,
        isEditModalOpen: false,
        isDeleteModalOpen: false,
        currentCompany: null,
        formData: initialFormData,
        editFormData: initialFormData,
        searchTerm: "",
    });

    // --- Data Fetching ---
    const fetchCompaniesData = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const fetchedCompanies = await getCompanies();
            setState(prev => ({ ...prev, companies: fetchedCompanies, isLoading: false }));
        } catch (err) {
            console.error("Error fetching companies:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch companies.";
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(`Error fetching companies: ${errorMessage}`);
        }
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        fetchCompaniesData();
    }, [fetchCompaniesData]);

    // --- Modal Handling ---
    const handleOpenAddModal = useCallback(() => {
        setState(prev => ({
            ...prev,
            isAddModalOpen: true,
            formData: initialFormData, // Reset form
            error: null,
        }));
    }, []);

    const handleOpenEditModal = useCallback((company: Company) => {
        setState(prev => ({
            ...prev,
            isEditModalOpen: true,
            currentCompany: company,
            editFormData: { // Populate edit form
                name: company.name,
                site: company.site || "",
                branch: company.branch,
                desc: company.desc || "",
                email: company.email || "",
                ph_no: company.ph_no || "",
            },
            error: null,
        }));
    }, []);

    const handleOpenDeleteModal = useCallback((company: Company) => {
        setState(prev => ({
            ...prev,
            isDeleteModalOpen: true,
            currentCompany: company,
            error: null,
        }));
    }, []);

    const handleCloseModals = useCallback(() => {
        setState(prev => ({
            ...prev,
            isAddModalOpen: false,
            isEditModalOpen: false,
            isDeleteModalOpen: false,
            currentCompany: null,
            error: null, // Clear error when closing modal
        }));
    }, []);

    // --- Form Handling ---
    const handleFormChange = useCallback((field: keyof CompanyInputData, value: string) => {
        setState(prev => ({
            ...prev,
            formData: { ...prev.formData, [field]: value },
        }));
    }, []);

    const handleEditFormChange = useCallback((field: keyof CompanyInputData, value: string) => {
        setState(prev => ({
            ...prev,
            editFormData: { ...prev.editFormData, [field]: value },
        }));
    }, []);

    // --- Search Handling ---
     const handleSearchChange = useCallback((value: string) => {
        setState(prev => ({ ...prev, searchTerm: value }));
    }, []);

    // --- CRUD Operations ---
    const submitNewCompany = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await addCompany(state.formData);
            toast.success("Company added successfully!");
            handleCloseModals();
            await fetchCompaniesData(); // Refresh data
        } catch (err) {
            console.error("Error adding company:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to add company.";
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(`Error adding company: ${errorMessage}`);
        }
    }, [state.formData, fetchCompaniesData, handleCloseModals]);

    const submitUpdatedCompany = useCallback(async () => {
        if (!state.currentCompany?._id) return;
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await updateCompany(state.currentCompany._id, state.editFormData);
            toast.success("Company updated successfully!");
            handleCloseModals();
            await fetchCompaniesData(); // Refresh data
        } catch (err) {
            console.error("Error updating company:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to update company.";
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(`Error updating company: ${errorMessage}`);
        }
    }, [state.currentCompany, state.editFormData, fetchCompaniesData, handleCloseModals]);

    const confirmDeletion = useCallback(async () => {
        if (!state.currentCompany?._id) return;
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await deleteCompany(state.currentCompany._id);
            toast.success("Company deleted successfully!");
            handleCloseModals();
            await fetchCompaniesData(); // Refresh data
        } catch (err) {
            console.error("Error deleting company:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to delete company.";
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(`Error deleting company: ${errorMessage}`);
        }
    }, [state.currentCompany, fetchCompaniesData, handleCloseModals]);

    // Expose state and actions
    return {
        ...state, // Spread all state properties
        // Actions/Handlers
        fetchCompaniesData,
        handleOpenAddModal,
        handleOpenEditModal,
        handleOpenDeleteModal,
        handleCloseModals,
        handleFormChange,
        handleEditFormChange,
        handleSearchChange,
        submitNewCompany,
        submitUpdatedCompany,
        confirmDeletion,
    };
};