import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SelectInput } from './SelectInput'
import { useForm } from 'react-hook-form'
import userEvent from '@testing-library/user-event'

function SelectInputWithForm({
  defaultValue = '',
  error,
}: {
  defaultValue?: string
  error?: { type: string; message: string }
}) {
  const { control } = useForm({
    defaultValues: { country: defaultValue },
  })

  return (
    <SelectInput
      id="country"
      label="Country"
      options={[
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
        { label: 'Option 3', value: 'opt3' },
      ]}
      control={control}
      error={error}
    />
  )
}

describe('SelectInput', () => {
  it('renders with label', () => {
    render(<SelectInputWithForm />)

    expect(screen.getByLabelText('Country')).toBeInTheDocument()
  })

  it('renders all options when clicked', async () => {
    const user = userEvent.setup()

    render(<SelectInputWithForm />)

    const select = screen.getByLabelText('Country')
    await user.click(select)

    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument()
  })

  it('displays error message', () => {
    const error = {
      type: 'required',
      message: 'Please select an option',
    }

    render(<SelectInputWithForm error={error} />)

    expect(screen.getByText('Please select an option')).toBeInTheDocument()
  })

  it('shows restored value from defaultValues', () => {
    render(<SelectInputWithForm defaultValue="opt2" />)

    expect(screen.getByLabelText('Country')).toHaveTextContent('Option 2')
  })
})
