import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SelectInput } from './SelectInput'
import type { FieldValues, UseFormRegister } from 'react-hook-form'
import userEvent from '@testing-library/user-event'

describe('SelectInput', () => {
  const mockRegister = vi.fn() as unknown as UseFormRegister<FieldValues>

  const options = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ]

  it('renders with label', () => {
    render(
      <SelectInput
        id="country"
        label="Country"
        options={options}
        register={mockRegister}
      />,
    )

    expect(screen.getByLabelText('Country')).toBeInTheDocument()
  })

  it('renders all options when clicked', async () => {
    const user = userEvent.setup()

    render(
      <SelectInput
        id="country"
        label="Country"
        options={options}
        register={mockRegister}
      />,
    )
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

    render(
      <SelectInput
        id="country"
        label="Country"
        options={options}
        register={mockRegister}
        error={error}
      />,
    )

    expect(screen.getByText('Please select an option')).toBeInTheDocument()
  })

  it('calls register with correct id', () => {
    render(
      <SelectInput
        id="region"
        label="Region"
        options={options}
        register={mockRegister}
      />,
    )

    expect(mockRegister).toHaveBeenCalledWith('region')
  })
})
