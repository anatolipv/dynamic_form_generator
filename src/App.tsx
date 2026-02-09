import { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import { JSONInput } from './components/JSONInput'
import { FormRenderer } from './components/FormRenderer'
import type { FormSchema } from './types/form.types'

export interface AppProps {
  themeMode: 'light' | 'dark'
  onToggleTheme: () => void
}

function App({ themeMode, onToggleTheme }: AppProps) {
  const [schema, setSchema] = useState<FormSchema | null>(null)

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 4 }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 1,
        }}
      >
        <Tooltip
          title={themeMode === 'light' ? 'Switch to dark' : 'Switch to light'}
        >
          <IconButton
            color="primary"
            onClick={onToggleTheme}
            aria-label="toggle color theme"
          >
            {themeMode === 'light' ? (
              <DarkModeRoundedIcon />
            ) : (
              <LightModeRoundedIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>

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
          <FormRenderer
            schema={schema}
            key={JSON.stringify(schema)}
          />
        </Box>
      )}
    </Container>
  )
}

export default App
