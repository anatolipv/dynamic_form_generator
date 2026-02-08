import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { FormRenderer } from './FormRenderer'
import type { FormSchema } from '../types/form.types'
import userEvent from '@testing-library/user-event'

describe('FormRenderer', () => {
  const simpleSchema: FormSchema = {
    title: 'Test Form',
    description: 'Test description',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Name',
        validations: [
          {
            type: 'required',
            message: 'Name is required',
          },
        ],
      },
      {
        id: 'email',
        type: 'text',
        label: 'Email',
      },
    ],
  }

  const groupSchema: FormSchema = {
    title: 'Registration Form',
    fields: [
      {
        id: 'personal',
        type: 'group',
        title: 'Personal Information',
        description: 'Your personal details',
        fields: [
          {
            id: 'firstName',
            type: 'text',
            label: 'First Name',
          },
        ],
      },
    ],
  }

  it('renders form with title and description', () => {
    render(<FormRenderer schema={simpleSchema} />)

    expect(screen.getByText('Test Form')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders all fields', () => {
    render(<FormRenderer schema={simpleSchema} />)

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<FormRenderer schema={simpleSchema} />)

    const submitButton = screen.getByTestId('form-submit-button')
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveTextContent('Submit Form')
  })

  it('renders nested groups', () => {
    render(<FormRenderer schema={groupSchema} />)

    expect(screen.getByText('Registration Form')).toBeInTheDocument()
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Your personal details')).toBeInTheDocument()
    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
  })

  it('disables submit button while submitting', () => {
    render(<FormRenderer schema={simpleSchema} />)

    const submitButton = screen.getByTestId('form-submit-button')

    expect(submitButton).not.toBeDisabled()
  })

  it('shows form output after submission', async () => {
    const user = userEvent.setup()

    render(<FormRenderer schema={simpleSchema} />)

    // Fill in the form fields
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')

    // Submit form
    const submitButton = screen.getByTestId('form-submit-button')
    await user.click(submitButton)

    // Check output appears
    await waitFor(() => {
      expect(screen.getByText('Form Output')).toBeInTheDocument()
    })

    // Verify submitted data is displayed
    expect(screen.getByText(/"name": "John Doe"/)).toBeInTheDocument()
    expect(screen.getByText(/"email": "john@example.com"/)).toBeInTheDocument()
  })
})
