import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFormPersistence } from './useFormPersistence'
import { buildDraftKey, loadDraft } from '../utils/formPersistence'

function PersistenceTestForm({ formId = 'test-form' }: { formId?: string }) {
  const { register, control, reset } = useForm({
    defaultValues: { name: '' },
  })
  const { clearDraft, hasDraft } = useFormPersistence(formId, control, reset, {
    debounceMs: 50,
  })

  return (
    <form>
      <input
        aria-label="Name"
        {...register('name')}
      />
      <button
        type="button"
        onClick={clearDraft}
      >
        Clear Draft
      </button>
      <span>{hasDraft ? 'has-draft' : 'no-draft'}</span>
    </form>
  )
}

describe('useFormPersistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('restores existing draft on mount', async () => {
    localStorage.setItem(
      buildDraftKey('test-form'),
      JSON.stringify({
        formId: 'test-form',
        data: { name: 'Alice' },
        timestamp: Date.now(),
      }),
    )

    render(<PersistenceTestForm />)

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('Alice')
    })
    expect(screen.getByText('has-draft')).toBeInTheDocument()
  })

  it('saves form changes as draft after debounce', async () => {
    const user = userEvent.setup()

    render(<PersistenceTestForm />)

    await user.type(screen.getByLabelText('Name'), 'Bob')

    await waitFor(() => {
      expect(loadDraft('test-form')).toEqual({ name: 'Bob' })
    })
    expect(screen.getByText('has-draft')).toBeInTheDocument()
  })

  it('clears saved draft', async () => {
    const user = userEvent.setup()

    render(<PersistenceTestForm />)

    await user.type(screen.getByLabelText('Name'), 'Bob')

    await waitFor(() => {
      expect(loadDraft('test-form')).toEqual({ name: 'Bob' })
    })

    await user.click(screen.getByRole('button', { name: 'Clear Draft' }))

    expect(loadDraft('test-form')).toBeNull()
    expect(screen.getByText('no-draft')).toBeInTheDocument()
  })
})
