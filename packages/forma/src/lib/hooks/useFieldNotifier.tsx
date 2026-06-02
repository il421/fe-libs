import { useCallback, useEffect, useRef } from "react";

import { isFieldEqual } from "../forma-api.utils";
import { useFormaSubscription } from "./useFormaSubscription";

/**
 * A custom React hook that notifies the form state whenever a specific field's value or invalidity changes.
 * It uses a debounced notification mechanism to optimize performance and avoid excessive re-renders.
 *
 * @template Value - The type of the filed value.
 * @template Values - The type of the form values object.
 * @param {string} name - The name of the field to monitor.
 *
 * @returns {void}
 *
 * @example
 * useFieldNotifier<MyFormValues>("firstName");
 *
 * @description
 * This hook subscribes to the form state and listens for changes in the specified field's value or invalidity.
 * When a change is detected, it triggers a debounced notification to the form's subscription system.
 * The notification includes the field's name, its current value, the form's state, and available actions (e.g., `setValue`, `reset`).
 * The `useDebounce` hook ensures that notifications are not triggered too frequently, improving performance.
 */
export const useFieldNotifier = <
  Value = unknown,
  Values extends object = object
>(
  name: string
): void => {
  const {
    state,
    actions: { notify, setValue, reset }
  } = useFormaSubscription<Values>({
    subscriptions: { values: true, invalid: true }
  });

  const value = state.values[name as keyof Values];

  const isMounted = useRef<boolean>(false);
  const prevValue = useRef<Value>(value as Value);

  const getState = useCallback(() => {
    return state;
  }, [state]);

  const onNotify = useCallback(() => {
    notify?.({
      field: name as keyof Values,
      value,
      getState,
      actions: { setValue, reset }
    });
  }, [name, value, getState, setValue, reset]);

  useEffect(() => {
    if (
      isMounted.current &&
      notify &&
      !isFieldEqual<Value>(prevValue.current, value as Value)
    ) {
      onNotify();
    }
    isMounted.current = true;
    prevValue.current = value as Value;
  }, [value]);
};
