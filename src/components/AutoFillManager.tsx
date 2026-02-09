import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import type { Control, FieldValues, UseFormSetValue } from 'react-hook-form'
import type { ResolvedAutoFillConfig } from '../utils/autoFillResolver'
import { useAutoFill } from '../hooks/useAutoFill'

interface AutoFillManagerProps {
  configs: ResolvedAutoFillConfig[]
  control: Control<FieldValues>
  setValue: UseFormSetValue<FieldValues>
}

interface AutoFillWorkerProps {
  config: ResolvedAutoFillConfig
  control: Control<FieldValues>
  setValue: UseFormSetValue<FieldValues>
}

function AutoFillWorker({ config, control, setValue }: AutoFillWorkerProps) {
  const { loading, error } = useAutoFill(config, control, setValue)

  if (!loading && !error) {
    return null
  }

  return (
    <Box
      sx={{ mb: 2 }}
      data-testid={`autofill-status-${config.key}`}
    >
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2">
            Auto-filling related fields...
          </Typography>
        </Box>
      )}
      {error && (
        <Alert
          severity="warning"
          sx={{ mt: loading ? 1 : 0 }}
        >
          {error}
        </Alert>
      )}
    </Box>
  )
}

/**
 * Coordinates all configured auto-fill workers for the current form schema.
 */
export function AutoFillManager({
  configs,
  control,
  setValue,
}: AutoFillManagerProps) {
  return (
    <>
      {configs.map((config) => (
        <AutoFillWorker
          key={config.key}
          config={config}
          control={control}
          setValue={setValue}
        />
      ))}
    </>
  )
}
