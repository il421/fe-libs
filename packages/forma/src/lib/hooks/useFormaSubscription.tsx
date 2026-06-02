import { useMemo } from "react";

import { useFormaContext } from "./useFormaContext";

// Type definition for the different subscriptions that can be monitored
export type FormSpySubscriptions = {
  invalid?: boolean; // Indicates if the form is invalid
  submitError?: boolean; // Indicates if there was a submission error
  dirty?: boolean; // Indicates if the form has unsaved changes
  values?: boolean; // Indicates if the form values should be monitored
  isSubmitting?: boolean; // Indicates if the form is currently submitting
  submitFailed?: boolean; // Indicates if the last submission attempt failed
  submitSucceeded?: boolean; // Indicates if the last submission attempt was successful
  triedToSubmit?: boolean; // Indicates if a submit has been attempted
};

// Default subscriptions if none are provided
const defaultSubscriptions: FormSpySubscriptions = {
  invalid: true,
  submitError: true,
  dirty: true,
  values: true,
  isSubmitting: true,
  submitFailed: true,
  submitSucceeded: true,
  triedToSubmit: true
};

/**
 * Custom hook to subscribe to the form's state changes based on specified subscriptions.
 * Allows components to read the current state and actions from the form context.
 *
 * @param props - Contains optional subscriptions to determine which form state to monitor.
 * @returns An object containing the current subscriptions, state, and action handlers.
 */
export const useFormaSubscription = <Values extends object = object>(props: {
  subscriptions?: FormSpySubscriptions; // Optional subscriptions passed by the user
}) => {
  // Get the current state and actions from the form context
  const { state, actions } = useFormaContext<Values>();

  // Determine which subscriptions are required, defaulting if none are provided
  const requiredSubscriptions =
    !props.subscriptions ||
    (!props.subscriptions && !Object.keys(props.subscriptions).length)
      ? defaultSubscriptions
      : props.subscriptions;

  // Use memoization to avoid unnecessary recalculations of subscriptions
  const subscriptions = useMemo(() => {
    // Initialize base values for all possible subscriptions
    const baseValues = {
      values: undefined,
      invalid: false,
      submitError: false,
      dirty: false,
      isSubmitting: false,
      submitFailed: false,
      triedToSubmit: false
    };

    // Build the subscription state based on current form state and required subscriptions
    return Object.keys(state).reduce((acc: object, key: string) => {
      if (
        requiredSubscriptions &&
        !!requiredSubscriptions[key as keyof FormSpySubscriptions]
      ) {
        if (key === "values") {
          // If monitoring values, stringify the object to allow for easier comparison
          return { ...acc, [key]: JSON.stringify(state.values) };
        }
        // For other keys, store the boolean state value
        return { ...acc, [key]: !!state[key as keyof FormSpySubscriptions] };
      }
      return acc; // Return the accumulated values if the key is not required
    }, baseValues);
  }, [state, requiredSubscriptions]); // Dependencies for recalculation

  // Return the computed subscriptions and the current state and actions
  return { subscriptions: Object.values(subscriptions), state, actions };
};
