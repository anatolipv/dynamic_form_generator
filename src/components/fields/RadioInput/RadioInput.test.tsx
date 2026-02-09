import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RadioInput } from './RadioInput'
import { useForm } from 'react-hook-form'

function RadioInputWithForm({
  defaultValue = '',
  error,
}: {
  defaultValue?: string
  error?: { type: string; message: string }
}) {
  const { control } = useForm({
    defaultValues: { choice: defaultValue },
  })

  return (
    <RadioInput
      id="choice"
      label="Choose one"
      options={[
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
        { label: 'Option C', value: 'c' },
      ]}
      control={control}
      error={error}
    />
  )
}

describe('RadioInput', () => {
  it('renders with label', () => {
    render(<RadioInputWithForm />)

    expect(screen.getByText('Choose one')).toBeInTheDocument()
  })

  it('renders all radio options', () => {
    render(<RadioInputWithForm />)

    expect(screen.getByLabelText('Option A')).toBeInTheDocument()
    expect(screen.getByLabelText('Option B')).toBeInTheDocument()
    expect(screen.getByLabelText('Option C')).toBeInTheDocument()
  })

  it('displays error message', () => {
    const error = {
      type: 'required',
      message: 'Please select an option',
    }

    render(<RadioInputWithForm error={error} />)

    expect(screen.getByText('Please select an option')).toBeInTheDocument()
  })

  it('shows restored checked value from defaultValues', () => {
    render(<RadioInputWithForm defaultValue="b" />)

    expect(screen.getByLabelText('Option B')).toBeChecked()
  })
})
