# Dynamic Form Builder

Single-page React application that builds and renders dynamic forms from JSON schema input.

## Live Demo
- GitHub Pages: `https://anatolipv.github.io/dynamic_form_generator/`

## Project Goal
The app accepts JSON schema definition and generates an interactive form with:
- field rendering by type
- nested groups
- conditional visibility
- dynamic validation rules
- mocked API auto-fill
- structured JSON output on submit
- auto-save draft (optional feature)

## Implemented Features
- JSON input parser and schema validation
- Field types:
  - text
  - textarea
  - dropdown/select
  - checkbox
  - radio group
  - text-with-validation
- Nested groups with recursive rendering
- Conditional visibility for fields and groups (`showWhen`)
- Dynamic validation based on other field values (`condition` in validation rules)
- Mock API integration for auto-fill (`autoFill` config)
- Submit output rendered as formatted JSON
- Auto-save to `localStorage` per schema hash
- Unit tests with Vitest and React Testing Library
- API and code documentation generation with TypeDoc

## Tech Stack
- React 19
- TypeScript
- React Hook Form
- Zod
- Material UI
- Vitest
- Testing Library
- TypeDoc

## Getting Started
1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open the app in browser (Vite URL shown in terminal).

## Scripts
- `npm run dev` - start local development server
- `npm run build` - type-check and build production bundle
- `npm run preview` - preview built app
- `npm run test` - run unit tests
- `npm run test:ui` - run tests with Vitest UI
- `npm run test:coverage` - run tests with coverage report
- `npm run lint` - run ESLint
- `npm run format` - run Prettier on source files
- `npm run docs` - generate TypeDoc HTML documentation in `docs/`

## Demo JSON Schemas
Use these ready examples:
- `examples/testjsonform.json` - full scenario with conditional sections, nested groups, dynamic validation, and auto-fill
- `examples/testjsonform_second.json` - second schema for testing auto-save isolation between forms

## How It Works
- `JSONInput` parses and validates schema on input change (debounced).
- `FormRenderer` builds Zod schema and wires React Hook Form.
- `FieldRenderer` and `GroupRenderer` render schema recursively.
- Hidden fields/groups are unregistered to avoid stale validation conflicts.
- `AutoFillManager` runs hook workers for configured `autoFill` blocks.
- `useFormPersistence` stores and restores draft values by deterministic form id.

## Mock API Behavior
Auto-fill requests are mocked and resolved in the frontend layer:
- address auto-fill by postal code
- company auto-fill by VAT number

If dependencies are incomplete, target fields are cleared and request is not executed.

## Validation Model
- Base validations are generated from field rules.
- Conditional rules are evaluated against current form values.
- Only visible/registered fields should block submit.

## Output Contract
On successful submit, the app returns structured JSON matching the field hierarchy and naming from the schema.

## Documentation
Run:

```bash
npm run docs
```

Generated HTML docs are available at:
- `docs/index.html`

Project-level technical overview is available at:
- `PROJECT_TECH_PRESENTATION.md`

JSON authoring guide with examples is available at:
- `JSON_SCHEMA_GUIDE.md`

## Testing Scope
Current test suite covers:
- individual field components
- group rendering
- conditional logic hook
- auto-fill resolver
- form persistence utilities/hook
- form submit output and invalid submit behavior

## Interview Notes
This project is implemented with modular architecture to keep responsibilities separated:
- `src/components` for UI rendering
- `src/hooks` for stateful form logic
- `src/utils` for pure transformation/business helpers
- `src/services` for API layer abstraction
- `src/types` for schema contracts
