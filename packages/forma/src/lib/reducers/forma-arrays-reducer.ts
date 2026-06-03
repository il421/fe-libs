import { FormaState, ProviderProps } from "../forma-api.types";
import { getSetValueState, isFieldEqual } from "../forma-api.utils";
import { getByPath } from "../native-utils";
import {
  ArraysMutatorsActions,
  SetArrayAction
} from "./forma-api-reducers.types";

export const formaArraysReducer = <
  FormValues extends object = object,
  TError extends Error = Error
>(
  state: FormaState<FormValues, TError>,
  action: SetArrayAction,
  callBacks: Pick<ProviderProps<FormValues, TError>, "isEqual">
): FormaState<FormValues, TError> => {
  const { isEqual } = callBacks;
  const prevValues: [] = (getByPath(state.values, action.payload.name) as []) ?? [];
  let tempValue;
  switch (action.payload.type) {
    case ArraysMutatorsActions.push_item:
      tempValue = [...prevValues, action.payload.value];
      break;

    case ArraysMutatorsActions.unshift_item:
      tempValue = [action.payload.value, ...prevValues];
      break;

    case ArraysMutatorsActions.remove_item:
      tempValue = prevValues.filter((_, idx) => idx !== action.payload.index);
      break;

    case ArraysMutatorsActions.update_item:
      tempValue = prevValues.map((i, idx) => {
        if (idx !== action.payload.index) return i;
        return action.payload.value;
      });
      break;

    case ArraysMutatorsActions.insert_item: {
      const { index, value } = action.payload;
      if (
        typeof index === "undefined" ||
        index < 0 ||
        index > prevValues.length
      ) {
        throw new Error("Index out of bounds.");
      }

      tempValue = [
        ...prevValues.slice(0, index),
        value,
        ...prevValues.slice(index)
      ];

      break;
    }
    case ArraysMutatorsActions.replace_items:
      tempValue = action.payload.value;
  }

  const initValue = getByPath(state.initialValues, action.payload.name);
  const dirty = isEqual
    ? !isEqual(initValue, tempValue)
    : !isFieldEqual(initValue, tempValue);

  return getSetValueState<FormValues, TError>(state, {
    name: action.payload.name,
    value: tempValue as FormValues[keyof FormValues],
    dirty
  });
};
