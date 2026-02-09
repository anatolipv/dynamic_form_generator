import { Box, Typography } from '@mui/material'
import { useEffect } from 'react'
import type {
  Control,
  UseFormRegister,
  UseFormUnregister,
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
  unregister?: UseFormUnregister<FieldValues>
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
  unregister,
  errors,
  parentId,
}: GroupRendererProps) {
  const { shouldShowField } = useConditionalLogic(control, [group.showWhen])
  const isVisible = shouldShowField(group.showWhen)
  const fullGroupId = parentId ? `${parentId}.${group.id}` : group.id

  useEffect(() => {
    if (!isVisible && unregister) {
      unregister(fullGroupId)
    }
  }, [fullGroupId, isVisible, unregister])

  if (!isVisible) {
    return null
  }

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
                unregister={unregister}
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
                unregister={unregister}
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
