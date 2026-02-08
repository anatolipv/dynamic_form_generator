import type { FieldConfig } from '../types/form.types'

/**
 * Props for FieldRenderer component
 */
interface FieldRendererProps {
  /**
   * Field configuration from schema
   */
  field: FieldConfig
}

/**
 * FieldRenderer Component
 *
 * Routes field rendering to appropriate field type component.
 * Acts as a switch/router for different field types.
 *
 * @param props - Component props
 */
export function FieldRenderer({ field }: FieldRendererProps) {
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'select':
    case 'checkbox':
    case 'radio':
      return (
        <div>
          <strong>{field.label}</strong> (type: {field.type})
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Field component will be implemented in Task 1.4
          </p>
        </div>
      )
    default:
      return (
        <div>
          <strong>Unknown field type: {field.type}</strong>
        </div>
      )
  }
}
