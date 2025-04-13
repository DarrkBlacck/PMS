'use client';
import React from 'react';
import { MdSearch, MdDeleteForever, MdEdit } from "react-icons/md";
import { useState, useEffect, useRef } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input, Select, SelectItem } from '@heroui/react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, GridReadyEvent, FirstDataRenderedEvent } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

interface Alumni {
  _id: string;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  ph_no?: string;
  adm_no?: string;
  passout_year?: Date | string;
  status: 'Employed' | 'Unemployed';
}

function Alumni() {
  const [formData, setFormData] = useState({
    first_name: "",
    email: "",
    // Optional fields below
    middle_name: "",
    last_name: "", 
    ph_no: "",
    adm_no: "",
    status: "Unemployed"
  });

  const [editFormData, setEditFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    ph_no: "",
    adm_no: "",
    status: ""
  });

  const [error, setError] = useState("");
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [editingAlumni, setEditingAlumni] = useState(false);
  const [addingAlumni, setAddingAlumni] = useState(false);
  const [deletingAlumni, setDeletingAlumni] = useState(false);
  const [currentAlumni, setCurrentAlumni] = useState<Alumni | null>(null);
  const [searchContent, setSearchContent] = useState("");

  const gridRef = useRef<AgGridReact>(null);

  const statusOptions = [
    { value: "Employed", label: "Employed" },
    { value: "Unemployed", label: "Unemployed" }
  ];

  const [columnDefs] = useState([
    { field: 'first_name', headerName: 'First Name', flex: 2, sortable: true, filter: true },
    { field: 'last_name', headerName: 'Last Name', flex: 2, sortable: true, filter: true },
    { field: 'email', headerName: 'Email', flex: 3, sortable: true, filter: true },
    { field: 'ph_no', headerName: 'Phone', flex: 2, sortable: true, filter: true },
    { field: 'adm_no', headerName: 'Admission No', flex: 2, sortable: true, filter: true },
    { field: 'passout_year', headerName: 'Passout Year', flex: 2, sortable: true, filter: true },
    { field: 'status', headerName: 'Status', flex: 1, sortable: true, filter: true },
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
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/alumni/get`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      const data = await response.json();
      setAlumni(data);
    } catch (err: any) {
      console.error("Error fetching alumni:", err.message);
      setError(err.message);
    }
  };

  const handleAdd = () => {
    setAddingAlumni(true);
  };

  const openDeleteModal = (alumni: Alumni) => {
    setCurrentAlumni(alumni);
    setDeletingAlumni(true);
  };

  const handleEdit = (alumni: Alumni) => {
    setCurrentAlumni(alumni);
    setEditFormData({
      first_name: alumni.first_name,
      middle_name: alumni.middle_name || "",
      last_name: alumni.last_name || "",
      email: alumni.email || "",
      ph_no: alumni.ph_no || "",
      adm_no: alumni.adm_no || "",
      status: alumni.status
    });
    setEditingAlumni(true);
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



  // Update the handleSubmit function
  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/alumni/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong");
      }

      setAddingAlumni(false);
      fetchAlumni();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/alumni/update/${currentAlumni?._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      setEditingAlumni(false);
      fetchAlumni();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/alumni/delete/${currentAlumni?._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      setDeletingAlumni(false);
      fetchAlumni();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-0">
      <div className="flex flex-col items-center bg-gray-100 p-4 mb-4">
        <h1 className="text-3xl font-semibold mb-4">Alumni Management</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="flex gap-2 justify-end w-full mb-4">
          <Button color="primary" onPress={handleAdd}>Add Alumni</Button>
        </div>

        <div className="w-full flex justify-start mb-4">
          <Input
            startContent={<MdSearch/>}
            placeholder="Search alumni..."
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
          />
        </div>

        <div className="w-full ag-theme-quartz" style={{ height: '500px' }}>
          <AgGridReact
            ref={gridRef}
            rowData={alumni}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            quickFilterText={searchContent}
          />
        </div>

        {/* Add Alumni Modal */}
        <Modal isOpen={addingAlumni} onClose={() => setAddingAlumni(false)}>
          <ModalContent>
            <ModalHeader>Add New Alumni</ModalHeader>
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
              <Input
                label="Admission Number"
                value={formData.adm_no}
                onChange={(e) => handleFormChange('adm_no', e.target.value)}
                className="mb-3"
              />
              
              <Select 
                label="Status"
                value={formData.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="mb-3"
                defaultSelectedKeys={["Unemployed"]}
              >
                {statusOptions.map((status) => (
                  <SelectItem key={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </Select>
              <div className="flex justify-end gap-2">
                <Button color="danger" onPress={() => setAddingAlumni(false)}>Cancel</Button>
                <Button color="primary" onPress={handleSubmit}>Submit</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Edit Alumni Modal */}
        <Modal isOpen={editingAlumni} onClose={() => setEditingAlumni(false)}>
          <ModalContent>
            <ModalHeader>Edit Alumni</ModalHeader>
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
              <Input
                label="Admission Number"
                value={editFormData.adm_no}
                onChange={(e) => handleEditFormChange('adm_no', e.target.value)}
                className="mb-3"
              />
              
              <Select 
                label="Status"
                selectedKeys={[editFormData.status]}
                onChange={(e) => handleEditFormChange('status', e.target.value)}
                className="mb-3"
              >
                {statusOptions.map((status) => (
                  <SelectItem key={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </Select>
              <div className="flex justify-end gap-2 mt-4">
                <Button color="danger" onPress={() => setEditingAlumni(false)}>Cancel</Button>
                <Button color="primary" onPress={handleUpdate}>Update</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deletingAlumni} onClose={() => setDeletingAlumni(false)}>
          <ModalContent>
            <ModalHeader>Confirm Delete</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete this alumni?</p>
              <div className="flex justify-end gap-2">
                <Button color="default" onPress={() => setDeletingAlumni(false)}>Cancel</Button>
                <Button color="danger" onPress={handleDelete}>Delete</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}

export default Alumni;