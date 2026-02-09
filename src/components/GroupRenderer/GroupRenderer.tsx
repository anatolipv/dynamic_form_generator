import { Box, Typography, Paper } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useEffect, useRef } from 'react'
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
export interface GroupRendererProps {
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
  const depth = parentId ? parentId.split('.').length : 0
  const { shouldShowField } = useConditionalLogic(control, [group.showWhen])
  const isVisible = shouldShowField(group.showWhen)
  const fullGroupId = parentId ? `${parentId}.${group.id}` : group.id
  const wasVisibleRef = useRef(isVisible)

  useEffect(() => {
    // Unregister only when visibility transitions from visible to hidden.
    if (wasVisibleRef.current && !isVisible && unregister) {
      unregister(fullGroupId)
    }
    wasVisibleRef.current = isVisible
  }, [fullGroupId, isVisible, unregister])

  if (!isVisible) {
    return null
  }

  const groupErrors = errors[group.id] as Record<string, unknown> | undefined

  return (
    <Paper
      elevation={depth === 0 ? 2 : 0}
      sx={(theme) => ({
        mb: 3,
        px: 2,
        py: 2,
        borderRadius: 2,
        border: 1,
        borderColor: alpha(theme.palette.primary.main, depth === 0 ? 0.35 : 0.2),
        borderLeftWidth: 4,
        bgcolor:
          theme.palette.mode === 'light'
            ? alpha(theme.palette.primary.main, 0.03 + depth * 0.01)
            : alpha(theme.palette.primary.main, 0.09 + depth * 0.01),
      })}
    >
      <Typography
        variant="h6"
        sx={{ mb: 1.5 }}
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
      <Box sx={{ pl: 1 }}>
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
    </Paper>
  )
}
