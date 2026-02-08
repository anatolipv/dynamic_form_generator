/**
 * Type definitions for Dynamic Form Builder
 *
 * Defines the JSON schema structure for dynamic form generation with support for
 * nested groups, conditional visibility, validation rules, and API integration.
 *
 * @packageDocumentation
 */

/**
 * Supported form field types
 *
 * Each type maps to a specific input component with appropriate validation and behavior.
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'text-with-validation'

/**
 * Available validation rule types
 *
 * Used to define constraints on field values that are enforced during form submission.
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
 * Defines a single validation constraint for a form field with an error message.
 * Rules can be conditional based on other field values.
 */
export interface ValidationRule {
  /** Type of validation to apply */
  type: ValidationType
  /** Value for the validation rule (e.g., min length, regex pattern) */
  value?: string | number
  /** Error message shown when validation fails */
  message: string
  /** Optional condition that determines when this rule applies */
  condition?: {
    field: string
    operator: 'equals' | 'notEquals'
    value: string
  }
}

/**
 * Simple conditional visibility configuration
 *
 * Controls field visibility based on equality check with another field's value.
 * Used for straightforward show/hide logic.
 */
export interface ShowWhenCondition {
  /** ID of the field to watch */
  field: string
  /** Value that triggers visibility */
  equals: string | number | boolean
}

/**
 * Advanced visibility condition with multiple operators
 *
 * Provides more complex visibility logic including contains checks and arrays.
 * Used when simple equality checks are insufficient.
 */
export interface VisibilityCondition {
  /** ID of the field to watch */
  field: string
  /** Comparison operator */
  operator: 'equals' | 'notEquals' | 'contains'
  /** Value(s) to compare against */
  value: string | string[]
}

/**
 * Auto-fill configuration for API-driven field population
 *
 * Enables automatic field value population from API responses when dependency
 * fields are filled. Useful for address lookups, user data fetching, etc.
 */
export interface AutoFillConfig {
  /** API endpoint to call for data */
  apiEndpoint: string
  /** Field IDs that must have values before API call */
  dependsOn: string[]
  /** Field IDs to populate with API response data */
  targetFields: string[]
}

/**
 * Option for select and radio field types
 *
 * Defines a single selectable option with display label and form value.
 */
export interface FieldOption {
  /** Display text shown to user */
  label: string
  /** Value submitted with form */
  value: string
}

/**
 * Individual form field configuration
 *
 * Represents a single input field with all its properties including type,
 * validation, visibility conditions, and API integration settings.
 */
export interface FieldConfig {
  /** Unique identifier used as form field name */
  id: string
  /** Type of input field to render */
  type: FieldType
  /** Display label for the field */
  label: string
  /** Optional placeholder text */
  placeholder?: string
  /** Initial value for the field */
  defaultValue?: string | string[] | boolean
  /** Available options for select/radio fields */
  options?: FieldOption[]
  /** Validation rules to apply */
  validations?: ValidationRule[]
  /** Advanced visibility condition */
  visibilityCondition?: VisibilityCondition
  /** API auto-fill configuration */
  autoFill?: AutoFillConfig
  /** Simple visibility condition */
  showWhen?: ShowWhenCondition
}

/**
 * Field group configuration for organizing related fields
 *
 * Groups fields together visually and logically, supporting nested groups
 * for complex form structures. Groups can also have visibility conditions.
 */
export interface GroupConfig {
  /** Unique identifier for the group */
  id: string
  /** Must be 'group' to distinguish from FieldConfig */
  type: 'group'
  /** Display title for the group */
  title: string
  /** Optional description text */
  description?: string
  /** Fields or nested groups within this group */
  fields: (FieldConfig | GroupConfig)[]
  /** Simple visibility condition for the entire group */
  showWhen?: ShowWhenCondition
}

/**
 * Root form schema configuration
 *
 * Top-level structure that defines the entire form including title,
 * description, and all fields/groups.
 */
export interface FormSchema {
  /** Form title displayed at the top */
  title: string
  /** Optional form description */
  description?: string
  /** Top-level fields and groups */
  fields: (FieldConfig | GroupConfig)[]
}

/**
 * Possible value types in form output data
 *
 * Supports primitives, arrays, and nested objects for grouped fields.
 */
export type FormFieldValue =
  | string
  | number
  | boolean
  | string[]
  | FormOutputData

/**
 * Form submission output structure
 *
 * Recursive structure that represents form data with nested groups
 * as nested objects. Used for form submission and display.
 */
export interface FormOutputData {
  [key: string]: FormFieldValue
}

/**
 * Type guard to check if an item is a FieldConfig
 *
 * Distinguishes between field and group configurations by checking
 * for the absence of type: 'group'.
 *
 * @param item - Configuration item to check
 * @returns True if item is a FieldConfig
 */
export function isFieldConfig(
  item: FieldConfig | GroupConfig,
): item is FieldConfig {
  return (item as GroupConfig).type !== 'group'
}

/**
 * Type guard to check if an item is a GroupConfig
 *
 * Distinguishes between field and group configurations by checking
 * for type: 'group'.
 *
 * @param item - Configuration item to check
 * @returns True if item is a GroupConfig
 */
export function isGroupConfig(
  item: FieldConfig | GroupConfig,
): item is GroupConfig {
  return (item as GroupConfig).type === 'group'
}
