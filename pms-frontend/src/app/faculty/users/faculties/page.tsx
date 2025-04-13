'use client';
import React from 'react';
import { MdSearch, MdDeleteForever, MdEdit } from "react-icons/md";
import { useState, useEffect, useRef } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input, Select, SelectItem } from '@heroui/react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

interface Faculty {
  _id: string;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  ph_no?: string;
  program: 'MCA' | 'MBA' | 'BCA' | 'BBA';
  status: 'Active' | 'Resigned';
}

function Faculty() {
  const [formData, setFormData] = useState({
    first_name: "",
    email: "",
    middle_name: "",
    last_name: "",
    ph_no: "",
    program: "MCA",
    status: "Active"
  });

  const [editFormData, setEditFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    ph_no: "",
    program: "",
    status: ""
  });

  const [error, setError] = useState("");
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [editingFaculty, setEditingFaculty] = useState(false);
  const [addingFaculty, setAddingFaculty] = useState(false);
  const [deletingFaculty, setDeletingFaculty] = useState(false);
  const [currentFaculty, setCurrentFaculty] = useState<Faculty | null>(null);
  const [searchContent, setSearchContent] = useState("");

  const gridRef = useRef<AgGridReact>(null);

  const programOptions = [
    { value: "MCA", label: "MCA" },
    { value: "MBA", label: "MBA" },
    { value: "BCA", label: "BCA" },
    { value: "BBA", label: "BBA" }
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Resigned", label: "Resigned" }
  ];

  const [columnDefs] = useState([
    { field: 'first_name', headerName: 'First Name', flex: 2, sortable: true, filter: true },
    { field: 'last_name', headerName: 'Last Name', flex: 2, sortable: true, filter: true },
    { field: 'email', headerName: 'Email', flex: 3, sortable: true, filter: true },
    { field: 'ph_no', headerName: 'Phone', flex: 2, sortable: true, filter: true },
    { field: 'program', headerName: 'Program', flex: 2, sortable: true, filter: true },
    { field: 'status', headerName: 'Status', flex: 1, sortable: true, filter: true },
    {
      headerName: 'Actions',
      flex: 1,
      cellRenderer: (params: any) => (
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
      )
    }
  ]);

  const defaultColDef = {
    resizable: true,
    minWidth: 100
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/faculty/get`);
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      const data = await response.json();
      setFaculty(data);
    } catch (err: any) {
      console.error("Error fetching faculty:", err.message);
      setError(err.message);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdd = () => setAddingFaculty(true);
  
  const openDeleteModal = (faculty: Faculty) => {
    setCurrentFaculty(faculty);
    setDeletingFaculty(true);
  };

  const handleEdit = (faculty: Faculty) => {
    setCurrentFaculty(faculty);
    setEditFormData({
      first_name: faculty.first_name,
      middle_name: faculty.middle_name || "",
      last_name: faculty.last_name || "",
      email: faculty.email,
      ph_no: faculty.ph_no || "",
      program: faculty.program,
      status: faculty.status
    });
    setEditingFaculty(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/faculty/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong");
      }

      setAddingFaculty(false);
      fetchFaculty();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/faculty/update/${currentFaculty?._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      
      setEditingFaculty(false);
      fetchFaculty();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/faculty/delete/${currentFaculty?._id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      
      setDeletingFaculty(false);
      fetchFaculty();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-0">
      <div className="flex flex-col items-center bg-gray-100 p-4 mb-4">
        <h1 className="text-3xl font-semibold mb-4">Faculty Management</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="flex gap-2 justify-end w-full mb-4">
          <Button color="primary" onPress={handleAdd}>Add Faculty</Button>
        </div>

        <div className="w-full flex justify-start mb-4">
          <Input
            startContent={<MdSearch/>}
            placeholder="Search faculty..."
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
          />
        </div>

        <div className="w-full ag-theme-quartz" style={{ height: '500px' }}>
          <AgGridReact
            ref={gridRef}
            rowData={faculty}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            quickFilterText={searchContent}
          />
        </div>

        {/* Add Faculty Modal */}
        <Modal isOpen={addingFaculty} onClose={() => setAddingFaculty(false)}>
          <ModalContent>
            <ModalHeader>Add New Faculty</ModalHeader>
            <ModalBody>
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => handleFormChange('first_name', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Middle Name"
                value={formData.middle_name}
                onChange={(e) => handleFormChange('middle_name', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleFormChange('last_name', e.target.value)}
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
              <Select 
                label="Program"
                value={formData.program}
                onChange={(e) => handleFormChange('program', e.target.value)}
                className="mb-3"
                defaultSelectedKeys={["MCA"]}
              >
                {programOptions.map((program) => (
                  <SelectItem key={program.value}>{program.label}</SelectItem>
                ))}
              </Select>
              <Select 
                label="Status"
                value={formData.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="mb-3"
                defaultSelectedKeys={["Active"]}
              >
                {statusOptions.map((status) => (
                  <SelectItem key={status.value}>{status.label}</SelectItem>
                ))}
              </Select>
              <div className="flex justify-end gap-2">
                <Button color="danger" onPress={() => setAddingFaculty(false)}>Cancel</Button>
                <Button color="primary" onPress={handleSubmit}>Submit</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Edit Faculty Modal */}
        <Modal isOpen={editingFaculty} onClose={() => setEditingFaculty(false)}>
          <ModalContent>
            <ModalHeader>Edit Faculty</ModalHeader>
            <ModalBody>
              <Input
                label="First Name"
                value={editFormData.first_name}
                onChange={(e) => handleEditFormChange('first_name', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Middle Name"
                value={editFormData.middle_name}
                onChange={(e) => handleEditFormChange('middle_name', e.target.value)}
                className="mb-3"
              />
              <Input
                label="Last Name"
                value={editFormData.last_name}
                onChange={(e) => handleEditFormChange('last_name', e.target.value)}
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
              <Select 
                label="Program"
                selectedKeys={[editFormData.program]}
                onChange={(e) => handleEditFormChange('program', e.target.value)}
                className="mb-3"
              >
                {programOptions.map((program) => (
                  <SelectItem key={program.value}>{program.label}</SelectItem>
                ))}
              </Select>
              <Select 
                label="Status"
                selectedKeys={[editFormData.status]}
                onChange={(e) => handleEditFormChange('status', e.target.value)}
                className="mb-3"
              >
                {statusOptions.map((status) => (
                  <SelectItem key={status.value}>{status.label}</SelectItem>
                ))}
              </Select>
              <div className="flex justify-end gap-2">
                <Button color="danger" onPress={() => setEditingFaculty(false)}>Cancel</Button>
                <Button color="primary" onPress={handleUpdate}>Update</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deletingFaculty} onClose={() => setDeletingFaculty(false)}>
          <ModalContent>
            <ModalHeader>Confirm Delete</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete this faculty member?</p>
              <div className="flex justify-end gap-2">
                <Button color="default" onPress={() => setDeletingFaculty(false)}>Cancel</Button>
                <Button color="danger" onPress={handleDelete}>Delete</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}

export default Faculty;