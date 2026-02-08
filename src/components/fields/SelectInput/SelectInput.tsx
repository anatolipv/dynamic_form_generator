import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material'
import type { UseFormRegister, FieldError, FieldValues } from 'react-hook-form'

/**
 * Select option structure
 */
interface SelectOption {
  label: string
  value: string
}

/**
 * Props for SelectInput component
 */
interface SelectInputProps {
  /**
   * Field ID for form registration
   */
  id: string
  /**
   * Field label
   */
  label: string
  /**
   * Available options
   */
  options: SelectOption[]
  /**
   * React Hook Form register function
   */
  register: UseFormRegister<FieldValues>
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
export function SelectInput({
  id,
  label,
  options,
  register,
  error,
}: SelectInputProps) {
  return (
    <FormControl
      fullWidth
      margin="normal"
      error={!!error}
    >
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        {...register(id)}
        labelId={`${id}-label`}
        label={label}
        defaultValue=""
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
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  )
}
