import { UseFieldContextReturn } from "../forma-api.types";
import { useFieldContext, useFieldRegister } from "../hooks";
import * as React from "react";

interface FieldControllerProps<Value> {
  name: string;
  children: (
    context: UseFieldContextReturn<Value, object>
  ) => React.JSX.Element;
}

/**
 * A component that provides field context for form handling and allows
 * rendering of child components with access to that context.
 *
 * @template Value - The type of the field value.
 *
 * @param {FieldControllerProps<Value>} props - The properties passed to the FieldController.
 * @param {string} props.name - The name of the field, used for registration and context retrieval.
 * @param {(context: UseFieldContextReturn<Value, object>) => React.JSX.Element} props.children - A function
 * that receives the field context as an argument and returns a JSX element.
 * @param {(newValue: Value, oldValue: Value) => boolean} [props.equal] - An optional function to determine
 * if the new field value is equal to the old value.
 *
 * @returns {React.JSX.Element} The rendered children with field context.
 *
 * @example
 * <FieldController name="username">
 *   {({ value, setValue }) => (
 *     <input value={value} onChange={setValue} />
 *   )}
 * </FieldController>
 */
export const FieldController = <Value = unknown,>(
  props: FieldControllerProps<Value>
): React.JSX.Element => {
  useFieldRegister(props.name);
  const context = useFieldContext<Value>(props.name);

  return props.children(context);
};
