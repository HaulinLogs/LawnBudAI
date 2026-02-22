# Form Validation with Formik + Yup

This document describes the form validation system implemented in LawnBudAI using Formik and Yup (Issue #39).

## Overview

LawnBudAI uses Formik + Yup for professional form validation across all three event screens:
- **Mowing Screen**: Track lawn mowing events (date, height)
- **Watering Screen**: Track watering events (date, amount, source)
- **Fertilizer Screen**: Track fertilizer applications (date, amount, N-P-K, form, method)

## Architecture

### Core Components

#### 1. **Yup Validation Schemas** (`lib/schemas/`)
- `mowing.schema.ts` - Validates mowing event inputs
- `watering.schema.ts` - Validates watering event inputs
- `fertilizer.schema.ts` - Validates fertilizer event inputs

Each schema enforces:
- Required fields with specific error messages
- Data type validation (numbers, strings, enums)
- Value range constraints (0-100% for NPK)
- Date validation (required format, no future dates)
- Type-safe TypeScript type inference via `Yup.InferType`

Example:
```typescript
export const mowingEventSchema = Yup.object({
  date: Yup.string()
    .required('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .test('not-future', 'You cannot choose a future date', (value) => {
      // Custom validation logic
    }),
  height_inches: Yup.number()
    .required('Height is required')
    .positive('Height must be a positive number')
    .typeError('Height must be a valid number'),
  notes: Yup.string().optional(),
});

export type MowingFormValues = Yup.InferType<typeof mowingEventSchema>;
```

#### 2. **FormikEventForm Wrapper** (`components/forms/FormikEventForm.tsx`)
- Integrates Formik with the base EventForm component
- Provides real-time validation feedback (on change + blur)
- Displays inline error messages below invalid fields
- Disables submit button when form is invalid
- Type-safe field mapping

Usage:
```typescript
<FormikEventForm
  formik={formik}
  fieldNames={{
    date: 'date',
    amount: 'height_inches',
    notes: 'notes',
  }}
  amountLabel="Height (inches)"
  amountPlaceholder="e.g., 2.5"
  submitLabel="Record Mowing"
/>
```

#### 3. **FormikNPKInput Component** (`components/forms/FormikNPKInput.tsx`)
- Specialized component for N-P-K (Nitrogen-Phosphorus-Potassium) inputs
- Renders three TextInputs in row layout (N | P | K)
- Individual error messages for each nutrient
- NPK total warning (orange, non-blocking) when total > 100%
- Full Formik integration with validation

Usage:
```typescript
<FormikNPKInput
  formik={formik}
  nitrogenField="nitrogen_pct"
  phosphorusField="phosphorus_pct"
  potassiumField="potassium_pct"
  showNPKWarning
/>
```

### Form Integration Pattern

All three screens follow the same migration pattern:

```typescript
import { useFormik } from 'formik';
import { validationSchema, FormValues } from '@/lib/schemas/mowing.schema';
import FormikEventForm from '@/components/forms/FormikEventForm';

export default function MowingScreen() {
  const { events, addEvent } = useMowEvents();

  // Create Formik instance with schema
  const formik = useFormik<FormValues>({
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      height_inches: '',
      notes: '',
    },
    validationSchema,
    validateOnChange: true,  // Real-time validation
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        await addEvent(values);
        resetForm();  // Clear form after success
        Alert.alert('Success', 'Event recorded!');
      } catch {
        Alert.alert('Error', 'Failed to record event');
      }
    },
  });

  return (
    <FormikEventForm
      formik={formik}
      fieldNames={{...}}
      // ...props
    />
  );
}
```

## Validation Features

### Real-Time Validation
- Validation triggers on every keystroke (`validateOnChange: true`)
- Additional validation on field blur for final check
- Errors appear inline below the invalid field

### Error Display
- Red error text (#ef4444) below invalid fields
- Field-level errors, not modal dialogs
- Multiple errors can show simultaneously
- Error messages are specific ("Height must be a positive number")

### Submit Button State
- Disabled when form is invalid
- Disabled during submission (loading state)
- Enabled only when all validations pass

### NPK Warning vs Error
- **Error** (red): Blocks form submission (e.g., NPK value > 100)
- **Warning** (orange): Non-blocking information (e.g., N+P+K total > 100%)

## Migration Notes

### Phase 0: Foundation
- Installed `formik` and `yup` dependencies
- Created `lib/schemas/` and `components/forms/` directories
- Added error/warning text styles to `styles/theme.ts`
- Updated `EventForm` with blur handlers

### Phase 1: Mowing Screen
- Created `mowingEventSchema` with date validation including "no future dates" check
- Created `FormikEventForm` wrapper component
- Migrated MowingScreen from useState to useFormik
- Real-time validation working with inline error display

### Phase 2: Watering Screen
- Created `wateringEventSchema` with source field enum validation
- Integrated GenericPicker with Formik's `setFieldValue` and `setFieldTouched`
- Added error display for source field
- Maintained getSourceBreakdown statistics

### Phase 3: Fertilizer Screen
- Created `fertilizerEventSchema` with 6 validation rules (date, amount, N-P-K range, application form/method)
- Created `FormikNPKInput` component for N-P-K trio
- Integrated two GenericPickers (application form and method) with error display
- Added NPK warning (> 100%) as non-blocking informational message
- All 8 form fields validated

### Jest Configuration
- Added `formik` and `yup` to `transformIgnorePatterns` in `jest.config.js`
- Created `__mocks__/formik.ts` and `__mocks__/yup.ts` for test compatibility
- Updated `FertilizerScreen.test.tsx` to work with new form structure

## Best Practices

### When Adding a New Form

1. **Create Yup Schema** (`lib/schemas/newfeature.schema.ts`)
   ```typescript
   export const newFeatureSchema = Yup.object({...});
   export type NewFeatureFormValues = Yup.InferType<typeof newFeatureSchema>;
   ```

2. **Use useFormik in Screen**
   ```typescript
   const formik = useFormik<NewFeatureFormValues>({
     initialValues: {...},
     validationSchema: newFeatureSchema,
     validateOnChange: true,
     validateOnBlur: true,
     onSubmit: async (values, { resetForm }) => {...}
   });
   ```

3. **Render with FormikEventForm**
   ```typescript
   <FormikEventForm
     formik={formik}
     fieldNames={{ date: 'date', amount: 'fieldName', notes: 'notes' }}
     {...props}
   />
   ```

### Error Message Guidelines

- Be specific: "Height must be a positive number" ✅ vs "Invalid" ❌
- Use active voice: "Date cannot be in the future" ✅ vs "Future date not allowed" ⚠️
- Match user context: "Please select a valid source" for pickers ✅

### Testing

- Unit test schemas in `__tests__/lib/schemas/`
- Integration test screens in `__tests__/screens/`
- Use mocks for Formik/Yup in test environment
- Test validation errors appear correctly

## Troubleshooting

### Form not validating?
- Check `validationSchema` is passed to `useFormik`
- Verify `validateOnChange: true` and `validateOnBlur: true`
- Ensure field names match between schema and `fieldNames` map

### Errors not displaying?
- Check `formik.touched[fieldName]` in FormikEventForm
- Verify error text styles are imported from theme
- Ensure error component is rendered in JSX

### Module not found: 'formik'?
- Run `yarn install` to ensure dependencies installed
- Check `jest.config.js` has formik/yup in `transformIgnorePatterns`
- Verify mock files exist in `__mocks__/`

## Related Issues

- **#38**: Mowing Screen E2E Tests (depends on #39, uses Formik validation)
- **#37**: Test Coverage Improvements (uses #39 as foundation)
- **#36**: Comprehensive Testing Strategy (completed before #39)

## References

- [Formik Documentation](https://formik.org/)
- [Yup Documentation](https://github.com/jquense/yup)
- [React Native Formik Guide](https://formik.org/docs/guides/react-native)
