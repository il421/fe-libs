import { useEffect, useMemo, useRef } from "react";

import { FieldItemBaseState } from "../forma-api.types";
import { isFieldEqual } from "../forma-api.utils";
import { useFieldMetaSubscription } from "../hooks";

interface FieldSpyWithChildrenProps<Value> {
  name: string;
  equal?: never;
  children: (value?: Value, meta?: FieldItemBaseState) => React.ReactNode;
  subscriptions?: Partial<Record<keyof FieldItemBaseState, boolean>>;
  onChange?: never;
}

interface FieldSpyWithOnChangeProps<Value> {
  name: string;
  children?: never;
  equal?: (newValue?: Value, oldValue?: Value) => boolean;
  onChange: (value?: Value, meta?: FieldItemBaseState) => void;
  subscriptions?: never;
}

type FieldSpyProps<Value> =
  | FieldSpyWithChildrenProps<Value>
  | FieldSpyWithOnChangeProps<Value>;

/**
 * The FieldSpy component is a React utility designed to observe and react to changes in the state of a specific form field.
 * It allows subscribing to field metadata and its value, enabling real-time updates in the UI based on user input or validation results.
 * The component accepts two prop variations: one that utilizes a render prop (children) for dynamic rendering based on the field's state,
 * and another that executes a callback (onChange) whenever the field's value changes. An optional equal function can be provided to determine
 * how value changes are compared, avoiding unnecessary updates. This component is particularly useful for implementing custom behaviors or
 * UI elements that depend on the state of a specific field within a form.
 * @param props
 * @constructor
 */
export const FieldSpy = <Value = unknown,>(props: FieldSpyProps<Value>) => {
  const isMounted = useRef<boolean>(false);

  const { value, meta, subscriptions } = useFieldMetaSubscription<Value>({
    name: props.name,
    subscriptions: props.subscriptions
  });

  const prevValue = useRef(value);

  useEffect(() => {
    if (props.onChange && isMounted) {
      const hasChanged = props.equal
        ? !props.equal(value as Value, prevValue.current as Value)
        : !isFieldEqual(prevValue.current, value);
      if (hasChanged) {
        props.onChange(value, meta);
        prevValue.current = value;
      }
    }
    isMounted.current = true;
  }, [value]);

  const children = useMemo(
    () => (props.children ? props.children(value, meta) : null),
    subscriptions
  );

  if (!props.children) return null;

  return <>{children}</>;
};
