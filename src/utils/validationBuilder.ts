import { z } from 'zod'
import type {
  FieldConfig,
  GroupConfig,
  ValidationRule,
} from '../types/form.types'
import { isFieldConfig } from '../types/form.types'

/**
 * Builds a Zod validation schema from form field configurations
 *
 * @param fields - Array of field or group configurations
 * @returns Zod object schema for form validation
 */
export function buildValidationSchema(
  fields: (FieldConfig | GroupConfig)[],
): z.ZodObject<z.ZodRawShape> {
  const shape: Record<string, z.ZodTypeAny> = {}

  fields.forEach((item) => {
    if (isFieldConfig(item)) {
      shape[item.id] = buildFieldSchema(item)
    } else {
      const nestedShape = buildValidationSchema(item.fields)
      shape[item.id] = nestedShape
    }
  })

  return z.object(shape)
}

/**
 * Builds Zod schema for a single field
 */
function buildFieldSchema(field: FieldConfig): z.ZodTypeAny {
  let schema: z.ZodTypeAny

  switch (field.type) {
    case 'checkbox':
      schema = z.boolean()
      break
    case 'select':
    case 'radio':
      if (field.options && field.options.length > 0) {
        const values = field.options.map((opt) => opt.value) as [
          string,
          ...string[],
        ]
        schema = z.enum(values)
      } else {
        schema = z.string()
      }
      break
    default:
      schema = z.string()
  }

  // Conditional fields are optional - shouldUnregister removes them from output
  if (field.showWhen) {
    return schema.optional()
  }

  // Apply validations
  if (field.validations && field.validations.length > 0) {
    schema = applyValidations(schema, field.validations)
  } else if (field.type !== 'checkbox') {
    schema = schema.optional()
  }

  return schema
}

/**
 * Applies validation rules to a Zod schema
 */
function applyValidations(
  schema: z.ZodTypeAny,
  validations: ValidationRule[],
): z.ZodTypeAny {
  let result = schema

  validations.forEach((rule) => {
    switch (rule.type) {
      case 'required':
        if (result instanceof z.ZodString) {
          result = result.min(1, rule.message)
        } else if (result instanceof z.ZodBoolean) {
          result = result.refine((val) => val === true, {
            message: rule.message,
          })
        }
        break

      case 'minLength':
        if (result instanceof z.ZodString && typeof rule.value === 'number') {
          result = result.min(rule.value, rule.message)
        }
        break

      case 'maxLength':
        if (result instanceof z.ZodString && typeof rule.value === 'number') {
          result = result.max(rule.value, rule.message)
        }
        break

      case 'pattern':
        if (result instanceof z.ZodString && typeof rule.value === 'string') {
          result = result.regex(new RegExp(rule.value), rule.message)
        }
        break
    }
  })

  return result
}
