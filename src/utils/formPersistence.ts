import type { FieldValues } from 'react-hook-form'
import type { FormSchema } from '../types/form.types'

interface StoredDraft {
  formId: string
  data: FieldValues
  timestamp: number
}

const DRAFT_PREFIX = 'form-draft'

export function buildFormId(schema: FormSchema): string {
  const serializedSchema = JSON.stringify(schema)
  const hash = hashString(serializedSchema)
  return `dynamic-form:${hash}`
}

export function buildDraftKey(formId: string): string {
  return `${DRAFT_PREFIX}:${formId}`
}

export function loadDraft(formId: string): FieldValues | null {
  try {
    const raw = localStorage.getItem(buildDraftKey(formId))
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredDraft
    if (!parsed || parsed.formId !== formId || typeof parsed.data !== 'object') {
      return null
    }

    return parsed.data
  } catch {
    return null
  }
}

export function saveDraft(formId: string, data: FieldValues): void {
  try {
    const payload: StoredDraft = {
      formId,
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(buildDraftKey(formId), JSON.stringify(payload))
  } catch {
    // Ignore quota/security errors in interview demo environment.
  }
}

export function clearDraft(formId: string): void {
  try {
    localStorage.removeItem(buildDraftKey(formId))
  } catch {
    // Ignore storage access errors.
  }
}

function hashString(value: string): string {
  let hash = 5381
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index)
  }
  return (hash >>> 0).toString(36)
}
