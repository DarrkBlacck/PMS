'use client';
import { useState, useEffect } from 'react';
import { useStudentManagement } from '@/app/students/components/useStudentManagement';
import { Student, Performance, FileInfo } from '@/app/students/components/types';
import FileUploadModal from '@/app/students/components/FileUploadModal';
import PDFPreviewModal from '@/app/students/components/PDFPreviewModal';
import useCurrentUser from '@/app/hooks/useUser';
import { Button, Tab, Tabs, Card, Divider, Spinner, Input, Modal, ModalHeader, ModalBody, ModalContent, ModalFooter } from '@heroui/react';
import { format } from 'date-fns';
import PDFThumbnail from '@/app/students/components/PDFThumbnail';
import {MdDelete} from 'react-icons/md';
import {BsFillFileEarmarkPdfFill} from 'react-icons/bs';
import { toast } from 'react-toastify';
import { MdEdit } from 'react-icons/md';



export default function StudentProfile() {
  const { user, userloading } = useCurrentUser();
  const [user_id, setUserId] = useState("");
  const [editName, setEditName] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    file: FileInfo | null;
    type: 'certification' | 'job_application' | null;
  }>({
    show: false,
    file: null,
    type: null
  });

  const {
    student,
    loading,
    performance,
    performanceLoading,
    handlefetchStudent,
    handleEditStudent,
    studentForm,
    performanceForm,
    handleStudentFormChange,
    handlePerformanceFormChange,
    handleFileUpload,
    handleDeleteDocument,
    error,
  } = useStudentManagement();

  useEffect(() => {
    if (user) {
      setUserId(user._id);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const fetchStudents = async () => {
      if (user_id && mounted) {
        try {
          await handlefetchStudent(user_id);
        } catch (error) {
          console.error("Error fetching student:", error);
        }
      }
    };
    fetchStudents();
    return () => {
      mounted = false;
    };
  }, [user_id]);

  if (userloading || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!student) {
    return <div>No student data available</div>;
  }

  


  const PersonalDetails = () => (
    <Card className="p-8 bg-white rounded-xl shadow-sm space-y-8" shadow="none">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              {editName ? (
                <Button 
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                  variant="light"
                  onPress={() => setEditName(false)}
                >
                  Cancel
                </Button>
              ) : (
                <Button 
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                  variant="light"
                  startContent={<MdEdit className="w-4 h-4" />}
                  onPress={() => setEditName(true)}
                >
                  Edit
                </Button>
              )}
            </div>
            <p className="text-gray-800 font-medium mb-2">
              {`${(student as Student).first_name || ''} ${(student as Student).middle_name || ''} ${(student as Student).last_name || ''}`}
            </p>
            
            {editName && (
              <div className="space-y-4 mt-4 bg-gray-50 p-4 rounded-lg">
              <Input 
                type="text" 
                variant="bordered"
                label="First Name"
                value={studentForm.first_name} 
                onChange={(e) => handleStudentFormChange('first_name', e.target.value)}
              />
              <Input 
                type="text" 
                variant="underlined"
                value={studentForm.middle_name}
                placeholder="Middle Name" 
                onChange={(e) => handleStudentFormChange('middle_name', e.target.value)}
              />
              <Input 
                type="text"
                variant="underlined"
                value={studentForm.last_name}
                placeholder="Last Name"
                onChange={(e) => handleStudentFormChange('last_name', e.target.value)}
              />
                <Button 
                size="sm" 
                color="primary" 
                variant="light" 
                onPress={() => {
                setEditName(false);
                handleEditStudent(student as Student);
                }}
                >
                Save
                </Button>
              </div>
            )}
            </div>
          <div>
            <label className="text-sm text-gray-500">Date of Birth</label>
            <p>{(student as Student).dob ? format(new Date((student as Student).dob!), 'PP') : 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Gender</label>
            <p>{(student as Student).gender || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <Divider />

      <div className="mt-8">
  <h3 className="text-xl font-semibold text-gray-800 mb-6">Contact Information</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="text-sm font-medium text-gray-600 block mb-2">Email</label>
        <p className="text-gray-800">{(student as Student).email}</p>
        <p className="text-sm text-gray-500 mt-1">
          Secondary: {(student as Student).alt_email || "Not set"}
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="text-sm font-medium text-gray-600 block mb-2">Phone</label>
        <p className="text-gray-800">{(student as Student).ph_no}</p>
        <p className="text-sm text-gray-500 mt-1">
          Secondary: {(student as Student).alt_ph || "Not set"}
        </p>
      </div>
    </div>

    <div className="relative bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-medium text-gray-600">Residence</label>
        {editAddress ? (
          <Button
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            variant="light"
            onPress={() => setEditAddress(false)}
          >
            Cancel
          </Button>
        ) : (
          <Button
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            variant="light"
            startContent={<MdEdit className="w-4 h-4" />}
            onPress={() => setEditAddress(true)}
          >
            Edit
          </Button>
        )}
      </div>
            <div className="space-y-1">
              <p>Address: {(student as Student).address}</p>
              <p>City: {(student as Student).city}</p>
              <p>District: {(student as Student).district}</p>
              <p>State: {(student as Student).state}</p>
            </div>
            
            {editAddress && (
              <div className="space-y-2 mt-2">
              <Input 
                variant="underlined"
                type="text"
                value={studentForm.address}
                placeholder="Address"
                onChange={(e) => handleStudentFormChange('address', e.target.value)}
              />
              <Input 
                type="text"
                variant="underlined"
                value={studentForm.city}
                placeholder="City"
                onChange={(e) => handleStudentFormChange('city', e.target.value)}
              />
              <Input 
                type="text"
                variant="underlined"
                value={studentForm.district}
                placeholder="District" 
                onChange={(e) => handleStudentFormChange('district', e.target.value)}
              />
              <Input 
                type="text"
                variant="underlined"
                value={studentForm.state}
                placeholder="State"
                onChange={(e) => handleStudentFormChange('state', e.target.value)}
              />
              <Button 
                size="sm"
                color="primary"
                variant="light"
                onPress={() => {
                setEditAddress(false);
                handleEditStudent(student as Student);
                }}
              >
                Save
              </Button>
              </div>
            )}
            </div>
        </div>
      </div>
    </Card>
  );

  const AcademicDetails = () => (
    <Card className="p-6 space-y-6" shadow='none'>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Admission Number</label>
              <p>{(student as Student).adm_no}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Registration Number</label>
              <p>{(student as Student).reg_no || 'Not assigned'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Program</label>
              <p>{(student as Student).program}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <p>{(student as Student).status}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Join Date</label>
              <p>{(student as Student).join_date ? format(new Date((student as Student).join_date), 'PP') : 'Not specified'}</p>
            </div>
            {(student as Student).end_date && (
              <div>
                <label className="text-sm text-gray-500">End Date</label>
                <p>{format(new Date((student as Student).end_date), 'PP')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </Card>
   );
   const Documents = () => {
    const [selectedFile, setSelectedFile] = useState<{ url: string; name: string } | null>(null);
  
    const handlePreview = (filepath: string, filename: string) => {
      setSelectedFile({
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${filepath}`,
        name: filename
      });
    };
  
    return (
      <Card className="p-6" shadow='none'>
      <div className="space-y-6">
        <div>
        <label className="text-sm text-gray-500">Certifications</label>
        {(performance as Performance).certification_files.length === 0 ? (
          // Empty state - centered layout
          <div className='flex flex-col items-center justify-center h-48 border rounded-lg p-3 mt-2'>
          <p className="text-sm text-gray-500 mb-4">No certifications uploaded</p>
          <Button 
            size="sm" 
            color="secondary" 
            variant="solid"
            onPress={() => setIsUploadModalOpen('certification')}
          >
            Upload Certification
          </Button>
          </div>
        ) : (
          // Has certifications - button at top right
          <div className="mt-2">
          <div className="flex justify-end mb-4">
            <Button 
            size="sm" 
            color="secondary" 
            variant="solid"
            onPress={() => setIsUploadModalOpen('certification')}
            >
            Upload Certification
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {((performance as Performance).certification_files || []).map((cert, index) => (
    <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4 space-y-3">
        <PDFThumbnail
          fileUrl={cert.filepath}
          onClick={() => handlePreview(cert.filepath, cert.filename)}
          className="w-full h-32 object-cover rounded-lg"
        />
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700 truncate" title={cert.filename}>
            {cert.filename}
          </p>
          <Button
            size="sm"
            color="danger"
            variant="light"
            isIconOnly
            className="hover:bg-red-50"
            onPress={() => setDeleteConfirmation({ show: true, file: cert, type: 'certification' })}
          >
            <MdDelete className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  ))}
</div>
          </div>
        )}
        </div>
        <div>
        <label className="text-sm text-gray-500">Job Application Documents</label>
        {(performance as Performance).job_application_files.length === 0 ? (
          // Empty state - centered layout
          <div className='flex flex-col items-center justify-center h-48 border rounded-lg p-3 mt-2'>
          <p className="text-sm text-gray-500 mb-4">No documents uploaded</p>
          <Button 
            size="sm" 
            color="secondary" 
            variant="solid"
            onPress={() => setIsUploadModalOpen('job_application')}
          >
            Upload Document(s)
          </Button>
          </div>
        ) : (
          // Has certifications - button at top right
          <div className="mt-2">
          <div className="flex justify-end mb-4">
            <Button 
            size="sm" 
            color="secondary" 
            variant="solid"
            onPress={() => setIsUploadModalOpen('job_application')}
            >
            Upload Document(s)
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {((performance as Performance).job_application_files || []).map((cert, index) => (
            <div key={index} className="border rounded-lg p-3 hover:border-primary-500 cursor-pointer">
              <div className="flex flex-col space-y-2">
              <PDFThumbnail
                fileUrl={cert.filepath}
                onClick={() => handlePreview(cert.filepath, cert.filename)}
                />
              <div className="flex justify-between items-center">
                <p className="text-sm truncate" title={cert.filename}>
                {cert.filename}
                </p>
                <>
                  <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  onPress={() => setDeleteConfirmation({ show: true, file: cert, type: 'job_application' })}
                  isIconOnly
                  >
                  <MdDelete/>
                  </Button>

                  <Modal 
                  isOpen={deleteConfirmation.show && deleteConfirmation.file?.filepath === cert.filepath} 
                  onClose={() => setDeleteConfirmation({ show: false, file: null, type: null })}
                  size="sm"
                  >
                  <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalBody>
                    Are you sure you want to delete this document?
                    </ModalBody>
                    <ModalFooter>
                    <Button
                      variant="light"
                      onPress={() => setDeleteConfirmation({ show: false, file: null, type: null })}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="danger"
                      onPress={async () => {
                      try {
                        await handleDeleteDocument(cert.filepath, 'job_application');
                        toast.success('Document deleted successfully!',{
                                      position: "bottom-left",
                        });
                        setDeleteConfirmation({ show: false, file: null, type: null });
                      } catch (error) {
                        toast.error('Failed to delete document. Please try again.',{
                                      position: "bottom-left",
                        });
                      }
                      }}
                    >
                      Delete
                    </Button>
                    </ModalFooter>
                  </ModalContent>
                  </Modal>
                </>
              </div>
              </div>
            </div>
            ))}
          </div>
          </div>
        )}
        </div>
  
              
  
        <FileUploadModal 
        isOpen={!!isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(null)}
        onUpload={async (files, onProgress) => {
          try {
            await handleFileUpload(files, isUploadModalOpen!, (student as Student)._id, onProgress);
            toast.success('Documents uploaded successfully!', {
              position: "bottom-left",
              autoClose: 3000,
              type: "success",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            setIsUploadModalOpen(null);
          } catch (error) {
            toast.error('Failed to upload documents. Please try again.', {
              position: "bottom-left",
              type: "error",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        }}
      />
  
          <PDFPreviewModal
            isOpen={!!selectedFile}
            onClose={() => setSelectedFile(null)}
            fileUrl={selectedFile?.url || ''}
            fileName={selectedFile?.name || ''}
            showDelete={true}
            onDelete={async () => {
              if (selectedFile) {
                try {
                  const filepath = selectedFile.url.split('/uploads/')[1];
                  // Determine the type based on the current arrays
                  const type = (performance as Performance).certification_files.some(f => f.filepath === filepath)
                    ? 'certification'
                    : 'job_application';
                  await handleDeleteDocument(filepath, type);
                  toast.success('Document deleted successfully!');
                  setSelectedFile(null);
                } catch (error) {
                  toast.error('Failed to delete document. Please try again.');
                }
              }
            }}
          />
        </div>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <Tabs 
      aria-label="Profile" 
      variant="underlined"
      classNames={{ 
        base: "flex flex-col md:flex-row h-full gap-8",
        tabList: "w-full md:w-64 justify-start flex-none bg-gray-50 p-4 rounded-lg",
        cursor: "w-full md:w-1 bg-blue-600",
        tab: "max-w-full justify-start px-4 h-12 text-gray-600 data-[selected=true]:text-blue-600",
        tabContent: "group-data-[selected=true]:font-medium",
        panel: "flex-1 min-w-0"
      }}
      isVertical 
      color="primary"
      selectedKey={activeTab}
      onSelectionChange={(key) => setActiveTab(key.toString())}
      >
      <Tab key="personal" title="Personal Details">
        <PersonalDetails />
      </Tab>
      <Tab key="academic" title="Academic Details">
        <AcademicDetails />
      </Tab>
      <Tab key="documents" title="Documents">
        <Documents />
      </Tab>
      </Tabs>
    </div>
  );
}
