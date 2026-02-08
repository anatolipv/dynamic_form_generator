import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RadioInput } from './RadioInput'
import type { FieldValues, UseFormRegister } from 'react-hook-form'

describe('RadioInput', () => {
  const mockRegister = vi.fn() as unknown as UseFormRegister<FieldValues>

  const options = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
  ]

  it('renders with label', () => {
    render(
      <RadioInput
        id="gender"
        label="Gender"
        options={options}
        register={mockRegister}
      />,
    )

    expect(screen.getByText('Gender')).toBeInTheDocument()
  })

  it('renders all radio options', () => {
    render(
      <RadioInput
        id="choice"
        label="Choose one"
        options={options}
        register={mockRegister}
      />,
    )

    expect(screen.getByLabelText('Option A')).toBeInTheDocument()
    expect(screen.getByLabelText('Option B')).toBeInTheDocument()
    expect(screen.getByLabelText('Option C')).toBeInTheDocument()
  })

  it('displays error message', () => {
    const error = {
      type: 'required',
      message: 'Please select an option',
    }

    render(
      <RadioInput
        id="choice"
        label="Choose one"
        options={options}
        register={mockRegister}
        error={error}
      />,
    )

    expect(screen.getByText('Please select an option')).toBeInTheDocument()
  })

  it('calls register with correct id', () => {
    render(
      <RadioInput
        id="method"
        label="Contact Method"
        options={options}
        register={mockRegister}
      />,
    )

    expect(mockRegister).toHaveBeenCalledWith('method')
  })
})
