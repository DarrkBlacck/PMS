'use client';
import React from 'react';
import { MdSearch, MdDeleteForever, MdEdit } from "react-icons/md";
import { useState, useEffect, useRef } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input } from '@heroui/react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

interface Company {
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

function Companies() {
  const [formData, setFormData] = useState({
    name: "",
    site: "",
    branch: "",
    desc: "",
    email: "",
    ph_no: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    site: "",
    branch: "",
    desc: "",
    email: "",
    ph_no: "",
  });

  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingCompany, setEditingCompany] = useState(false);
  const [addingCompany, setAddingCompany] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [searchContent, setSearchContent] = useState("");

  const gridRef = useRef<AgGridReact>(null);

  const [columnDefs] = useState([
    { field: 'name', headerName: 'Company Name', flex: 2, sortable: true, filter: true },
    { field: 'branch', headerName: 'Branch', flex: 2, sortable: true, filter: true },
    { field: 'email', headerName: 'Email', flex: 2, sortable: true, filter: true },
    { field: 'ph_no', headerName: 'Phone', flex: 2, sortable: true, filter: true },
    { field: 'avg_salary', headerName: 'Average Salary', flex: 2, sortable: true, filter: true },
    {
      headerName: 'Actions',
      flex: 1,
      cellRenderer: (params: any) => {
        return (
          <div className="flex w-full gap-2">
            <Button 
              isIconOnly
              onPress={() => handleEdit(params.data)} 
              className="bg-blue-600 text-white"
            >
              <MdEdit />
            </Button>
            <Button 
              isIconOnly
              onPress={() => openDeleteModal(params.data)} 
              color="danger"
            >
              <MdDeleteForever />
            </Button>
          </div>
        );
      }
    }
  ]);

  const defaultColDef = {
    resizable: true,
    minWidth: 100
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/get`, {
        method: "GET",
      });
      if (!response.ok) throw new Error(`Server returned with an error: ${response.status}`);
      const data = await response.json();
      setCompanies(data);
    } catch (err: any) {
      console.error("Error fetching companies:", err.message);
      setError(err.message);
    }
  };

  const handleAdd = () => setAddingCompany(true);
  
  const openDeleteModal = (company: Company) => {
    setCurrentCompany(company);
    setDeletingCompany(true);
  };

  const handleEdit = (company: Company) => {
    setCurrentCompany(company);
    setEditFormData({
      name: company.name,
      site: company.site || "",
      branch: company.branch,
      desc: company.desc || "",
      email: company.email || "",
      ph_no: company.ph_no || "",
    });
    setEditingCompany(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'avg_salary' ? parseFloat(value) : value
    }));
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: field === 'avg_salary' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong");
      }

      setAddingCompany(false);
      fetchCompanies();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/update/${currentCompany?._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (!response.ok) throw new Error(`Server returned with an error: ${response.status}`);
      setEditingCompany(false);
      fetchCompanies();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/delete/${currentCompany?._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Server returned with an error: ${response.status}`);
      setDeletingCompany(false);
      fetchCompanies();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-0">
      <div className="flex flex-col items-center bg-gray-100 p-4 mb-4">
        <h1 className="text-3xl font-semibold mb-4">Company Management</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="flex gap-2 justify-end w-full mb-4">
          <Button color="primary" onPress={handleAdd}>Add Company</Button>
        </div>

        <div className="w-full flex justify-start mb-4">
          <Input
            startContent={<MdSearch/>}
            placeholder="Search companies..."
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
          />
        </div>

        <div className="w-full ag-theme-quartz" style={{ height: '500px' }}>
          <AgGridReact
            ref={gridRef}
            rowData={companies}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            quickFilterText={searchContent}
          />
        </div>

        {/* Add Company Modal */}
        <Modal isOpen={addingCompany} onClose={() => setAddingCompany(false)}>
          <ModalContent>
            <ModalHeader>Add New Company</ModalHeader>
            <ModalBody>
              <Input
                label="Company Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Website"
                value={formData.site}
                onChange={(e) => handleFormChange('site', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Branch"
                value={formData.branch}
                onChange={(e) => handleFormChange('branch', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Description"
                value={formData.desc}
                onChange={(e) => handleFormChange('desc', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Phone"
                value={formData.ph_no}
                onChange={(e) => handleFormChange('ph_no', e.target.value)}
                className="mb-3"
              />
              
              <div className="flex justify-end gap-2">
                <Button color="danger" onPress={() => setAddingCompany(false)}>Cancel</Button>
                <Button color="primary" onPress={handleSubmit}>Submit</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Edit Company Modal */}
        <Modal isOpen={editingCompany} onClose={() => setEditingCompany(false)}>
          <ModalContent>
            <ModalHeader>Edit Company</ModalHeader>
            <ModalBody>
              <Input
                label="Company Name"
                value={editFormData.name}
                onChange={(e) => handleEditFormChange('name', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Website"
                value={editFormData.site}
                onChange={(e) => handleEditFormChange('site', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Branch"
                value={editFormData.branch}
                onChange={(e) => handleEditFormChange('branch', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Description"
                value={editFormData.desc}
                onChange={(e) => handleEditFormChange('desc', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) => handleEditFormChange('email', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Phone"
                value={editFormData.ph_no}
                onChange={(e) => handleEditFormChange('ph_no', e.target.value)}
                className="mb-3"
              />
              
              <div className="flex justify-end gap-2">
                <Button color="danger" onPress={() => setEditingCompany(false)}>Cancel</Button>
                <Button color="primary" onPress={handleUpdate}>Update</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deletingCompany} onClose={() => setDeletingCompany(false)}>
          <ModalContent>
            <ModalHeader>Confirm Delete</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete this company?</p>
              <div className="flex justify-end gap-2">
                <Button color="default" onPress={() => setDeletingCompany(false)}>Cancel</Button>
                <Button color="danger" onPress={handleDelete}>Delete</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}

export default Companies;