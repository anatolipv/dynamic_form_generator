import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TextInput } from './TextInput'
import type { FieldValues, UseFormRegister } from 'react-hook-form'

describe('TextInput', () => {
  const mockRegister = vi.fn() as unknown as UseFormRegister<FieldValues>

  it('renders with label', () => {
    render(
      <TextInput
        id="name"
        label="Full Name"
        register={mockRegister}
      />,
    )

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(
      <TextInput
        id="name"
        label="Full Name"
        placeholder="Enter your name"
        register={mockRegister}
      />,
    )

    const input = screen.getByPlaceholderText('Enter your name')
    expect(input).toBeInTheDocument()
  })

  it('displays error message', () => {
    const error = {
      type: 'required',
      message: 'Name is required',
    }

    render(
      <TextInput
        id="name"
        label="Full Name"
        register={mockRegister}
        error={error}
      />,
    )

    expect(screen.getByText('Name is required')).toBeInTheDocument()
  })

  it('calls register with correct id', () => {
    render(
      <TextInput
        id="email"
        label="Email"
        register={mockRegister}
      />,
    )

    expect(mockRegister).toHaveBeenCalledWith('email')
  })
})
