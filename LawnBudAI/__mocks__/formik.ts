// Mock formik module for jest
export const useFormik = jest.fn(() => ({
  values: {},
  errors: {},
  touched: {},
  isValid: true,
  isSubmitting: false,
  handleSubmit: jest.fn(),
  setFieldValue: jest.fn(),
  setFieldTouched: jest.fn(),
  resetForm: jest.fn(),
}));

export const Formik = jest.fn();
