import { FormaMeta } from "../forma-api.types";

export type ReducerAction<A, P> = {
  type: A;
  payload: P;
};

export enum BaseActions {
  set_value = "set_value",
  set_values = "set_values",
  register_field = "register_field",
  set_active = "set_active",
  set_error = "set_error",
  reset_values = "reset_values",
  set_submitting = "set_submitting",
  set_submit_failed = "set_submit_failed",
  set_submit_succeeded = "set_submit_succeeded",
  set_tried_to_submit = "set_tried_to_submit",
  set_array_mutator = "set_array_mutator",
  set_meta = "set_meta"
}

export enum ArraysMutatorsActions {
  remove_item = "array_remove_item",
  push_item = "array_push_item",
  insert_item = "array_insert_item",
  update_item = "array_update_item",
  unshift_item = "array_unshift_item",
  replace_items = "array_replace_items"
}

export type SetValuePayload<Value = unknown> = {
  name: string;
  value: Value;
  dirty: boolean;
};

export type SetValueAction<Value = unknown> = ReducerAction<
  BaseActions.set_value,
  Omit<SetValuePayload<Value>, "dirty">
>;
export type SetValuesAction<Values = object> = ReducerAction<
  BaseActions.set_values,
  Values
>;
export type RegisterFieldAction = ReducerAction<
  BaseActions.register_field,
  { name: string; shouldUnregister?: boolean }
>;

export type SetActiveAction = ReducerAction<
  BaseActions.set_active,
  { name: string; active: true }
>;

export type SetInactiveAction = ReducerAction<
  BaseActions.set_active,
  { name: string; active: false }
>;

export type SetErrorAction = ReducerAction<
  BaseActions.set_error,
  { name: string; error: string | undefined }
>;

export type SetMetaAction = ReducerAction<BaseActions.set_meta, FormaMeta>;

export type ResetValuesAction<Values = object> = ReducerAction<
  BaseActions.reset_values,
  Values | undefined
>;
export type SetSubmittingAction = ReducerAction<
  BaseActions.set_submitting,
  boolean
>;
export type SetSubmitFailedAction<TError = Error> = ReducerAction<
  BaseActions.set_submit_failed,
  TError
>;
export type SetSubmitSucceedAction = ReducerAction<
  BaseActions.set_submit_succeeded,
  boolean
>;
export type SetSubmittedAction = ReducerAction<
  BaseActions.set_tried_to_submit,
  boolean
>;
export type SetArrayAction<Value = unknown> = ReducerAction<
  BaseActions.set_array_mutator,
  { type: ArraysMutatorsActions; name: string; index?: number; value?: Value }
>;
export type FormActions<TError> =
  | SetValueAction
  | SetValuesAction
  | RegisterFieldAction
  | SetActiveAction
  | SetInactiveAction
  | SetErrorAction
  | ResetValuesAction
  | SetSubmittingAction
  | SetSubmitFailedAction<TError>
  | SetSubmitSucceedAction
  | SetSubmittedAction
  | SetArrayAction
  | SetMetaAction;
