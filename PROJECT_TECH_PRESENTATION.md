# Project Technical Presentation

## Purpose
Dynamic Form Builder is a React SPA that converts JSON schema into interactive forms with validation, conditional behavior, and mock API auto-fill.

## Architecture
- `src/components`: Rendering layer (`JSONInput`, `FormRenderer`, `FieldRenderer`, `GroupRenderer`, field components).
- `src/hooks`: Stateful orchestration (`useConditionalLogic`, `useAutoFill`, `useFormPersistence`).
- `src/utils`: Pure helpers (schema parsing, validation schema builder, auto-fill config resolver, local persistence utils).
- `src/services`: API abstraction and mock implementation.
- `src/types`: JSON schema contracts and type guards.

## Runtime Flow
1. User pastes schema in `JSONInput`.
2. `jsonParser` validates schema shape and IDs.
3. `FormRenderer` builds Zod validation schema from JSON rules.
4. Recursive renderers create fields and nested groups.
5. Conditional rules control visibility and active validations.
6. Auto-fill hooks call mock API when dependencies are complete.
7. Submit returns structured JSON output.
8. Auto-save stores drafts in `localStorage` by schema hash.

## Key Behaviors
- Hidden fields/groups are unregistered to avoid stale validation.
- Conditional validation supports `equals` and `notEquals`.
- Auto-fill clears target fields when dependencies are incomplete or request fails.
- Clear draft now clears both persisted draft and current UI state.

## Demonstration Assets
- `examples/testjsonform.json`
- `examples/testjsonform_second.json`
- `JSON_SCHEMA_GUIDE.md` for schema authoring examples
