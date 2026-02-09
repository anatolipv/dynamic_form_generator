import { useState, useEffect } from 'react'
import { TextField, Alert, Typography, Paper } from '@mui/material'
import type { FormSchema } from '../types/form.types'
import { parseFormSchema } from '../utils/jsonParser'

/**
 * Props for JSONInput component
 */
export interface JSONInputProps {
  /**
   * Callback when schema changes (null if invalid)
   */
  onSchemaChange: (schema: FormSchema | null) => void
}

/**
 * JSONInput Component
 *
 * Provides a text area for JSON schema input with validation and error handling.
 * Auto-parses and validates JSON after user stops typing (500ms debounce).
 *
 * @param props - Component props
 */
export function JSONInput({ onSchemaChange }: JSONInputProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!jsonInput.trim()) {
        setError(null)
        setSuccess(false)
        onSchemaChange(null)
        return
      }

      try {
        const schema = parseFormSchema(jsonInput)
        onSchemaChange(schema)
        setError(null)
        setSuccess(true)
      } catch (err) {
        setError((err as Error).message)
        setSuccess(false)
        onSchemaChange(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [jsonInput, onSchemaChange])

  return (
    <Paper
      elevation={2}
      sx={{ p: 3, mb: 4 }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 1 }}
      >
        JSON Form Schema
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        Paste your JSON schema below. The form will update automatically.
      </Typography>

      <TextField
        multiline
        rows={12}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder={`{
  "title": "Contact Form",
  "fields": [
    {
      "id": "name",
      "type": "text",
      "label": "Full Name"
    }
  ]
}`}
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
        }}
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
        >
          <strong>Invalid Schema:</strong> {error}
        </Alert>
      )}

      {success && !error && (
        <Alert
          severity="success"
          sx={{ mt: 2 }}
        >
          Schema loaded successfully! Form will appear below.
        </Alert>
      )}
    </Paper>
  )
}
