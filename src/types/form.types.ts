/**
 * Type definitions for Dynamic Form Builder
 *
 * Defines the JSON schema structure that the form builder consumes.
 * All interfaces are exported for use throughout the application.
 *
 * @packageDocumentation
 */

/**
 * Supported field types in the form builder
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'text-with-validation'

/**
 * Validation rule types
 */
export type ValidationType =
  | 'required'
  | 'pattern'
  | 'minLength'
  | 'maxLength'
  | 'custom'

/**
 * Validation rule configuration
 *
 * @example
 * ```typescript
 * const rule: ValidationRule = {
 *   type: 'required',
 *   message: 'This field is required'
 * };
 * ```
 */
export interface ValidationRule {
  type: ValidationType
  value?: string | number
  message: string
  condition?: {
    field: string
    operator: 'equals' | 'notEquals'
    value: string
  }
}

/**
 * Visibility condition configuration
 * Controls when a field or group is shown/hidden
 *
 * @example
 * ```typescript
 * const condition: VisibilityCondition = {
 *   field: 'userType',
 *   operator: 'equals',
 *   value: 'business'
 * };
 * ```
 */
export interface VisibilityCondition {
  field: string
  operator: 'equals' | 'notEquals' | 'contains'
  value: string | string[]
}

/**
 * Auto-fill configuration for API integration
 * Specifies which fields must have values before API call is triggered
 *
 * @example
 * ```typescript
 * const config: AutoFillConfig = {
 *   apiEndpoint: '/api/address',
 *   dependsOn: ['zipCode'],
 *   targetFields: ['city', 'region', 'country']
 * };
 * ```
 */
export interface AutoFillConfig {
  apiEndpoint: string
  dependsOn: string[]
  targetFields: string[]
}

/**
 * Select/Radio option
 */
export interface FieldOption {
  label: string
  value: string
}

/**
 * Field configuration
 * Represents a single form input field
 */
export interface FieldConfig {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  defaultValue?: string | string[] | boolean
  options?: FieldOption[]
  validations?: ValidationRule[]
  visibilityCondition?: VisibilityCondition
  autoFill?: AutoFillConfig
}

/**
 * Group configuration
 * Represents a container for multiple fields or nested groups
 */
export interface GroupConfig {
  id: string
  type: 'group'
  title: string
  description?: string
  fields: (FieldConfig | GroupConfig)[]
  visibilityCondition?: VisibilityCondition
}

/**
 * Root form schema
 * Top-level configuration for the entire form
 */
export interface FormSchema {
  title: string
  description?: string
  fields: (FieldConfig | GroupConfig)[]
}

/**
 * Form output value types
 */
export type FormFieldValue =
  | string
  | number
  | boolean
  | string[]
  | FormOutputData

/**
 * Form output structure - recursive for nested groups
 */
export interface FormOutputData {
  [key: string]: FormFieldValue
}

/**
 * Type guard to check if item is a FieldConfig
 *
 * @param item - Item to check
 * @returns True if item is FieldConfig
 */
export function isFieldConfig(
  item: FieldConfig | GroupConfig,
): item is FieldConfig {
  return (item as GroupConfig).type !== 'group'
}

/**
 * Type guard to check if item is a GroupConfig
 *
 * @param item - Item to check
 * @returns True if item is GroupConfig
 */
export function isGroupConfig(
  item: FieldConfig | GroupConfig,
): item is GroupConfig {
  return (item as GroupConfig).type === 'group'
}
