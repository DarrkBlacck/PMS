'use client';
import React, { useRef, useMemo } from 'react';
import { MdSearch, MdEdit, MdDeleteForever } from "react-icons/md";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input } from '@heroui/react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, themeQuartz, FirstDataRenderedEvent } from 'ag-grid-community';
import { useStudentManagement } from './components/useStudentManagement';
import { Student } from './components/types';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);


function StudentsPage() {
  const {
    // Data
    students,
    addFormData,
    editFormData,
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
    openDeleteModal,
    handleAdd,
    handleEdit,
    handleUpdate,
    handleDelete
  } = useStudentManagement();

  const gridRef = useRef<AgGridReact>(null);

  // Column definitions for AG Grid
  const columnDefs = useMemo(() => [
    { field: 'first_name', headerName: 'Name', flex: 4, sortable: true, filter: true },
    { field: 'adm_no', headerName: 'Admission No', flex: 1, sortable: true, filter: true },
    { field: 'email', headerName: 'Email', flex: 5, sortable: true, filter: true },
    { field: 'ph_no', headerName: 'Phone', flex: 4, sortable: true, filter: true },
    { field: 'program', headerName: 'Program', flex: 1, sortable: true, filter: true },
    {
      headerName: 'Actions',
      flex: 1,
      width: 100,
      cellRenderer: (params: { data: Student }) => {
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
  ], [handleEdit, openDeleteModal]);

  // Default column definitions
  const defaultColDef = useMemo(() => ({
    resizable: true,
    minWidth: 100
  }), []);



  const onFirstDataRendered = (params: FirstDataRenderedEvent) => {
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="p-0">
      <div className="flex flex-col items-center bg-gray-100 p-4 mb-4">
        <h1 className="text-3xl font-semibold mb-4">Students List</h1>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        <div className="flex gap-2 justify-end w-full mb-4">
          <Button 
            color="primary" 
            className="hover:bg-black" 
            onClick={openAddModal} 
            variant="solid"
          >
            Add Student
          </Button>
          <Button color="primary" variant="solid">Import file</Button>
        </div>
        
        {/* Search Input */}
        <div className="w-full flex justify-start mb-4">
          <Input
            startContent={<MdSearch/>}
            variant="faded"
            className="w-76"
            placeholder="Search on name or other fields..."
            type="text"
            isClearable
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
          />
        </div>
        
        {/* AG Grid Component */}
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
            onFirstDataRendered={onFirstDataRendered}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
            overlayLoadingTemplate={
              '<span class="ag-overlay-loading-center">Loading data...</span>'
            }
            overlayNoRowsTemplate={
              '<span class="ag-overlay-no-rows-center">No student records found</span>'
            }
          />
        </div>
      </div>
      
      {/* Add Student Modal */}
      <Modal
        backdrop="blur" 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader className="text-2xl font-bold">Add Student</ModalHeader>
          <ModalBody>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <Input
              type="text"
              placeholder="First Name"
              value={addFormData.first_name}
              onChange={(e) => handleAddFormChange('first_name', e.target.value)}
              className="mb-3"
            />
            <Input
              type="email"
              placeholder="Email"
              value={addFormData.email}
              onChange={(e) => handleAddFormChange('email', e.target.value)}
              className="mb-3"
            />
            <Input
              type="tel"
              placeholder="Phone Number"
              value={addFormData.ph_no}
              onChange={(e) => handleAddFormChange('ph_no', e.target.value)}
              className="mb-3"
            />
            <Input
              type="text"
              placeholder="Admission Number"
              value={addFormData.adm_no}
              onChange={(e) => handleAddFormChange('adm_no', e.target.value)}
              className="mb-3"
            />
            <Input
              type="text"
              placeholder="Program"
              value={addFormData.program}
              onChange={(e) => handleAddFormChange('program', e.target.value)}
              className="mb-3"
            />
            <div className="flex justify-end gap-2">
              <Button
                color="warning"
                variant="light"
                onClick={() => setIsAddModalOpen(false)}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleAdd}
                isLoading={loading}
              >
                Submit
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        backdrop="blur" 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader className="text-2xl font-bold mb-4">Edit Student</ModalHeader>
          <ModalBody>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <Input
              type="text"
              placeholder="First Name"
              value={editFormData.first_name}
              onChange={(e) => handleEditFormChange('first_name', e.target.value)}
              className="mb-3"
            />
            <Input
              type="email"
              placeholder="Email"
              value={editFormData.email}
              onChange={(e) => handleEditFormChange('email', e.target.value)}
              className="mb-3"
            />
            <Input
              type="tel"
              placeholder="Phone Number"
              value={editFormData.ph_no}
              onChange={(e) => handleEditFormChange('ph_no', e.target.value)}
              className="mb-3"
            />
            <Input
              type="text"
              placeholder="Admission Number"
              value={editFormData.adm_no}
              onChange={(e) => handleEditFormChange('adm_no', e.target.value)}
              className="mb-3"
            />
            <Input
              type="text"
              placeholder="Program"
              value={editFormData.program}
              onChange={(e) => handleEditFormChange('program', e.target.value)}
              className="mb-3"
            />
            <div className="flex justify-end gap-2">
              <Button
                color="warning"
                variant="light"
                onPress={() => setIsEditModalOpen(false)}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                variant="shadow"
                onClick={handleUpdate}
                isLoading={loading}
              >
                Update Details
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        backdrop="blur" 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Warning!!</ModalHeader>
          <ModalBody>
            <p className="mb-4">Permanently DELETE selected data?</p>
            <div className="flex justify-end gap-2">
              <Button
                color="warning"
                variant="light"
                onClick={() => setIsDeleteModalOpen(false)}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                variant="shadow"
                onClick={handleDelete}
                isLoading={loading}
              >
                Proceed
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default StudentsPage;