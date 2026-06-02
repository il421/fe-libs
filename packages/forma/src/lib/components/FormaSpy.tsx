import { useEffect, useMemo, useRef } from "react";

import { FormaState, UseFormaMethods } from "../forma-api.types";
import { FormSpySubscriptions, useFormaSubscription } from "../hooks";

interface FormaSpyProps<FormValues extends object = object> {
  children?: (
    state: FormaState<FormValues>,
    action: UseFormaMethods<FormValues>
  ) => React.ReactNode;
  subscriptions?: FormSpySubscriptions;
  onChange?: (
    state: FormaState<FormValues>,
    action: UseFormaMethods<FormValues>
  ) => void;
}

/**
 * The FormaSpy component is a React utility designed to monitor and respond to changes in the state of a form.
 * It allows subscribing to specific aspects of the form's state, such as validation status, error handling, dirty state,
 * and submission status. Using the children prop, it renders a function that provides the current form state and methods
 * for manipulation, enabling dynamic and reactive form handling.
 * The onChange prop allows for custom handling when subscribed state changes occur, ensuring that developers can
 * easily manage form interactions while reducing boilerplate code.
 * This component is particularly useful for creating complex forms that require real-time feedback and state management.
 * @param props
 * @constructor
 */

export const FormaSpy = <FormValues extends object = object>(
  props: FormaSpyProps<FormValues>
) => {
  const isMounted = useRef<boolean>(false);

  const { state, actions, subscriptions } = useFormaSubscription<FormValues>({
    subscriptions: props.subscriptions
  });

  const prevSubscriptions = useRef(subscriptions);

  useEffect(() => {
    const isDifferent =
      JSON.stringify(subscriptions) !==
      JSON.stringify(prevSubscriptions.current);
    if (props.onChange && isMounted && isDifferent) {
      props.onChange(state, actions);
      prevSubscriptions.current = subscriptions;
    }
    isMounted.current = true;
  }, [subscriptions]);

  const children = useMemo(
    () => (props.children ? props.children(state, actions) : null),
    subscriptions
  );

  return <>{children}</>;
};
