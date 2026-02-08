import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Typography, Paper, Alert, Divider } from '@mui/material'
import type { FormSchema } from '../types/form.types'
import { buildValidationSchema } from '../utils/validationBuilder'
import { FieldRenderer } from './FieldRenderer'
import { isFieldConfig } from '../types/form.types'
import { useState } from 'react'

/**
 * Props for FormRenderer component
 */
interface FormRendererProps {
  /**
   * Form schema configuration
   */
  schema: FormSchema
}

/**
 * FormRenderer Component
 *
 * Main form orchestrator that sets up React Hook Form with Zod validation,
 * renders all fields, and handles form submission with structured JSON output.
 *
 * @param props - Component props
 */
export function FormRenderer({ schema }: FormRendererProps) {
  const [submittedData, setSubmittedData] = useState<object | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validationSchema = buildValidationSchema(schema.fields)

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validationSchema),
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
                <Box
                  key={item.id}
                  sx={{ mb: 2 }}
                >
                  <FieldRenderer field={item} />
                  {errors[item.id] && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {errors[item.id]?.message as string}
                    </Typography>
                  )}
                </Box>
              )
            } else {
              return (
                <Box
                  key={item.id}
                  sx={{ mb: 3 }}
                >
                  <Typography
                    variant="h6"
                    sx={{ mb: 2 }}
                  >
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {item.description}
                    </Typography>
                  )}
                  <Box sx={{ pl: 2 }}>
                    {item.fields.map((field) => {
                      if (isFieldConfig(field)) {
                        return (
                          <Box
                            key={field.id}
                            sx={{ mb: 2 }}
                          >
                            <FieldRenderer field={field} />
                            {errors[field.id] && (
                              <Typography
                                variant="caption"
                                color="error"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                {errors[field.id]?.message as string}
                              </Typography>
                            )}
                          </Box>
                        )
                      }
                      return null
                    })}
                  </Box>
                </Box>
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
