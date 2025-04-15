// src/services/API.ts

export interface Company {
    _id: string;
    name: string;
    site?: string;
    branch: string;
    desc?: string;
    email?: string;
    ph_no?: string;
    avg_salary?: number;
    placed_students?: string[];
}

export interface CompanyInputData {
    name: string;
    site?: string;
    branch: string;
    desc?: string;
    email?: string;
    ph_no?: string;
}

export class ApiError extends Error {
    constructor(message: string, public status?: number, public details?: unknown) {
        super(message);
        this.name = 'ApiError';
    }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const COMPANY_ENDPOINT = `${API_BASE_URL}/company`; 

/**
 * Fetches all companies from the API.
 */
export const getCompanies = async (): Promise<Company[]> => {
    try {
        const response = await fetch(`${COMPANY_ENDPOINT}/get`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                throw new ApiError(`Server responded with status: ${response.status}`, response.status);
            }
            const message = errorData?.message || errorData?.detail || `Failed to fetch companies (${response.status})`;
            throw new ApiError(message, response.status, errorData);
        }

        return await response.json() as Company[];

    } catch (err) {
        console.error("API Error [getCompanies]:", err);
        if (err instanceof ApiError) {
            throw err;
        }
        throw new Error(`Failed to fetch companies: ${err instanceof Error ? err.message : String(err)}`);
    }
};

/**
 * Adds a new company via the API.
 */
export const addCompany = async (companyData: CompanyInputData) => {
    try {
        const response = await fetch(`${COMPANY_ENDPOINT}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(companyData),
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                throw new ApiError(`Server responded with status: ${response.status}`, response.status);
            }
            const message = errorData?.message || errorData?.detail || `Failed to add company (${response.status})`;
            throw new ApiError(message, response.status, errorData);
        }

        return await response.json();

    } catch (err) {
        console.error("API Error [addCompany]:", err);
        if (err instanceof ApiError) {
            throw err;
        }
        throw new Error(`Failed to add company: ${err instanceof Error ? err.message : String(err)}`);
    }
};

/**
 * Updates an existing company via the API.
 */
export const updateCompany = async (id: string, companyData: Partial<CompanyInputData>) => {
    try {
        const response = await fetch(`${COMPANY_ENDPOINT}/update/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(companyData),
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                throw new ApiError(`Server responded with status: ${response.status}`, response.status);
            }
            const message = errorData?.message || errorData?.detail || `Failed to update company (${response.status})`;
            throw new ApiError(message, response.status, errorData);
        }

        return await response.json();

    } catch (err) {
        console.error("API Error [updateCompany]:", err);
        if (err instanceof ApiError) {
            throw err;
        }
        throw new Error(`Failed to update company: ${err instanceof Error ? err.message : String(err)}`);
    }
};

/**
 * Deletes a company via the API.
 */
export const deleteCompany = async (id: string) => {
    try {
        const response = await fetch(`${COMPANY_ENDPOINT}/delete/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            let errorData;
            try {
                if (response.status !== 204) {
                    errorData = await response.json();
                } else {
                    throw new ApiError(`Server responded with status: ${response.status}`, response.status);
                }
            } catch {
                throw new ApiError(`Server responded with status: ${response.status}`, response.status);
            }
            const message = errorData?.message || errorData?.detail || `Failed to delete company (${response.status})`;
            throw new ApiError(message, response.status, errorData);
        }

        if (response.status === 204) {
            return { success: true };
        }
        
        return await response.json();

    } catch (err) {
        console.error("API Error [deleteCompany]:", err);
        if (err instanceof ApiError) {
            throw err;
        }
        throw new Error(`Failed to delete company: ${err instanceof Error ? err.message : String(err)}`);
    }
};