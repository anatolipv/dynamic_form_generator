import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material'
import type { UseFormRegister, FieldError, FieldValues } from 'react-hook-form'

/**
 * Radio option structure
 */
interface RadioOption {
  label: string
  value: string
}

/**
 * Props for RadioInput component
 */
interface RadioInputProps {
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
  options: RadioOption[]
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
 * RadioInput Component
 *
 * Radio button group field integrated with React Hook Form.
 *
 * @param props - Component props
 */
export function RadioInput({
  id,
  label,
  options,
  register,
  error,
}: RadioInputProps) {
  return (
    <FormControl
      component="fieldset"
      margin="normal"
      error={!!error}
      fullWidth
    >
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio {...register(id)} />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  )
}
