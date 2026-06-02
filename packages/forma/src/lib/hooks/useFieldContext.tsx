import { UseFieldContextReturn } from "../forma-api.types";
import { useFormaContext } from "./useFormaContext";
import get from "lodash.get";

export const useFieldContext = <
  Value = unknown,
  FormValues extends object = object
>(
  name: string
): UseFieldContextReturn<Value, FormValues> => {
  const {
    actions: { setValue, focus, blur },
    state: { fields, values, disabled, readonly, initialValues }
  } = useFormaContext<FormValues>();

  const setFieldValue = (value: Value) =>
    setValue(name, value as FormValues[keyof FormValues]);

  const resetFieldValue = () => setValue(name, get(initialValues, name));

  const focusField = () => focus(name);
  const blurField = () => blur(name);

  const meta = fields[name];
  const value = get(values, name) as Value;

  return {
    setFieldValue,
    resetFieldValue,
    focusField,
    blurField,
    meta,
    value,
    values,
    readonlyForm: readonly,
    disabledForm: disabled
  };
};
