import * as React from 'react';
import { Controller } from 'react-hook-form';
import {
  PrincipalType,
  IPeoplePickerContext,
} from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { PeoplePicker } from '@pnp/spfx-controls-react/lib/PeoplePicker';

interface ControlledPeoplePickerProps {
  name: string;
  control: any;
  errorMessage?: string;
  context: IPeoplePickerContext; // Adjust type based on your context type
  titleText: string;
  personSelectionLimit?: number;
  disabled?: boolean;
  showTooltip?: boolean;
  searchTextLimit?: number;
}

const ControlledPeoplePicker: React.FC<ControlledPeoplePickerProps> = ({
  name,
  control,
  errorMessage,
  context,
  titleText,
  personSelectionLimit = 1,
  disabled = false,
  showTooltip = true,
  searchTextLimit = 5,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <PeoplePicker
          errorMessage={errorMessage}
          context={context}
          titleText={titleText}
          personSelectionLimit={personSelectionLimit}
          showtooltip={showTooltip}
          disabled={disabled}
          searchTextLimit={searchTextLimit}
          onChange={(items: any) => field.onChange(items)} // Handle change with react-hook-form
          principalTypes={[PrincipalType.User]}
          resolveDelay={1000}
        />
      )}
    />
  );
};

export default ControlledPeoplePicker;
