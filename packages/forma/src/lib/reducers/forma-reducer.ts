import { cloneDeep, getByPath, setByPath } from "../native-utils";

import {
  defaultFieldState,
  defaultState,
  FormaState
} from "../forma-api.types";
import {
  getSetValueState,
  isDirty,
  isFieldEqual,
  isInvalid
} from "../forma-api.utils";
import { BaseActions, FormActions } from "./forma-api-reducers.types";
import { formaArraysReducer } from "./forma-arrays-reducer";

export const formaReducer = <
  FormValues extends object = object,
  TError extends Error = Error
>(
  isEqual?: <Value>(prevValue: Value, value: Value) => boolean
) => {
  return (
    state: FormaState<FormValues, TError>,
    action: FormActions<TError>
  ): FormaState<FormValues, TError> => {
    switch (action.type) {
      case BaseActions.set_meta:
        return {
          ...state,
          ...action.payload
        };

      case BaseActions.reset_values: {
        const valuesToBeReset = action.payload ?? state.initialValues;
        return {
          ...defaultState,
          values: valuesToBeReset,
          initialValues: valuesToBeReset
        } as FormaState<FormValues, TError>;
      }

      case BaseActions.set_submitting:
        return {
          ...state,
          isSubmitting: action.payload
        };

      case BaseActions.set_tried_to_submit:
        return {
          ...state,
          triedToSubmit: action.payload
        };

      case BaseActions.set_submit_failed:
        return {
          ...state,
          isSubmitting: false,
          submitFailed: !!action.payload,
          submitError: action.payload,
          submitSucceeded: false
        };

      case BaseActions.set_submit_succeeded:
        return {
          ...state,
          isSubmitting: false,
          submitFailed: false,
          submitSucceeded: action.payload
        };

      case BaseActions.register_field: {
        const { name, shouldUnregister } = action.payload;
        // register a new field
        if (!shouldUnregister) {
          if (!state.fields[name]) {
            // new field
            return {
              ...state,
              fields: {
                ...state.fields,
                [action.payload.name]: defaultFieldState
              }
            };
          } else {
            // has been registered before
            if (!state.fields[name].registered) {
              const fields = setByPath(cloneDeep(state.fields), action.payload.name, {
                ...state.fields[name],
                registered: true
              });

              return {
                ...state,
                fields,
                dirty: isDirty(fields),
                invalid: isInvalid(fields)
              };
            }
          }
        } else {
          // unregister an existing field
          if (state.fields[name]) {
            const fields = setByPath(cloneDeep(state.fields), action.payload.name, {
              ...state.fields[name],
              registered: false
            });

            return {
              ...state,
              fields,
              dirty: isDirty(fields),
              invalid: isInvalid(fields)
            };
          }
        }
        return state;
      }

      case BaseActions.set_value:
        return getSetValueState<FormValues, TError>(state, {
          name: action.payload.name,
          value: action.payload.value as FormValues[keyof FormValues],
          dirty: isEqual
            ? !isEqual(
                getByPath(state.initialValues, action.payload.name),
                action.payload.value
              )
            : !isFieldEqual(
                getByPath(state.initialValues, action.payload.name),
                action.payload.value
              )
        });

      case BaseActions.set_values: {
        const valuesEntries = Object.entries(action.payload);
        return valuesEntries.reduce((prevState, item) => {
          const [name, value] = item;

          return getSetValueState(prevState, {
            name,
            value,
            dirty: isEqual
              ? !isEqual(getByPath(state.initialValues, name), value)
              : !isFieldEqual(getByPath(state.initialValues, name), value)
          });
        }, cloneDeep(state));
      }

      case BaseActions.set_active: {
        const setActiveName = action.payload.name;
        return {
          ...state,
          fields: {
            ...state.fields,
            [setActiveName]: {
              ...state.fields[setActiveName],
              touched: true,
              active: action.payload.active
            }
          }
        };
      }

      case BaseActions.set_error: {
        const setErrorName = action.payload.name;
        const fieldsError: FormaState<FormValues, TError>["fields"] = {
          ...state.fields,
          [setErrorName]: {
            ...state.fields[setErrorName],
            error: action.payload.error
          }
        };

        return {
          ...state,
          fields: fieldsError,
          invalid: isInvalid(fieldsError)
        };
      }

      case BaseActions.set_array_mutator:
        return formaArraysReducer<FormValues, TError>(state, action, {
          isEqual
        });

      default:
        return state;
    }
  };
};
