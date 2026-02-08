import { FormControlLabel, Checkbox, FormHelperText, Box } from '@mui/material'
import type { UseFormRegister, FieldError, FieldValues } from 'react-hook-form'

/**
 * Props for CheckboxInput component
 */
interface CheckboxInputProps {
  /**
   * Field ID for form registration
   */
  id: string
  /**
   * Field label
   */
  label: string
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
 * CheckboxInput Component
 *
 * Checkbox field integrated with React Hook Form.
 *
 * @param props - Component props
 */
export function CheckboxInput({
  id,
  label,
  register,
  error,
}: CheckboxInputProps) {
  return (
    <Box sx={{ my: 2 }}>
      <FormControlLabel
        control={<Checkbox {...register(id)} />}
        label={label}
      />
      {error && (
        <FormHelperText
          error
          sx={{ ml: 0 }}
        >
          {error.message}
        </FormHelperText>
      )}
    </Box>
  )
}
