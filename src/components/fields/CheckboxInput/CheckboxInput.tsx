import { FormControlLabel, Checkbox, FormHelperText, Box } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Controller } from 'react-hook-form'
import type {
  Control,
  FieldError,
  FieldPath,
  FieldValues,
} from 'react-hook-form'

/**
 * Props for CheckboxInput component
 */
export interface CheckboxInputProps<
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
   * React Hook Form control object
   */
  control: Control<TFieldValues>
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
export function CheckboxInput<TFieldValues extends FieldValues = FieldValues>({
  id,
  label,
  control,
  error,
}: CheckboxInputProps<TFieldValues>) {
  return (
    <Box
      sx={(theme) => ({
        my: 2,
        px: 2,
        py: 1,
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
        '& .MuiFormControlLabel-root': {
          m: 0,
        },
      })}
    >
      <Controller
        name={id}
        control={control}
        defaultValue={false as never}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                inputRef={field.ref}
              />
            }
            label={label}
          />
        )}
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
