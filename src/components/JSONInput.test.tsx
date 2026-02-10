import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import { JSONInput } from './JSONInput'

describe('JSONInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders input field', () => {
    const mockOnChange = vi.fn()
    render(<JSONInput onSchemaChange={mockOnChange} />)

    expect(screen.getByText('JSON Form Schema')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load Demo 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load Demo 2' })).toBeInTheDocument()
  })

  it('loads demo schema when clicking example button', () => {
    const mockOnChange = vi.fn()
    render(<JSONInput onSchemaChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Load Demo 1' }))
    })

    expect(textarea.value).toContain('"title": "Final Demo Form"')

    act(() => {
      vi.runAllTimers()
    })

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Final Demo Form' }),
    )
  })

  it('shows error for invalid JSON after debounce', () => {
    const mockOnChange = vi.fn()
    render(<JSONInput onSchemaChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')

    act(() => {
      fireEvent.change(textarea, { target: { value: '{invalid}' } })
      vi.runAllTimers()
    })

    expect(screen.getByText(/Invalid JSON syntax/i)).toBeInTheDocument()
    expect(mockOnChange).toHaveBeenCalledWith(null)
  })

  it('shows error for missing required fields', () => {
    const mockOnChange = vi.fn()
    render(<JSONInput onSchemaChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')

    act(() => {
      fireEvent.change(textarea, { target: { value: '{"title": "Test"}' } })
      vi.runAllTimers()
    })

    expect(screen.getByText(/must have a "fields" array/i)).toBeInTheDocument()
  })

  it('shows error for empty ID', () => {
    const mockOnChange = vi.fn()
    render(<JSONInput onSchemaChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    const emptyIdSchema = JSON.stringify({
      title: 'Test Form',
      fields: [
        { id: 'name', type: 'text', label: 'Name' },
        { id: '', type: 'text', label: 'Another Name' },
      ],
    })

    act(() => {
      fireEvent.change(textarea, { target: { value: emptyIdSchema } })
      vi.runAllTimers()
    })

    expect(screen.getByText(/Field "id" cannot be empty/i)).toBeInTheDocument()
  })

  it('shows error for duplicate IDs', () => {
    const mockOnChange = vi.fn()
    render(<JSONInput onSchemaChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    const duplicateSchema = JSON.stringify({
      title: 'Test Form',
      fields: [
        { id: 'name', type: 'text', label: 'Name' },
        { id: 'name', type: 'text', label: 'Another Name' },
      ],
    })

    act(() => {
      fireEvent.change(textarea, { target: { value: duplicateSchema } })
      vi.runAllTimers()
    })

    expect(screen.getByText(/Duplicate field ID "name"/i)).toBeInTheDocument()
  })

  it('calls onSchemaChange with valid schema after debounce', () => {
    const mockOnChange = vi.fn()
    render(<JSONInput onSchemaChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    const validSchema = JSON.stringify({
      title: 'Test Form',
      fields: [{ id: 'name', type: 'text', label: 'Name' }],
    })

    act(() => {
      fireEvent.change(textarea, { target: { value: validSchema } })
      vi.runAllTimers()
    })

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Form' }),
    )
  })

  it('clears schema when input is cleared', () => {
    const mockOnChange = vi.fn()
    render(<JSONInput onSchemaChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement

    act(() => {
      fireEvent.change(textarea, { target: { value: 'test' } })
      vi.runAllTimers()
    })

    mockOnChange.mockClear()

    act(() => {
      fireEvent.change(textarea, { target: { value: '' } })
      vi.runAllTimers()
    })

    expect(mockOnChange).toHaveBeenCalledWith(null)
  })

  it('debounces multiple rapid changes', () => {
    const mockOnChange = vi.fn()
    render(<JSONInput onSchemaChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')

    act(() => {
      fireEvent.change(textarea, { target: { value: '{' } })
      vi.advanceTimersByTime(200)

      fireEvent.change(textarea, { target: { value: '{ "t' } })
      vi.advanceTimersByTime(200)

      const validSchema = JSON.stringify({
        title: 'Test',
        fields: [{ id: 'test', type: 'text', label: 'Test' }],
      })
      fireEvent.change(textarea, { target: { value: validSchema } })

      vi.runAllTimers()
    })

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test' }),
    )
    expect(mockOnChange).toHaveBeenCalledTimes(1)
  })
})
