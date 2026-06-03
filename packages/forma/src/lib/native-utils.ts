const parsePath = (path: string): string[] =>
  path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);

export const getByPath = (obj: unknown, path: string): unknown =>
  parsePath(path).reduce(
    (acc, key) =>
      acc != null && typeof acc === "object"
        ? (acc as Record<string, unknown>)[key]
        : undefined,
    obj
  );

export const setByPath = <T extends object>(
  obj: T,
  path: string,
  value: unknown
): T => {
  const keys = parsePath(path);
  keys.reduce((acc: Record<string, unknown>, key, index) => {
    if (index === keys.length - 1) {
      acc[key] = value;
    } else if (acc[key] == null || typeof acc[key] !== "object") {
      acc[key] = {};
    }
    return acc[key] as Record<string, unknown>;
  }, obj as Record<string, unknown>);
  return obj;
};

export const cloneDeep = <T>(value: T): T => structuredClone(value);

export const isDeepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(key =>
    isDeepEqual(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key]
    )
  );
};

export const flattenObject = (
  obj: unknown,
  prefix = ""
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  const process = (value: unknown, key: string): void => {
    if (value !== null && typeof value === "object") {
      Object.assign(result, flattenObject(value, key));
    } else {
      result[key] = value;
    }
  };

  if (Array.isArray(obj)) {
    obj.forEach((item, idx) =>
      process(item, prefix ? `${prefix}.${idx}` : String(idx))
    );
  } else if (obj !== null && typeof obj === "object") {
    Object.keys(obj as Record<string, unknown>).forEach(key =>
      process(
        (obj as Record<string, unknown>)[key],
        prefix ? `${prefix}.${key}` : key
      )
    );
  }

  return result;
};