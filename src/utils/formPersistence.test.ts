import { beforeEach, describe, expect, it } from 'vitest'
import type { FormSchema } from '../types/form.types'
import {
  buildDraftKey,
  buildFormId,
  clearDraft,
  loadDraft,
  saveDraft,
} from './formPersistence'

describe('formPersistence utils', () => {
  const schema: FormSchema = {
    title: 'Demo Form',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Name',
      },
    ],
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it('builds stable form ids for the same schema', () => {
    const first = buildFormId(schema)
    const second = buildFormId(schema)

    expect(first).toBe(second)
    expect(first.startsWith('dynamic-form:')).toBe(true)
  })

  it('saves and loads draft data', () => {
    saveDraft('demo-form', { name: 'John Doe' })

    expect(loadDraft('demo-form')).toEqual({ name: 'John Doe' })
  })

  it('clears draft data', () => {
    saveDraft('demo-form', { name: 'John Doe' })
    clearDraft('demo-form')

    expect(loadDraft('demo-form')).toBeNull()
  })

  it('returns null when draft key contains invalid payload', () => {
    localStorage.setItem(buildDraftKey('demo-form'), '{"broken":true}')

    expect(loadDraft('demo-form')).toBeNull()
  })
})
