import { Box, Typography } from '@mui/material'
import type {
  Control,
  UseFormRegister,
  FieldError,
  FieldValues,
} from 'react-hook-form'
import type { GroupConfig } from '../../types/form.types'
import { useConditionalLogic } from '../../hooks/useConditionalLogic'
import { FieldRenderer } from '../FieldRenderer'
import { isFieldConfig } from '../../types/form.types'

/**
 * Props for GroupRenderer component
 */
interface GroupRendererProps {
  group: GroupConfig
  control: Control<FieldValues>
  register: UseFormRegister<FieldValues>
  errors: Record<string, unknown>
  parentId?: string
}

/**
 * GroupRenderer Component
 *
 * Recursively renders form groups with conditional visibility support.
 * Each group watches only its own visibility dependencies for optimal performance.
 *
 * @param props - Component props
 */
export function GroupRenderer({
  group,
  control,
  register,
  errors,
  parentId,
}: GroupRendererProps) {
  const { shouldShowField } = useConditionalLogic(control, [group.showWhen])

  if (!shouldShowField(group.showWhen)) {
    return null
  }

  const fullGroupId = parentId ? `${parentId}.${group.id}` : group.id
  const groupErrors = errors[group.id] as Record<string, unknown> | undefined

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2 }}
      >
        {group.title}
      </Typography>
      {group.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {group.description}
        </Typography>
      )}
      <Box sx={{ pl: 2 }}>
        {group.fields.map((item) => {
          if (isFieldConfig(item)) {
            return (
              <FieldRenderer
                key={item.id}
                field={item}
                control={control}
                register={register}
                error={groupErrors?.[item.id] as FieldError | undefined}
                parentId={fullGroupId}
              />
            )
          } else {
            return (
              <GroupRenderer
                key={item.id}
                group={item}
                control={control}
                register={register}
                errors={groupErrors || {}}
                parentId={fullGroupId}
              />
            )
          }
        })}
      </Box>
    </Box>
  )
}
