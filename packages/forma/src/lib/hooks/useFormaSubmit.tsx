import { Dispatch, useEffect } from "react";

import { reset, setValue } from "../actions";
import { FormaState, ProviderProps } from "../forma-api.types";
import { BaseActions, FormActions } from "../reducers";

export const useFormaSubmit = <
  FormValues extends object = object,
  TError extends Error = Error
>(
  state: FormaState<FormValues, TError>,
  dispatch: Dispatch<FormActions<TError>>,
  onSubmit: ProviderProps<FormValues, TError>["onSubmit"]
) => {
  useEffect(() => {
    if (state.triedToSubmit && state.isSubmitting) {
      if (state.invalid) {
        return dispatch({ type: BaseActions.set_submitting, payload: false });
      }

      onSubmit(state.values, {
        reset: reset<FormValues>(dispatch),
        setValue: setValue(dispatch)
      })
        .then(() => {
          dispatch({ type: BaseActions.set_submit_succeeded, payload: true });
        })
        .catch((e: TError) => {
          dispatch({
            type: BaseActions.set_submit_failed,
            payload: e
          });
        });
    }
  }, [state.triedToSubmit, state.isSubmitting]);
};
