import { createContext, Reducer, useMemo, useReducer } from "react";

import {
  defaultState,
  FormaContext,
  FormaMethods,
  FormaMethodsToPass,
  FormaState,
  ProviderProps,
  UseFormaMethods
} from "./forma-api.types";
import { useFormaMeta } from "./hooks/useFormaMeta";
import { useFormaSubmit } from "./hooks/useFormaSubmit";
import { useFormaValidate } from "./hooks/useFormaValidate";
import { FormActions } from "./reducers";

/**
 * createContext extends React.createContext. It binds reducer, action and default store value
 * and return actions and store objects in context.
 * @param reducer
 * @param methods
 */
export const createFormaContext = (
  reducer: <FormValues extends object = object, TError extends Error = Error>(
    isEqual?: <Value>(prevValue: Value, value: Value) => boolean
  ) => (
    state: FormaState<FormValues, TError>,
    actions: FormActions<TError>
  ) => FormaState<FormValues, TError>,
  methods: FormaMethodsToPass
) => {
  const Context = createContext<FormaContext | undefined>(undefined);

  const Provider = <
    FormValues extends object = object,
    TError extends Error = Error
  >({
    children,
    initialValues,
    notify,
    validate,
    onSubmit,
    isEqual,
    disabled,
    readonly
  }: ProviderProps<FormValues, TError>) => {
    const values: FormValues = initialValues ?? ({} as FormValues);

    const [state, dispatch] = useReducer<
      Reducer<FormaState<FormValues, TError>, FormActions<TError>>
    >(reducer(isEqual), {
      ...defaultState,
      values,
      initialValues: values,
      disabled,
      readonly
    });

    const actions = useMemo<Partial<FormaMethods<FormValues>>>(
      () => ({
        notify,
        setValue: methods.setValue(dispatch),
        setValues: methods.setValues(dispatch),
        reset: methods.reset(dispatch),
        focus: methods.focus(dispatch),
        blur: methods.blur(dispatch),
        registerField: methods.registerField(dispatch),
        unRegisterField: methods.unRegisterField(dispatch),
        submit: methods.submit(dispatch),
        arrayMutators: methods.arrayMutators(dispatch),
        ...(methods.setError ? { setError: methods.setError(dispatch) } : {})
      }),
      [state]
    );

    useFormaSubmit<FormValues, TError>(state, dispatch, onSubmit);
    useFormaValidate<FormValues, TError>(state, dispatch, validate);
    useFormaMeta<FormValues, TError>(dispatch, { disabled, readonly });

    return (
      <Context.Provider
        value={{
          state,
          actions: actions as unknown as UseFormaMethods
        }}
      >
        {typeof children === "function"
          ? children(state, actions as FormaMethods<FormValues>)
          : children}
      </Context.Provider>
    );
  };

  return { Provider, Context };
};
