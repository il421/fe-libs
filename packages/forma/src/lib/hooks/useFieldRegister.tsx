import { useEffect } from "react";

import { useFieldNotifier } from "./useFieldNotifier";
import { useFormaContext } from "./useFormaContext";

export const useFieldRegister = <
  Value = unknown,
  Values extends object = object
>(
  name: string
) => {
  const {
    actions: { registerField, unRegisterField },
    state: { fields }
  } = useFormaContext<Values>();

  useEffect(() => {
    if (!fields[name]?.registered) {
      registerField(name);
    }
  }, [fields[name], name]);

  useEffect(() => {
    return () => {
      unRegisterField(name);
    };
  }, []);

  useFieldNotifier<Value, Values>(name);
};
