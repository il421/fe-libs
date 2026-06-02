import { useFieldArray, UseFieldArrayReturn } from "../hooks/useFieldArray";
import * as React from "react";

export interface FieldArrayProps<Value> {
  name: string;
  children: (
    names: string[],
    action: UseFieldArrayReturn<Value>["actions"],
    value: Value[]
  ) => React.JSX.Element;
}

/**
 * FieldArray component to manage a dynamic array of fields in a form context.
 *
 * @template Value - The type of the items in the field array.
 *
 * @param {FieldArrayProps<Value>} props - The props for the FieldArray component.
 * @param {string} props.name - The name of the field array which is used to register and manage the array state within the form context.
 * @param {function} props.children - A render prop function that receives:
 *   - `names`: An array of strings representing the names of the individual fields within the array.
 *   - `actions`: An object containing methods to manipulate the field array (e.g., push, remove, update).
 *   - `value`: The current value of the field array, which is an array of items of type `Value`.
 *
 * @returns {React.ReactNode} The rendered output of the children function, allowing customization of how the field array is displayed and interacted with.
 *
 * The FieldArray component uses the `useFieldArray` hook to facilitate easy interaction
 * with a dynamic list of fields whose state is synchronized with the form context.
 * This makes it suitable for scenarios like managing lists of items in a form,
 * where users can dynamically add or remove fields.
 */
export const FieldArray = <Value = unknown,>(
  props: FieldArrayProps<Value>
): React.JSX.Element => {
  const { name, children } = props;
  const { names, actions, value } = useFieldArray(name);

  return children(names, actions, value as Value[]);
};
