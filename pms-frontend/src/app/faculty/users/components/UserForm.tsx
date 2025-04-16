// users/components/UserForm.tsx
import React from 'react';
import { Input, Select, SelectItem, Button } from '@heroui/react';
import { UserFormData, OptionType } from './types';

interface UserFormProps {
  formData: UserFormData;
  roleOptions: OptionType[];
  onFormChange: (field: string, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isLoading?: boolean;
  showMiddleName?: boolean;
  error?: string;
}

const UserForm: React.FC<UserFormProps> = ({
  formData,
  roleOptions,
  onFormChange,
  onCancel,
  onSubmit,
  submitLabel,
  isLoading = false,
  showMiddleName = false,
  error
}) => {
  return (
    <>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <Input
        label="First Name"
        value={formData.first_name}
        onChange={(e) => onFormChange('first_name', e.target.value)}
        className="mb-3"
        isRequired
      />
      
      {showMiddleName && (
        <Input
          label="Middle Name"
          value={formData.middle_name}
          onChange={(e) => onFormChange('middle_name', e.target.value)}
          className="mb-3"
        />
      )}
      
      <Input
        label="Last Name"
        value={formData.last_name}
        onChange={(e) => onFormChange('last_name', e.target.value)}
        className="mb-3"
      />
      
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => onFormChange('email', e.target.value)}
        className="mb-3"
        isRequired
      />
      
      <Input
        label="Phone"
        value={formData.ph_no}
        onChange={(e) => onFormChange('ph_no', e.target.value)}
        className="mb-3"
        isRequired
      />
      
      <Select 
        label="Role"
        selectedKeys={formData.role ? [formData.role] : []}
        onChange={(e) => onFormChange('role', e.target.value)}
        className="mb-3"
        isRequired
      >
        {roleOptions.map((role) => (
          <SelectItem key={role.value}>
            {role.label}
          </SelectItem>
        ))}
      </Select>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button color="danger" onPress={onCancel} isDisabled={isLoading}>
          Cancel
        </Button>
        <Button color="primary" onPress={onSubmit} isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </>
  );
};

export default UserForm;