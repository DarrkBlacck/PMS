'use client';
import React from 'react';
import { MdSearch, MdDeleteForever, MdEdit } from "react-icons/md";
import { useState, useEffect, useRef } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@heroui/react';
import { AgGridReact } from 'ag-grid-react';
// Import required modules
import { ModuleRegistry, AllCommunityModule, themeQuartz, GridApi, GridReadyEvent, FirstDataRenderedEvent } from 'ag-grid-community';

// Register the required modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface Student {
  _id: string;
  first_name: string;
  email: string;
  ph_no: string;
  adm_no: string;
  program: string;
}

function Students() {
  // State for the add student form
  const [first_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phno, setPh] = useState("");
  const [admno, setAdm] = useState("");
  const [program, setProgram] = useState("");
  
  // Separate state for the edit form
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    email: "",
    phno: "",
    admno: "",
    program: ""
  });
  
  const [error, setError] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [searchContent, setSearchContent] = useState("");
  
  const openDeleteModal = (student: Student) =>  {
  setCurrentStudent(student);
  setDeletingStudent(true);

  };
  
  // AG Grid Reference
  const gridRef = useRef<AgGridReact>(null);
  
  // Column Definitions
  const [columnDefs] = useState([
    { field: 'first_name', headerName: 'Name', flex: 4, sortable: true, filter: true },
    { field: 'adm_no', headerName: 'Admission No', flex: 1, sortable: true, filter: true },
    { field: 'email', headerName: 'Email', flex: 5, sortable: true, filter: true },
    { field: 'ph_no', headerName: 'Phone', flex: 4, sortable: true, filter: true },
    { field: 'program', headerName: 'Program', flex: 1, sortable: true, filter: true },
    {
      headerName: 'Actions',
      flex: 1,
      width:100,
      cellRenderer: (params:any) => {
        return (
          <div className="flex w-full gap-2">
            <Button 
	     isIconOnly
              onPress={() => handleEdit(params.data)} 
              className="bg-blue-600 text-white"
            >
              < MdEdit />
            </Button>
            <Button 
	     isIconOnly
              onPress={() => openDeleteModal(params.data)} 
              color="danger"
            >
              < MdDeleteForever />
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
    fetchStudents();
  }, []);
  
  const fetchStudents = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/get`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      const data = await response.json();
      setStudents(data);
      console.log(data);
    } catch (err: any) {
      console.error("Error fetching students:", err.message);
      setError(err.message);
    }
  };
  
  const handleAdd = () => {
    setAddingStudent(true);
  };

  const handleEdit = (student: Student) => {
    setCurrentStudent(student);
    // Set edit form data with the current student's information
    setEditFormData({
      first_name: student.first_name,
      email: student.email,
      phno: student.ph_no,
      admno: student.adm_no,
      program: student.program
    });
    setEditingStudent(true);
  };

  // Handler for edit form input changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setEditFormData({
      ...editFormData,
      [field]: e.target.value
    });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/delete/${currentStudent?._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      // After successful deletion, refresh the student list
      fetchStudents();
    } catch (err:any) {
      console.error("Error deleting student:", err.message);
      setError(err.message);
    }
    setDeletingStudent(false);
  };
  
  const handleUpdate = async () => {
    setError("");
    // Validate edit form data
    if (!editFormData.first_name || !editFormData.email || !editFormData.phno || 
        !editFormData.admno || !editFormData.program) {
      setError("Please enter all required fields!");
      return;
    }
    try {
      const studentData = {
        email: editFormData.email,
        first_name: editFormData.first_name,
        ph_no: editFormData.phno,
        adm_no: editFormData.admno,
        program: editFormData.program,
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/update/${currentStudent?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });
      
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.detail || `Server returned ${response.status}`);
      }
      
      // Close the modal and refresh the student list
      setEditingStudent(false);
      fetchStudents();
      // Reset edit form
      setEditFormData({
        first_name: "",
        email: "",
        phno: "",
        admno: "",
        program: ""
      });
    } catch (err:any) {
      setError(err.message || "An error occurred while updating the student.");
      console.error("Error updating data:", err);
    }
  };
  
  const handleSubmit = async () => {
    setError("");
    if (!first_name || !email || !phno || !admno || !program) {
      setError("Please enter all required fields!");
      return;
    }
    try {
      const studentData = {
        email: email,
        first_name: first_name,
        ph_no: phno,
        adm_no: admno,
        program: program,
      };
      console.log(studentData);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("Error Response:", errorResponse);
        throw new Error(errorResponse.detail || `Server returned ${response.status}`);
      }
      const data = await response.json();
      console.log("Success", data);
      // Clear form after successful submission
      clearForm();
      // Refresh student list
      fetchStudents();
    } catch (err:any) {
      setError(err.message || "An error occurred while submitting the form.");
      console.error("Error sending data:", err);
    }
    setAddingStudent(false);
  };

  const clearForm = () => {
    setName("");
    setEmail("");
    setPh("");
    setAdm("");
    setProgram("");
  };

  const onGridReady = (params: GridReadyEvent) => {
    // You can access the grid API here if needed
    // Example: params.api.sizeColumnsToFit();
  };

  const onFirstDataRendered = (params: FirstDataRenderedEvent) => {
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="p-0">
      <div className="flex flex-col items-center bg-gray-100 p-4 mb-4">
        <Modal
          backdrop="blur" 
          isOpen={editingStudent} 
          onClose={() => setEditingStudent(false)}
        >
          <ModalContent>
            <ModalHeader className="text-2xl font-bold mb-4">Edit Student</ModalHeader>
            <ModalBody>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <Input
                variant="flat"
                type="text"
                placeholder="First Name"
                value={editFormData.first_name}
                onChange={(e) => handleEditFormChange(e, 'first_name')}
              />
              <Input
                type="email"
                placeholder="Email"
                value={editFormData.email}
                onChange={(e) => handleEditFormChange(e, 'email')}
              />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={editFormData.phno}
                onChange={(e) => handleEditFormChange(e, 'phno')}
              />
              <Input
                type="text"
                placeholder="Admission Number"
                value={editFormData.admno}
                onChange={(e) => handleEditFormChange(e, 'admno')}
              />
              <Input
                type="text"
                placeholder="Program"
                value={editFormData.program}
                onChange={(e) => handleEditFormChange(e, 'program')}
              />
              <div className="flex justify-end">
                <Button
                  variant="shadow"
                  color="primary"
                  onClick={handleUpdate}
                >
                  Update Details
                </Button>
                <Button
                  onClick={() => setEditingStudent(false)}
                  color="warning"
                  variant="light"
                >
                  Cancel
                </Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        <h1 className="text-3xl font-semibold mb-4">Students List</h1>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex gap-2 justify-end w-full mb-4">
          <Button color="primary" className="hover:bg-black" onClick={handleAdd} variant="solid">Add Student</Button>
          <Button color="primary" variant="solid">Import file</Button>
        </div>
        
        {/* AG Grid Component */}
        <div className="w-full flex justify-start">
        <Input
          startContent={<MdSearch/>}
          variant="faded"
          className="w-76"
          placeholder="Search on name or other fields..."
          type="text"
          isClearable
          onChange={(e) => setSearchContent(e.target.value)}
         />
         </div>
        <div className="w-full" style={{ height: '500px' }}>
       
          <AgGridReact
            theme={themeQuartz}
            quickFilterText={searchContent}
            ref={gridRef}
            rowData={students}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowSelection="multiple"
            onGridReady={onGridReady}
            onFirstDataRendered={onFirstDataRendered}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
          />
        </div>
      </div>
      
      <div className="flex flex-col items-center bg-gray-100 p-4 mb-4">
        <Modal
          backdrop="blur" 
          isOpen={addingStudent} 
          onClose={() => setAddingStudent(false)}
        >
          <ModalContent>
            <ModalHeader className="text-2xl font-bold">Add Student</ModalHeader>
            <ModalBody>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <Input
                type="text"
                placeholder="First Name"
                value={first_name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={phno}
                onChange={(e) => setPh(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Admission Number"
                value={admno}
                onChange={(e) => setAdm(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
              />
              <Button
                onClick={handleSubmit}
                color="primary"
                className="text-white"
              >
                Submit
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
      <div className="gap-2">
      <Modal
      	  backdrop="blur" 
          isOpen={deletingStudent} 
          onClose={() => setDeletingStudent(false)}
      >
      <ModalContent>
            <ModalHeader>Warning!!</ModalHeader>
            <ModalBody>
      <p className="mb-4">Permanently DELETE selected data?</p>
      <div className="flex justify-end">
      <Button
       onClick={() => handleDelete()} 
       color="danger"
       variant="shadow"
      >Proceed</Button>
      <Button
                  onClick={() => setDeletingStudent(false)}
                  color="warning"
                  variant="light"
                >
                  Cancel
                </Button>
                </div>
      </ModalBody></ModalContent>
      </Modal>
      </div>
    </div>
  );
}

export default Students;
