import {
  cloneDeep,
  flattenObject,
  getByPath,
  isDeepEqual,
  setByPath
} from "../native-utils";

describe("getByPath", () => {
  it("should return undefined for null object", () => {
    expect(getByPath(null, "a")).toBeUndefined();
  });

  it("should return undefined for undefined object", () => {
    expect(getByPath(undefined, "a")).toBeUndefined();
  });

  it("should return undefined for non-existent path", () => {
    expect(getByPath({ a: 1 }, "b")).toBeUndefined();
  });

  it("should return undefined for non-existent nested path", () => {
    expect(getByPath({ a: { b: 1 } }, "a.c")).toBeUndefined();
  });

  it("should return value for a simple key", () => {
    expect(getByPath({ a: 1 }, "a")).toBe(1);
  });

  it("should return value using dot-notation nested path", () => {
    expect(getByPath({ a: { b: 2 } }, "a.b")).toBe(2);
  });

  it("should return value using bracket-notation array index", () => {
    expect(getByPath({ a: [10, 20] }, "a[1]")).toBe(20);
  });

  it("should return value using mixed dot and bracket notation", () => {
    expect(getByPath({ a: [{ b: 3 }] }, "a[0].b")).toBe(3);
  });

  it("should return value for deeply nested path", () => {
    expect(getByPath({ a: { b: { c: 4 } } }, "a.b.c")).toBe(4);
  });
});

describe("setByPath", () => {
  it("should create intermediate object for non-existent nested key", () => {
    const obj = {};
    setByPath(obj, "a.b", 1);
    expect(obj).toEqual({ a: { b: 1 } });
  });

  it("should replace null intermediate with object", () => {
    const obj = { a: null } as Record<string, unknown>;
    setByPath(obj, "a.b", 1);
    expect(obj).toEqual({ a: { b: 1 } });
  });

  it("should overwrite a simple key", () => {
    const obj = { a: 1 };
    setByPath(obj, "a", 2);
    expect(obj).toEqual({ a: 2 });
  });

  it("should create a nested path using dot notation", () => {
    const obj = {} as Record<string, unknown>;
    setByPath(obj, "a.b.c", 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });

  it("should set a value using bracket-notation array index", () => {
    const obj = { a: [1, 2, 3] };
    setByPath(obj, "a[1]", 99);
    expect(obj.a[1]).toBe(99);
  });

  it("should mutate in place and return the same reference", () => {
    const obj = { a: 1 };
    const result = setByPath(obj, "a", 2);
    expect(result).toBe(obj);
  });

  it("should set a value using mixed dot and bracket notation", () => {
    const obj = { items: [{ name: "foo" }] };
    setByPath(obj, "items[0].name", "bar");
    expect(obj.items[0].name).toBe("bar");
  });
});

describe("cloneDeep", () => {
  it("should return null for null input", () => {
    expect(cloneDeep(null)).toBeNull();
  });

  it("should return primitive values unchanged", () => {
    expect(cloneDeep(42)).toBe(42);
    expect(cloneDeep("hello")).toBe("hello");
    expect(cloneDeep(true)).toBe(true);
  });

  it("should produce an independent copy of a shallow object", () => {
    const original = { a: 1 };
    const copy = cloneDeep(original);
    copy.a = 99;
    expect(original.a).toBe(1);
  });

  it("should deep copy nested objects", () => {
    const original = { a: { b: { c: 1 } } };
    const copy = cloneDeep(original);
    copy.a.b.c = 99;
    expect(original.a.b.c).toBe(1);
  });

  it("should deep copy arrays", () => {
    const original = [1, 2, [3, 4]];
    const copy = cloneDeep(original);
    (copy[2] as number[])[0] = 99;
    expect((original[2] as number[])[0]).toBe(3);
  });
});

describe("isDeepEqual", () => {
  it("should return true for null and null", () => {
    expect(isDeepEqual(null, null)).toBe(true);
  });

  it("should return false for null and an object", () => {
    expect(isDeepEqual(null, {})).toBe(false);
    expect(isDeepEqual({}, null)).toBe(false);
  });

  it("should return true for undefined and undefined", () => {
    expect(isDeepEqual(undefined, undefined)).toBe(true);
  });

  it("should return false for array compared to non-array object", () => {
    expect(isDeepEqual([], {})).toBe(false);
    expect(isDeepEqual({}, [])).toBe(false);
  });

  it("should return false for different types", () => {
    expect(isDeepEqual(1, "1")).toBe(false);
    expect(isDeepEqual(true, 1)).toBe(false);
  });

  it("should return true for same reference", () => {
    const obj = { a: 1 };
    expect(isDeepEqual(obj, obj)).toBe(true);
  });

  it("should return true for equal primitives", () => {
    expect(isDeepEqual(1, 1)).toBe(true);
    expect(isDeepEqual("foo", "foo")).toBe(true);
  });

  it("should return false for different primitives", () => {
    expect(isDeepEqual(1, 2)).toBe(false);
    expect(isDeepEqual("foo", "bar")).toBe(false);
  });

  it("should return true for structurally equal nested objects", () => {
    expect(isDeepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
  });

  it("should return false for structurally unequal nested objects", () => {
    expect(isDeepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  it("should return false for objects with different key counts", () => {
    expect(isDeepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it("should return true for equal arrays", () => {
    expect(isDeepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it("should return false for unequal arrays", () => {
    expect(isDeepEqual([1, 2], [1, 3])).toBe(false);
    expect(isDeepEqual([1, 2], [1, 2, 3])).toBe(false);
  });
});

describe("flattenObject", () => {
  it("should return empty object for empty object input", () => {
    expect(flattenObject({})).toEqual({});
  });

  it("should return empty object for null input", () => {
    expect(flattenObject(null)).toEqual({});
  });

  it("should pass through a flat object unchanged", () => {
    expect(flattenObject({ a: 1, b: "x" })).toEqual({ a: 1, b: "x" });
  });

  it("should flatten nested object to dot-notation keys", () => {
    expect(flattenObject({ a: { b: 1 } })).toEqual({ "a.b": 1 });
  });

  it("should flatten array items to indexed keys", () => {
    expect(flattenObject({ a: [10, 20] })).toEqual({
      "a.0": 10,
      "a.1": 20
    });
  });

  it("should flatten nested array of objects to mixed keys", () => {
    expect(flattenObject({ a: [{ b: 1 }] })).toEqual({ "a.0.b": 1 });
  });

  it("should flatten deeply nested structure", () => {
    expect(flattenObject({ a: { b: { c: 42 } } })).toEqual({ "a.b.c": 42 });
  });

  it("should flatten mixed nested objects and arrays", () => {
    expect(
      flattenObject({
        test1: [{ field1: "error1" }],
        test2: [{ nested: [{ field1: "error2" }] }],
        test3: { nested: { field1: "error3" } }
      })
    ).toEqual({
      "test1.0.field1": "error1",
      "test2.0.nested.0.field1": "error2",
      "test3.nested.field1": "error3"
    });
  });
});