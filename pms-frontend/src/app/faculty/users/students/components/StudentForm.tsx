// students/components/StudentForm.tsx
import React from 'react';
import { Input, Button } from '@heroui/react';
import { StudentFormData } from './types';

interface StudentFormProps {
  formData: StudentFormData;
  onFormChange: (field: string, value: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  error?: string;
  isLoading?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  formData,
  onFormChange,
  onSubmit,
  submitLabel,
  error,
  isLoading = false
}) => {
  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <Input
        type="text"
        label="First Name"
        placeholder="First Name"
        value={formData.first_name}
        onChange={(e) => onFormChange('first_name', e.target.value)}
        isRequired
      />
      
      <Input
        type="email"
        label="Email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => onFormChange('email', e.target.value)}
        isRequired
      />
      
      <Input
        type="tel"
        label="Phone Number"
        placeholder="Phone Number"
        value={formData.ph_no}
        onChange={(e) => onFormChange('ph_no', e.target.value)}
        isRequired
      />
      
      <Input
        type="text"
        label="Admission Number"
        placeholder="Admission Number"
        value={formData.adm_no}
        onChange={(e) => onFormChange('adm_no', e.target.value)}
        isRequired
      />
      
      <Input
        type="text"
        label="Program"
        placeholder="Program"
        value={formData.program}
        onChange={(e) => onFormChange('program', e.target.value)}
        isRequired
      />
      
      <div className="flex justify-end mt-4">
        <Button
          color="primary"
          onClick={onSubmit}
          isLoading={isLoading}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

export default StudentForm;