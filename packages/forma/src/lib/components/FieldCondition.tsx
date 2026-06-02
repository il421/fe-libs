import { FieldSpy } from "./FieldSpy";
import * as React from "react";

type PredicateCondition<Value = unknown> = (value: Value) => boolean;

/**
 * @component FieldCondition
 * @description
 * A conditional rendering component for form fields. It observes the value of a specific
 * field and renders its children only when a specified condition is met.
 *
 * This is useful for showing or hiding parts of a form dynamically based on other field values.
 *
 * @template Value
 *
 * @param {Object} props - Component properties.
 * @param {string} props.when - The name of the form field whose value will be observed.
 * @param {Value | ((value: Value) => boolean)} props.is - The condition to match:
 * either a specific value or a predicate function returning `true` or `false`.
 * @param {React.ReactNode | React.ReactNode[] | ((val: Value | undefined) => React.ReactNode)} props.children -
 * The content to render when the condition is satisfied. Can be static JSX or a render function
 * receiving the current field value.
 *
 * @returns {React.ReactElement | null} The rendered content if the condition is met, or `null` otherwise.
 *
 * @example
 * // Example 1: Show a field when another field equals a specific value
 * <FieldCondition when="country" is="nz">
 *   <Field name="state" component="input" placeholder="State" />
 * </FieldCondition>
 *
 * @example
 * // Example 2: Use a predicate function for more complex logic
 * <FieldCondition when="age" is={(val) => val && val >= 18}>
 *   <Field name="driversLicense" component="input" placeholder="Driver's License Number" />
 * </FieldCondition>
 */

export interface FieldConditionProp<Value> {
  when: string;
  is: Value | PredicateCondition<Value>;
  children:
    | React.ReactNode
    | React.ReactNode[]
    | ((val: Value | undefined) => React.ReactNode);
}

export const FieldCondition = <Value = unknown,>(
  props: FieldConditionProp<Value>
) => {
  const { is, children, when } = props;

  const condition: PredicateCondition<Value | undefined> =
    typeof is === "function"
      ? (is as PredicateCondition<Value | undefined>)
      : (value: Value | undefined) => value === is;

  const getChildren = (val: Value | undefined) => {
    if (typeof children === "function") {
      return children(val);
    } else {
      return children;
    }
  };

  return (
    <FieldSpy<Value> name={when}>
      {value => (condition(value) ? getChildren(value) : null)}
    </FieldSpy>
  );
};
