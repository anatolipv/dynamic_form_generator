import { useCallback, useEffect, useRef, useState } from 'react'
import { useWatch } from 'react-hook-form'
import type {
  Control,
  FieldValues,
  UseFormReset,
} from 'react-hook-form'
import {
  clearDraft as clearStoredDraft,
  loadDraft,
  saveDraft,
} from '../utils/formPersistence'

interface UseFormPersistenceOptions {
  debounceMs?: number
}

interface UseFormPersistenceResult {
  clearDraft: () => void
  hasDraft: boolean
}

/**
 * Persists form values in localStorage and restores them when the same form re-mounts.
 */
export function useFormPersistence<TFieldValues extends FieldValues>(
  formId: string,
  control: Control<TFieldValues>,
  reset: UseFormReset<TFieldValues>,
  options: UseFormPersistenceOptions = {},
): UseFormPersistenceResult {
  const { debounceMs = 500 } = options
  const watchedValues = useWatch({ control })

  const [hasDraft, setHasDraft] = useState(() => loadDraft(formId) !== null)
  const isHydratedRef = useRef(false)
  const lastSavedSnapshotRef = useRef<string>('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    isHydratedRef.current = false

    const restoredDraft = loadDraft(formId)
    if (restoredDraft) {
      const draftValues = restoredDraft as TFieldValues
      lastSavedSnapshotRef.current = serialize(draftValues)
      reset(draftValues)
    } else {
      lastSavedSnapshotRef.current = ''
    }

    isHydratedRef.current = true

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [formId, reset])

  useEffect(() => {
    if (!isHydratedRef.current) {
      return
    }

    const snapshot = serialize(watchedValues)

    if (!snapshot || snapshot === lastSavedSnapshotRef.current) {
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      console.log('[AutoSave] Saving draft', { formId, values: watchedValues })
      saveDraft(formId, (watchedValues ?? {}) as FieldValues)
      lastSavedSnapshotRef.current = snapshot
      setHasDraft(true)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [debounceMs, formId, watchedValues])

  const clearDraft = useCallback(() => {
    clearStoredDraft(formId)
    lastSavedSnapshotRef.current = ''
    setHasDraft(false)
  }, [formId])

  return {
    clearDraft,
    hasDraft,
  }
}

function serialize(value: unknown): string {
  if (value === undefined) return ''

  try {
    return JSON.stringify(value)
  } catch {
    return ''
  }
}
