import { z } from 'zod'
import type {
  FieldConfig,
  GroupConfig,
  ValidationCondition,
  ValidationRule,
} from '../types/form.types'
import { isFieldConfig } from '../types/form.types'

interface ConditionalValidationTarget {
  fieldPath: string
  parentPath: string
  rule: ValidationRule
}

/**
 * Builds a Zod validation schema from form field configurations
 *
 * @param fields - Array of field or group configurations
 * @returns Zod object schema for form validation
 */
export function buildValidationSchema(
  fields: (FieldConfig | GroupConfig)[],
): z.ZodObject<z.ZodRawShape> {
  const conditionalRules: ConditionalValidationTarget[] = []
  return buildObjectSchema(fields, '', conditionalRules).superRefine(
    (formData, ctx) => {
      conditionalRules.forEach(({ fieldPath, parentPath, rule }) => {
        if (!rule.condition) return

        const shouldApply = evaluateCondition(formData, rule.condition, parentPath)
        if (!shouldApply) return

        const value = getValueByPath(formData, fieldPath)
        const isValid = validateRuleValue(value, rule)

        if (!isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: toZodPath(fieldPath),
            message: rule.message,
          })
        }
      })
    },
  ) as z.ZodObject<z.ZodRawShape>
}

/**
 * Builds Zod schema for a single field
 */
function buildFieldSchema(
  field: FieldConfig,
  fieldPath: string,
  parentPath: string,
  conditionalRules: ConditionalValidationTarget[],
): z.ZodTypeAny {
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

  const allRules = field.validations ?? []
  const unconditionalRules = allRules.filter((rule) => !rule.condition)
  const hasUnconditionalRequired = unconditionalRules.some(
    (rule) => rule.type === 'required',
  )

  if (unconditionalRules.length > 0) {
    schema = applyValidations(schema, unconditionalRules)
  }

  allRules
    .filter((rule) => rule.condition)
    .forEach((rule) => {
      conditionalRules.push({ fieldPath, parentPath, rule })
    })

  if (!hasUnconditionalRequired) {
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

      case 'custom':
        if (result instanceof z.ZodString && typeof rule.value === 'string') {
          result = result.regex(new RegExp(rule.value), rule.message)
        }
        break
    }
  })

  return result
}

function buildObjectSchema(
  fields: (FieldConfig | GroupConfig)[],
  parentPath: string,
  conditionalRules: ConditionalValidationTarget[],
): z.ZodObject<z.ZodRawShape> {
  const shape: Record<string, z.ZodTypeAny> = {}

  fields.forEach((item) => {
    const itemPath = joinPath(parentPath, item.id)

    if (isFieldConfig(item)) {
      const fieldSchema = buildFieldSchema(
        item,
        itemPath,
        parentPath,
        conditionalRules,
      )
      shape[item.id] = item.showWhen ? fieldSchema.optional() : fieldSchema
    } else {
      const nestedShape = buildObjectSchema(item.fields, itemPath, conditionalRules)
      shape[item.id] = item.showWhen ? nestedShape.optional() : nestedShape
    }
  })

  return z.object(shape)
}

function evaluateCondition(
  formData: unknown,
  condition: ValidationCondition,
  parentPath: string,
): boolean {
  const absoluteValue = getValueByPath(formData, condition.field)
  const relativeFieldPath = joinPath(parentPath, condition.field)
  const relativeValue =
    relativeFieldPath !== condition.field
      ? getValueByPath(formData, relativeFieldPath)
      : undefined

  const conditionValue =
    absoluteValue !== undefined ? absoluteValue : relativeValue

  if (condition.operator === 'equals') {
    return conditionValue === condition.value
  }

  return conditionValue !== condition.value
}

function validateRuleValue(value: unknown, rule: ValidationRule): boolean {
  switch (rule.type) {
    case 'required':
      if (typeof value === 'string') {
        return value.trim().length > 0
      }
      if (typeof value === 'boolean') {
        return value === true
      }
      return value !== null && value !== undefined

    case 'minLength':
      if (typeof value !== 'string' || typeof rule.value !== 'number') {
        return true
      }
      return value.length >= rule.value

    case 'maxLength':
      if (typeof value !== 'string' || typeof rule.value !== 'number') {
        return true
      }
      return value.length <= rule.value

    case 'pattern':
    case 'custom':
      if (typeof value !== 'string' || typeof rule.value !== 'string') {
        return true
      }
      return new RegExp(rule.value).test(value)

    default:
      return true
  }
}

function getValueByPath(data: unknown, path: string): unknown {
  if (!path) return undefined
  if (typeof data !== 'object' || data === null) return undefined

  const recordData = data as Record<string, unknown>
  if (Object.prototype.hasOwnProperty.call(recordData, path)) {
    return recordData[path]
  }

  return path
    .split('.')
    .reduce<unknown>((currentValue, segment) => {
      if (typeof currentValue !== 'object' || currentValue === null) {
        return undefined
      }
      return (currentValue as Record<string, unknown>)[segment]
    }, data)
}

function toZodPath(path: string): (string | number)[] {
  if (!path) return []
  return path.split('.')
}

function joinPath(parentPath: string, itemId: string): string {
  return parentPath ? `${parentPath}.${itemId}` : itemId
}
