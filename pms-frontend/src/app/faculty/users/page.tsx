'use client';
import React from 'react';
import { MdSearch, MdDeleteForever, MdEdit } from "react-icons/md";
import { useState, useEffect, useRef } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input, Select, SelectItem } from '@heroui/react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, themeQuartz, GridReadyEvent, FirstDataRenderedEvent } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

interface User {
  _id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  ph_no: string;
  role: 'admin' | 'faculty' | 'student' | 'alumni';
  status: 'Active' | 'Inactive';
}

function Users() {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    ph_no: "",
    role: ""
  });

  const [editFormData, setEditFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    ph_no: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchContent, setSearchContent] = useState("");

  const gridRef = useRef<AgGridReact>(null);

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "faculty", label: "Faculty" },
    { value: "student", label: "Student" },
    { value: "alumni", label: "Alumni" }
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" }
  ];

  const [columnDefs] = useState([
    { field: 'first_name', headerName: 'First Name', flex: 2, sortable: true, filter: true },
    { field: 'last_name', headerName: 'Last Name', flex: 2, sortable: true, filter: true },
    { field: 'email', headerName: 'Email', flex: 3, sortable: true, filter: true },
    { field: 'ph_no', headerName: 'Phone', flex: 2, sortable: true, filter: true },
    { field: 'role', headerName: 'Role', flex: 1, sortable: true, filter: true },
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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
      setError(err.message);
    }
  };

  const handleAdd = () => {
    setAddingUser(true);
  };

  const openDeleteModal = (user: User) => {
    setCurrentUser(user);
    setDeletingUser(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setEditFormData({
      first_name: user.first_name,
      middle_name: "",
      last_name: user.last_name || "",
      email: user.email || "",
      ph_no: user.ph_no,
      role: user.role,
    });
    setEditingUser(true);
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

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      setAddingUser(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/update/${currentUser?._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      setEditingUser(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/delete/${currentUser?._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      setDeletingUser(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-0">
      <div className="flex flex-col items-center bg-gray-100 p-4 mb-4">
        <h1 className="text-3xl font-semibold mb-4">Users Management</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="flex gap-2 justify-end w-full mb-4">
          <Button color="primary" onPress={handleAdd}>Add User</Button>
        </div>

        <div className="w-full flex justify-start mb-4">
          <Input
            startContent={<MdSearch/>}
            placeholder="Search users..."
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
          />
        </div>

        <div className="w-full ag-theme-quartz" style={{ height: '500px' }}>
          <AgGridReact
            ref={gridRef}
            rowData={users}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            quickFilterText={searchContent}
          />
        </div>

        {/* Add User Modal */}
        <Modal isOpen={addingUser} onClose={() => setAddingUser(false)}>
          <ModalContent>
            <ModalHeader>Add New User</ModalHeader>
            <ModalBody>
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => handleFormChange('first_name', e.target.value)}
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleFormChange('last_name', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
              <Input
                label="Phone"
                value={formData.ph_no}
                onChange={(e) => handleFormChange('ph_no', e.target.value)}
              />
              <Select 
                label="Role"
                onChange={(e) => handleFormChange('role', e.target.value)}
              >
                {roleOptions.map((role) => (
                  <SelectItem key={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </Select>
              <div className="flex justify-end gap-2">
                <Button color="danger" onPress={() => setAddingUser(false)}>Cancel</Button>
                <Button color="primary" onPress={handleSubmit}>Submit</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Edit User Modal */}
        <Modal isOpen={editingUser} onClose={() => setEditingUser(false)}>
          <ModalContent>
            <ModalHeader>Edit User</ModalHeader>
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
                label="Role"
                selectedKeys={[editFormData.role]}
                onChange={(e) => handleEditFormChange('role', e.target.value)}
                className="mb-3"
              >
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} >
                    {role.label}
                  </SelectItem>
                ))}
              </Select>
              {/*<Select 
                label="Gender"
                selectedKeys={[editFormData.gender]}
                onChange={(e) => handleEditFormChange('gender', e.target.value)}
                className="mb-3"
              >
                {genderOptions.map((gender) => (
                  <SelectItem key={gender.value} >
                    {gender.label}
                  </SelectItem>
                ))}
              </Select> */}
              {/* <Select 
                label="Status"
                selectedKeys={[editFormData.status]}
                onChange={(e) => handleEditFormChange('status', e.target.value)}
                className="mb-3"
              >
                <SelectItem key="Active" >Active</SelectItem>
                <SelectItem key="Inactive" >Inactive</SelectItem>
              </Select> */}
              <div className="flex justify-end gap-2 mt-4">
                <Button color="danger" onPress={() => setEditingUser(false)}>Cancel</Button>
                <Button color="primary" onPress={handleUpdate}>Update</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deletingUser} onClose={() => setDeletingUser(false)}>
          <ModalContent>
            <ModalHeader>Confirm Delete</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete this user?</p>
              <div className="flex justify-end gap-2">
                <Button color="default" onPress={() => setDeletingUser(false)}>Cancel</Button>
                <Button color="danger" onPress={handleDelete}>Delete</Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}

export default Users;