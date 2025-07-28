import * as React from "react";
import { Controller } from "react-hook-form";
import { Dropdown, IDropdownOption } from "@fluentui/react";
import Intersection from "../../components/Intersection/Intersection";

interface ControlledDropdownProps {
  name: string;
  control: any;
  label: string;
  options: IDropdownOption[];
  errorMessage?: string;
  onChange?: (value: any) => void;
  calloutProps?: any;
  styles?: any;
}

const ControlledDropdown: React.FC<ControlledDropdownProps> = ({
  name,
  control,
  label,
  options,
  errorMessage,
  onChange,
  calloutProps,
  styles,
}) => {
  return (
    <Intersection>
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
            calloutProps={calloutProps}
            styles={styles}
          />
        )}
      />
    </Intersection>
  );
};

export default ControlledDropdown;
