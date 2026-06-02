import { defaultState } from "../forma-api.types";
import {
  flatResultValidationResult,
  getFieldErrorMessage,
  isDirty,
  isFieldEqual,
  isInvalid,
  updateField
} from "../forma-api.utils";

describe("getErrorMessage", () => {
  it("should return an error if validateOnInitialize set", () => {
    const result = getFieldErrorMessage(
      {
        error: "error",
        touched: true,
        modified: false,
        active: false,
        dirty: true,
        registered: true
      },
      { validateOnInitialize: true }
    );

    expect(result).toBe("error");
  });

  it("should return an error if a field has not been modified but form submitted", () => {
    const result = getFieldErrorMessage(
      {
        error: "error",
        touched: false,
        modified: false,
        active: false,
        dirty: true,
        registered: true
      },
      { triedToSubmit: true }
    );

    expect(result).toBe("error");
  });

  it("should return an error if a field is not active and modified", () => {
    const result = getFieldErrorMessage({
      error: "error",
      touched: false,
      modified: true,
      active: false,
      dirty: true,
      registered: true
    });

    expect(result).toBe("error");
  });

  it("should NOT return an error if a field is not active and not modified", () => {
    const result = getFieldErrorMessage({
      error: "error",
      touched: false,
      modified: false,
      active: false,
      dirty: true,
      registered: true
    });

    expect(result).toBeUndefined();
  });
});

describe("isInvalid", () => {
  it("should return true if one of fields has an error", () => {
    const result = isInvalid({
      field1: {
        error: "Error",
        active: true,
        modified: true,
        dirty: true,
        touched: true,
        registered: true
      },
      field2: {
        error: undefined,
        active: true,
        modified: true,
        dirty: true,
        touched: true,
        registered: true
      }
    });

    expect(result).toBeTruthy();
  });

  it("should return false if no errors in fields", () => {
    const result = isInvalid({
      field1: {
        error: undefined,
        active: true,
        modified: true,
        dirty: true,
        touched: true,
        registered: true
      },
      field2: {
        error: undefined,
        active: true,
        modified: true,
        dirty: true,
        touched: true,
        registered: true
      }
    });

    expect(result).toBeFalsy();
  });
});

describe("isDirty", () => {
  it("should return true if one of fields is dirty and registered", () => {
    const result = isDirty({
      field1: {
        error: "Error",
        active: true,
        modified: true,
        dirty: true,
        touched: true,
        registered: true
      },
      field2: {
        error: undefined,
        active: true,
        modified: true,
        dirty: false,
        touched: true,
        registered: true
      }
    });

    expect(result).toBeTruthy();
  });

  it("should return false if all fields are not dirty", () => {
    const result = isInvalid({
      field1: {
        error: undefined,
        active: true,
        modified: true,
        dirty: false,
        touched: true,
        registered: true
      },
      field2: {
        error: undefined,
        active: true,
        modified: true,
        dirty: false,
        touched: true,
        registered: true
      }
    });

    expect(result).toBeFalsy();
  });
});

describe("updateField", () => {
  it("should return correct field state with field error", () => {
    const result = updateField(
      {
        ...defaultState,
        fields: {
          field1: {
            error: "Error",
            active: true,
            dirty: true,
            modified: true,
            touched: true,
            registered: true
          }
        }
      },
      { name: "field1", dirty: false, value: "1" }
    );
    expect(result).toEqual({
      error: "Error",
      active: true,
      dirty: false,
      modified: true,
      touched: true,
      registered: true
    });
  });
});

describe("isFieldEqual", () => {
  it("should return true for equal primitives", () => {
    expect(isFieldEqual(1, 1)).toBe(true);
    expect(isFieldEqual("test", "test")).toBe(true);
    expect(isFieldEqual(null, null)).toBe(true);
    expect(isFieldEqual(undefined, undefined)).toBe(true);
  });

  it("should return false for non-equal primitives", () => {
    expect(isFieldEqual(1, 2)).toBe(false);
    expect(isFieldEqual("test", "TEST")).toBe(false);
  });

  it("should handle arrays", () => {
    expect(isFieldEqual([1, 2], [1, 2])).toBe(true);
    expect(isFieldEqual([1, 2], [2, 1])).toBe(true); // Order does not matter
    expect(isFieldEqual([1, 2, 3], [1, 2])).toBe(false);
    expect(isFieldEqual([], [])).toBe(true);
  });

  it("should handle dates", () => {
    const dateA = new Date("2025-01-23");
    const dateB = new Date("2025-01-23");
    const dateC = new Date("2025-01-24");
    expect(isFieldEqual(dateA, dateB)).toBe(true);
    expect(isFieldEqual(dateA, dateC)).toBe(false);
  });

  it("should return false for string and number with same value (strict equality)", () => {
    expect(isFieldEqual<number | string>(1, "1")).toBe(false);
  });

  it("should handle NaN values", () => {
    expect(isFieldEqual(NaN, NaN)).toBe(true);
    expect(isFieldEqual(NaN, 1)).toBe(false);
  });

  it("should distinguish null from undefined (strict equality)", () => {
    expect(isFieldEqual(null, undefined)).toBe(false);
    expect(isFieldEqual(undefined, null)).toBe(false);
  });

  it("should handle arrays with duplicates", () => {
    expect(isFieldEqual([1, 1, 2], [1, 2, 2])).toBe(false);
    expect(isFieldEqual([1, 1, 2], [1, 1, 2])).toBe(true);
    expect(isFieldEqual([1, 1, 2], [2, 1, 1])).toBe(true);
  });

  it("should deep compare plain objects", () => {
    expect(isFieldEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(isFieldEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(isFieldEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isFieldEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(isFieldEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  it("should handle arrays of objects", () => {
    expect(isFieldEqual([{ id: 1 }], [{ id: 1 }])).toBe(true);
    expect(isFieldEqual([{ id: 1 }], [{ id: 2 }])).toBe(false);
  });

  it("should handle boolean values with strict equality", () => {
    expect(isFieldEqual(true, true)).toBe(true);
    expect(isFieldEqual(false, false)).toBe(true);
    expect(isFieldEqual<boolean | number>(false, 0)).toBe(false);
    expect(isFieldEqual<boolean | string>(false, "")).toBe(false);
  });
});

describe("flatResultValidationResult", () => {
  it("should  validate nested objects/arrays", () => {
    const initialValues = {
      test1: [{ field1: "test" }],
      test2: [{ nested: [{ field1: "test" }] }],
      test3: { nested: { field1: "test" } }
    };

    const validate = () => ({
      test1: [{ field1: "error1" }],
      test2: [{ nested: [{ field1: "error2" }] }],
      test3: { nested: { field1: "error3" } }
    });

    const flattenValidate = flatResultValidationResult(validate);

    expect(flattenValidate(initialValues)).toEqual({
      "test1[0].field1": "error1",
      "test2[0].nested[0].field1": "error2",
      "test3.nested.field1": "error3"
    });
  });
});
