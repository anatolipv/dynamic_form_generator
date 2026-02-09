import { useForm, type FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Typography, Paper, Alert, Divider } from '@mui/material'
import { keyframes } from '@mui/system'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import type { FormSchema } from '../types/form.types'
import { buildValidationSchema } from '../utils/validationBuilder'
import { resolveAutoFillConfigs } from '../utils/autoFillResolver'
import { buildFormId } from '../utils/formPersistence'
import { FieldRenderer } from './FieldRenderer'
import { GroupRenderer } from './GroupRenderer/GroupRenderer'
import { AutoFillManager } from './AutoFillManager'
import { isFieldConfig } from '../types/form.types'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react'
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
  const [confettiBurstId, setConfettiBurstId] = useState(0)
  const [confettiOrigin, setConfettiOrigin] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  })
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  )
  const submitButtonRef = useRef<HTMLButtonElement | null>(null)

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

  const onValidSubmit = (data: object) => {
    setConfettiBurstId((current) => current + 1)
    onSubmit(data)
  }

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

  const updateConfettiOriginFromElement = useCallback((element?: Element | null) => {
    const target =
      element && element instanceof HTMLElement ? element : submitButtonRef.current
    if (!target) return

    const submitButtonRect = target.getBoundingClientRect()
    setConfettiOrigin({
      x: submitButtonRect.left + submitButtonRect.width / 2,
      y: submitButtonRect.top + submitButtonRect.height / 2,
    })
  }, [])

  const handleSubmitButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      updateConfettiOriginFromElement(event.currentTarget)
    },
    [updateConfettiOriginFromElement],
  )

  const handleFormSubmitCapture = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      const submitEvent = event.nativeEvent as SubmitEvent
      updateConfettiOriginFromElement(submitEvent.submitter)
    },
    [updateConfettiOriginFromElement],
  )

  const handleCopyOutput = useCallback(async () => {
    if (!submittedData) return

    const outputJson = JSON.stringify(submittedData, null, 2)
    const resetCopyStatus = () => {
      setTimeout(() => {
        setCopyStatus('idle')
      }, 1800)
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(outputJson)
        setCopyStatus('copied')
        resetCopyStatus()
        return
      }

      const didCopy = copyTextFallback(outputJson)
      setCopyStatus(didCopy ? 'copied' : 'error')
    } catch {
      const didCopy = copyTextFallback(outputJson)
      setCopyStatus(didCopy ? 'copied' : 'error')
    }

    resetCopyStatus()
  }, [submittedData])

  return (
    <>
      {confettiBurstId > 0 && (
        <SubmitConfetti
          key={confettiBurstId}
          origin={confettiOrigin}
        />
      )}
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
        onSubmitCapture={handleFormSubmitCapture}
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
          ref={submitButtonRef}
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          onClick={handleSubmitButtonClick}
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
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Typography variant="h6">Form Output</Typography>
            <Button
              type="button"
              variant={copyStatus === 'copied' ? 'contained' : 'outlined'}
              size="small"
              color={copyStatus === 'error' ? 'error' : 'primary'}
              onClick={handleCopyOutput}
              startIcon={
                copyStatus === 'copied' ? (
                  <CheckRoundedIcon fontSize="small" />
                ) : copyStatus === 'error' ? (
                  <ErrorOutlineRoundedIcon fontSize="small" />
                ) : (
                  <ContentCopyRoundedIcon fontSize="small" />
                )
              }
            >
              {copyStatus === 'copied'
                ? 'Copied'
                : copyStatus === 'error'
                  ? 'Copy Failed'
                  : 'Copy JSON'}
            </Button>
          </Box>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: 'background.default',
              border: 1,
              borderColor: 'divider',
              overflowX: 'auto',
            }}
          >
            <Box
              component="pre"
              sx={{
                m: 0,
                fontFamily:
                  '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'text.primary',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {JSON.stringify(submittedData, null, 2)}
            </Box>
          </Paper>
        </Box>
      )}
      </Paper>
    </>
  )
}

function copyTextFallback(text: string): boolean {
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'absolute'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textArea)
    return copied
  } catch {
    return false
  }
}

const confettiBurst = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(0deg) scale(0.7);
  }
  8% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--confetti-x), var(--confetti-y), 0) rotate(var(--confetti-rotate)) scale(1);
  }
`

const CONFETTI_COLORS = [
  '#54C6A9',
  '#FF8F70',
  '#6D7DFF',
  '#F7C948',
  '#0A7C66',
  '#C8553D',
]

const CONFETTI_PARTICLES = Array.from({ length: 28 }, (_, index) => {
  const offset = ((index % 14) - 6.5) * 3.5
  const sideBoost = index % 2 === 0 ? 1 : -1

  return {
    id: index,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    size: 8 + (index % 4) * 2,
    delayMs: (index % 7) * 14,
    durationMs: 760 + (index % 6) * 36,
    startX: ((index % 7) - 3) * 5,
    x: offset * 8 + sideBoost * (24 + (index % 3) * 16),
    y: -(130 + (index % 5) * 18),
    rotate: sideBoost * (120 + (index % 7) * 36),
  }
})

interface ConfettiOrigin {
  x: number
  y: number
}

interface SubmitConfettiProps {
  origin: ConfettiOrigin
}

function SubmitConfetti({ origin }: SubmitConfettiProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: (theme) => theme.zIndex.snackbar + 1,
        pointerEvents: 'none',
      }}
    >
      {CONFETTI_PARTICLES.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            '--confetti-x': `${particle.x}px`,
            '--confetti-y': `${particle.y}px`,
            '--confetti-rotate': `${particle.rotate}deg`,
            position: 'fixed',
            left: `${origin.x + particle.startX}px`,
            top: `${origin.y - 8}px`,
            width: `${particle.size}px`,
            height: `${Math.max(4, Math.floor(particle.size * 0.55))}px`,
            borderRadius: '2px',
            bgcolor: particle.color,
            opacity: 0,
            animation: `${confettiBurst} ${particle.durationMs}ms cubic-bezier(0.16, 0.84, 0.24, 1) ${particle.delayMs}ms forwards`,
            '@media (prefers-reduced-motion: reduce)': {
              display: 'none',
            },
          }}
        />
      ))}
    </Box>
  )
}
