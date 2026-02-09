import type {
  FieldConfig,
  GroupConfig,
  AutoFillConfig,
} from '../types/form.types'
import { isFieldConfig } from '../types/form.types'

export interface ResolvedAutoFillFieldRef {
  key: string
  path: string
}

export interface ResolvedAutoFillConfig {
  key: string
  apiEndpoint: string
  dependsOn: ResolvedAutoFillFieldRef[]
  targetFields: ResolvedAutoFillFieldRef[]
}

/**
 * Resolves all auto-fill configurations to absolute field paths.
 *
 * Supports nested groups while keeping schema references ergonomic:
 * - Dot notation references are treated as absolute paths
 * - Plain IDs are resolved via globally unique schema field IDs
 */
export function resolveAutoFillConfigs(
  fields: (FieldConfig | GroupConfig)[],
): ResolvedAutoFillConfig[] {
  const idToPath = buildFieldPathMap(fields)
  const resolvedConfigs: ResolvedAutoFillConfig[] = []

  collectAutoFillConfigs(fields, '', idToPath, resolvedConfigs)

  return resolvedConfigs
}

function collectAutoFillConfigs(
  items: (FieldConfig | GroupConfig)[],
  parentPath: string,
  idToPath: Map<string, string>,
  target: ResolvedAutoFillConfig[],
): void {
  items.forEach((item) => {
    const itemPath = joinPath(parentPath, item.id)
    const scopePath = isFieldConfig(item) ? parentPath : itemPath

    if (item.autoFill) {
      target.push(resolveAutoFillConfig(item.autoFill, itemPath, scopePath, idToPath))
    }

    if (!isFieldConfig(item)) {
      collectAutoFillConfigs(item.fields, itemPath, idToPath, target)
    }
  })
}

function resolveAutoFillConfig(
  config: AutoFillConfig,
  itemPath: string,
  scopePath: string,
  idToPath: Map<string, string>,
): ResolvedAutoFillConfig {
  return {
    key: itemPath,
    apiEndpoint: config.apiEndpoint,
    dependsOn: config.dependsOn.map((fieldRef) => ({
      key: fieldRef,
      path: resolveReferencePath(fieldRef, scopePath, idToPath),
    })),
    targetFields: config.targetFields.map((fieldRef) => ({
      key: fieldRef,
      path: resolveReferencePath(fieldRef, scopePath, idToPath),
    })),
  }
}

function buildFieldPathMap(
  fields: (FieldConfig | GroupConfig)[],
): Map<string, string> {
  const idToPath = new Map<string, string>()

  const walk = (
    items: (FieldConfig | GroupConfig)[],
    parentPath: string,
  ): void => {
    items.forEach((item) => {
      const itemPath = joinPath(parentPath, item.id)
      idToPath.set(item.id, itemPath)

      if (!isFieldConfig(item)) {
        walk(item.fields, itemPath)
      }
    })
  }

  walk(fields, '')
  return idToPath
}

function resolveReferencePath(
  reference: string,
  scopePath: string,
  idToPath: Map<string, string>,
): string {
  if (reference.includes('.')) {
    return reference
  }

  const mapped = idToPath.get(reference)
  if (mapped) {
    return mapped
  }

  return joinPath(scopePath, reference)
}

function joinPath(parentPath: string, childId: string): string {
  return parentPath ? `${parentPath}.${childId}` : childId
}
