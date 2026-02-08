import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TextareaInput } from './TextareaInput'
import type { FieldValues, UseFormRegister } from 'react-hook-form'

describe('TextareaInput', () => {
  const mockRegister = vi.fn() as unknown as UseFormRegister<FieldValues>

  it('renders with label', () => {
    render(
      <TextareaInput
        id="message"
        label="Message"
        register={mockRegister}
      />,
    )

    expect(screen.getByLabelText('Message')).toBeInTheDocument()
  })

  it('renders as multiline', () => {
    render(
      <TextareaInput
        id="message"
        label="Message"
        register={mockRegister}
      />,
    )

    const textarea = screen.getByLabelText('Message')
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('displays error message', () => {
    const error = {
      type: 'required',
      message: 'Message is required',
    }

    render(
      <TextareaInput
        id="message"
        label="Message"
        register={mockRegister}
        error={error}
      />,
    )

    expect(screen.getByText('Message is required')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(
      <TextareaInput
        id="message"
        label="Message"
        placeholder="Write your message..."
        register={mockRegister}
      />,
    )

    expect(
      screen.getByPlaceholderText('Write your message...'),
    ).toBeInTheDocument()
  })
})
