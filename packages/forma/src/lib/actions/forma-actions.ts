import { Dispatch } from "react";

import { FormaMeta } from "../forma-api.types";
import {
  BaseActions,
  RegisterFieldAction,
  ResetValuesAction,
  SetActiveAction,
  SetErrorAction,
  SetInactiveAction,
  SetMetaAction,
  SetSubmittedAction,
  SetSubmittingAction,
  SetValueAction,
  SetValuesAction
} from "../reducers";

export const setValue =
  (dispatch: Dispatch<SetValueAction>) =>
  async (name: string, value: unknown) => {
    dispatch({
      type: BaseActions.set_value,
      payload: { name, value }
    });
  };

export const setValues =
  <FormValues extends object>(dispatch: Dispatch<SetValuesAction>) =>
  (values: FormValues) => {
    dispatch({
      type: BaseActions.set_values,
      payload: values
    });
  };

export const reset =
  <FormValues>(dispatch: Dispatch<ResetValuesAction<FormValues>>) =>
  (values?: FormValues) => {
    dispatch({ type: BaseActions.reset_values, payload: values });
  };
export const focus =
  (dispatch: Dispatch<SetActiveAction>) => (name: string) => {
    dispatch({ type: BaseActions.set_active, payload: { name, active: true } });
  };

export const blur =
  (dispatch: Dispatch<SetInactiveAction>) => (name: string) => {
    dispatch({
      type: BaseActions.set_active,
      payload: { name, active: false }
    });
  };

export const setMeta = (
  dispatch: Dispatch<SetMetaAction>,
  payload: FormaMeta
) => {
  dispatch({
    type: BaseActions.set_meta,
    payload
  });
};

export const registerField =
  (dispatch: Dispatch<RegisterFieldAction>) => (name: string) => {
    dispatch({
      type: BaseActions.register_field,
      payload: { name }
    });
  };

export const unRegisterField =
  (dispatch: Dispatch<RegisterFieldAction>) => (name: string) => {
    dispatch({
      type: BaseActions.register_field,
      payload: { name, shouldUnregister: true }
    });
  };

export const submit =
  (dispatch: Dispatch<SetSubmittedAction | SetSubmittingAction>) =>
  async () => {
    // mark form as has been tried to submit (not submitted succeeded or failed)
    dispatch({ type: BaseActions.set_tried_to_submit, payload: true });
    dispatch({ type: BaseActions.set_submitting, payload: true });
  };

export const setError =
  (dispatch: Dispatch<SetErrorAction>) =>
  async (name: string, error: string | undefined) => {
    dispatch({
      type: BaseActions.set_error,
      payload: { name, error }
    });
  };
