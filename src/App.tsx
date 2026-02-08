import { useState } from 'react'
import { Container, Typography, Box, Divider } from '@mui/material'
import { JSONInput } from './components/JSONInput'
import type { FormSchema } from './types/form.types'

function App() {
  const [schema, setSchema] = useState<FormSchema | null>(null)

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 4 }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ mb: 1 }}
        >
          Dynamic Form Builder
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Generate interactive forms from JSON schemas with conditional logic,
          validations, and API integrations.
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <JSONInput onSchemaChange={setSchema} />

      {schema && (
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            sx={{ mb: 1 }}
          >
            Generated Form: {schema.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Form renderer will be implemented in next task...
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default App
