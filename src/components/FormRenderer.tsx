import { useForm, type FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Typography, Paper, Alert, Divider } from '@mui/material'
import type { FormSchema } from '../types/form.types'
import { buildValidationSchema } from '../utils/validationBuilder'
import { FieldRenderer } from './FieldRenderer'
import { GroupRenderer } from './GroupRenderer/GroupRenderer'
import { isFieldConfig } from '../types/form.types'
import { useState } from 'react'

/**
 * Props for FormRenderer component
 */
interface FormRendererProps {
  schema: FormSchema
}

/**
 * FormRenderer Component
 */
export function FormRenderer({ schema }: FormRendererProps) {
  const [submittedData, setSubmittedData] = useState<object | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validationSchema = buildValidationSchema(schema.fields)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validationSchema),
    shouldUnregister: true,
  })

  const onSubmit = (data: object) => {
    try {
      setSubmittedData(data)
      setSubmitError(null)
    } catch (error) {
      setSubmitError((error as Error).message)
      setSubmittedData(null)
    }
  }

  return (
    <Paper
      elevation={2}
      sx={{ p: 3 }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 1 }}
      >
        {schema.title}
      </Typography>
      {schema.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {schema.description}
        </Typography>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 3 }}>
          {schema.fields.map((item) => {
            if (isFieldConfig(item)) {
              return (
                <FieldRenderer
                  key={item.id}
                  field={item}
                  control={control}
                  register={register}
                  error={errors[item.id] as FieldError | undefined}
                />
              )
            } else {
              return (
                <GroupRenderer
                  key={item.id}
                  group={item}
                  control={control}
                  register={register}
                  errors={errors}
                />
              )
            }
          })}
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          data-testid="form-submit-button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </Button>
      </form>

      {submitError && (
        <Alert
          severity="error"
          sx={{ mt: 3 }}
        >
          <strong>Submission Error:</strong> {submitError}
        </Alert>
      )}

      {submittedData && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography
            variant="h6"
            sx={{ mb: 2 }}
          >
            Form Output
          </Typography>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflowX: 'auto',
            }}
          >
            <pre>{JSON.stringify(submittedData, null, 2)}</pre>
          </Paper>
        </Box>
      )}
    </Paper>
  )
}
