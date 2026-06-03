import { cloneDeep, flattenObject, isDeepEqual, setByPath } from "./native-utils";

import { FieldItemBaseState, FormaState } from "./forma-api.types";
import { SetValuePayload } from "./reducers";

export const getFieldErrorMessage = (
  meta: FieldItemBaseState,
  options?: { triedToSubmit?: boolean; validateOnInitialize?: boolean }
) => {
  return options?.validateOnInitialize ||
    options?.triedToSubmit ||
    (meta?.modified && !meta?.active)
    ? meta?.error
    : undefined;
};

export const isInvalid = <FormValues>(
  fields: FormaState<FormValues>["fields"]
) => Object.values(fields).some(i => !!i.error);

export const isDirty = <FormValues>(fields: FormaState<FormValues>["fields"]) =>
  Object.values(fields).some(i => i.dirty && i.registered);

export const updateField = <FormValues, Value>(
  state: FormaState<FormValues>,
  payload: {
    name: string;
    value: Value;
    dirty: boolean;
  }
) => {
  return {
    ...state.fields[payload.name],
    dirty: payload.dirty,
    modified: true
  };
};

export const isFieldEqual = <
  T = string | number | undefined | null | string[] | number[] | Date | object
>(
  prevValue: T,
  value: T
): boolean => {
  // Handle NaN comparison
  if (
    typeof prevValue === "number" &&
    typeof value === "number" &&
    isNaN(prevValue) &&
    isNaN(value)
  ) {
    return true;
  }

  // Handle null/undefined explicitly
  if (prevValue == null || value == null) {
    return prevValue === value;
  }

  if (Array.isArray(prevValue) && Array.isArray(value)) {
    if (prevValue.length !== value.length) return false;

    // Order-insensitive comparison with duplicate frequency check
    const used = new Set<number>();
    return prevValue.every(v => {
      const idx = value.findIndex(
        (item, i) => !used.has(i) && isFieldEqual(v, item)
      );
      if (idx === -1) return false;
      used.add(idx);
      return true;
    });
  }

  if (prevValue instanceof Date && value instanceof Date) {
    const normalizedDateValue = new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    );

    const normalizedDatePrevValue = new Date(
      prevValue.getFullYear(),
      prevValue.getMonth(),
      prevValue.getDate()
    );

    return normalizedDateValue.getTime() === normalizedDatePrevValue.getTime();
  }

  // Deep comparison for plain objects
  if (typeof prevValue === "object" && typeof value === "object") {
    return isDeepEqual(prevValue, value);
  }

  return prevValue === value;
};

export const getSetValueState = <
  FormValues extends object,
  TError extends Error
>(
  state: FormaState<FormValues, TError>,
  payload: SetValuePayload<FormValues[keyof FormValues]>
): FormaState<FormValues, TError> => {
  const values = setByPath(cloneDeep(state.values), payload.name, payload.value);

  const fields = cloneDeep(state.fields);

  fields[payload.name] = updateField(state, payload);

  return {
    ...state,
    values,
    fields,
    dirty: isDirty(fields),
    invalid: isInvalid(fields)
  };
};

export const flatResultValidationResult =
  <FormValues>(validate: (values: FormValues) => object) =>
  (formValues: FormValues) => {
    //flatten nested objects/arrays to path keys
    const flatErrors = flattenObject(validate(formValues)) as Record<string, string>;

    //replace .0. array indexes with [0].
    const flatResultWithKeysMapped: Record<string, string> = {};
    for (const key in flatErrors) {
      const newKey = key.replace(/\.(\d+)\./g, "[$1]."); // Replace "old" with "new" in the key
      flatResultWithKeysMapped[newKey] = flatErrors[key];
    }
    return flatResultWithKeysMapped;
  };
