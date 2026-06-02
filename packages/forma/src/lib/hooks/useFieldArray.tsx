import { useMemo } from "react";

import { useFieldContext } from "./useFieldContext";
import { useFieldRegister } from "./useFieldRegister";
import { useFormaContext } from "./useFormaContext";

export interface UseFieldArrayReturn<Value> {
  names: string[];
  value: Value[];
  actions: {
    push: (item: Value) => void;
    unshift: (item: Value) => void;
    remove: (index: number) => void;
    update: (index: number, item: Value) => void;
    insert: (index: number, item: Value) => void;
    replace: (items: Value[]) => void;
  };
}

/**
 * Custom hook to manage an array of fields in a form.
 *
 * @template Value - The type of the items in the array.
 * @param {string} name - The name of the field array in the form.
 * @returns {UseFieldArrayReturn<Value>} An object containing:
 *   - `names`: An array of strings representing the names of individual fields within the array (e.g., "name[0]", "name[1]", etc.).
 *   - `value`: The current value of the field array, which is an array of the specified type `Value`.
 *   - `actions`: An object containing methods to manipulate the field array:
 *     - `push(value: Value)`: Adds a new item to the end of the array.
 *     - `unshift(value: Value)`: Adds a new item to the beginning of the array.
 *     - `remove(index: number)`: Removes an item at the specified index from the array.
 *     - `update(index: number, value: Value)`: Updates the item at the specified index with the new value.
 *     - `insert(index: number, value: Value)`: Inserts a new item at the specified index in the array.
 *     - `replace(values: Value[])`: Replaces the array items.
 *
 * This hook registers the field with the form context and manages updates to the field array's value.
 * It utilizes the `useFieldContext` to retrieve the current value of the field array and the `useFormContext`
 * to access actions available for array manipulation, ensuring that the form state remains in sync with
 * changes made to the array.
 */
export const useFieldArray = <Value = unknown,>(
  name: string
): UseFieldArrayReturn<Value> => {
  useFieldRegister(name);

  const { actions } = useFormaContext();
  const { value } = useFieldContext<Value[]>(name);

  const names = useMemo(() => {
    if (value && Array.isArray(value)) {
      return value.map((_, index) => `${name}[${index}]`);
    }
    return [];
  }, [value]);

  return {
    names,
    actions: {
      push: (value: Value) => actions.arrayMutators.push(name, value),
      unshift: (value: Value) => actions.arrayMutators.unshift(name, value),
      remove: (index: number) => actions.arrayMutators.remove(name, index),
      update: (index: number, value: Value) =>
        actions.arrayMutators.update(name, index, value),
      insert: (index: number, value: Value) =>
        actions.arrayMutators.insert(name, index, value),
      replace: (values: Value[]) => actions.arrayMutators.replace(name, values)
    },
    value: value ?? []
  };
};
