import { Dispatch, useEffect } from "react";

import { FormaState, ProviderProps, Validate } from "../forma-api.types";
import { flatResultValidationResult } from "../forma-api.utils";
import { BaseActions, FormActions } from "../reducers";

//⚠️ Should be removed if useFormInternalValidator works as expected.
export const useFormaValidate = <
  FormValues extends object = object,
  TError extends Error = Error
>(
  state: FormaState<FormValues, TError>,
  dispatch: Dispatch<FormActions<TError>>,
  validate: ProviderProps<FormValues, TError>["validate"]
) => {
  useEffect(() => {
    const validateFlatten: Validate<FormValues> | undefined = validate
      ? flatResultValidationResult(validate)
      : undefined;

    if (validateFlatten) {
      const errors = validateFlatten(state.values);

      for (const key in state.fields) {
        dispatch({
          type: BaseActions.set_error,
          payload: { name: key, error: errors[key] }
        });
      }
    }
    // ⚠️ Dependencies:
    // 1. state.values - run validation on values updates;
    // 2. Object.keys(state.fields) - run validation on fields register or adding new fields;
    // 3. validate - run validation on callback changes.
    // 4. dispatch - run validation on dispatch changes.
  }, [state.values, Object.keys(state.fields).length, validate, dispatch]);
};
