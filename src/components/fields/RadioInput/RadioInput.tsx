import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material'
import { Controller } from 'react-hook-form'
import type { Control, FieldError, FieldValues } from 'react-hook-form'

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
   * React Hook Form control object
   */
  control: Control<FieldValues>
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
  control,
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
      <Controller
        name={id}
        control={control}
        render={({ field }) => (
          <RadioGroup
            name={field.name}
            value={field.value ?? ''}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
          >
            {options.map((option, index) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={
                  <Radio inputRef={index === 0 ? field.ref : undefined} />
                }
                label={option.label}
              />
            ))}
          </RadioGroup>
        )}
      />
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  )
}
