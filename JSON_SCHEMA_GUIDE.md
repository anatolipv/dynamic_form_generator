# JSON Schema Guide

This guide explains how to write valid JSON schemas for the Dynamic Form Builder.

## 1. Minimal Form
```json
{
  "title": "Simple Contact Form",
  "description": "Minimal valid schema",
  "fields": [
    {
      "id": "fullName",
      "type": "text",
      "label": "Full Name"
    }
  ]
}
```

## 2. Field Types Reference

### `text`
```json
{
  "id": "firstName",
  "type": "text",
  "label": "First Name",
  "placeholder": "John",
  "validations": [
    { "type": "required", "message": "First name is required" },
    { "type": "minLength", "value": 2, "message": "Minimum 2 characters" }
  ]
}
```

### `textarea`
```json
{
  "id": "bio",
  "type": "textarea",
  "label": "Bio",
  "placeholder": "Tell us about yourself"
}
```

### `select`
```json
{
  "id": "country",
  "type": "select",
  "label": "Country",
  "options": [
    { "label": "Bulgaria", "value": "bg" },
    { "label": "Germany", "value": "de" }
  ],
  "validations": [
    { "type": "required", "message": "Please select a country" }
  ]
}
```

### `radio`
```json
{
  "id": "contactMethod",
  "type": "radio",
  "label": "Preferred Contact Method",
  "options": [
    { "label": "Email", "value": "email" },
    { "label": "Phone", "value": "phone" }
  ],
  "validations": [
    { "type": "required", "message": "Please choose one option" }
  ]
}
```

### `checkbox`
```json
{
  "id": "termsAccepted",
  "type": "checkbox",
  "label": "I accept terms and conditions",
  "validations": [
    { "type": "required", "message": "You must accept terms" }
  ]
}
```

### `text-with-validation`
Use this when you want text input with stronger format rules.
```json
{
  "id": "passportNumber",
  "type": "text-with-validation",
  "label": "Passport Number",
  "validations": [
    { "type": "required", "message": "Passport number is required" },
    {
      "type": "pattern",
      "value": "^[A-Z0-9]{6,9}$",
      "message": "Use 6-9 uppercase alphanumeric characters"
    }
  ]
}
```

## 3. Nested Groups
Groups are objects with `"type": "group"` and recursive `"fields"`.

```json
{
  "id": "addressGroup",
  "type": "group",
  "title": "Address",
  "description": "Nested group example",
  "fields": [
    {
      "id": "postalCode",
      "type": "text",
      "label": "Postal Code"
    },
    {
      "id": "cityDetails",
      "type": "group",
      "title": "City Details",
      "fields": [
        {
          "id": "city",
          "type": "text",
          "label": "City"
        },
        {
          "id": "region",
          "type": "text",
          "label": "Region"
        }
      ]
    }
  ]
}
```

## 4. Conditional Visibility (`showWhen`)

### Field-level condition
```json
{
  "id": "phone",
  "type": "text",
  "label": "Phone",
  "showWhen": {
    "field": "contactMethod",
    "equals": "phone"
  }
}
```

### Group-level condition
```json
{
  "id": "businessSection",
  "type": "group",
  "title": "Business Details",
  "showWhen": {
    "field": "applicantType",
    "equals": "business"
  },
  "fields": [
    {
      "id": "vatNumber",
      "type": "text",
      "label": "VAT Number"
    }
  ]
}
```

## 5. Conditional Validation Rules
Use `condition` in a validation rule. Supported operators are:
- `equals`
- `notEquals`

```json
{
  "id": "identificationNumber",
  "type": "text-with-validation",
  "label": "Identification Number",
  "validations": [
    { "type": "required", "message": "Identification number is required" },
    {
      "type": "pattern",
      "value": "^[0-9]{10}$",
      "message": "Personal ID must be 10 digits",
      "condition": {
        "field": "identificationType",
        "operator": "equals",
        "value": "personal"
      }
    },
    {
      "type": "pattern",
      "value": "^[A-Z0-9]{6,9}$",
      "message": "Passport must be 6-9 alphanumeric characters",
      "condition": {
        "field": "identificationType",
        "operator": "equals",
        "value": "passport"
      }
    }
  ]
}
```

## 6. Auto-Fill from Mock API
Use `autoFill` on a field to trigger API population of target fields.

```json
{
  "id": "city",
  "type": "text",
  "label": "City",
  "autoFill": {
    "apiEndpoint": "/api/address",
    "dependsOn": ["postalCode"],
    "targetFields": ["city", "state", "country"]
  }
}
```

Rules:
- API is called only when all `dependsOn` fields have values.
- On failure or missing dependencies, target fields are cleared.

## 7. Full Feature Example
For complete examples, use:
- `examples/testjsonform.json`
- `examples/testjsonform_second.json`

Both are ready for demo and cover nested groups, conditional rendering, validation, and auto-save behavior.

## 8. Common Mistakes
- Missing top-level `title`.
- Missing top-level `fields` array.
- Duplicate `id` values.
- `select` or `radio` without `options`.
- Referencing non-existing field ids in `showWhen` or `condition`.

## 9. Quick Authoring Checklist
1. Start with minimal form (`title`, `fields`).
2. Add unique ids for all fields/groups.
3. Add `showWhen` for visibility logic.
4. Add `validations` and conditional rules.
5. Add `autoFill` only after dependency ids are stable.
6. Test with both valid and invalid values.
