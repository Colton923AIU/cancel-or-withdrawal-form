import * as React from 'react';
import { Controller } from 'react-hook-form';
import { TextField } from '@fluentui/react';

interface ControlledTextFieldProps {
  name: string;
  control: any;
  label: string;
  errorMessage?: string;
  type?: 'text' | 'number';
  disabled?: boolean; // Add disabled prop
}

const ControlledTextField: React.FC<ControlledTextFieldProps> = ({
  name,
  control,
  label,
  errorMessage,
  type = 'text',
  disabled = false, // Default to false if not provided
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          label={label}
          type={type}
          onChange={(_, value) => field.onChange(value)}
          value={field.value || ''}
          errorMessage={errorMessage}
          disabled={disabled} // Pass the disabled prop to TextField
        />
      )}
    />
  );
};

export default ControlledTextField;
