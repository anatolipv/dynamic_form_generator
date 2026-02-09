import { TextField } from '@mui/material'
import type { UseFormRegister, FieldError, FieldValues } from 'react-hook-form'

/**
 * Props for TextareaInput component
 */
interface TextareaInputProps {
  /**
   * Field ID for form registration
   */
  id: string
  /**
   * Field label
   */
  label: string
  /**
   * Placeholder text
   */
  placeholder?: string
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
 * TextareaInput Component
 *
 * Multi-line text input field integrated with React Hook Form.
 *
 * @param props - Component props
 */
export function TextareaInput({
  id,
  label,
  placeholder,
  register,
  error,
}: TextareaInputProps) {
  return (
    <TextField
      {...register(id)}
      label={label}
      placeholder={placeholder}
      slotProps={{ inputLabel: { shrink: true } }}
      error={!!error}
      helperText={error?.message}
      fullWidth
      multiline
      rows={4}
      margin="normal"
    />
  )
}
