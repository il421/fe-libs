import { getFieldErrorMessage } from "../forma-api.utils";
import { useFormaSubscription } from "../hooks";
import { FieldSpy } from "./FieldSpy";
import * as React from "react";

interface FieldErrorProps {
  validateOnInitialize: boolean;
  name: string;
  children: (error: string | undefined) => React.ReactNode;
  hideError?: boolean;
}

/**
 * @component FieldError
 * @description
 * A render-prop React component that observes a specific form field and provides its
 * validation error (if any) to its child function. It integrates with the form state
 * to control when errors are displayed — for example, only after submission or during
 * initialization.
 *
 * @template Value
 *
 * @param {Object} props - Component properties.
 * @param {string} props.name - The name of the form field to observe.
 * @param {boolean} props.validateOnInitialize - Whether to validate the field on form initialization.
 * @param {(error: string | undefined) => React.ReactNode} props.children - A render function that
 * receives the current error (if any) and returns JSX to display it.
 * @param {boolean} [props.hideError] - If true, skips rendering and subscriptions entirely.
 *
 * @returns {React.ReactElement | null} The rendered error element or null if `hideError` is true.
 *
 * @example
 * <FieldError name="email" validateOnInitialize>
 *   {error => error && <span className="text-red-500">{error}</span>}
 * </FieldError>
 */

export const FieldError = <Value = unknown,>(
  props: FieldErrorProps
): React.ReactElement | null => {
  const { name, children, validateOnInitialize, hideError } = props;
  const {
    state: { triedToSubmit }
  } = useFormaSubscription({ subscriptions: { triedToSubmit: true } });

  if (hideError) return null;
  return (
    <FieldSpy<Value> name={name}>
      {(_value, meta) => {
        const error = meta
          ? getFieldErrorMessage(meta, {
              triedToSubmit,
              validateOnInitialize
            })
          : undefined;
        return children(error);
      }}
    </FieldSpy>
  );
};
