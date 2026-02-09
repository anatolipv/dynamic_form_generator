import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CheckboxInput } from './CheckboxInput'
import { useForm } from 'react-hook-form'

function CheckboxInputWithForm({
  defaultValue = false,
  error,
}: {
  defaultValue?: boolean
  error?: { type: string; message: string }
}) {
  const { control } = useForm({
    defaultValues: { terms: defaultValue },
  })

  return (
    <CheckboxInput
      id="terms"
      label="I agree to terms"
      control={control}
      error={error}
    />
  )
}

describe('CheckboxInput', () => {
  it('renders with label', () => {
    render(<CheckboxInputWithForm />)

    expect(screen.getByLabelText('I agree to terms')).toBeInTheDocument()
  })

  it('renders as checkbox', () => {
    render(<CheckboxInputWithForm />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('displays error message', () => {
    const error = {
      type: 'required',
      message: 'You must agree',
    }

    render(<CheckboxInputWithForm error={error} />)

    expect(screen.getByText('You must agree')).toBeInTheDocument()
  })

  it('shows restored checked value from defaultValues', () => {
    render(<CheckboxInputWithForm defaultValue />)

    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
