import { useForm, type FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Typography, Paper, Alert, Divider } from '@mui/material'
import type { FormSchema } from '../types/form.types'
import { buildValidationSchema } from '../utils/validationBuilder'
import { resolveAutoFillConfigs } from '../utils/autoFillResolver'
import { buildFormId } from '../utils/formPersistence'
import { FieldRenderer } from './FieldRenderer'
import { GroupRenderer } from './GroupRenderer/GroupRenderer'
import { AutoFillManager } from './AutoFillManager'
import { isFieldConfig } from '../types/form.types'
import { useCallback, useMemo, useState } from 'react'
import { useFormPersistence } from '../hooks/useFormPersistence'

/**
 * Props for FormRenderer component
 */
export interface FormRendererProps {
  schema: FormSchema
}

/**
 * FormRenderer Component
 */
export function FormRenderer({ schema }: FormRendererProps) {
  const [submittedData, setSubmittedData] = useState<object | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validationSchema = buildValidationSchema(schema.fields)
  const formId = buildFormId(schema)
  const autoFillConfigs = useMemo(
    () => resolveAutoFillConfigs(schema.fields),
    [schema.fields],
  )

  const {
    control,
    register,
    unregister,
    reset,
    clearErrors,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validationSchema),
    shouldUnregister: true,
  })

  const { clearDraft, hasDraft } = useFormPersistence(formId, control, reset)

  const onSubmit = (data: object) => {
    try {
      setSubmittedData(data)
      setSubmitError(null)
    } catch (error) {
      setSubmitError((error as Error).message)
      setSubmittedData(null)
    }
  }

  const onValidSubmit = (data: object) => onSubmit(data)

  const onInvalidSubmit = () => {
    setSubmittedData(null)
    setSubmitError(null)
  }

  const onFormChange = useCallback(() => {
    clearErrors()

    if (!submittedData && !submitError) {
      return
    }

    setSubmittedData(null)
    setSubmitError(null)
  }, [clearErrors, submittedData, submitError])

  const handleClearDraft = useCallback(() => {
    clearDraft()
    reset({})
    clearErrors()
    setSubmittedData(null)
    setSubmitError(null)
  }, [clearDraft, clearErrors, reset])

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

      <form
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onChange={onFormChange}
      >
        <AutoFillManager
          configs={autoFillConfigs}
          control={control}
          setValue={setValue}
        />

        <Box sx={{ mb: 3 }}>
          {schema.fields.map((item) => {
            if (isFieldConfig(item)) {
              return (
                <FieldRenderer
                  key={item.id}
                  field={item}
                  control={control}
                  register={register}
                  unregister={unregister}
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
                  unregister={unregister}
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
        {hasDraft && (
          <Button
            type="button"
            variant="text"
            size="small"
            sx={{ ml: 2 }}
            onClick={handleClearDraft}
          >
            Clear Draft
          </Button>
        )}
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
