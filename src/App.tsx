import { Container, Typography, Box } from '@mui/material'

function App() {
  return (
    <Container
      maxWidth="xl"
      sx={{
        mx: 'auto',
      }}
    >
      <Box sx={{ py: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
        >
          Dynamic Form Builder
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
        >
          A React TypeScript application for generating dynamic forms from JSON
          schemas.
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Form components will appear here...
        </Typography>
      </Box>
    </Container>
  )
}

export default App
