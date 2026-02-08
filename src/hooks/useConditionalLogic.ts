import { useMemo, useCallback } from 'react'
import { useWatch } from 'react-hook-form'
import type { Control, FieldValues } from 'react-hook-form'
import type { ShowWhenCondition } from '../types/form.types'

/**
 * Hook for conditional field visibility with optimized watching
 *
 * Watches only the dependency fields specified in conditions, preventing
 * unnecessary re-renders of unaffected components.
 *
 * @param control - React Hook Form control object
 * @param conditions - Array of conditions to watch dependencies for
 * @returns Object with shouldShowField function
 */
export function useConditionalLogic(
  control: Control<FieldValues>,
  conditions: Array<ShowWhenCondition | undefined> = [],
) {
  const dependencyFields = useMemo(() => {
    const fields = conditions
      .filter((c): c is ShowWhenCondition => c !== undefined)
      .map((c) => c.field)
      .filter(Boolean)

    return Array.from(new Set(fields))
  }, [conditions])

  const watchedValues = useWatch({
    control,
    name:
      dependencyFields.length > 0
        ? (dependencyFields as readonly string[])
        : ([] as readonly string[]),
  })

  const valueMap = useMemo(() => {
    if (dependencyFields.length === 0) {
      return {} as Record<string, unknown>
    }

    if (dependencyFields.length === 1) {
      // useWatch returns inconsistent types for single field
      // Sometimes string, sometimes array with 1 element
      const value = Array.isArray(watchedValues)
        ? watchedValues[0]
        : watchedValues
      return { [dependencyFields[0]]: value }
    }

    // Multiple fields: watchedValues is always an array
    const valuesArray = Array.isArray(watchedValues)
      ? watchedValues
      : [watchedValues]
    return Object.fromEntries(
      dependencyFields.map((fieldName, index) => [
        fieldName,
        valuesArray[index],
      ]),
    )
  }, [dependencyFields, watchedValues])

  const shouldShowField = useCallback(
    (condition?: ShowWhenCondition): boolean => {
      if (!condition) return true

      const actualValue = valueMap[condition.field]
      return actualValue === condition.equals
    },
    [valueMap],
  )

  return { shouldShowField }
}
