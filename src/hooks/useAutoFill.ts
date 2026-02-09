import { useEffect, useMemo, useRef, useState } from 'react'
import { useWatch } from 'react-hook-form'
import type { Control, FieldValues, UseFormSetValue } from 'react-hook-form'
import type { ResolvedAutoFillConfig } from '../utils/autoFillResolver'
import { fetchAutoFillData } from '../services/apiClient'

interface UseAutoFillResult {
  loading: boolean
  error: string | null
}

/**
 * Watches dependency fields and auto-fills target fields through API calls.
 */
export function useAutoFill(
  config: ResolvedAutoFillConfig,
  control: Control<FieldValues>,
  setValue: UseFormSetValue<FieldValues>,
): UseAutoFillResult {
  const [error, setStatusError] = useState<string | null>(null)
  const [lastCompletedRequestKey, setLastCompletedRequestKey] = useState<
    string | null
  >(null)
  const hadCompleteDependenciesRef = useRef(false)

  const dependencyPaths = useMemo(
    () => config.dependsOn.map((fieldRef) => fieldRef.path),
    [config.dependsOn],
  )

  const watchedValues = useWatch({
    control,
    name: dependencyPaths as readonly string[],
  })

  const valuesArray = useMemo(
    () => (Array.isArray(watchedValues) ? watchedValues : [watchedValues]),
    [watchedValues],
  )

  const dependenciesReady = useMemo(() => {
    if (
      dependencyPaths.length === 0 ||
      valuesArray.length !== dependencyPaths.length
    ) {
      return false
    }

    return valuesArray.every((value) => hasValue(value))
  }, [dependencyPaths, valuesArray])

  const hasUnregisteredDependency = useMemo(() => {
    if (
      dependencyPaths.length === 0 ||
      valuesArray.length !== dependencyPaths.length
    ) {
      return true
    }

    return valuesArray.some((value) => value === undefined)
  }, [dependencyPaths, valuesArray])

  const requestKey = useMemo(() => {
    if (!dependenciesReady) {
      return null
    }

    const params: Record<string, unknown> = {}
    config.dependsOn.forEach((fieldRef, index) => {
      params[fieldRef.key] = valuesArray[index]
    })

    return JSON.stringify(params)
  }, [config.dependsOn, dependenciesReady, valuesArray])

  const loading =
    requestKey !== null && requestKey !== lastCompletedRequestKey

  useEffect(() => {
    if (!dependenciesReady || !requestKey) {
      if (hadCompleteDependenciesRef.current && !hasUnregisteredDependency) {
        clearTargetFields(config, setValue)
      }
      hadCompleteDependenciesRef.current = false
      return
    }
    hadCompleteDependenciesRef.current = true

    const params = JSON.parse(requestKey) as Record<string, unknown>

    let active = true

    fetchAutoFillData(config.apiEndpoint, params)
      .then((response) => {
        if (!active) return

        if (response.success && response.data) {
          config.targetFields.forEach((fieldRef) => {
            const value = response.data?.[fieldRef.key]
            if (value !== undefined) {
              setValue(fieldRef.path, value as never, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          })
          setStatusError(null)
          return
        }

        const message = response.error || 'Auto-fill request failed'
        setStatusError(message)
        clearTargetFields(config, setValue)
      })
      .catch((requestError) => {
        if (!active) return
        const message = (requestError as Error).message
        setStatusError(message)
        clearTargetFields(config, setValue)
      })
      .finally(() => {
        if (!active) return
        setLastCompletedRequestKey(requestKey)
      })

    return () => {
      active = false
    }
  }, [
    config,
    dependenciesReady,
    hasUnregisteredDependency,
    requestKey,
    setValue,
  ])

  const visibleError = dependenciesReady && !loading ? error : null

  return { loading, error: visibleError }
}

function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

function clearTargetFields(
  config: ResolvedAutoFillConfig,
  setValue: UseFormSetValue<FieldValues>,
): void {
  config.targetFields.forEach((fieldRef) => {
    setValue(fieldRef.path, '' as never, {
      shouldDirty: true,
      shouldValidate: true,
    })
  })
}
