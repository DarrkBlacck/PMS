'use client';

import useCurrentUser from '@/app/hooks/useUser';
import { Performance, Student } from '../components/types';
import { useState, useEffect } from 'react';
import { Card, Divider, Progress, Button, Tab, Tabs } from '@heroui/react';
import { MdTrendingUp, MdSchool, MdWork, MdVerified } from 'react-icons/md';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import FileUploadModal from '@/app/students/components/FileUploadModal';
import PDFPreviewModal from '@/app/students/components/PDFPreviewModal';
import PDFThumbnail from '@/app/students/components/PDFThumbnail';
import { useStudentManagement } from '../components/useStudentManagement';

export default function StudentPerformance() {
  const { 
    student,
    loading,
    error,
    performance,
    performanceLoading,
    performanceError,
    handleFetchPerformance,
    handleFileUpload
  } = useStudentManagement();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<string | null>(null);

  useEffect(() => {
    if (student?._id) {
      handleFetchPerformance(student._id);
    }
  }, [student]);

  const handleUpload = async (files: FileList) => {
    if (!student?._id) {
      toast.error('Student ID not found');
      return;
    }

    try {
      await handleFileUpload(
        files,
        isUploadModalOpen || 'certification', // Use modal type or default to certification
        student._id,
        (progress) => {
          // Handle upload progress if needed
          console.log('Upload progress:', progress);
        }
      );
      toast.success('File uploaded successfully');
      setIsUploadModalOpen(null);
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('Upload error:', error);
    }
  };

  if (loading || performanceLoading) {
    return <div>Loading...</div>;
  }

  if (error || performanceError) {
    return <div>Error loading performance data</div>;
  }

  // Academic Performance Section
  const AcademicMetrics = () => (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Academic Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>10th CGPA</span>
              <span className="font-semibold">{performance?.tenth_cgpa || 'N/A'}</span>
            </div>
            <Progress 
              value={((performance?.tenth_cgpa || 0) / 10) * 100} 
              color="primary"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>12th CGPA</span>
              <span className="font-semibold">{performance?.twelfth_cgpa || 'N/A'}</span>
            </div>
            <Progress 
              value={((performance?.twelfth_cgpa || 0) / 10) * 100} 
              color="primary"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>Degree CGPA</span>
              <span className="font-semibold">{performance?.degree_cgpa || 'N/A'}</span>
            </div>
            <Progress 
              value={((performance?.degree_cgpa || 0) / 10) * 100} 
              color="primary"
            />
          </div>
        </div>

        {/* <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">MCA Semester-wise CGPA</h3>
          {performance?.mca_cgpa && performance.mca_cgpa.length > 0 ? (
            <Line 
              data={{
                labels: performance.mca_cgpa.map((_, i) => `Sem ${i + 1}`),
                datasets: [{
                  label: 'CGPA',
                  data: performance.mca_cgpa,
                  borderColor: 'rgb(59, 130, 246)',
                  tension: 0.1
                }]
              }}
            />
          ) : (
            <p className="text-gray-500 text-center">No semester data available</p>
          )}
        </div> */}
      </div>
    </Card>
  );

  // Skills Section
  const SkillsSection = () => (
    <Card className="p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Skills & Certifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Technical Skills</h3>
          <div className="flex flex-wrap gap-2">
            {performance?.skills?.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Certifications</h3>
            <Button 
              size="sm"
              color="primary"
              variant="flat"
              onPress={() => setIsUploadModalOpen('certification')}
            >
              Upload Certificate
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {performance?.certification_files?.map((cert, index) => (
              <div key={index} className="border rounded-lg p-3">
                <PDFThumbnail
                  fileUrl={cert.filepath}
                  onClick={() => {/* Handle preview */}}
                />
                <p className="text-sm mt-2 truncate">{cert.filename}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Performance Dashboard</h1>
        <p className="text-gray-600">Track your academic progress and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4 bg-blue-50">
          <div className="flex items-center space-x-3">
            <MdTrendingUp className="text-blue-600 text-2xl" />
            <div>
              <p className="text-sm text-gray-600">Current CGPA</p>
              <p className="text-xl font-bold text-blue-600">
                {performance?.mca_cgpa?.[performance.mca_cgpa.length - 1] || 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-green-50">
          <div className="flex items-center space-x-3">
            <MdSchool className="text-green-600 text-2xl" />
            <div>
              <p className="text-sm text-gray-600">Current Semester</p>
              <p className="text-xl font-bold text-green-600">
                {performance?.semester || 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-purple-50">
          <div className="flex items-center space-x-3">
            <MdVerified className="text-purple-600 text-2xl" />
            <div>
              <p className="text-sm text-gray-600">Certifications</p>
              <p className="text-xl font-bold text-purple-600">
                {performance?.certification_files?.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <AcademicMetrics />
      <SkillsSection />

      {/* Modals */}
      <FileUploadModal 
        isOpen={!!isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(null)}
        onUpload={handleUpload}
      />
    </div>
  );
}
