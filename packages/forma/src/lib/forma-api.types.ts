import { Dispatch, ReactNode } from "react";

import {
  RegisterFieldAction,
  ResetValuesAction,
  SetActiveAction,
  SetArrayAction,
  SetErrorAction,
  SetInactiveAction,
  SetSubmittedAction,
  SetSubmittingAction,
  SetValueAction,
  SetValuesAction
} from "./reducers";

export interface ProviderProps<
  FormValues extends object = object,
  TError extends Error = Error
> extends FormaMeta {
  children: (
    state: FormaState<FormValues, TError>,
    actions: UseFormaMethods<FormValues>
  ) => ReactNode;
  onSubmit: (
    values: FormValues,
    actions: Pick<UseFormaMethods<FormValues>, "reset" | "setValue">
  ) => Promise<void>;
  initialValues?: FormValues;
  notify?: (args: NotifyArgs<FormValues>) => void;
  validate?: (values: FormValues) => object;
  isEqual?: <Value = unknown>(prevValue: Value, value: Value) => boolean;
}

export interface FormaMeta {
  disabled?: boolean;
  readonly?: boolean;
}

export type ContextState<State, Actions> = {
  state: State;
  actions: Actions;
};

export type FormaContext<
  FormValues extends object = object,
  TError = Error
> = ContextState<FormaState<FormValues, TError>, UseFormaMethods<FormValues>>;

export type FieldItemBaseState = {
  error: string | undefined;
  active: boolean;
  dirty: boolean;
  touched: boolean;
  modified: boolean;
  registered: boolean;
};

export type FormaState<FormValues, TError = Error> = FormaMeta & {
  values: FormValues;
  initialValues: FormValues;
  fields: Record<string, FieldItemBaseState>;
  dirty: boolean;
  invalid: boolean;
  isSubmitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
  triedToSubmit: boolean;
  submitError: TError | undefined;
};

export type FormaArrayMethods = {
  push: <Value>(name: string, item: Value) => void;
  unshift: <Value>(name: string, item: Value) => void;
  remove: (name: string, index: number) => void;
  update: <Value>(name: string, index: number, item: Value) => void;
  insert: <Value>(name: string, index: number, item: Value) => void;
  replace: <Value>(name: string, items: Value[]) => void;
};

export type FormaMethods<FormValues extends object = object> = {
  setValue: (name: string, value: unknown) => void;
  setValues: (values: FormValues) => void;
  setError: (name: string, error: string | undefined) => void;
  reset: (values?: FormValues) => void;
  focus: (name: string) => void;
  blur: (name: string) => void;
  registerField: (name: string) => void;
  unRegisterField: (name: string) => void;
  submit: () => void;
  notify?: (args: NotifyArgs<FormValues>) => void;
  arrayMutators: FormaArrayMethods;
};

export type UseFormaMethods<FormValues extends object = object> = Pick<
  FormaMethods<FormValues>,
  | "setValue"
  | "setError"
  | "setValues"
  | "reset"
  | "submit"
  | "registerField"
  | "unRegisterField"
  | "arrayMutators"
  | "notify"
  | "focus"
  | "blur"
>;

export type FormaMethodsToPass<FormValues extends object = object> = {
  setValue: (
    dispatch: Dispatch<SetValueAction>
  ) => FormaMethods<FormValues>["setValue"];
  setValues: (
    dispatch: Dispatch<SetValuesAction<FormValues>>
  ) => FormaMethods<FormValues>["setValues"];
  reset: (
    dispatch: Dispatch<ResetValuesAction<FormValues>>
  ) => FormaMethods<FormValues>["reset"];
  focus: (
    dispatch: Dispatch<SetActiveAction>
  ) => FormaMethods<FormValues>["focus"];
  blur: (
    dispatch: Dispatch<SetInactiveAction>
  ) => FormaMethods<FormValues>["blur"];
  registerField: (
    dispatch: Dispatch<RegisterFieldAction>
  ) => FormaMethods<FormValues>["registerField"];
  unRegisterField: (
    dispatch: Dispatch<RegisterFieldAction>
  ) => FormaMethods<FormValues>["unRegisterField"];
  submit: (
    dispatch: Dispatch<SetSubmittedAction | SetSubmittingAction>
  ) => FormaMethods<FormValues>["submit"];
  setError?: (
    dispatch: Dispatch<SetErrorAction>
  ) => FormaMethods<FormValues>["setError"];
  arrayMutators: (
    dispatch: Dispatch<SetArrayAction>
  ) => FormaMethods<FormValues>["arrayMutators"];
};

export const defaultState = {
  fields: {},
  values: {},
  initialValues: {},
  dirty: false,
  invalid: false,
  isSubmitting: false,
  submitFailed: false,
  submitSucceeded: false,
  submitError: undefined,
  triedToSubmit: false
};

export const defaultFieldState: FieldItemBaseState = {
  error: undefined,
  active: false,
  dirty: false,
  touched: false,
  modified: false,
  registered: true
};

export interface UseFieldContextReturn<Value, FormValues> {
  setFieldValue: (value: Value) => void;
  resetFieldValue: () => void;
  focusField: () => void;
  blurField: () => void;
  value: Value | undefined;
  values: FormValues;
  meta?: FieldItemBaseState;
  disabledForm?: boolean;
  readonlyForm?: boolean;
}

export interface NotifyArgs<FormValues extends object = object> {
  field: keyof FormValues;
  value: FormValues[keyof FormValues];
  getState: () => FormaState<FormValues>;
  actions: Pick<FormaMethods<FormValues>, "setValue" | "reset">;
}

export type Validate<FormValues> = (
  values: FormValues
) => Record<string, string | undefined>;
