import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
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
 * Radio option structure
 */
export interface RadioOption {
  label: string
  value: string
}

/**
 * Props for RadioInput component
 */
export interface RadioInputProps<
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
  options: RadioOption[]
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
 * RadioInput Component
 *
 * Radio button group field integrated with React Hook Form.
 *
 * @param props - Component props
 */
export function RadioInput<TFieldValues extends FieldValues = FieldValues>({
  id,
  label,
  options,
  control,
  error,
}: RadioInputProps<TFieldValues>) {
  return (
    <FormControl
      component="fieldset"
      margin="normal"
      error={!!error}
      fullWidth
    >
      <FormLabel component="legend">{label}</FormLabel>
      <Controller
        // Typed by caller through generic TFieldValues and id path
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
