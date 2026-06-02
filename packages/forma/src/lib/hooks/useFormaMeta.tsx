import { Dispatch, useEffect } from "react";

import { setMeta } from "../actions";
import { ProviderProps } from "../forma-api.types";
import { FormActions } from "../reducers";

export const useFormaMeta = <
  FormValues extends object = object,
  TError extends Error = Error
>(
  dispatch: Dispatch<FormActions<TError>>,
  meta: Pick<ProviderProps<FormValues, TError>, "disabled" | "readonly">
) => {
  useEffect(() => {
    setMeta(dispatch, { disabled: meta.disabled, readonly: meta.readonly });
  }, [dispatch, meta.disabled, meta.readonly]);
};
