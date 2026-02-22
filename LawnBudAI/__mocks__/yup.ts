// Mock yup module for jest
const createMockValidator = () => ({
  required: jest.fn(function() { return this; }),
  string: jest.fn(function() { return this; }),
  number: jest.fn(function() { return this; }),
  object: jest.fn(function() { return this; }),
  matches: jest.fn(function() { return this; }),
  test: jest.fn(function() { return this; }),
  positive: jest.fn(function() { return this; }),
  min: jest.fn(function() { return this; }),
  max: jest.fn(function() { return this; }),
  typeError: jest.fn(function() { return this; }),
  oneOf: jest.fn(function() { return this; }),
  optional: jest.fn(function() { return this; }),
});

const mockString = jest.fn(() => createMockValidator());
const mockNumber = jest.fn(() => createMockValidator());
const mockObject = jest.fn(() => createMockValidator());

export const string = mockString;
export const number = mockNumber;
export const object = mockObject;

export default {
  string: mockString,
  number: mockNumber,
  object: mockObject,
};
