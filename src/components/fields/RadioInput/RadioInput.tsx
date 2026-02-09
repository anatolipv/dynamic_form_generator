import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
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
      sx={(theme) => ({
        px: 2,
        py: 1.5,
        border: 1,
        borderRadius: 2,
        borderColor: error ? 'error.main' : 'divider',
        transition:
          'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
        '&:hover': {
          borderColor: error ? 'error.main' : 'primary.main',
        },
        '&:focus-within': {
          borderColor: error ? 'error.main' : 'primary.main',
          boxShadow: `0 0 0 3px ${alpha(
            error ? theme.palette.error.main : theme.palette.primary.main,
            0.2,
          )}`,
        },
      })}
    >
      <FormLabel
        component="legend"
        sx={{ mb: 0.5 }}
      >
        {label}
      </FormLabel>
      <Controller
        // Typed by caller through generic TFieldValues and id path
        name={id}
        control={control}
        defaultValue={'' as never}
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
