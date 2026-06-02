import { useMemo } from "react";

import { FieldItemBaseState } from "../forma-api.types";
import { useFieldContext } from "./useFieldContext";

export type MetaSubscriptions = Partial<
  Record<keyof FieldItemBaseState, boolean>
>;

/**
 * A custom hook to manage and subscribe to field metadata changes.
 *
 * @param props - The properties for the hook.
 * @param props.name - The name of the field to subscribe to.
 * @param props.subscriptions - An optional object that defines which metadata changes to subscribe to.
 * @param props.equal - An optional comparison function for new and old values.
 *
 * @returns An object containing the subscribed metadata, the field value, and the field meta state.
 */
export const useFieldMetaSubscription = <Value = unknown,>(props: {
  name: string; // The name of the field to subscribe to
  subscriptions?: MetaSubscriptions; // Optional object defining which metadata changes to subscribe to
}) => {
  // Retrieve the current field value and metadata from context
  const { value, meta: _meta } = useFieldContext<Value>(props.name);

  // Use useMemo to calculate the subscriptions based on metadata and props
  const subscriptions = useMemo(() => {
    // If no subscriptions are defined, return an array containing just the current value
    if (!props.subscriptions) return [value];

    // Initialize base values for the metadata subscription
    const baseValues = {
      value,
      active: false,
      error: false,
      dirty: false,
      touched: false,
      modified: false
    };

    const meta = _meta ?? ({} as FieldItemBaseState);
    // Build the subscriptions object based on the keys in meta
    return Object.keys(meta).reduce((acc: object, key: string) => {
      // Check if the current key is included in the subscriptions
      if (
        props.subscriptions &&
        !!props.subscriptions[key as keyof MetaSubscriptions]
      ) {
        // Add the corresponding metadata value (converted to boolean) to the accumulator
        return { ...acc, [key]: !!meta[key as keyof FieldItemBaseState] };
      }
      return acc; // Return the accumulator unchanged if the key is not subscribed
    }, baseValues);
  }, [_meta, props.subscriptions, value]); // Dependencies for recalculation of the memoized value

  // Return an object containing the subscribed values, field value, and metadata
  return { subscriptions: Object.values(subscriptions), value, meta: _meta };
};
