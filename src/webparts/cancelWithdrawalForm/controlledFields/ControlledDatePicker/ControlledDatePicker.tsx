import * as React from "react";
import { Controller } from "react-hook-form";
import { DatePicker, DayOfWeek } from "@fluentui/react";
import Intersection from "../../components/Intersection/Intersection";

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
    <Intersection>
      {errorMessage ? <p>{errorMessage}</p> : null}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            label={label}
            firstDayOfWeek={DayOfWeek.Sunday}
            placeholder="Select a date..."
            onSelectDate={(date) => field.onChange(date)}
            value={field.value}
          />
        )}
      />
    </Intersection>
  );
};

export default ControlledDatePicker;
