import type {
  Control,
  UseFormRegister,
  UseFormUnregister,
  FieldError,
  FieldValues,
} from 'react-hook-form'
import { useEffect, useRef } from 'react'
import type { FieldConfig } from '../types/form.types'
import { TextInput } from './fields/TextInput/TextInput'
import { TextareaInput } from './fields/TextareaInput/TextareaInput'
import { SelectInput } from './fields/SelectInput/SelectInput'
import { CheckboxInput } from './fields/CheckboxInput/CheckboxInput'
import { RadioInput } from './fields/RadioInput/RadioInput'
import { useConditionalLogic } from '../hooks/useConditionalLogic'

/**
 * Props for FieldRenderer component
 */
export interface FieldRendererProps {
  /**
   * Field configuration from schema
   */
  field: FieldConfig
  /**
   * React Hook Form control object
   */
  control: Control<FieldValues>
  /**
   * React Hook Form register function
   */
  register: UseFormRegister<FieldValues>
  /**
   * Validation error for this field
   */
  error?: FieldError
  /**
   * React Hook Form unregister function
   */
  unregister?: UseFormUnregister<FieldValues>
  /**
   * Parent group ID for nested fields
   */
  parentId?: string
}

/**
 * FieldRenderer Component
 *
 * Routes field rendering to appropriate field type component.
 *
 * @param props - Component props
 */
export function FieldRenderer({
  field,
  control,
  register,
  error,
  unregister,
  parentId,
}: FieldRendererProps) {
  const { shouldShowField } = useConditionalLogic(control, [field.showWhen])
  const fieldPath = parentId ? `${parentId}.${field.id}` : field.id
  const isVisible = shouldShowField(field.showWhen)
  const wasVisibleRef = useRef(isVisible)

  useEffect(() => {
    // Unregister only when visibility transitions from visible to hidden.
    if (wasVisibleRef.current && !isVisible && unregister) {
      unregister(fieldPath)
    }
    wasVisibleRef.current = isVisible
  }, [fieldPath, isVisible, unregister])

  if (!isVisible) {
    return null
  }

  switch (field.type) {
    case 'text':
    case 'text-with-validation':
      return (
        <TextInput
          id={fieldPath}
          label={field.label}
          placeholder={field.placeholder}
          register={register}
          error={error}
        />
      )

    case 'textarea':
      return (
        <TextareaInput
          id={fieldPath}
          label={field.label}
          placeholder={field.placeholder}
          register={register}
          error={error}
        />
      )

    case 'select':
      return (
        <SelectInput
          id={fieldPath}
          label={field.label}
          options={field.options || []}
          control={control}
          error={error}
        />
      )

    case 'checkbox':
      return (
        <CheckboxInput
          id={fieldPath}
          label={field.label}
          control={control}
          error={error}
        />
      )

    case 'radio':
      return (
        <RadioInput
          id={fieldPath}
          label={field.label}
          options={field.options || []}
          control={control}
          error={error}
        />
      )

    default:
      return (
        <div>
          <strong>Unknown field type: {field.type}</strong>
        </div>
      )
  }
}
