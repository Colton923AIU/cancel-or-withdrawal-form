import * as React from 'react';
import { Controller } from 'react-hook-form';
import { DatePicker, DayOfWeek } from '@fluentui/react';

interface ControlledDatePickerProps {
  name: string;
  control: any;
  label: string;
  errorMessage?: string;
}

const ControlledDatePicker: React.FC<ControlledDatePickerProps> = ({
  name,
  control,
  label,
  errorMessage,
}) => {
  return (
    <>
      {errorMessage ? <p>{errorMessage}</p> : null}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            label={label}
            firstDayOfWeek={DayOfWeek.Sunday}
            placeholder="Select a date..."
            onSelectDate={date => field.onChange(date)}
            value={field.value}
          />
        )}
      />
    </>
  );
};

export default ControlledDatePicker;
