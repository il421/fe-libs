import { useEffect } from "react";

import { ProviderProps, Validate } from "../forma-api.types";
import { flatResultValidationResult } from "../forma-api.utils";
import { useFormaSubscription } from "./useFormaSubscription";

export const useFormaInternalValidator = <
  FormValues extends object = object,
  TError extends Error = Error
>(
  validate: ProviderProps<FormValues, TError>["validate"]
) => {
  const { state, actions } = useFormaSubscription<FormValues>({
    subscriptions: { values: true }
  });

  useEffect(() => {
    const validateFlatten: Validate<FormValues> | undefined = validate
      ? flatResultValidationResult(validate)
      : undefined;

    if (validateFlatten) {
      const errors = validateFlatten(state.values);

      for (const key in state.fields) {
        actions.setError(key, errors[key]);
      }
    }
    // ⚠️ Dependencies:
    // 1. state.values - run validation on values updates;
    // 2. Object.keys(state.fields) - run validation on fields register or adding new fields;
    // 3. validate - run validation on callback changes.
  }, [state.values, Object.keys(state.fields).length, validate]);
};
