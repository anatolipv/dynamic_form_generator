import type { FormSchema } from '../types/form.types'

/**
 * Parses and validates JSON input for form schema
 *
 * @param jsonString - Raw JSON string from user input
 * @returns Parsed and validated FormSchema object
 * @throws {Error} If JSON is invalid or schema structure is incorrect
 */
/**
 * Parses and validates JSON input for form schema
 *
 * @param jsonString - Raw JSON string from user input
 * @returns Parsed and validated FormSchema object
 * @throws {Error} If JSON is invalid or schema structure is incorrect
 */
export function parseFormSchema(jsonString: string): FormSchema {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch (error) {
    throw new Error(`Invalid JSON syntax: ${(error as Error).message}`)
  }

  if (!isObject(parsed)) {
    throw new Error('Schema must be a JSON object')
  }

  if (!('title' in parsed) || typeof parsed.title !== 'string') {
    throw new Error('Schema must have a "title" field (string)')
  }

  if (!('fields' in parsed) || !Array.isArray(parsed.fields)) {
    throw new Error('Schema must have a "fields" array')
  }

  if (parsed.fields.length === 0) {
    throw new Error('Schema must have at least one field')
  }

  // Validate fields and check for duplicate IDs
  const seenIds = new Set<string>()
  validateFields(parsed.fields, 'fields', seenIds)

  return parsed as unknown as FormSchema
}

/**
 * Recursively validates fields and groups in the schema
 *
 * @param fields - Array of fields/groups to validate
 * @param path - Current path for error messages
 * @param seenIds - Set of IDs already seen (for duplicate detection)
 * @throws {Error} If validation fails
 */
function validateFields(
  fields: unknown[],
  path: string = 'fields',
  seenIds: Set<string> = new Set(),
): void {
  fields.forEach((item, index) => {
    const currentPath = `${path}[${index}]`

    if (!isObject(item)) {
      throw new Error(`${currentPath}: Must be an object`)
    }

    if (!('id' in item) || typeof item.id !== 'string') {
      throw new Error(`${currentPath}: Missing or invalid "id" field`)
    }

    if (!item.id.trim()) {
      throw new Error(`${currentPath}: Field "id" cannot be empty`)
    }

    if (seenIds.has(item.id)) {
      throw new Error(`Duplicate field ID "${item.id}" found at ${currentPath}`)
    }
    seenIds.add(item.id)

    if (!('type' in item) || typeof item.type !== 'string') {
      throw new Error(`${currentPath}: Missing or invalid "type" field`)
    }

    if (item.type === 'group') {
      if (!('title' in item) || typeof item.title !== 'string') {
        throw new Error(`${currentPath}: Group must have a "title" field`)
      }
      if (!('fields' in item) || !Array.isArray(item.fields)) {
        throw new Error(`${currentPath}: Group must have a "fields" array`)
      }
      validateFields(item.fields, `${currentPath}.fields`, seenIds)
    } else {
      if (!('label' in item) || typeof item.label !== 'string') {
        throw new Error(`${currentPath}: Field must have a "label"`)
      }

      const validTypes = [
        'text',
        'textarea',
        'select',
        'checkbox',
        'radio',
        'text-with-validation',
      ]
      if (!validTypes.includes(item.type)) {
        throw new Error(
          `${currentPath}: Invalid field type "${item.type}". ` +
            `Must be one of: ${validTypes.join(', ')}`,
        )
      }

      if (
        (item.type === 'select' || item.type === 'radio') &&
        !('options' in item)
      ) {
        throw new Error(
          `${currentPath}: ${item.type} field must have "options" array`,
        )
      }
    }
  })
}

/**
 * Type guard to check if value is an object
 *
 * @param value - Value to check
 * @returns True if value is an object (not null, not array)
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Checks if a string is valid JSON without parsing
 *
 * @param jsonString - String to validate
 * @returns True if valid JSON, false otherwise
 */
export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}
