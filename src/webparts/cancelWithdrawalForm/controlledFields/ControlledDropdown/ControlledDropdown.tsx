import * as React from 'react';
import { Controller } from 'react-hook-form';
import { Dropdown, IDropdownOption } from '@fluentui/react';

interface ControlledDropdownProps {
  name: string;
  control: any;
  label: string;
  options: IDropdownOption[];
  errorMessage?: string;
  onChange?: (value: any) => void;
}

const ControlledDropdown: React.FC<ControlledDropdownProps> = ({
  name,
  control,
  label,
  options,
  errorMessage,
  onChange,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Dropdown
          label={label}
          options={options}
          selectedKey={field.value}
          onChange={(e, option) => {
            field.onChange(option?.key);
            if (onChange) onChange(option?.key);
          }}
          errorMessage={errorMessage}
        />
      )}
    />
  );
};

export default ControlledDropdown;
