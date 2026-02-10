import { useState, useEffect } from 'react'
import { TextField, Alert, Typography, Paper, Box, Button, Stack } from '@mui/material'
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

const PRIMARY_EXAMPLE_SCHEMA = `{
  "title": "Final Demo Form",
  "description": "Full demo: conditional visibility, nested groups, dynamic validation, mocked API auto-fill",
  "fields": [
    {
      "id": "applicantType",
      "type": "select",
      "label": "Applicant Type",
      "options": [
        { "label": "Individual", "value": "individual" },
        { "label": "Business", "value": "business" }
      ],
      "validations": [
        { "type": "required", "message": "Please choose applicant type" }
      ]
    },
    {
      "id": "contactMethod",
      "type": "radio",
      "label": "Preferred Contact Method",
      "options": [
        { "label": "Email", "value": "email" },
        { "label": "Phone", "value": "phone" }
      ],
      "validations": [
        { "type": "required", "message": "Please choose contact method" }
      ]
    },
    {
      "id": "contactEmail",
      "type": "text-with-validation",
      "label": "Contact Email",
      "placeholder": "name@example.com",
      "showWhen": { "field": "contactMethod", "equals": "email" },
      "validations": [
        { "type": "required", "message": "Email is required" },
        {
          "type": "pattern",
          "value": "^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$",
          "message": "Invalid email format"
        }
      ]
    },
    {
      "id": "contactPhone",
      "type": "text-with-validation",
      "label": "Contact Phone",
      "placeholder": "+359888123456",
      "showWhen": { "field": "contactMethod", "equals": "phone" },
      "validations": [
        { "type": "required", "message": "Phone is required" },
        {
          "type": "pattern",
          "value": "^(\\\\+359|0)[0-9]{9}$",
          "message": "Use Bulgarian format: +359XXXXXXXXX or 0XXXXXXXXX"
        }
      ]
    },
    {
      "id": "individualSection",
      "type": "group",
      "title": "Individual Details",
      "showWhen": { "field": "applicantType", "equals": "individual" },
      "fields": [
        {
          "id": "identificationType",
          "type": "select",
          "label": "Identification Type",
          "options": [
            { "label": "Personal ID", "value": "personal" },
            { "label": "Passport", "value": "passport" }
          ],
          "validations": [
            {
              "type": "required",
              "message": "Please choose identification type"
            }
          ]
        },
        {
          "id": "identificationNumber",
          "type": "text-with-validation",
          "label": "Identification Number",
          "validations": [
            {
              "type": "required",
              "message": "Identification number is required"
            },
            {
              "type": "pattern",
              "value": "^[0-9]{10}$",
              "message": "Personal ID must be exactly 10 digits",
              "condition": {
                "field": "identificationType",
                "operator": "equals",
                "value": "personal"
              }
            },
            {
              "type": "pattern",
              "value": "^[A-Z0-9]{6,9}$",
              "message": "Passport must be 6-9 uppercase alphanumeric chars",
              "condition": {
                "field": "identificationType",
                "operator": "equals",
                "value": "passport"
              }
            }
          ]
        },
        {
          "id": "individualAddress",
          "type": "group",
          "title": "Address (Auto-Fill)",
          "fields": [
            {
              "id": "postalCode",
              "type": "text",
              "label": "Postal Code",
              "placeholder": "Try 1000, 4000, 5000, 6000, 7000, 8000, 9000",
              "validations": [
                { "type": "required", "message": "Postal code is required" },
                {
                  "type": "pattern",
                  "value": "^[0-9]{4}$",
                  "message": "Postal code must be 4 digits"
                }
              ]
            },
            {
              "id": "city",
              "type": "text",
              "label": "City",
              "autoFill": {
                "apiEndpoint": "/api/address",
                "dependsOn": ["postalCode"],
                "targetFields": ["city", "state", "country"]
              }
            },
            {
              "id": "state",
              "type": "text",
              "label": "Region"
            },
            {
              "id": "country",
              "type": "text",
              "label": "Country"
            },
            {
              "id": "addressLine",
              "type": "textarea",
              "label": "Address Line"
            }
          ]
        }
      ]
    },
    {
      "id": "businessSection",
      "type": "group",
      "title": "Business Details",
      "showWhen": { "field": "applicantType", "equals": "business" },
      "fields": [
        {
          "id": "businessVatNumber",
          "type": "text",
          "label": "VAT Number",
          "placeholder": "Try BG123456789",
          "validations": [
            { "type": "required", "message": "VAT number is required" }
          ]
        },
        {
          "id": "companyName",
          "type": "text",
          "label": "Company Name",
          "autoFill": {
            "apiEndpoint": "/api/company",
            "dependsOn": ["businessVatNumber"],
            "targetFields": ["companyName", "companyAddress", "companyCity"]
          }
        },
        {
          "id": "companyAddress",
          "type": "textarea",
          "label": "Company Address"
        },
        {
          "id": "companyCity",
          "type": "text",
          "label": "Company City"
        }
      ]
    },
    {
      "id": "termsAccepted",
      "type": "checkbox",
      "label": "I accept terms and conditions",
      "validations": [
        { "type": "required", "message": "You must accept terms" }
      ]
    }
  ]
}`

const SECONDARY_EXAMPLE_SCHEMA = `{
  "title": "Secondary Demo Form",
  "description": "Second schema for testing per-form auto-save isolation",
  "fields": [
    {
      "id": "requestType",
      "type": "select",
      "label": "Request Type",
      "options": [
        { "label": "Support", "value": "support" },
        { "label": "Partnership", "value": "partnership" }
      ],
      "validations": [
        { "type": "required", "message": "Please select request type" }
      ]
    },
    {
      "id": "fullName",
      "type": "text",
      "label": "Full Name",
      "validations": [
        { "type": "required", "message": "Full name is required" }
      ]
    },
    {
      "id": "contactChannel",
      "type": "radio",
      "label": "Preferred Contact",
      "options": [
        { "label": "Email", "value": "email" },
        { "label": "Phone", "value": "phone" }
      ],
      "validations": [
        { "type": "required", "message": "Please choose contact channel" }
      ]
    },
    {
      "id": "email",
      "type": "text-with-validation",
      "label": "Email",
      "showWhen": { "field": "contactChannel", "equals": "email" },
      "validations": [
        { "type": "required", "message": "Email is required" },
        {
          "type": "pattern",
          "value": "^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$",
          "message": "Invalid email format"
        }
      ]
    },
    {
      "id": "phone",
      "type": "text-with-validation",
      "label": "Phone",
      "showWhen": { "field": "contactChannel", "equals": "phone" },
      "validations": [
        { "type": "required", "message": "Phone is required" }
      ]
    },
    {
      "id": "topic",
      "type": "textarea",
      "label": "Topic Details"
    },
    {
      "id": "consent",
      "type": "checkbox",
      "label": "I agree to be contacted",
      "validations": [
        { "type": "required", "message": "Consent is required" }
      ]
    }
  ]
}`

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

  const applyExampleSchema = (schemaText: string) => {
    setJsonInput(schemaText)
    setError(null)
    setSuccess(false)
  }

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
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ mb: 1 }}
          >
            JSON Form Schema
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Paste your JSON schema below. The form will update automatically.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={() => applyExampleSchema(PRIMARY_EXAMPLE_SCHEMA)}
          >
            Load Demo 1
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => applyExampleSchema(SECONDARY_EXAMPLE_SCHEMA)}
          >
            Load Demo 2
          </Button>
        </Stack>
      </Box>

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
