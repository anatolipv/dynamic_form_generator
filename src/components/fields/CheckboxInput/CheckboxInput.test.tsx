import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CheckboxInput } from './CheckboxInput'
import type { FieldValues, UseFormRegister } from 'react-hook-form'

describe('CheckboxInput', () => {
  const mockRegister = vi.fn() as unknown as UseFormRegister<FieldValues>

  it('renders with label', () => {
    render(
      <CheckboxInput
        id="terms"
        label="I agree to terms"
        register={mockRegister}
      />,
    )

    expect(screen.getByLabelText('I agree to terms')).toBeInTheDocument()
  })

  it('renders as checkbox', () => {
    render(
      <CheckboxInput
        id="newsletter"
        label="Subscribe to newsletter"
        register={mockRegister}
      />,
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('displays error message', () => {
    const error = {
      type: 'required',
      message: 'You must agree',
    }

    render(
      <CheckboxInput
        id="terms"
        label="I agree to terms"
        register={mockRegister}
        error={error}
      />,
    )

    expect(screen.getByText('You must agree')).toBeInTheDocument()
  })

  it('calls register with correct id', () => {
    render(
      <CheckboxInput
        id="marketing"
        label="Marketing emails"
        register={mockRegister}
      />,
    )

    expect(mockRegister).toHaveBeenCalledWith('marketing')
  })
})
