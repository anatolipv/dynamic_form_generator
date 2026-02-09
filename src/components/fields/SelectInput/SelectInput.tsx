import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material'
import { Controller } from 'react-hook-form'
import type {
  Control,
  FieldError,
  FieldPath,
  FieldValues,
} from 'react-hook-form'

/**
 * Select option structure
 */
export interface SelectOption {
  label: string
  value: string
}

/**
 * Props for SelectInput component
 */
export interface SelectInputProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  /**
   * Field ID for form registration
   */
  id: FieldPath<TFieldValues>
  /**
   * Field label
   */
  label: string
  /**
   * Available options
   */
  options: SelectOption[]
  /**
   * React Hook Form control object
   */
  control: Control<TFieldValues>
  /**
   * Validation error if present
   */
  error?: FieldError
}

/**
 * SelectInput Component
 *
 * Dropdown select field integrated with React Hook Form.
 *
 * @param props - Component props
 */
export function SelectInput<TFieldValues extends FieldValues = FieldValues>({
  id,
  label,
  options,
  control,
  error,
}: SelectInputProps<TFieldValues>) {
  return (
    <FormControl
      fullWidth
      margin="normal"
      error={!!error}
    >
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Controller
        // Typed by caller through generic TFieldValues and id path
        name={id}
        control={control}
        defaultValue={'' as never}
        render={({ field }) => (
          <Select
            labelId={`${id}-label`}
            label={label}
            value={field.value ?? ''}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
            inputRef={field.ref}
          >
            {options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
        )}
      />
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  )
}
